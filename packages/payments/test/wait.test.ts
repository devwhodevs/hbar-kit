import { describe, it, expect, vi } from "vitest"
import { createMirrorClient } from "@hbar-kit/mirror"
import { waitForHbarPayment } from "../src/wait.js"

function clientSequence(bodies: unknown[]) {
  let i = 0
  const fetchMock = vi.fn(async () => {
    const body = bodies[Math.min(i, bodies.length - 1)]
    i++
    return new Response(JSON.stringify(body), { status: 200 })
  })
  return {
    client: createMirrorClient({ network: "testnet", fetch: fetchMock as unknown as typeof fetch }),
  }
}

const empty = { transactions: [], links: { next: null } }
const hit = {
  transactions: [
    {
      result: "SUCCESS",
      name: "CRYPTOTRANSFER",
      consensus_timestamp: "1780150231.000000000",
      transaction_id: "0.0.999-1780150230-000000000",
      memo_base64: "",
      nonce: 0,
      scheduled: false,
      parent_consensus_timestamp: null,
      charged_tx_fee: 1,
      nft_transfers: [],
      token_transfers: [],
      transfers: [
        { account: "0.0.12345", amount: 100000000, is_approval: false },
        { account: "0.0.999", amount: -100000000, is_approval: false },
      ],
    },
  ],
  links: { next: null },
}

describe("waitForHbarPayment", () => {
  it("polls until a match appears then resolves confirmed", async () => {
    const { client } = clientSequence([empty, empty, hit])
    const r = await waitForHbarPayment({
      client,
      receiver: "0.0.12345",
      amount: "1",
      network: "testnet",
      timeoutMs: 1000,
      pollIntervalMs: 1,
    })
    expect(r.matched).toBe(true)
    expect(r.status).toBe("confirmed")
  })

  it("returns expired when the timeout elapses with no match", async () => {
    const { client } = clientSequence([empty])
    const r = await waitForHbarPayment({
      client,
      receiver: "0.0.12345",
      amount: "1",
      network: "testnet",
      timeoutMs: 5,
      pollIntervalMs: 1,
    })
    expect(r.matched).toBe(false)
    expect(r.status).toBe("expired")
  })

  it("stops when the signal aborts", async () => {
    const { client } = clientSequence([empty])
    const ac = new AbortController()
    queueMicrotask(() => ac.abort())
    const r = await waitForHbarPayment({
      client,
      receiver: "0.0.12345",
      amount: "1",
      network: "testnet",
      timeoutMs: 1000,
      pollIntervalMs: 1,
      signal: ac.signal,
    })
    expect(r.status).toBe("expired")
  })
})
