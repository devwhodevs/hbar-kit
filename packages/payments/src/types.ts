import type { Transaction } from "@hbar-kit/mirror"

export type PaymentStatus =
  | "confirmed"
  | "pending"
  | "underpaid"
  | "overpaid"
  | "duplicate"
  | "mismatch"
  | "expired"
  | "failed"

export type PaymentAsset = "HBAR" | { tokenId: string; decimals: number }

export interface PaymentMatch {
  transactionId: string
  payer?: string
  consensusTimestamp: string
  netBase: bigint
  net: string
  memo: string
  transaction: Transaction
}

export interface PaymentResult {
  matched: boolean
  status: PaymentStatus
  receiver: string
  asset: PaymentAsset
  transactionId?: string
  payer?: string
  amount?: string
  amountBase?: bigint
  memo?: string
  consensusTimestamp?: string
  explorerUrl?: string
  matches: PaymentMatch[]
  reason?: string
}

export interface MemoComparison {
  mode?: "exact" | "trim" | "caseInsensitive"
}
