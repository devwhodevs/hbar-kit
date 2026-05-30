import { describe, it, expect } from "vitest"
import { parseTimestamp, dateToTimestamp, tsFilter } from "../src/timestamp.js"

describe("parseTimestamp", () => {
  it("splits seconds and nanos and keeps the raw string", () => {
    const t = parseTimestamp("1780150231.809463000")
    expect(t.raw).toBe("1780150231.809463000")
    expect(t.seconds).toBe(1780150231)
    expect(t.nanos).toBe(809463000)
  })
  it("toNanos returns a bigint beyond MAX_SAFE_INTEGER", () => {
    const t = parseTimestamp("1748625594.029692003")
    expect(t.toNanos()).toBe(1748625594029692003n)
    expect(t.toNanos() > BigInt(Number.MAX_SAFE_INTEGER)).toBe(true)
  })
  it("toDate truncates to milliseconds (documented lossy)", () => {
    const t = parseTimestamp("1748625594.029692003")
    expect(t.toDate().getTime()).toBe(1748625594029)
  })
  it("handles a seconds-only timestamp", () => {
    const t = parseTimestamp("1780150231")
    expect(t.seconds).toBe(1780150231)
    expect(t.nanos).toBe(0)
  })
})

describe("dateToTimestamp", () => {
  it("converts a Date to seconds.nanos with ms precision", () => {
    expect(dateToTimestamp(new Date(1748625594029))).toBe("1748625594.029000000")
  })
})

describe("tsFilter", () => {
  it("builds op:value range filter strings", () => {
    expect(tsFilter("gte", "1780150231.000000000")).toBe("gte:1780150231.000000000")
    expect(tsFilter("lt", new Date(1748625594029))).toBe("lt:1748625594.029000000")
  })
})
