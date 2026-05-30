import { describe, it, expect } from "vitest"
import { hashFn, makeQueryKey } from "../src/query.js"

describe("hashFn", () => {
  it("serializes bigint values deterministically", () => {
    const a = hashFn(["balance", { id: "0.0.1", value: 100_000_000n }])
    const b = hashFn(["balance", { id: "0.0.1", value: 100_000_000n }])
    expect(a).toBe(b)
    expect(a).toContain("100000000")
  })
  it("is order-independent for object keys", () => {
    expect(hashFn([{ a: 1n, b: 2 }])).toBe(hashFn([{ b: 2, a: 1n }]))
  })
})

describe("makeQueryKey", () => {
  it("builds a [resource, filteredOptions] tuple dropping undefined", () => {
    expect(makeQueryKey("hederaBalance", { accountId: "0.0.1", limit: undefined })).toEqual([
      "hederaBalance",
      { accountId: "0.0.1" },
    ])
  })
})
