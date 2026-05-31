# Accept HBAR payments without custody

You can **accept HBAR (and HTS token) payments** in your app without ever holding a private key,
moving user funds, or running a node. This guide explains the **non-custodial** model hbar-kit uses
and how to verify payments **server-side** through the Hedera Mirror Node.

## What "non-custodial" means here

The buyer pays your Hedera account directly from their own wallet. The funds land in **your**
account on-chain — hbar-kit is never in the path of the money. Your backend's only job is to
**confirm** that the payment you expected actually arrived. hbar-kit does that by **reading** public
Mirror Node data:

- No private keys. hbar-kit never signs anything.
- No custody. It does not receive, hold, or forward funds.
- No node to run. It calls the public Hedera Mirror Node REST API (or your own).

## The flow

1. The buyer pays your `receiver` account from their wallet, with your order id as the **memo**.
2. Your server calls `verifyHbarPayment` (or `verifyHtsPayment`) with the expected
   `receiver`, `amount`, `memo`, and time window.
3. You branch on the returned `status` and fulfil the order on `confirmed`.

```ts
import { verifyHbarPayment } from "@hbar-kit/payments"

const result = await verifyHbarPayment({
  network: "mainnet",
  receiver: "0.0.12345", // your account — funds go here, not through hbar-kit
  amount: "25",
  memo: "order_6471727153206",
  after: new Date(Date.now() - 30 * 60 * 1000),
})

if (result.matched) {
  // Funds are already in your account. Fulfil the order.
} else {
  // pending | underpaid | overpaid | duplicate | mismatch | expired
}
```

For token payments use `verifyHtsPayment` with a `tokenId` (decimals are resolved from the Mirror
Node automatically, or pass `decimals` to skip the lookup).

## Verify on the server — always

Because verification is just a read, it is tempting to do it in the browser. Don't. A client can lie
about the amount, the receiver, or whether anything was paid. The rules:

- **Run verification server-side.** Treat the `PaymentResult` as the source of truth.
- **Derive `receiver` / `amount` / `memo` from your own database**, keyed by an opaque order id —
  never from values sent by the client.
- **Do not trust a client-supplied amount** or a "paid" flag.
- **`!matched` is not "not paid".** Inspect `status` for `underpaid` / `overpaid` / `duplicate` /
  `pending`.

## What is out of scope

Settling, refunding, or withdrawing funds means **signing transactions**, which is custodial and
belongs to the official Hedera SDK (`@hashgraph/sdk` / `@hiero-ledger/sdk`) — not hbar-kit. hbar-kit
stays on the read-only, verification side on purpose.

See also: [Build a Hedera payment link](./build-a-hedera-payment-link),
[Verify a Hedera transaction by memo](./verify-hedera-transaction-by-memo), and
[Production notes](./production-notes).
