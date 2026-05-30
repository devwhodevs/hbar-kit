import { describe, it, expect, vi } from "vitest"
import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { createTransactionsResource } from "../src/resources/transactions.js"
import { parseJsonWithBigInt } from "../src/json.js"
import type { Transport } from "../src/transport.js"

const raw = (name: string) => readFileSync(fileURLToPath(new URL(`./fixtures/${name}`, import.meta.url)), "utf8")
const transport = (handler: (path: string) => unknown): Transport => ({ baseUrl: "https://x.test", get: vi.fn(async (path: string) => handler(path)) })

describe("transactions.find", () => {
  it("builds the query and returns a normalized page", async () => {
    let captured = ""
    const t = transport((path) => { captured = path; return parseJsonWithBigInt(raw("tx-list.json")) })
    const page = await createTransactionsResource(t).find({
      accountId: "0.0.8093816", transactionType: "cryptotransfer", result: "success", limit: 25,
    })
    expect(captured).toContain("/api/v1/transactions?")
    expect(captured).toContain("account.id=0.0.8093816")
    expect(captured).toContain("transactiontype=cryptotransfer")
    expect(captured).toContain("result=success")
    expect(captured).toContain("limit=25")
    expect(page.items[0]!.memo).toBe("order_6471727153206")
    expect(page.next).toContain("timestamp=lt:")
  })

  it("clamps limit to 100", async () => {
    let captured = ""
    const t = transport((path) => { captured = path; return { transactions: [], links: { next: null } } })
    await createTransactionsResource(t).find({ accountId: "0.0.1", limit: 9999 })
    expect(captured).toContain("limit=100")
  })

  it("serializes after/before as timestamp gte/lt filters", async () => {
    let captured = ""
    const t = transport((path) => { captured = path; return { transactions: [], links: { next: null } } })
    await createTransactionsResource(t).find({ accountId: "0.0.1", after: new Date(1748625594029), before: new Date(1748625599000) })
    expect(captured).toContain("timestamp=gte%3A1748625594.029000000")
    expect(captured).toContain("timestamp=lt%3A1748625599.000000000")
  })
})

describe("transactions.get", () => {
  it("converts @-form to dash, returns the array", async () => {
    let captured = ""
    const t = transport((path) => { captured = path; return parseJsonWithBigInt(raw("single-tx.json")) })
    const list = await createTransactionsResource(t).get("0.0.7399329@1780150219.858438706")
    expect(captured).toBe("/api/v1/transactions/0.0.7399329-1780150219-858438706")
    expect(list).toHaveLength(1)
    expect(list[0]!.result).toBe("SUCCESS")
  })

  it("returns an empty array for not-found (HTTP-400-empty-array quirk)", async () => {
    const t = transport(() => ({ transactions: [] }))
    expect(await createTransactionsResource(t).get("0.0.1-1-1")).toEqual([])
  })
})
