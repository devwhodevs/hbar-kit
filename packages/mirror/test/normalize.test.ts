import { describe, it, expect } from "vitest"
import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { normalizeTransaction, normalizeToken, isNotFound } from "../src/normalize.js"
import { parseJsonWithBigInt } from "../src/json.js"

const fx = (name: string) =>
  parseJsonWithBigInt(
    readFileSync(fileURLToPath(new URL(`./fixtures/${name}`, import.meta.url)), "utf8"),
  )

describe("normalizeTransaction", () => {
  it("decodes memo, parses timestamps, camelCases transfers", () => {
    const tx = normalizeTransaction(fx("hts-tx.json") as never)
    expect(tx.memo).toBe("order_6471727153206")
    expect(tx.consensusTimestamp.seconds).toBe(1780150231)
    expect(tx.tokenTransfers[0]!.tokenId).toBe("0.0.5449")
    expect(tx.tokenTransfers[1]!.amount).toBe(2889029n)
    expect(tx.transfers[0]!.isApproval).toBe(false)
  })
  it("handles empty memo", () => {
    const tx = normalizeTransaction(fx("hbar-tx.json") as never)
    expect(tx.memo).toBe("")
  })
})

describe("normalizeToken", () => {
  it("coerces string decimals to a number and supplies to bigint", () => {
    const t = normalizeToken(fx("token.json") as never)
    expect(t.decimals).toBe(6)
    expect(typeof t.decimals).toBe("number")
    expect(t.totalSupply).toBe(700000000000000n)
    expect(t.symbol).toBe("USDC")
  })
  it("accepts numeric decimals (token list shape)", () => {
    const t = normalizeToken({
      token_id: "0.0.5449",
      decimals: 6,
      symbol: "USDC",
      name: "USD Coin",
      type: "FUNGIBLE_COMMON",
    } as never)
    expect(t.decimals).toBe(6)
  })
})

describe("isNotFound", () => {
  it("detects the _status not-found envelope and empty arrays", () => {
    expect(isNotFound(fx("not-found.json"))).toBe(true)
    expect(isNotFound({ transactions: [] })).toBe(true)
    expect(isNotFound({ transactions: [{}] })).toBe(false)
  })
})
