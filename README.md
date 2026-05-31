# hbar-kit

[![CI](https://github.com/devwhodevs/hbar-kit/actions/workflows/ci.yml/badge.svg)](https://github.com/devwhodevs/hbar-kit/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/@hbar-kit/payments.svg)](https://www.npmjs.com/package/@hbar-kit/payments)
[![license](https://img.shields.io/npm/l/@hbar-kit/payments.svg)](./LICENSE)
[![docs](https://img.shields.io/badge/docs-hbar--kit-blue)](https://devwhodevs.github.io/hbar-kit/)

**hbar-kit is a TypeScript toolkit for verifying native Hedera payments.** It confirms whether an
HBAR or HTS-token payment reached a receiver account — by amount, memo, and time window — by reading
the public Hedera Mirror Node. Read-only, non-custodial, bigint-safe, and built for real payment
verification.

> Verify a **native** Hedera payment in under 20 lines. No private keys, no custody.

> **Status: v0.1.x (beta).** Published to npm and tested, usable today for HBAR/HTS payment
> verification. Pre-1.0 — the public API may still change before 1.0, so pin a version. The
> wallet/React/Next.js/indexer packages (Phases 2–5) are planned, not yet built.

## Who it's for

Developers building **checkout flows, invoices, payment links, or backend payment APIs** on Hedera
who need to confirm a payment **server-side** without holding funds or running a node.

## Use it when you need to

- verify an **HBAR payment** by receiver, amount, memo, and time window
- verify an **HTS token payment**
- build **Hedera payment links**, invoice flows, checkout flows, or backend payment APIs
- read **Hedera Mirror Node** data with typed helpers

It is read-only, non-custodial, bigint-safe, and designed for production payment verification.

## Install

```bash
pnpm add @hbar-kit/payments
```

## Quick example

```ts
import { verifyHbarPayment } from "@hbar-kit/payments"

const result = await verifyHbarPayment({
  network: "testnet",
  receiver: "0.0.12345",
  amount: "25", // 25 HBAR — parsed to tinybars internally, never a float
  memo: "order_6471727153206", // your order / invoice id
  after: new Date(Date.now() - 30 * 60 * 1000),
})

if (result.matched) {
  console.log("Paid:", result.explorerUrl)
} else {
  // pending | underpaid | overpaid | duplicate | mismatch | expired
  console.log("Not settled:", result.status)
}
```

No private keys, no signing, no funds held — `verifyHbarPayment` only **reads** public Mirror Node
data and tells you whether the payment you expected actually arrived.

### Verify a USDC payment

USDC on Hedera is an HTS token. hbar-kit includes a USDC convenience helper for common invoice,
checkout, and payment-link flows — it fills in the verified USDC token id and 6-decimal parsing.

```ts
import { verifyUsdcPayment } from "@hbar-kit/payments"

const result = await verifyUsdcPayment({
  network: "mainnet",
  receiver: "0.0.12345",
  amount: "25.00",
  memo: "invoice_123",
  after: new Date(Date.now() - 30 * 60 * 1000),
})
```

See [Verify a USDC payment](https://devwhodevs.github.io/hbar-kit/guide/verify-usdc-payment).

## Use cases

- Hedera payment links
- HBAR checkout flows
- HTS token payment verification
- invoice payment verification
- backend payment status APIs
- payment webhooks
- Mirror Node TypeScript integrations
- Shopify-style manual crypto payment verification

## What hbar-kit is not

hbar-kit is **not** a wallet, payment processor, custodial service, fiat on-ramp, exchange, or
EVM/Solidity framework. It does not hold funds or move user money. It verifies public Hedera
transactions through the Mirror Node and helps developers build payment links, invoices, checkout
flows, and payment-verification APIs.

## Packages

| Package              | Status  | Purpose                                                           |
| -------------------- | ------- | ----------------------------------------------------------------- |
| `@hbar-kit/core`     | 0.1 (beta) | Primitives: network config, bigint money, ids, timestamps, errors |
| `@hbar-kit/mirror`   | 0.1 (beta) | Typed Mirror Node REST client                                     |
| `@hbar-kit/payments` | 0.1 (beta) | HBAR/HTS payment verification                                     |
| `@hbar-kit/wallet`   | Phase 2 | Native Hedera wallet signing                                      |
| `@hbar-kit/react`    | Phase 3 | React hooks                                                       |
| `@hbar-kit/next`     | Phase 4 | Next.js server helpers                                            |
| `@hbar-kit/indexer`  | Phase 5 | Forward-only Mirror Node indexer                                  |

## Docs

See [the documentation](https://devwhodevs.github.io/hbar-kit/). Task-focused guides:

- [Build a Hedera payment link](https://devwhodevs.github.io/hbar-kit/guide/build-a-hedera-payment-link) — create a request, show instructions, verify server-side
- [Verify a Hedera transaction by memo](https://devwhodevs.github.io/hbar-kit/guide/verify-hedera-transaction-by-memo) — match payments to an order id
- [Accept HBAR payments without custody](https://devwhodevs.github.io/hbar-kit/guide/accept-hbar-payments-without-custody) — the non-custodial model
- Plus: verify HBAR/HTS, wait for payment, custom Mirror Nodes, partial/duplicate handling, amounts & decimals, production notes.

For AI agents and tools, a machine-readable summary lives at
[`llms.txt`](https://devwhodevs.github.io/hbar-kit/llms.txt) (and
[`llms-full.txt`](https://devwhodevs.github.io/hbar-kit/llms-full.txt)).

## Contributing

Issues and PRs welcome — see [CONTRIBUTING.md](./CONTRIBUTING.md). By participating you agree to the
[Code of Conduct](./CODE_OF_CONDUCT.md). To report a vulnerability, see [SECURITY.md](./SECURITY.md).

## License

[MIT](./LICENSE) © Oleksandr Ostrovskyi
