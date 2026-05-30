import { verifyHbarPayment, verifyHtsPayment, type VerifyHbarParams, type VerifyHtsParams } from "./verify.js"
import type { PaymentResult } from "./types.js"

export interface WaitOptions {
  timeoutMs?: number
  pollIntervalMs?: number
  signal?: AbortSignal
}
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

async function poll(verify: () => Promise<PaymentResult>, opts: WaitOptions): Promise<PaymentResult> {
  const timeoutMs = opts.timeoutMs ?? 10 * 60 * 1000
  const pollIntervalMs = opts.pollIntervalMs ?? 3000
  const deadline = Date.now() + timeoutMs
  let last: PaymentResult | undefined
  while (Date.now() < deadline) {
    if (opts.signal?.aborted) break
    last = await verify()
    if (last.matched) return last
    if (last.status === "duplicate" || last.status === "overpaid") return last
    await sleep(pollIntervalMs)
  }
  return last && last.status !== "pending"
    ? { ...last, status: "expired" }
    : { matched: false, status: "expired", receiver: last?.receiver ?? "", asset: last?.asset ?? "HBAR", matches: [], reason: "timed out waiting for payment" }
}

export function waitForHbarPayment(p: VerifyHbarParams & WaitOptions): Promise<PaymentResult> {
  return poll(() => verifyHbarPayment(p), p)
}
export function waitForHtsPayment(p: VerifyHtsParams & WaitOptions): Promise<PaymentResult> {
  return poll(() => verifyHtsPayment(p), p)
}
