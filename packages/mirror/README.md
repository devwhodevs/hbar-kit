# @hbar-kit/mirror

Typed client for the Hedera Mirror Node REST API. Native `fetch`, retry-aware transport,
lossless `bigint` amount parsing, `links.next` pagination, and normalized responses.

```ts
import { createMirrorClient } from "@hbar-kit/mirror"

const mirror = createMirrorClient({ network: "testnet" })
const page = await mirror.transactions.find({
  accountId: "0.0.8093816", transactionType: "cryptotransfer", result: "success", limit: 25,
})
for (const tx of page.items) console.log(tx.transactionId, tx.memo, tx.transfers)
```

`network` (or `baseUrl`) is required — there is no default, which prevents testnet/mainnet
mix-ups. See the [docs](https://github.com/devwhodevs/hbar-kit).
