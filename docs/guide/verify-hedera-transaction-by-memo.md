# Verify a Hedera transaction by memo

A common need: **"did this buyer pay me, and which order was it for?"** On Hedera, the transaction
**memo** is how you tie an on-chain payment back to an order or invoice. This guide shows how to
**verify a Hedera transaction by memo** with hbar-kit — server-side, read-only, through the Mirror
Node.

## Use the memo as your order id

Give every order a **unique memo** (e.g. `order_<uuid>`) and ask the buyer to set it on their
transfer. Then verification can match exactly one payment to exactly one order:

```ts
import { verifyHbarPayment } from "@hbar-kit/payments"

const result = await verifyHbarPayment({
  network: "mainnet",
  receiver: "0.0.12345",
  amount: "25",
  memo: "order_6471727153206", // your order / invoice id
  after: new Date(Date.now() - 60 * 60 * 1000),
})

if (result.matched) {
  console.log("Paid order_6471727153206 in", result.transactionId)
}
```

## What the memo match does

- Transactions that credit `receiver` but carry a **different memo** are excluded.
- If transactions reached the receiver but **none** match the memo, `status` is `"mismatch"`.
- If no transaction reached the receiver at all in the window, `status` is `"pending"`.
- When exactly one transaction matches the memo **and** the amount, `status` is `"confirmed"` and
  `result.matched` is `true`.

## Loosen the comparison when you need to

Memos can arrive with stray whitespace or inconsistent casing from different wallets. Control how
strictly the memo is compared with `memoComparison`:

```ts
const result = await verifyHbarPayment({
  network: "mainnet",
  receiver: "0.0.12345",
  amount: "25",
  memo: "ORDER_6471727153206",
  memoComparison: { mode: "caseInsensitive" }, // "exact" (default) | "trim" | "caseInsensitive"
  after: new Date(Date.now() - 60 * 60 * 1000),
})
```

- `"exact"` — byte-for-byte (default).
- `"trim"` — ignore leading/trailing whitespace.
- `"caseInsensitive"` — ignore case (and whitespace).

## Memo + amount + window together

The memo is one of three filters. For robust verification combine all three:

- **`memo`** — which order this payment is for.
- **`amount`** (+ optional `comparison: "atLeast"`) — that the right amount arrived.
- **`after` / `before`** — that it happened in the expected window. (Mirror Node caps a single
  timestamp range at ~7 days.)

If you only need "did *any* qualifying payment arrive for this order", keep `comparison: "exact"`
and inspect `status`. If overpayment should still count, use `comparison: "atLeast"`.

## Why server-side

A buyer can claim any memo or amount. The Mirror Node is the source of truth: hbar-kit reads the
actual on-chain transfer and its real memo. Always run this on the server and derive `receiver`,
`amount`, and `memo` from your own records — never from client input.

See also: [Build a Hedera payment link](./build-a-hedera-payment-link) and
[Accept HBAR payments without custody](./accept-hbar-payments-without-custody).
