# Getting Started

```bash
pnpm add @hbar-kit/payments
```

```ts
import { verifyHbarPayment } from "@hbar-kit/payments"

const result = await verifyHbarPayment({
  network: "testnet",
  receiver: "0.0.12345",
  amount: "25",
  memo: "order_6471727153206",
  after: new Date(Date.now() - 30 * 60 * 1000),
})

if (result.matched) console.log("Paid:", result.explorerUrl)
```

`@hbar-kit/payments` pulls in `@hbar-kit/mirror` and `@hbar-kit/core` automatically. Everything is
read-only — no private keys, safe to run on a server.
