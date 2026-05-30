# node-payment-verifier

Verify an HBAR or HTS-token payment against the Hedera Mirror Node in under 20 lines, using
[`@hbar-kit/payments`](../../packages/payments).

## Setup

```bash
pnpm install
cp .env.example .env   # then edit with your account / amount / memo
```

## Run

```bash
# HBAR payment
pnpm --filter @hbar-kit/example-node-payment-verifier verify:hbar

# HTS token payment
pnpm --filter @hbar-kit/example-node-payment-verifier verify:hts
```

Each script prints `PAID` / `NOT PAID` plus the full `PaymentResult`, and (when matched) an explorer
deep-link. The amount is always interpreted server-side from your inputs, never trusted from a client.
