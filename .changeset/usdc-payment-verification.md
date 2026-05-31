---
"@hbar-kit/payments": minor
"@hbar-kit/core": minor
---

Add USDC payment verification helpers for Hedera.

Introduces `verifyUsdcPayment` and `waitForUsdcPayment` as convenience wrappers over HTS payment
verification, with 6-decimal amount parsing, optional token ID override, docs, examples, and tests.
Adds a verified USDC token registry (`USDC_TOKEN_IDS`, `getUsdcTokenId`) with mainnet/testnet token
ids confirmed against the Mirror Node and Circle's official docs, plus `isUsdcPaymentResult` and an
optional `symbol` field on `PaymentAsset` (additive, non-breaking). Adds a new `UnsupportedAssetError`
to `@hbar-kit/core` for networks without a verified USDC token id (e.g. previewnet).
