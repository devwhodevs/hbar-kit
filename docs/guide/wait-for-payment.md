# Wait for a payment

```ts
import { waitForHbarPayment } from "@hbar-kit/payments"

const result = await waitForHbarPayment({
  network: "testnet",
  receiver: "0.0.12345",
  amount: "10",
  memo: "order_123",
  timeoutMs: 10 * 60 * 1000,
  pollIntervalMs: 3000,
})
// result.status is "confirmed" or "expired"
```

Pass an `AbortSignal` as `signal` to cancel early. Polling stops immediately on a confirmed,
duplicate, or overpaid result.
