# @hbar-kit/payments

Verify HBAR and HTS payments against the Hedera Mirror Node in a few lines. Read-only,
backend-safe, non-custodial. Built on `@hbar-kit/mirror`.

```ts
import { verifyHbarPayment } from "@hbar-kit/payments"

const result = await verifyHbarPayment({
  network: "testnet",
  receiver: "0.0.12345",
  amount: "25",
  memo: "order_6471727153206",
  after: new Date(Date.now() - 30 * 60 * 1000),
})
if (result.matched) {
  // status === "confirmed"; result.transactionId, result.explorerUrl, ...
}
```

Statuses: `confirmed | pending | underpaid | overpaid | duplicate | mismatch | expired | failed`.
A non-match is a result (with `reason`), not a thrown error. See the
[docs](https://github.com/devwhodevs/hbar-kit).
