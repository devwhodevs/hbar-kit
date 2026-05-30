import { parseTimestamp } from "@hbar-kit/core"
import type {
  RawTransaction, Transaction, RawToken, Token, RawAccount, AccountBalance, RawStatus,
} from "./types.js"

const decodeMemo = (b64: string): string =>
  b64 ? Buffer.from(b64, "base64").toString("utf8") : ""

export function normalizeTransaction(raw: RawTransaction): Transaction {
  return {
    transactionId: raw.transaction_id,
    consensusTimestamp: parseTimestamp(raw.consensus_timestamp),
    validStartTimestamp: raw.valid_start_timestamp ? parseTimestamp(raw.valid_start_timestamp) : undefined,
    result: raw.result,
    name: raw.name,
    chargedTxFee: raw.charged_tx_fee,
    memo: decodeMemo(raw.memo_base64),
    nonce: raw.nonce,
    scheduled: raw.scheduled,
    parentConsensusTimestamp: raw.parent_consensus_timestamp,
    transfers: (raw.transfers ?? []).map((t) => ({
      account: t.account, amount: t.amount, isApproval: t.is_approval ?? false,
    })),
    tokenTransfers: (raw.token_transfers ?? []).map((t) => ({
      tokenId: t.token_id, account: t.account, amount: t.amount, isApproval: t.is_approval ?? false,
    })),
    nftTransfers: (raw.nft_transfers ?? []).map((t) => ({
      tokenId: t.token_id, sender: t.sender_account_id, receiver: t.receiver_account_id,
      serial: t.serial_number, isApproval: t.is_approval ?? false,
    })),
    raw,
  }
}

export function normalizeToken(raw: RawToken): Token {
  return {
    tokenId: raw.token_id,
    decimals: Number(raw.decimals),
    symbol: raw.symbol,
    name: raw.name,
    type: raw.type,
    totalSupply: raw.total_supply != null ? BigInt(raw.total_supply) : undefined,
    maxSupply: raw.max_supply != null ? BigInt(raw.max_supply) : undefined,
    treasuryAccountId: raw.treasury_account_id,
    raw,
  }
}

export function normalizeAccountBalance(raw: RawAccount): AccountBalance {
  return {
    accountId: raw.account,
    balance: raw.balance.balance,
    tokens: (raw.balance.tokens ?? []).map((t) => ({ tokenId: t.token_id, balance: t.balance })),
    raw,
  }
}

/** Detect Mirror Node not-found: the _status envelope, or an empty transactions array. */
export function isNotFound(body: unknown): boolean {
  if (!body || typeof body !== "object") return false
  const status = (body as RawStatus)._status
  if (status?.messages?.some((m) => /not found/i.test(m.message))) return true
  const txs = (body as { transactions?: unknown[] }).transactions
  if (Array.isArray(txs) && txs.length === 0) return true
  return false
}
