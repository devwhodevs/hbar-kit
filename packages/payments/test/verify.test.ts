import { describe, it, expect } from "vitest"
import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { createMirrorClient } from "@hbar-kit/mirror"
import { verifyHtsPayment, verifyHbarPayment } from "../src/verify.js"

// These mocks serve a single page, so force `links.next` to null. The shared
// fixture carries a non-null `links.next` (real-API pagination metadata); left
// as-is the mock would return the same page forever and `runVerify`'s
// auto-pagination loop would never terminate. Nulling it yields one page.
function withLinks(body: unknown): unknown {
  return { ...(body as Record<string, unknown>), links: { next: null } }
}

function clientReturning(listBody: unknown, tokenBody?: unknown) {
  const fetchMock = async (url: string) => {
    if (url.includes("/api/v1/tokens/")) {
      return new Response(
        JSON.stringify(
          tokenBody ?? {
            token_id: "0.0.5449",
            decimals: "6",
            symbol: "USDC",
            name: "USD Coin",
            type: "FUNGIBLE_COMMON",
          },
        ),
        { status: 200 },
      )
    }
    return new Response(JSON.stringify(withLinks(listBody)), { status: 200 })
  }
  return createMirrorClient({ network: "testnet", fetch: fetchMock as unknown as typeof fetch })
}

const htsListRaw = JSON.parse(
  readFileSync(
    fileURLToPath(new URL("../../mirror/test/fixtures/tx-list.json", import.meta.url)),
    "utf8",
  ),
)

describe("verifyHtsPayment", () => {
  it("confirms an exact HTS payment with matching memo", async () => {
    const r = await verifyHtsPayment({
      client: clientReturning(htsListRaw),
      receiver: "0.0.8093816",
      tokenId: "0.0.5449",
      decimals: 6,
      amount: "2.889029",
      memo: "order_6471727153206",
      network: "testnet",
    })
    expect(r.matched).toBe(true)
    expect(r.status).toBe("confirmed")
    expect(r.payer).toBe("0.0.6628041")
    expect(r.amountBase).toBe(2_889_029n)
    expect(r.explorerUrl).toContain("hashscan.io/testnet/transaction/1780150231.356942024")
  })

  it("auto-fetches decimals when omitted", async () => {
    const r = await verifyHtsPayment({
      client: clientReturning(htsListRaw),
      receiver: "0.0.8093816",
      tokenId: "0.0.5449",
      amount: "2.889029",
      memo: "order_6471727153206",
      network: "testnet",
    })
    expect(r.matched).toBe(true)
  })

  it("returns mismatch on wrong memo", async () => {
    const r = await verifyHtsPayment({
      client: clientReturning(htsListRaw),
      receiver: "0.0.8093816",
      tokenId: "0.0.5449",
      decimals: 6,
      amount: "2.889029",
      memo: "wrong_memo",
      network: "testnet",
    })
    expect(r.matched).toBe(false)
    expect(r.status).toBe("mismatch")
    expect(r.reason).toMatch(/memo/i)
  })

  it("returns underpaid when amount is short", async () => {
    const r = await verifyHtsPayment({
      client: clientReturning(htsListRaw),
      receiver: "0.0.8093816",
      tokenId: "0.0.5449",
      decimals: 6,
      amount: "5.0",
      memo: "order_6471727153206",
      network: "testnet",
    })
    expect(r.matched).toBe(false)
    expect(r.status).toBe("underpaid")
  })

  it("returns pending when nothing matches the receiver", async () => {
    const r = await verifyHbarPayment({
      client: clientReturning({ transactions: [], links: { next: null } }),
      receiver: "0.0.404",
      amount: "1",
      network: "testnet",
    })
    expect(r.matched).toBe(false)
    expect(r.status).toBe("pending")
  })

  it("flags duplicates when two transactions each satisfy the request", async () => {
    const dup = {
      transactions: [
        htsListRaw.transactions[0],
        {
          ...htsListRaw.transactions[0],
          transaction_id: "0.0.6628041-1780150228-000000000",
          consensus_timestamp: "1780150232.000000000",
        },
      ],
      links: { next: null },
    }
    const r = await verifyHtsPayment({
      client: clientReturning(dup),
      receiver: "0.0.8093816",
      tokenId: "0.0.5449",
      decimals: 6,
      amount: "2.889029",
      memo: "order_6471727153206",
      network: "testnet",
    })
    expect(r.status).toBe("duplicate")
    expect(r.matches.length).toBe(2)
  })
})
