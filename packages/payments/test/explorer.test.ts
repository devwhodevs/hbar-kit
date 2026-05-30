import { describe, it, expect } from "vitest"
import { hashscanTxUrl } from "../src/explorer.js"

describe("hashscanTxUrl", () => {
  it("puts consensus timestamp in the path and dash tx id in ?tid", () => {
    expect(hashscanTxUrl("testnet", "1780150231.356942024", "0.0.6628041-1780150227-066757561")).toBe(
      "https://hashscan.io/testnet/transaction/1780150231.356942024?tid=0.0.6628041-1780150227-066757561",
    )
  })
  it("works for mainnet", () => {
    expect(hashscanTxUrl("mainnet", "1.2", "0.0.1-1-1")).toBe(
      "https://hashscan.io/mainnet/transaction/1.2?tid=0.0.1-1-1",
    )
  })
})
