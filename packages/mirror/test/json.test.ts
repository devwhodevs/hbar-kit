import { describe, it, expect } from "vitest"
import { parseJsonWithBigInt } from "../src/json.js"

describe("parseJsonWithBigInt", () => {
  it("parses integer amount fields as bigint without precision loss", () => {
    const out = parseJsonWithBigInt(
      '{"transfers":[{"account":"0.0.1","amount":90071992547409930}]}',
    ) as { transfers: { amount: bigint }[] }
    expect(out.transfers[0]!.amount).toBe(90071992547409930n)
    expect(typeof out.transfers[0]!.amount).toBe("bigint")
  })
  it("leaves non-amount numbers as numbers", () => {
    const out = parseJsonWithBigInt('{"nonce":0,"decimals":6}') as {
      nonce: number
      decimals: number
    }
    expect(out.nonce).toBe(0)
    expect(typeof out.nonce).toBe("number")
  })
  it("keeps string fields as strings", () => {
    const out = parseJsonWithBigInt('{"consensus_timestamp":"1780150231.80"}') as {
      consensus_timestamp: string
    }
    expect(out.consensus_timestamp).toBe("1780150231.80")
  })
})
