# @hbar-kit/mirror

```ts
import { createMirrorClient } from "@hbar-kit/mirror"
const mirror = createMirrorClient({ network: "testnet" })
```

## Config
`network` (or `baseUrl`) is required. Optional: `fetch`, `retryCount` (3), `retryDelay` (150ms),
`timeout` (10_000ms), `headers`, `transport`.

## Resources
- `transactions.find({ accountId?, transactionType?, result?, order?, limit?, after?, before? })` → `Page<Transaction>`
- `transactions.get(transactionId)` → `Transaction[]` (accepts either id form; converts to dash)
- `accounts.getBalance(id)` → `{ balance: bigint, tokens }`
- `accounts.isAssociated(id, tokenId)` → `boolean`
- `tokens.get(id)` → `{ decimals: number, symbol, name, ... }`
- `balances.get(id)` → `{ balance: bigint, timestamp }`

All `amount`/`balance` values are `bigint`. `limit` is clamped to 100. Pagination via `Page.next`.
