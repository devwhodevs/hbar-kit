import { describe, it, expect, vi } from "vitest"
import { createMirrorClient } from "@hbar-kit/mirror"
import { InvalidAmountError, InvalidParamsError, UnsupportedAssetError } from "@hbar-kit/core"
import {
  verifyUsdcPayment,
  getUsdcTokenId,
  isUsdcPaymentResult,
  USDC_TOKEN_IDS,
  USDC_DECIMALS,
  type VerifyUsdcParams,
} from "../src/usdc.js"
import { waitForUsdcPayment } from "../src/wait.js"
import { verifyHbarPayment } from "../src/verify.js"

const MAINNET_USDC = "0.0.456858"
const b64 = (s: string) => Buffer.from(s, "utf8").toString("base64")

/** Build a single-page Mirror Node list body with one HTS (USDC-style) credit to `receiver`. */
function tokenList(opts: {
  tokenId?: string
  receiver?: string
  payer?: string
  base?: number // smallest-unit amount credited to the receiver
  memo?: string
  result?: string
  txId?: string
  ts?: string
}) {
  const tokenId = opts.tokenId ?? MAINNET_USDC
  const receiver = opts.receiver ?? "0.0.12345"
  const payer = opts.payer ?? "0.0.6628041"
  const base = opts.base ?? 25_000_000
  return {
    transactions: [
      {
        result: opts.result ?? "SUCCESS",
        name: "CRYPTOTRANSFER",
        consensus_timestamp: opts.ts ?? "1780150231.356942024",
        transaction_id: opts.txId ?? "0.0.6628041-1780150230-000000000",
        memo_base64: opts.memo !== undefined ? b64(opts.memo) : "",
        nonce: 0,
        scheduled: false,
        parent_consensus_timestamp: null,
        charged_tx_fee: 1,
        nft_transfers: [],
        token_transfers: [
          { token_id: tokenId, account: receiver, amount: base, is_approval: false },
          { token_id: tokenId, account: payer, amount: -base, is_approval: false },
        ],
        transfers: [{ account: payer, amount: -1, is_approval: false }],
      },
    ],
    links: { next: null },
  }
}

const empty = { transactions: [], links: { next: null } }

/** A Mirror client whose fetch always returns `body` (token endpoint is never hit for USDC). */
function client(body: unknown, network: "mainnet" | "testnet" = "mainnet") {
  const fetchMock = async () => new Response(JSON.stringify(body), { status: 200 })
  return createMirrorClient({ network, fetch: fetchMock as unknown as typeof fetch })
}

/** A Mirror client that returns each body in `bodies` on successive polls. */
function clientSequence(bodies: unknown[]) {
  let i = 0
  const fetchMock = vi.fn(async () => {
    const body = bodies[Math.min(i, bodies.length - 1)]
    i++
    return new Response(JSON.stringify(body), { status: 200 })
  })
  return createMirrorClient({
    network: "mainnet",
    fetch: fetchMock as unknown as typeof fetch,
  })
}

const base = (over: Partial<VerifyUsdcParams> = {}): VerifyUsdcParams => ({
  network: "mainnet",
  receiver: "0.0.12345",
  amount: "25.00",
  ...over,
})

describe("USDC token registry", () => {
  it("getUsdcTokenId returns the verified mainnet/testnet ids", () => {
    expect(getUsdcTokenId("mainnet")).toBe("0.0.456858")
    expect(getUsdcTokenId("testnet")).toBe("0.0.429274")
  })
  it("registry constant matches and exposes 6 decimals", () => {
    expect(USDC_TOKEN_IDS.mainnet).toBe("0.0.456858")
    expect(USDC_TOKEN_IDS.testnet).toBe("0.0.429274")
    expect(USDC_TOKEN_IDS.previewnet).toBeUndefined()
    expect(USDC_DECIMALS).toBe(6)
  })
  it("throws UnsupportedAssetError on previewnet (no verified token id)", () => {
    expect(() => getUsdcTokenId("previewnet")).toThrowError(UnsupportedAssetError)
    expect(() => getUsdcTokenId("previewnet")).toThrowError(/USDC|previewnet/i)
  })
})

describe("verifyUsdcPayment", () => {
  it("confirms an exact USDC payment and tags the asset as USDC", async () => {
    const r = await verifyUsdcPayment(base({ client: client(tokenList({ memo: "invoice_123" })), memo: "invoice_123" }))
    expect(r.matched).toBe(true)
    expect(r.status).toBe("confirmed")
    expect(r.amountBase).toBe(25_000_000n)
    expect(r.amount).toBe("25")
    expect(r.payer).toBe("0.0.6628041")
    expect(r.asset).toEqual({ tokenId: MAINNET_USDC, decimals: 6, symbol: "USDC" })
    expect(r.explorerUrl).toContain("hashscan.io/mainnet/transaction/1780150231.356942024")
    expect(isUsdcPaymentResult(r)).toBe(true)
  })

  it("returns underpaid when the amount is short", async () => {
    const r = await verifyUsdcPayment(
      base({ amount: "25.00", client: client(tokenList({ base: 20_000_000, memo: "invoice_123" })), memo: "invoice_123" }),
    )
    expect(r.matched).toBe(false)
    expect(r.status).toBe("underpaid")
  })

  it("returns overpaid (exact comparison) when more was sent", async () => {
    const r = await verifyUsdcPayment(
      base({ client: client(tokenList({ base: 30_000_000, memo: "invoice_123" })), memo: "invoice_123" }),
    )
    expect(r.matched).toBe(false)
    expect(r.status).toBe("overpaid")
  })

  it("confirms an overpayment under comparison: atLeast", async () => {
    const r = await verifyUsdcPayment(
      base({
        comparison: "atLeast",
        client: client(tokenList({ base: 30_000_000, memo: "invoice_123" })),
        memo: "invoice_123",
      }),
    )
    expect(r.matched).toBe(true)
    expect(r.status).toBe("confirmed")
  })

  it("returns mismatch on the wrong memo", async () => {
    const r = await verifyUsdcPayment(
      base({ client: client(tokenList({ memo: "something_else" })), memo: "invoice_123" }),
    )
    expect(r.matched).toBe(false)
    expect(r.status).toBe("mismatch")
  })

  it("returns mismatch when a memo is expected but missing", async () => {
    const r = await verifyUsdcPayment(base({ client: client(tokenList({})), memo: "invoice_123" }))
    expect(r.status).toBe("mismatch")
  })

  it("returns pending when nothing credits the receiver (wrong receiver)", async () => {
    const r = await verifyUsdcPayment(
      base({ receiver: "0.0.99999", client: client(tokenList({ memo: "invoice_123" })), memo: "invoice_123" }),
    )
    expect(r.matched).toBe(false)
    expect(r.status).toBe("pending")
  })

  it("returns pending when the token id does not match USDC (wrong token)", async () => {
    const r = await verifyUsdcPayment(
      base({ client: client(tokenList({ tokenId: "0.0.111111", memo: "invoice_123" })), memo: "invoice_123" }),
    )
    expect(r.status).toBe("pending")
  })

  it("flags duplicates when two USDC payments satisfy the request", async () => {
    const dup = {
      transactions: [
        tokenList({ memo: "invoice_123" }).transactions[0],
        tokenList({ memo: "invoice_123", txId: "0.0.6628041-1780150240-000000000", ts: "1780150241.000000000" }).transactions[0],
      ],
      links: { next: null },
    }
    const r = await verifyUsdcPayment(base({ client: client(dup), memo: "invoice_123" }))
    expect(r.status).toBe("duplicate")
    expect(r.matches.length).toBe(2)
  })

  it("excludes failed transactions (treated as pending)", async () => {
    const r = await verifyUsdcPayment(
      base({ client: client(tokenList({ memo: "invoice_123", result: "INSUFFICIENT_PAYER_BALANCE" })), memo: "invoice_123" }),
    )
    expect(r.status).toBe("pending")
  })

  it("supports a custom tokenId override (dev/testnet mock token) while still tagging USDC + 6 decimals", async () => {
    const custom = "0.0.555555"
    const r = await verifyUsdcPayment(
      base({
        network: "testnet",
        amount: "10.00",
        tokenId: custom,
        client: client(tokenList({ tokenId: custom, base: 10_000_000, memo: "test_invoice_1" }), "testnet"),
        memo: "test_invoice_1",
      }),
    )
    expect(r.matched).toBe(true)
    expect(r.asset).toEqual({ tokenId: custom, decimals: 6, symbol: "USDC" })
    expect(r.explorerUrl).toContain("hashscan.io/testnet")
  })

  it("uses the testnet registry id and a testnet explorer url", async () => {
    const r = await verifyUsdcPayment(
      base({
        network: "testnet",
        amount: "10.00",
        client: client(tokenList({ tokenId: "0.0.429274", base: 10_000_000, memo: "t" }), "testnet"),
        memo: "t",
      }),
    )
    expect(r.matched).toBe(true)
    expect(r.asset).toEqual({ tokenId: "0.0.429274", decimals: 6, symbol: "USDC" })
    expect(r.explorerUrl).toContain("hashscan.io/testnet")
  })

  it("throws UnsupportedAssetError on previewnet without a tokenId override", async () => {
    await expect(verifyUsdcPayment(base({ network: "previewnet" }))).rejects.toThrowError(
      UnsupportedAssetError,
    )
  })

  it("throws InvalidParamsError when network is omitted", async () => {
    const bad = { receiver: "0.0.12345", amount: "25.00" } as unknown as VerifyUsdcParams
    await expect(verifyUsdcPayment(bad)).rejects.toThrowError(InvalidParamsError)
    await expect(verifyUsdcPayment(bad)).rejects.toThrowError(/network/i)
  })

  it("throws InvalidParamsError on a malformed custom tokenId", async () => {
    await expect(
      verifyUsdcPayment(base({ tokenId: "not-an-id", client: client(empty) })),
    ).rejects.toThrowError(InvalidParamsError)
  })

  it("throws InvalidAmountError when the amount has more than 6 decimals", async () => {
    await expect(
      verifyUsdcPayment(base({ amount: "10.1234567", client: client(empty), memo: "x" })),
    ).rejects.toThrowError(InvalidAmountError)
  })
})

describe("isUsdcPaymentResult", () => {
  it("is false for a plain HBAR result", async () => {
    const r = await verifyHbarPayment({
      network: "mainnet",
      receiver: "0.0.12345",
      amount: "1",
      client: client(empty),
    })
    expect(isUsdcPaymentResult(r)).toBe(false)
  })
})

describe("waitForUsdcPayment", () => {
  it("polls until a USDC payment appears, then resolves confirmed", async () => {
    const r = await waitForUsdcPayment({
      network: "mainnet",
      receiver: "0.0.12345",
      amount: "25.00",
      memo: "invoice_123",
      client: clientSequence([empty, empty, tokenList({ memo: "invoice_123" })]),
      timeoutMs: 1000,
      pollIntervalMs: 1,
    })
    expect(r.matched).toBe(true)
    expect(r.status).toBe("confirmed")
    expect(isUsdcPaymentResult(r)).toBe(true)
  })

  it("returns expired when the timeout elapses with no payment", async () => {
    const r = await waitForUsdcPayment({
      network: "mainnet",
      receiver: "0.0.12345",
      amount: "25.00",
      client: clientSequence([empty]),
      timeoutMs: 5,
      pollIntervalMs: 1,
    })
    expect(r.matched).toBe(false)
    expect(r.status).toBe("expired")
  })
})
