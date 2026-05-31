# @hbar-kit/payments

## 0.2.0

### Minor Changes

- 48499f8: Add USDC payment verification helpers for Hedera.

  Introduces `verifyUsdcPayment` and `waitForUsdcPayment` as convenience wrappers over HTS payment
  verification, with 6-decimal amount parsing, optional token ID override, docs, examples, and tests.
  Adds a verified USDC token registry (`USDC_TOKEN_IDS`, `getUsdcTokenId`) with mainnet/testnet token
  ids confirmed against the Mirror Node and Circle's official docs, plus `isUsdcPaymentResult` and an
  optional `symbol` field on `PaymentAsset` (additive, non-breaking). Adds a new `UnsupportedAssetError`
  to `@hbar-kit/core` for networks without a verified USDC token id (e.g. previewnet).

### Patch Changes

- Updated dependencies [48499f8]
  - @hbar-kit/core@0.2.0
  - @hbar-kit/mirror@0.1.4

## 0.1.3

### Patch Changes

- 56f5cd8: Release via npm OIDC trusted publishing (no long-lived token). First release on the tokenless CI flow; provenance remains automatic. No code or API changes.
- Updated dependencies [56f5cd8]
  - @hbar-kit/core@0.1.3
  - @hbar-kit/mirror@0.1.3

## 0.1.2

### Patch Changes

- ed52683: Rebuild npm provenance attestations from current main (the previous release's source commit was replaced by a history rewrite). No code or API changes.
- Updated dependencies [ed52683]
  - @hbar-kit/core@0.1.2
  - @hbar-kit/mirror@0.1.2

## 0.1.1

### Patch Changes

- 4ce8451: Improve npm discoverability: clearer package descriptions and Hedera payment / Mirror Node keywords. No API changes.
- Updated dependencies [4ce8451]
  - @hbar-kit/core@0.1.1
  - @hbar-kit/mirror@0.1.1

## 0.1.0

### Minor Changes

- [`e3286fd`](https://github.com/devwhodevs/hbar-kit/commit/e3286fd4244add4169eb5d9f159ceceebac28143) Thanks [@devwhodevs](https://github.com/devwhodevs)! - Initial release: verifyHbarPayment / verifyHtsPayment / waitForHbarPayment / waitForHtsPayment
  with signed net-to-receiver matching, memo matching, exact/atLeast comparison, duplicate &
  partial & overpayment classification, and HashScan links.

### Patch Changes

- Updated dependencies [[`5609356`](https://github.com/devwhodevs/hbar-kit/commit/5609356da8b07af1734809df61ee147e1e7fca5c), [`a01f541`](https://github.com/devwhodevs/hbar-kit/commit/a01f5416debb96104573e5d38151500da817814c)]:
  - @hbar-kit/core@0.1.0
  - @hbar-kit/mirror@0.1.0
