import { describe, it, expect } from "vitest"
import { createMirrorClient } from "@hbar-kit/mirror"
import { verifyHbarPayment } from "../src/verify.js"

function listWith(
  transfers: { account: string; amount: number }[],
  memoB64 = "",
  result = "SUCCESS",
  extra: object = {},
) {
  return {
    transactions: [
      {
        result,
        name: "CRYPTOTRANSFER",
        consensus_timestamp: "1780150231.000000000",
        transaction_id: "0.0.500-1780150230-000000000",
        memo_base64: memoB64,
        nonce: 0,
        scheduled: false,
        parent_consensus_timestamp: null,
        charged_tx_fee: 1,
        nft_transfers: [],
        token_transfers: [],
        transfers: transfers.map((t) => ({ ...t, is_approval: false })),
        ...extra,
      },
    ],
    links: { next: null },
  }
}
const client = (body: unknown) =>
  createMirrorClient({
    network: "testnet",
    fetch: (async () =>
      new Response(JSON.stringify(body), { status: 200 })) as unknown as typeof fetch,
  })
const b64 = (s: string) => Buffer.from(s, "utf8").toString("base64")
const RX = [
  { account: "0.0.R", amount: 100000000 },
  { account: "0.0.P", amount: -100000001 },
  { account: "0.0.98", amount: 1 },
]

describe("edge cases (spec §9)", () => {
  it("exact payment -> confirmed/matched", async () => {
    const r = await verifyHbarPayment({
      client: client(listWith(RX)),
      receiver: "0.0.R",
      amount: "1",
      network: "testnet",
    })
    expect(r.matched).toBe(true)
    expect(r.status).toBe("confirmed")
  })
  it("partial/underpayment -> underpaid", async () => {
    const r = await verifyHbarPayment({
      client: client(listWith(RX)),
      receiver: "0.0.R",
      amount: "2",
      network: "testnet",
    })
    expect(r.status).toBe("underpaid")
    expect(r.matched).toBe(false)
  })
  it("overpayment -> overpaid (exact) but matched under atLeast", async () => {
    const over = [
      { account: "0.0.R", amount: 300000000 },
      { account: "0.0.P", amount: -300000001 },
      { account: "0.0.98", amount: 1 },
    ]
    const r1 = await verifyHbarPayment({
      client: client(listWith(over)),
      receiver: "0.0.R",
      amount: "1",
      network: "testnet",
    })
    expect(r1.status).toBe("overpaid")
    const r2 = await verifyHbarPayment({
      client: client(listWith(over)),
      receiver: "0.0.R",
      amount: "1",
      comparison: "atLeast",
      network: "testnet",
    })
    expect(r2.matched).toBe(true)
    expect(r2.status).toBe("confirmed")
  })
  it("wrong receiver -> pending", async () => {
    const r = await verifyHbarPayment({
      client: client({ transactions: [], links: { next: null } }),
      receiver: "0.0.X",
      amount: "1",
      network: "testnet",
    })
    expect(r.status).toBe("pending")
  })
  it("wrong memo -> mismatch", async () => {
    const r = await verifyHbarPayment({
      client: client(listWith(RX, b64("real"))),
      receiver: "0.0.R",
      amount: "1",
      memo: "expected",
      network: "testnet",
    })
    expect(r.status).toBe("mismatch")
  })
  it("missing memo when one expected -> mismatch", async () => {
    const r = await verifyHbarPayment({
      client: client(listWith(RX, "")),
      receiver: "0.0.R",
      amount: "1",
      memo: "expected",
      network: "testnet",
    })
    expect(r.status).toBe("mismatch")
  })
  it("failed transaction -> excluded -> pending", async () => {
    const r = await verifyHbarPayment({
      client: client(listWith(RX, "", "INSUFFICIENT_PAYER_BALANCE")),
      receiver: "0.0.R",
      amount: "1",
      network: "testnet",
    })
    expect(r.status).toBe("pending")
  })
  it("multiple transfers in one tx -> signed net", async () => {
    const multi = [
      { account: "0.0.R", amount: 300000000 },
      { account: "0.0.R", amount: -50000000 },
      { account: "0.0.P", amount: -250000001 },
      { account: "0.0.98", amount: 1 },
    ]
    const r = await verifyHbarPayment({
      client: client(listWith(multi)),
      receiver: "0.0.R",
      amount: "2.5",
      network: "testnet",
    })
    expect(r.matched).toBe(true)
    expect(r.amountBase).toBe(250000000n)
  })
  it("duplicate matching payments -> duplicate with all matches", async () => {
    const body = {
      transactions: [
        listWith(RX).transactions[0],
        {
          ...listWith(RX).transactions[0],
          transaction_id: "0.0.501-1780150231-000000000",
          consensus_timestamp: "1780150232.0",
        },
      ],
      links: { next: null },
    }
    const r = await verifyHbarPayment({
      client: client(body),
      receiver: "0.0.R",
      amount: "1",
      network: "testnet",
    })
    expect(r.status).toBe("duplicate")
    expect(r.matches.length).toBe(2)
  })
  it("after > before throws InvalidParamsError", async () => {
    await expect(
      verifyHbarPayment({
        client: client(listWith(RX)),
        receiver: "0.0.R",
        amount: "1",
        after: new Date(2000),
        before: new Date(1000),
        network: "testnet",
      }),
    ).rejects.toThrowError(/after.*before/i)
  })
})
