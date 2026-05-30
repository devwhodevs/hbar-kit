import { MirrorHttpError, RateLimitError, TimeoutError, NetworkError } from "@hbar-kit/core"
import { parseJsonWithBigInt } from "./json.js"

export interface TransportOptions {
  fetch?: typeof fetch
  retryCount?: number
  retryDelay?: number
  timeout?: number
  headers?: Record<string, string>
}
export interface Transport {
  get(path: string): Promise<unknown>
  baseUrl: string
}

const RETRYABLE = new Set([408, 425, 429, 500, 502, 503, 504])
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
const jitter = (ms: number) => ms * (0.5 + Math.random())

export function http(baseUrl: string, options: TransportOptions = {}): Transport {
  const doFetch = options.fetch ?? globalThis.fetch
  const retryCount = options.retryCount ?? 3
  const retryDelay = options.retryDelay ?? 150
  const timeout = options.timeout ?? 10_000
  const base = baseUrl.replace(/\/+$/, "")

  async function get(path: string): Promise<unknown> {
    const url = path.startsWith("http") ? path : base + path
    let attempt = 0
    let lastErr: unknown
    while (attempt <= retryCount) {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), timeout)
      try {
        const response = await doFetch(url, {
          signal: controller.signal,
          headers: { accept: "application/json", ...options.headers },
        })
        clearTimeout(timer)
        if (response.ok) {
          const text = await response.text()
          return text ? parseJsonWithBigInt(text) : null
        }
        if (RETRYABLE.has(response.status) && attempt < retryCount) {
          const retryAfter = Number(response.headers.get("retry-after"))
          const wait =
            Number.isFinite(retryAfter) && retryAfter > 0
              ? retryAfter * 1000
              : jitter(retryDelay * 2 ** attempt)
          await sleep(wait)
          attempt++
          continue
        }
        const body = await response.text().catch(() => "")
        if (response.status === 429) {
          const ra = Number(response.headers.get("retry-after"))
          throw new RateLimitError(
            `Mirror Node rate limited (429)`,
            Number.isFinite(ra) ? { details: body, retryAfter: ra } : { details: body },
          )
        }
        throw new MirrorHttpError(`Mirror Node HTTP ${response.status}`, response.status, {
          details: body,
        })
      } catch (err) {
        clearTimeout(timer)
        if (err instanceof MirrorHttpError) throw err
        if (err instanceof DOMException && err.name === "AbortError") {
          throw new TimeoutError(`Mirror Node request timed out after ${timeout}ms`, { cause: err })
        }
        lastErr = err
        if (attempt < retryCount) {
          await sleep(jitter(retryDelay * 2 ** attempt))
          attempt++
          continue
        }
        throw new NetworkError(`Mirror Node request failed: ${String(err)}`, { cause: err })
      }
    }
    throw new NetworkError(`Mirror Node request failed`, { cause: lastErr })
  }

  return { get, baseUrl: base }
}
