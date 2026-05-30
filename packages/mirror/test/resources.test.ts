import { describe, it, expect, vi } from "vitest"
import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { parseJsonWithBigInt } from "../src/json.js"
import { createAccountsResource } from "../src/resources/accounts.js"
import { createTokensResource } from "../src/resources/tokens.js"
import type { Transport } from "../src/transport.js"

const raw = (name: string) =>
  readFileSync(fileURLToPath(new URL(`./fixtures/${name}`, import.meta.url)), "utf8")
const transport = (handler: (p: string) => unknown): Transport => ({
  baseUrl: "https://x.test",
  get: vi.fn(async (p) => handler(p)),
})

describe("accounts.getBalance", () => {
  it("returns tinybar balance and token balances", async () => {
    const t = transport(() => parseJsonWithBigInt(raw("account.json")))
    const acct = await createAccountsResource(t).getBalance("0.0.8093816")
    expect(acct.balance).toBe(135701389742752n)
    expect(acct.tokens[0]).toEqual({ tokenId: "0.0.5449", balance: 2889029n })
  })
})

describe("accounts.isAssociated", () => {
  it("is true when /accounts/{id}/tokens returns a row", async () => {
    let captured = ""
    const t = transport((p) => {
      captured = p
      return { tokens: [{ token_id: "0.0.5449", balance: 1, decimals: 6 }], links: { next: null } }
    })
    expect(await createAccountsResource(t).isAssociated("0.0.1", "0.0.5449")).toBe(true)
    expect(captured).toContain("/api/v1/accounts/0.0.1/tokens?token.id=0.0.5449")
  })
  it("is false when no rows returned", async () => {
    const t = transport(() => ({ tokens: [], links: { next: null } }))
    expect(await createAccountsResource(t).isAssociated("0.0.1", "0.0.9")).toBe(false)
  })
})

describe("tokens.get", () => {
  it("normalizes string decimals to number", async () => {
    const t = transport(() => parseJsonWithBigInt(raw("token.json")))
    const token = await createTokensResource(t).get("0.0.5449")
    expect(token.decimals).toBe(6)
    expect(token.symbol).toBe("USDC")
  })
})
