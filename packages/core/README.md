# @hbar-kit/core

Zero-dependency primitives for [hbar-kit](https://github.com/devwhodevs/hbar-kit): network config,
decimal-safe bigint money, account/token/transaction id helpers, nanosecond timestamps, and a
typed error hierarchy.

```ts
import { parseHbar, formatHbar, resolveNetwork, txIdToMirror } from "@hbar-kit/core"

parseHbar("25")                      // 2_500_000_000n  (tinybars)
formatHbar(99_306n)                  // "0.00099306"
resolveNetwork({ network: "testnet" }).baseUrl
// "https://testnet.mirrornode.hedera.com"
txIdToMirror("0.0.10@1748625594.1")  // "0.0.10-1748625594-000000001"
```

All amounts are `bigint` in the smallest unit. See the [docs](https://github.com/devwhodevs/hbar-kit).
