import { describe, it, expect, vi } from "vitest"
import { createMirrorClient } from "../src/client.js"

describe("createMirrorClient", () => {
  it("resolves the testnet base URL and exposes resources", () => {
    const client = createMirrorClient({ network: "testnet" })
    expect(client.baseUrl).toBe("https://testnet.mirrornode.hedera.com")
    expect(typeof client.transactions.find).toBe("function")
    expect(typeof client.accounts.getBalance).toBe("function")
    expect(typeof client.tokens.get).toBe("function")
  })
  it("throws when neither network nor baseUrl is provided", () => {
    // @ts-expect-error intentionally invalid
    expect(() => createMirrorClient({})).toThrowError(/network.*required/i)
  })
  it("passes a custom fetch through to the transport", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ transactions: [], links: { next: null } }), { status: 200 }),
      )
    const client = createMirrorClient({ network: "testnet", fetch: fetchMock })
    await client.transactions.find({ accountId: "0.0.1" })
    expect(fetchMock).toHaveBeenCalledOnce()
    expect(fetchMock.mock.calls[0]![0]).toContain(
      "https://testnet.mirrornode.hedera.com/api/v1/transactions",
    )
  })
})
