# @hbar-kit/core

## 0.2.0

### Minor Changes

- 48499f8: Add USDC payment verification helpers for Hedera.

  Introduces `verifyUsdcPayment` and `waitForUsdcPayment` as convenience wrappers over HTS payment
  verification, with 6-decimal amount parsing, optional token ID override, docs, examples, and tests.
  Adds a verified USDC token registry (`USDC_TOKEN_IDS`, `getUsdcTokenId`) with mainnet/testnet token
  ids confirmed against the Mirror Node and Circle's official docs, plus `isUsdcPaymentResult` and an
  optional `symbol` field on `PaymentAsset` (additive, non-breaking). Adds a new `UnsupportedAssetError`
  to `@hbar-kit/core` for networks without a verified USDC token id (e.g. previewnet).

## 0.1.3

### Patch Changes

- 56f5cd8: Release via npm OIDC trusted publishing (no long-lived token). First release on the tokenless CI flow; provenance remains automatic. No code or API changes.

## 0.1.2

### Patch Changes

- ed52683: Rebuild npm provenance attestations from current main (the previous release's source commit was replaced by a history rewrite). No code or API changes.

## 0.1.1

### Patch Changes

- 4ce8451: Improve npm discoverability: clearer package descriptions and Hedera payment / Mirror Node keywords. No API changes.

## 0.1.0

### Minor Changes

- [`5609356`](https://github.com/devwhodevs/hbar-kit/commit/5609356da8b07af1734809df61ee147e1e7fca5c) Thanks [@devwhodevs](https://github.com/devwhodevs)! - Initial release: network presets, bigint money (parseUnits/formatUnits/parseHbar/formatHbar),
  entity & transaction id helpers, HederaTimestamp, error hierarchy, query key/hash factories.
