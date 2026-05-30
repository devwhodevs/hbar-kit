# next-payment-demo

A minimal Next.js (App Router) demo that verifies an HBAR payment server-side with
[`@hbar-kit/payments`](../../packages/payments).

## Key idea: derive the amount on the server

The browser only sends an opaque `paymentId`. The route handler looks up the expected
`receiver` / `amount` / `memo` server-side (here hard-coded for the demo; in production read them
from your DB) and never trusts a client-supplied amount.

## Run

```bash
pnpm install
pnpm --filter @hbar-kit/example-next-payment-demo dev
```

Open the page, click **Check payment**, and the client calls `POST /api/verify`, which runs
`verifyHbarPayment` against the Hedera Mirror Node and returns the `PaymentResult`.

## Files

- `app/api/verify/route.ts` — server route; derives expected amount, calls `verifyHbarPayment`.
- `app/page.tsx` — minimal client that POSTs a `paymentId` and shows `PAID` / `NOT PAID`.
