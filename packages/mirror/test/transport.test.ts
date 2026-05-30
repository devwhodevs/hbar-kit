import { describe, it, expect, vi } from "vitest"
import { http } from "../src/transport.js"
import { MirrorHttpError } from "@hbar-kit/core"

const res = (status: number, body: unknown, headers: Record<string, string> = {}) =>
  new Response(typeof body === "string" ? body : JSON.stringify(body), { status, headers })

describe("http transport", () => {
  it("returns parsed JSON on 200", async () => {
    const fetchMock = vi.fn().mockResolvedValue(res(200, { ok: true }))
    const t = http("https://x.test", { fetch: fetchMock })
    expect(await t.get("/api/v1/x")).toEqual({ ok: true })
    expect(fetchMock).toHaveBeenCalledOnce()
  })

  it("retries on 503 then succeeds", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(res(503, "busy"))
      .mockResolvedValueOnce(res(200, { ok: 1 }))
    const t = http("https://x.test", { fetch: fetchMock, retryCount: 2, retryDelay: 0 })
    expect(await t.get("/y")).toEqual({ ok: 1 })
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it("throws RateLimitError after exhausting retries on 429 and reads Retry-After", async () => {
    const fetchMock = vi.fn().mockResolvedValue(res(429, "slow", { "retry-after": "2" }))
    const t = http("https://x.test", { fetch: fetchMock, retryCount: 1, retryDelay: 0 })
    await expect(t.get("/z")).rejects.toMatchObject({ name: "RateLimitError", retryAfter: 2 })
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it("throws MirrorHttpError on a non-retryable 400", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(res(400, { _status: { messages: [{ message: "bad" }] } }))
    const t = http("https://x.test", { fetch: fetchMock, retryCount: 3, retryDelay: 0 })
    await expect(t.get("/z")).rejects.toBeInstanceOf(MirrorHttpError)
    expect(fetchMock).toHaveBeenCalledOnce()
  })

  it("aborts on timeout", async () => {
    const fetchMock = vi.fn().mockImplementation(
      (_url: string, init: RequestInit) =>
        new Promise((_resolve, reject) => {
          init.signal?.addEventListener("abort", () =>
            reject(new DOMException("Aborted", "AbortError")),
          )
        }),
    )
    const t = http("https://x.test", { fetch: fetchMock, timeout: 5, retryCount: 0 })
    await expect(t.get("/slow")).rejects.toMatchObject({ name: "TimeoutError" })
  })
})
