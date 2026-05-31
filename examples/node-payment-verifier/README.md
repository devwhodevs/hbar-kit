# node-payment-verifier

A minimal Node.js script that shows how to **verify an HBAR payment** (or an HTS token payment)
against the **Hedera Mirror Node** in under 20 lines, using
[`@hbar-kit/payments`](../../packages/payments).

This is **server-side, non-custodial Hedera payment verification**: no private keys, no funds held —
it only reads public Mirror Node data and reports whether the expected payment arrived.

## Setup

```bash
pnpm install
cp .env.example .env   # then edit with your network / receiver / amount / memo
```

## Run

```bash
# Verify an HBAR payment
pnpm --filter @hbar-kit/example-node-payment-verifier verify:hbar

# Verify an HTS token payment
pnpm --filter @hbar-kit/example-node-payment-verifier verify:hts
```

Each script prints `PAID` / `NOT PAID` plus the full `PaymentResult` (status, amount, payer), and —
when matched — a HashScan explorer deep-link.

## Key idea: server-side verification

The expected `receiver`, `amount`, and `memo` are read from **your** inputs and checked against the
Mirror Node on the server. The amount is **never trusted from a client** — do not let the browser
tell you how much was paid. See
[Accept HBAR payments without custody](https://devwhodevs.github.io/hbar-kit/guide/accept-hbar-payments-without-custody).
