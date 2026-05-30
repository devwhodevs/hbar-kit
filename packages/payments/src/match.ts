import type { Transaction } from "@hbar-kit/mirror"
import type { MemoComparison, PaymentAsset } from "./types.js"

/** Signed sum of ALL the receiver's legs (HBAR transfers or a specific token's transfers). */
export function netToReceiver(tx: Transaction, receiver: string, asset: PaymentAsset): bigint {
  if (asset === "HBAR") {
    return tx.transfers.filter((t) => t.account === receiver).reduce((s, t) => s + t.amount, 0n)
  }
  return tx.tokenTransfers
    .filter((t) => t.tokenId === asset.tokenId && t.account === receiver)
    .reduce((s, t) => s + t.amount, 0n)
}

export function memoMatches(actual: string, expected: string, cmp: MemoComparison = {}): boolean {
  const mode = cmp.mode ?? "exact"
  if (mode === "trim") return actual.trim() === expected.trim()
  if (mode === "caseInsensitive") return actual.toLowerCase() === expected.toLowerCase()
  return actual === expected
}

export type AmountClass = "exact" | "underpaid" | "overpaid"
export function classifyAmount(net: bigint, expected: bigint): AmountClass {
  if (net === expected) return "exact"
  return net < expected ? "underpaid" : "overpaid"
}
