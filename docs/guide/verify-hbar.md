# Verify an HBAR payment

```ts
import { verifyHbarPayment } from "@hbar-kit/payments"

const result = await verifyHbarPayment({
  network: "testnet",
  receiver: "0.0.12345",
  amount: "25",
  memo: "order_6471727153206",
  after: new Date(Date.now() - 30 * 60 * 1000),
})

switch (result.status) {
  case "confirmed":
    break
  case "underpaid":
    break
  case "pending":
    break
}
```

`result.matched` is `true` only when a single successful transaction credits the receiver the
exact amount (and matches the memo, if given). Use `comparison: "atLeast"` to accept overpayment.
