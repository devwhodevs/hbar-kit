import type { HederaTimestamp } from "@hbar-kit/core"

// ---- Raw Mirror Node shapes ----
export interface RawTransfer {
  account: string
  amount: bigint
  is_approval?: boolean
}
export interface RawTokenTransfer {
  token_id: string
  account: string
  amount: bigint
  is_approval?: boolean
}
export interface RawNftTransfer {
  token_id: string
  sender_account_id: string | null
  receiver_account_id: string | null
  serial_number: bigint
  is_approval?: boolean
}
export interface RawTransaction {
  transaction_id: string
  consensus_timestamp: string
  valid_start_timestamp?: string
  result: string
  name: string
  charged_tx_fee: bigint
  memo_base64: string
  node?: string
  nonce: number
  scheduled: boolean
  parent_consensus_timestamp: string | null
  transfers: RawTransfer[]
  token_transfers: RawTokenTransfer[]
  nft_transfers: RawNftTransfer[]
}
export interface RawListLinks {
  next: string | null
}
export interface RawTransactionList {
  transactions: RawTransaction[]
  links: RawListLinks
}
export interface RawToken {
  token_id: string
  decimals: string | number
  symbol: string
  name: string
  type: string
  total_supply?: string
  max_supply?: string
  treasury_account_id?: string
}
export interface RawAccount {
  account: string
  evm_address?: string
  deleted?: boolean
  balance: { balance: bigint; timestamp: string; tokens: { token_id: string; balance: bigint }[] }
}
export interface RawStatus {
  _status?: { messages?: { message: string }[] }
}

// ---- Normalized shapes ----
export interface Transfer {
  account: string
  amount: bigint
  isApproval: boolean
}
export interface TokenTransfer {
  tokenId: string
  account: string
  amount: bigint
  isApproval: boolean
}
export interface NftTransfer {
  tokenId: string
  sender: string | null
  receiver: string | null
  serial: bigint
  isApproval: boolean
}
export interface Transaction {
  transactionId: string
  consensusTimestamp: HederaTimestamp
  validStartTimestamp?: HederaTimestamp | undefined
  result: string
  name: string
  chargedTxFee: bigint
  memo: string
  nonce: number
  scheduled: boolean
  parentConsensusTimestamp: string | null
  transfers: Transfer[]
  tokenTransfers: TokenTransfer[]
  nftTransfers: NftTransfer[]
  raw: RawTransaction
}
export interface Token {
  tokenId: string
  decimals: number
  symbol: string
  name: string
  type: string
  totalSupply?: bigint | undefined
  maxSupply?: bigint | undefined
  treasuryAccountId?: string | undefined
  raw: RawToken
}
export interface AccountBalance {
  accountId: string
  balance: bigint
  tokens: { tokenId: string; balance: bigint }[]
  raw: RawAccount
}
export interface Page<T> {
  items: T[]
  next: string | null
}
