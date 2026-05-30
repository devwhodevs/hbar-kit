import { describe, it, expect } from "vitest"
import { netToReceiver, memoMatches, classifyAmount } from "../src/match.js"
import type { Transaction } from "@hbar-kit/mirror"

const tx = (over: Partial<Transaction>): Transaction =>
  ({
    transactionId: "0.0.1-1-1",
    consensusTimestamp: { raw: "1.0", seconds: 1, nanos: 0, toNanos: () => 1_000_000_000n, toDate: () => new Date(1000) },
    result: "SUCCESS", name: "CRYPTOTRANSFER", chargedTxFee: 0n, memo: "", nonce: 0,
    scheduled: false, parentConsensusTimestamp: null,
    transfers: [], tokenTransfers: [], nftTransfers: [], raw: {} as never,
    ...over,
  }) as Transaction

describe("netToReceiver (HBAR)", () => {
  it("sums all signed legs for the receiver, excluding fee accounts implicitly", () => {
    const t = tx({ transfers: [
      { account: "0.0.802", amount: 99306n, isApproval: false },
      { account: "0.0.12345", amount: 2_500_000_000n, isApproval: false },
      { account: "0.0.9999", amount: -2_500_099_306n, isApproval: false },
    ] })
    expect(netToReceiver(t, "0.0.12345", "HBAR")).toBe(2_500_000_000n)
  })
  it("nets positive and negative legs for the same account (corrected rule)", () => {
    const t = tx({ transfers: [
      { account: "0.0.12345", amount: 3_000_000_000n, isApproval: false },
      { account: "0.0.12345", amount: -500_000_000n, isApproval: false },
    ] })
    expect(netToReceiver(t, "0.0.12345", "HBAR")).toBe(2_500_000_000n)
  })
})

describe("netToReceiver (HTS)", () => {
  it("sums only the matching token's legs for the receiver", () => {
    const t = tx({ tokenTransfers: [
      { tokenId: "0.0.5449", account: "0.0.8093816", amount: 2_889_029n, isApproval: false },
      { tokenId: "0.0.9999", account: "0.0.8093816", amount: 1n, isApproval: false },
    ] })
    expect(netToReceiver(t, "0.0.8093816", { tokenId: "0.0.5449", decimals: 6 })).toBe(2_889_029n)
  })
})

describe("memoMatches", () => {
  it("exact by default", () => {
    expect(memoMatches("order_1", "order_1")).toBe(true)
    expect(memoMatches("order_1 ", "order_1")).toBe(false)
  })
  it("trim and caseInsensitive modes", () => {
    expect(memoMatches("order_1 ", "order_1", { mode: "trim" })).toBe(true)
    expect(memoMatches("ORDER_1", "order_1", { mode: "caseInsensitive" })).toBe(true)
  })
})

describe("classifyAmount", () => {
  it("classifies exact / underpaid / overpaid", () => {
    expect(classifyAmount(100n, 100n)).toBe("exact")
    expect(classifyAmount(99n, 100n)).toBe("underpaid")
    expect(classifyAmount(101n, 100n)).toBe("overpaid")
  })
})
