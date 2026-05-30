import { tsFilter, txIdToMirror } from "@hbar-kit/core"
import type { Transport } from "../transport.js"
import { normalizeTransaction } from "../normalize.js"
import type { Page, RawTransaction, RawTransactionList, Transaction } from "../types.js"

export interface FindTransactionsParams {
  accountId?: string
  transactionType?: string
  result?: "success" | "fail"
  order?: "asc" | "desc"
  limit?: number
  after?: Date | string
  before?: Date | string
}

export interface TransactionsResource {
  find(params?: FindTransactionsParams): Promise<Page<Transaction>>
  get(transactionId: string): Promise<Transaction[]>
}

function buildQuery(params: FindTransactionsParams): string {
  const q = new URLSearchParams()
  if (params.accountId) q.set("account.id", params.accountId)
  if (params.transactionType) q.set("transactiontype", params.transactionType)
  if (params.result) q.set("result", params.result)
  if (params.order) q.set("order", params.order)
  q.set("limit", String(Math.min(params.limit ?? 25, 100)))
  if (params.after) q.append("timestamp", tsFilter("gte", params.after))
  if (params.before) q.append("timestamp", tsFilter("lt", params.before))
  return q.toString()
}

export function createTransactionsResource(transport: Transport): TransactionsResource {
  return {
    async find(params = {}) {
      const body = (await transport.get(`/api/v1/transactions?${buildQuery(params)}`)) as RawTransactionList
      return { items: (body.transactions ?? []).map(normalizeTransaction), next: body.links?.next ?? null }
    },
    async get(transactionId) {
      const id = txIdToMirror(transactionId)
      const body = (await transport.get(`/api/v1/transactions/${id}`)) as { transactions?: RawTransaction[] }
      return (body.transactions ?? []).map(normalizeTransaction)
    },
  }
}
