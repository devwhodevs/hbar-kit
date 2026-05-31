# Build a Hedera payment link

This guide shows how to build a **Hedera payment link / checkout flow** with hbar-kit: create a
payment request, show the buyer where to pay, and **verify the HBAR payment server-side** through the
Mirror Node — non-custodial, with no private keys.

hbar-kit handles the **verification** half. Modeling the request (your order id, expected amount,
receiver) is application code — a few lines, shown below.

## 1. Create a payment request

A payment request is just your order record: who should receive the payment, how much, and a unique
memo (your order/invoice id) that ties an on-chain transaction back to this order. Generate it
server-side and store it.

```ts
// app code — your order model, not a package export
interface PaymentRequest {
  orderId: string
  receiver: string // your Hedera account, e.g. "0.0.12345"
  amount: string // decimal string, e.g. "25" (HBAR)
  memo: string // unique per order — used to match the payment
  createdAt: Date
}

function createPaymentRequest(receiver: string, amount: string): PaymentRequest {
  const orderId = crypto.randomUUID()
  return {
    orderId,
    receiver,
    amount,
    memo: `order_${orderId}`,
    createdAt: new Date(),
  }
}

const request = createPaymentRequest("0.0.12345", "25")
// persist `request` in your database, keyed by orderId
```

## 2. Show payment instructions to the buyer

Render the **receiver**, **amount**, and **memo** the buyer must use. The memo is what lets you
match their transaction to this specific order, so it must be included.

```ts
function paymentInstructions(req: PaymentRequest) {
  return {
    payTo: req.receiver,
    amount: `${req.amount} HBAR`,
    memo: req.memo, // buyer MUST set this memo on the transfer
  }
}
```

Most Hedera wallets let the user paste an account id, amount, and memo. You can also build a HashScan
link for the *receiver* account so buyers can watch the payment land.

## 3. Verify the payment server-side

When the buyer says "I've paid" (or on a timer / webhook), look the request up **from your
database** and verify it. Never trust an amount or receiver sent from the browser.

```ts
import { verifyHbarPayment } from "@hbar-kit/payments"

const request = await db.getPaymentRequest(orderId) // your stored record

const result = await verifyHbarPayment({
  network: "mainnet",
  receiver: request.receiver,
  amount: request.amount,
  memo: request.memo,
  after: request.createdAt, // only look at transactions since the order was created
})
```

To poll until it confirms instead of checking once, use `waitForHbarPayment` with the same params
plus `{ timeoutMs, pollIntervalMs }`.

## 4. Handle every status

`verifyHbarPayment` returns a discriminated `PaymentResult`. Branch on `status`:

```ts
switch (result.status) {
  case "confirmed":
    // result.matched === true. Fulfil the order.
    await db.markPaid(orderId, result.transactionId!)
    break
  case "pending":
    // No matching payment to the receiver yet — keep waiting.
    break
  case "underpaid":
    // A payment arrived for less than expected (see result.amount).
    break
  case "overpaid":
    // More than expected. Decide: accept + refund difference, or accept as-is.
    break
  case "duplicate":
    // Two+ transactions satisfy this order (result.matches). Process one, refund/ignore the rest.
    break
  case "mismatch":
    // Payments reached the receiver but none had the right memo.
    break
  case "expired":
    // Only from waitFor* — the timeout elapsed before confirmation.
    break
}
```

## 5. Idempotency: process each payment once

Two things make this safe to retry:

- **A unique memo per order** lets you detect and reject `duplicate` payments.
- **Persisting `result.transactionId`** on first confirmation means a re-run finds the order already
  paid and does nothing. Use the memo (order id) as your idempotency key.

## 6. Rules that matter

- **Always verify server-side through the Mirror Node.** The result is the source of truth.
- **Never trust a client-supplied amount, receiver, or "paid" flag.** Derive expected values from
  your own database, keyed by an opaque order id.
- **`!result.matched` does not mean "not paid".** Check `status` — it may be `underpaid`,
  `overpaid`, `duplicate`, or still `pending`.
- **Money is bigint.** Pass `amount` as a decimal string; never use floats.

See also: [Verify a Hedera transaction by memo](./verify-hedera-transaction-by-memo),
[Accept HBAR payments without custody](./accept-hbar-payments-without-custody), and the
[Next.js payment demo](https://github.com/devwhodevs/hbar-kit/tree/main/examples/next-payment-demo).
