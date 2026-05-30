# Verify an HTS token payment

```ts
import { verifyHtsPayment } from "@hbar-kit/payments"

const result = await verifyHtsPayment({
  network: "testnet",
  receiver: "0.0.12345",
  tokenId: "0.0.5449",
  decimals: 6,          // optional — auto-fetched if omitted
  amount: "25.00",
  memo: "invoice_456",
  after: new Date(Date.now() - 30 * 60 * 1000),
})
```

If you omit `decimals`, hbar-kit fetches it from the token info endpoint and caches it.
