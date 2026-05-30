import { describe, it, expect } from "vitest"
import { createMirrorClient } from "../src/client.js"

// Opt-in live smoke test against the real testnet Mirror Node (read-only, no keys).
// Skipped by default so CI and `pnpm test` stay fully offline/deterministic.
// Run with: HBARKIT_LIVE=1 pnpm --filter @hbar-kit/mirror test
const live = process.env.HBARKIT_LIVE === "1"
const d = live ? describe : describe.skip

d("live testnet Mirror Node (smoke)", () => {
  const mirror = createMirrorClient({ network: "testnet" })

  it("lists recent successful crypto transfers with the expected shape", async () => {
    const page = await mirror.transactions.find({
      transactionType: "cryptotransfer",
      result: "success",
      order: "desc",
      limit: 5,
    })
    expect(page.items.length).toBeGreaterThan(0)
    const tx = page.items[0]!
    expect(tx.transactionId).toMatch(/^\d+\.\d+\.\d+-\d+-\d+$/)
    expect(tx.result).toBe("SUCCESS")
    expect(tx.consensusTimestamp.toNanos()).toBeTypeOf("bigint")
    // amounts are bigint (lossless) and the transfer array balances to zero
    const sum = tx.transfers.reduce((s, t) => s + t.amount, 0n)
    expect(sum).toBe(0n)
  }, 20_000)

  it("round-trips a single transaction by id (dash form via the API)", async () => {
    const page = await mirror.transactions.find({
      transactionType: "cryptotransfer",
      result: "success",
      limit: 1,
    })
    const id = page.items[0]!.transactionId
    const found = await mirror.transactions.get(id)
    expect(found.length).toBeGreaterThan(0)
    expect(found.some((t) => t.transactionId === id)).toBe(true)
  }, 20_000)

  it("reads token decimals as a number (string-in, number-out normalization)", async () => {
    // 0.0.5449 is testnet USDC (6 decimals) at time of writing.
    const token = await mirror.tokens.get("0.0.5449")
    expect(typeof token.decimals).toBe("number")
    expect(token.tokenId).toBe("0.0.5449")
  }, 20_000)
})
