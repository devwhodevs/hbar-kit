import { describe, it, expect, vi } from "vitest"
import { paginate } from "../src/paginate.js"
import type { Transport } from "../src/transport.js"

function fakeTransport(pages: Record<string, unknown>): Transport {
  return {
    baseUrl: "https://x.test",
    get: vi.fn(async (path: string) => {
      const key = path.replace("https://x.test", "")
      if (!(key in pages)) throw new Error(`unexpected path ${key}`)
      return pages[key]
    }),
  }
}

describe("paginate", () => {
  it("follows links.next until null, yielding each page's items", async () => {
    const t = fakeTransport({
      "/api/v1/transactions?account.id=0.0.1": {
        transactions: [{ id: 1 }],
        links: { next: "/api/v1/transactions?timestamp=lt:2" },
      },
      "/api/v1/transactions?timestamp=lt:2": { transactions: [{ id: 2 }], links: { next: null } },
    })
    const got: unknown[] = []
    for await (const item of paginate(
      t,
      "/api/v1/transactions?account.id=0.0.1",
      (p: never) => (p as { transactions: unknown[] }).transactions,
    ))
      got.push(item)
    expect(got).toEqual([{ id: 1 }, { id: 2 }])
  })

  it("stops at maxPages", async () => {
    const t = fakeTransport({
      "/p": { items: [1], links: { next: "/p2" } },
      "/p2": { items: [2], links: { next: "/p3" } },
    })
    const got: number[] = []
    for await (const n of paginate<number>(
      t,
      "/p",
      (p: never) => (p as { items: number[] }).items,
      { maxPages: 1 },
    ))
      got.push(n)
    expect(got).toEqual([1])
  })
})
