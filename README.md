# hbar-kit

[![CI](https://github.com/devwhodevs/hbar-kit/actions/workflows/ci.yml/badge.svg)](https://github.com/devwhodevs/hbar-kit/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/@hbar-kit/payments.svg)](https://www.npmjs.com/package/@hbar-kit/payments)
[![license](https://img.shields.io/npm/l/@hbar-kit/payments.svg)](./LICENSE)
[![docs](https://img.shields.io/badge/docs-hbar--kit-blue)](https://devwhodevs.github.io/hbar-kit/)

> viem-like DX for **native** Hedera apps. Verify HBAR & HTS payments against the Mirror Node in
> under 20 lines. Read-only, typed, tested, non-custodial.

```bash
pnpm add @hbar-kit/payments
```

```ts
import { verifyHbarPayment } from "@hbar-kit/payments"

const result = await verifyHbarPayment({
  network: "testnet",
  receiver: "0.0.12345",
  amount: "25",
  memo: "order_6471727153206",
  after: new Date(Date.now() - 30 * 60 * 1000),
})
if (result.matched) console.log("Paid:", result.explorerUrl)
```

## Packages

| Package              | Status  | Purpose                                                           |
| -------------------- | ------- | ----------------------------------------------------------------- |
| `@hbar-kit/core`     | stable  | Primitives: network config, bigint money, ids, timestamps, errors |
| `@hbar-kit/mirror`   | stable  | Typed Mirror Node REST client                                     |
| `@hbar-kit/payments` | stable  | HBAR/HTS payment verification                                     |
| `@hbar-kit/wallet`   | Phase 2 | Native Hedera wallet signing                                      |
| `@hbar-kit/react`    | Phase 3 | React hooks                                                       |
| `@hbar-kit/next`     | Phase 4 | Next.js server helpers                                            |
| `@hbar-kit/indexer`  | Phase 5 | Forward-only Mirror Node indexer                                  |

## Docs

See [the documentation](https://devwhodevs.github.io/hbar-kit/) — guides for verifying HBAR/HTS
payments, waiting, custom Mirror Nodes, partial/duplicate handling, amounts & decimals, production notes.

## Contributing

Issues and PRs welcome — see [CONTRIBUTING.md](./CONTRIBUTING.md). By participating you agree to the
[Code of Conduct](./CODE_OF_CONDUCT.md). To report a vulnerability, see [SECURITY.md](./SECURITY.md).

## License

[MIT](./LICENSE) © Oleksandr Ostrovskyi
