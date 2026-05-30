import { describe, it, expect } from "vitest"
import { NETWORKS, resolveNetwork } from "../src/network.js"

describe("network presets", () => {
  it("uses mainnet-public as the mainnet default", () => {
    expect(NETWORKS.mainnet.baseUrl).toBe("https://mainnet-public.mirrornode.hedera.com")
    expect(NETWORKS.testnet.baseUrl).toBe("https://testnet.mirrornode.hedera.com")
    expect(NETWORKS.previewnet.baseUrl).toBe("https://previewnet.mirrornode.hedera.com")
  })
  it("carries hashscan base and 8-decimal HBAR currency", () => {
    expect(NETWORKS.testnet.hashscan).toBe("https://hashscan.io/testnet")
    expect(NETWORKS.testnet.currency).toEqual({ symbol: "HBAR", decimals: 8 })
  })
})

describe("resolveNetwork", () => {
  it("resolves a named network to its preset", () => {
    expect(resolveNetwork({ network: "testnet" }).baseUrl).toBe(
      "https://testnet.mirrornode.hedera.com",
    )
  })
  it("accepts a custom baseUrl and strips a trailing slash", () => {
    const r = resolveNetwork({ baseUrl: "http://localhost:5551/", network: "testnet" })
    expect(r.baseUrl).toBe("http://localhost:5551")
    expect(r.hashscan).toBe("https://hashscan.io/testnet")
  })
  it("throws when neither network nor baseUrl is given", () => {
    // @ts-expect-error intentionally invalid
    expect(() => resolveNetwork({})).toThrowError(/network.*required/i)
  })
})
