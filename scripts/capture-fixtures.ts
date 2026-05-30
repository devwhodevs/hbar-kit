#!/usr/bin/env tsx
/**
 * Re-capture Mirror Node fixtures from a live network.
 * Usage: HBARKIT_NETWORK=testnet tsx scripts/capture-fixtures.ts 0.0.12345
 */
import { mkdir, writeFile } from "node:fs/promises"
import { resolve } from "node:path"

const network = process.env.HBARKIT_NETWORK ?? "testnet"
const account = process.argv[2] ?? "0.0.98"
const base =
  network === "mainnet"
    ? "https://mainnet-public.mirrornode.hedera.com"
    : `https://${network}.mirrornode.hedera.com`

const endpoints: Record<string, string> = {
  transactions: `/api/v1/transactions?account.id=${account}&limit=5`,
  account: `/api/v1/accounts/${account}?limit=1`,
  token: `/api/v1/tokens/0.0.456858`,
}

await mkdir(resolve("fixtures/captured"), { recursive: true })
for (const [name, path] of Object.entries(endpoints)) {
  const res = await fetch(base + path)
  const json = await res.json()
  await writeFile(
    resolve(`fixtures/captured/${name}.json`),
    JSON.stringify(json, null, 2),
  )
  console.log(`captured ${name} -> fixtures/captured/${name}.json`)
}
