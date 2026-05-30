import { describe, it, expect } from "vitest"
import { parseUnits, formatUnits, parseHbar, formatHbar } from "../src/units.js"

describe("parseUnits", () => {
  it("parses whole and fractional values to bigint base units", () => {
    expect(parseUnits("25", 6)).toBe(25_000_000n)
    expect(parseUnits("25.00", 6)).toBe(25_000_000n)
    expect(parseUnits("0.000001", 6)).toBe(1n)
    expect(parseUnits("1", 0)).toBe(1n)
  })
  it("handles values above 2^53 without precision loss", () => {
    expect(parseUnits("90071992.54740993", 8)).toBe(9007199254740993n)
  })
  it("throws InvalidAmountError on excess precision (strict)", () => {
    expect(() => parseUnits("1.123456789", 8)).toThrowError(/precision/i)
  })
  it("throws on non-numeric input", () => {
    expect(() => parseUnits("abc", 8)).toThrowError(/invalid/i)
    expect(() => parseUnits("1.2.3", 8)).toThrowError(/invalid/i)
  })
})

describe("formatUnits", () => {
  it("formats base units to a trimmed decimal string", () => {
    expect(formatUnits(25_000_000n, 6)).toBe("25")
    expect(formatUnits(1n, 6)).toBe("0.000001")
    expect(formatUnits(0n, 8)).toBe("0")
    expect(formatUnits(-99314n, 8)).toBe("-0.00099314")
  })
})

describe("parseHbar/formatHbar", () => {
  it("uses 8 decimals (tinybars)", () => {
    expect(parseHbar("1")).toBe(100_000_000n)
    expect(formatHbar(100_000_000n)).toBe("1")
    expect(formatHbar(99306n)).toBe("0.00099306")
  })
})
