# Amount precision and decimals

All money is `bigint` in the smallest unit. Never use floats.

```ts
import { parseHbar, formatHbar, parseUnits, formatUnits } from "@hbar-kit/core"

parseHbar("25") // 2_500_000_000n tinybars
formatHbar(99_306n) // "0.00099306"
parseUnits("25.00", 6) // 25_000_000n
formatUnits(2_889_029n, 6) // "2.889029"
```

Parsing is **strict**: a value with more decimals than allowed throws `InvalidAmountError`.

USDC on Hedera uses **6 decimals**. [`verifyUsdcPayment`](/guide/verify-usdc-payment) always parses
amounts at 6 decimals, so `"25.001234"` is fine but `"25.0012345"` (7 dp) throws
`InvalidAmountError`.
