# next-payment-demo

A minimal **Next.js (App Router)** demo that **verifies an HBAR payment server-side** with
[`@hbar-kit/payments`](../../packages/payments) — a building block for a **Hedera payment link /
checkout flow**. Non-custodial: it only reads the **Hedera Mirror Node**, holds no keys, and moves
no funds.

## Key idea: derive the amount on the server, never trust the client

The browser only sends an opaque `paymentId`. The route handler looks up the expected
`receiver` / `amount` / `memo` **server-side** (hard-coded here for the demo; in production read them
from your DB) and runs the verification against the Mirror Node. It **does not trust a
client-supplied amount** — the server is the source of truth.

## Run

```bash
pnpm install
pnpm --filter @hbar-kit/example-next-payment-demo dev
```

Open the page, click **Check payment**, and the client calls `POST /api/verify`, which runs
`verifyHbarPayment` against the **Hedera Mirror Node** and returns the typed `PaymentResult`
(`confirmed` / `pending` / `underpaid` / `overpaid` / `duplicate` / `mismatch`).

## Files

- `app/api/verify/route.ts` — server route; derives the expected amount, runs **server-side Hedera
  payment verification** via `verifyHbarPayment`.
- `app/page.tsx` — minimal client that POSTs a `paymentId` and shows `PAID` / `NOT PAID`.

See the [Build a Hedera payment link](https://devwhodevs.github.io/hbar-kit/guide/build-a-hedera-payment-link)
guide for the full checkout pattern.
