import {
  parseUnits,
  parseHbar,
  formatUnits,
  type HederaNetwork,
  type NetworkInput,
  InvalidParamsError,
} from "@hbar-kit/core"
import {
  createMirrorClient,
  normalizeTransaction,
  type MirrorClient,
  type RawTransaction,
  type Transaction,
} from "@hbar-kit/mirror"
import { netToReceiver, memoMatches, classifyAmount } from "./match.js"
import { hashscanTxUrl } from "./explorer.js"
import type { MemoComparison, PaymentAsset, PaymentMatch, PaymentResult } from "./types.js"

export interface VerifyBaseParams extends NetworkInput {
  client?: MirrorClient
  receiver: string
  amount: string
  memo?: string
  memoComparison?: MemoComparison
  comparison?: "exact" | "atLeast"
  after?: Date | string
  before?: Date | string
}
export type VerifyHbarParams = VerifyBaseParams
export interface VerifyHtsParams extends VerifyBaseParams {
  tokenId: string
  decimals?: number
}

const tokenDecimalsCache = new Map<string, number>()

function resolveClient(p: VerifyBaseParams): { client: MirrorClient; network: HederaNetwork } {
  return {
    client: p.client ?? createMirrorClient(p),
    network: (p.network ?? "mainnet") as HederaNetwork,
  }
}

async function runVerify(
  p: VerifyBaseParams,
  asset: PaymentAsset,
  expectedBase: bigint,
  decimals: number,
): Promise<PaymentResult> {
  if (p.after && p.before && new Date(p.after) > new Date(p.before)) {
    throw new InvalidParamsError("`after` must be before `before`")
  }
  const { client, network } = resolveClient(p)
  const tokenId = asset === "HBAR" ? undefined : asset.tokenId

  const candidates: PaymentMatch[] = []
  const collect = (items: Transaction[]) => {
    for (const tx of items) {
      if (tx.result !== "SUCCESS") continue
      const net = netToReceiver(tx, p.receiver, asset)
      if (net <= 0n) continue
      if (tokenId && !tx.tokenTransfers.some((t) => t.tokenId === tokenId)) continue
      const payer =
        tx.transfers.find((t) => t.amount < 0n)?.account ??
        tx.tokenTransfers.find((t) => t.amount < 0n)?.account
      const match: PaymentMatch = {
        transactionId: tx.transactionId,
        consensusTimestamp: tx.consensusTimestamp.raw,
        netBase: net,
        net: formatUnits(net, decimals),
        memo: tx.memo,
        transaction: tx,
      }
      if (payer !== undefined) match.payer = payer
      candidates.push(match)
    }
  }

  const findParams: Parameters<typeof client.transactions.find>[0] = {
    accountId: p.receiver,
    transactionType: "cryptotransfer",
    result: "success",
    order: "desc",
  }
  if (p.after !== undefined) findParams.after = p.after
  if (p.before !== undefined) findParams.before = p.before
  let page = await client.transactions.find(findParams)
  collect(page.items)
  while (page.next) {
    const body = (await client.transport.get(page.next)) as {
      transactions?: RawTransaction[]
      links?: { next: string | null }
    }
    collect((body.transactions ?? []).map(normalizeTransaction))
    page = { items: [], next: body.links?.next ?? null }
  }

  const memoFiltered = p.memo
    ? candidates.filter((c) => memoMatches(c.memo, p.memo!, p.memoComparison))
    : candidates

  const fail = (status: PaymentResult["status"], reason: string): PaymentResult => ({
    matched: false,
    status,
    receiver: p.receiver,
    asset,
    matches: memoFiltered,
    reason,
  })
  if (candidates.length === 0)
    return fail("pending", "no matching transactions for receiver in window")
  if (p.memo && memoFiltered.length === 0)
    return fail("mismatch", "no transaction matched the expected memo")

  const wantAtLeast = p.comparison === "atLeast"
  const satisfying = memoFiltered.filter((c) =>
    wantAtLeast ? c.netBase >= expectedBase : c.netBase === expectedBase,
  )

  const resultFrom = (
    m: PaymentMatch,
    status: PaymentResult["status"],
    matched: boolean,
    matches: PaymentMatch[],
    reason?: string,
  ): PaymentResult => {
    const result: PaymentResult = {
      matched,
      status,
      receiver: p.receiver,
      asset,
      transactionId: m.transactionId,
      amountBase: m.netBase,
      amount: m.net,
      memo: m.memo,
      consensusTimestamp: m.consensusTimestamp,
      explorerUrl: hashscanTxUrl(network, m.consensusTimestamp, m.transactionId),
      matches,
    }
    if (m.payer !== undefined) result.payer = m.payer
    if (reason !== undefined) result.reason = reason
    return result
  }

  if (satisfying.length === 0) {
    const best = memoFiltered[0]!
    const cls = classifyAmount(best.netBase, expectedBase)
    return resultFrom(
      best,
      cls === "exact" ? "confirmed" : cls,
      false,
      memoFiltered,
      `amount ${cls}`,
    )
  }
  if (satisfying.length > 1) {
    return resultFrom(
      satisfying[0]!,
      "duplicate",
      false,
      satisfying,
      `${satisfying.length} transactions satisfy this request`,
    )
  }
  return resultFrom(satisfying[0]!, "confirmed", true, satisfying)
}

export async function verifyHbarPayment(p: VerifyHbarParams): Promise<PaymentResult> {
  return runVerify(p, "HBAR", parseHbar(p.amount), 8)
}

export async function verifyHtsPayment(p: VerifyHtsParams): Promise<PaymentResult> {
  let decimals = p.decimals
  if (decimals === undefined) {
    const cached = tokenDecimalsCache.get(p.tokenId)
    if (cached !== undefined) decimals = cached
    else {
      const { client } = resolveClient(p)
      decimals = (await client.tokens.get(p.tokenId)).decimals
      tokenDecimalsCache.set(p.tokenId, decimals)
    }
  }
  return runVerify(p, { tokenId: p.tokenId, decimals }, parseUnits(p.amount, decimals), decimals)
}
