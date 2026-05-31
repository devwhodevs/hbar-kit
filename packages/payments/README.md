# @hbar-kit/payments

Verify HBAR and HTS payments against the Hedera Mirror Node in a few lines. Read-only,
backend-safe, non-custodial. Built on `@hbar-kit/mirror`.

```ts
import { verifyHbarPayment } from "@hbar-kit/payments"

const result = await verifyHbarPayment({
  network: "testnet",
  receiver: "0.0.12345",
  amount: "25",
  memo: "order_6471727153206",
  after: new Date(Date.now() - 30 * 60 * 1000),
})
if (result.matched) {
  // status === "confirmed"; result.transactionId, result.explorerUrl, ...
}
```

Statuses: `confirmed | pending | underpaid | overpaid | duplicate | mismatch | expired | failed`.
A non-match is a result (with `reason`), not a thrown error. See the
[docs](https://github.com/devwhodevs/hbar-kit).

## USDC

USDC on Hedera is an HTS token, so `verifyUsdcPayment` / `waitForUsdcPayment` are thin wrappers over
`verifyHtsPayment` / `waitForHtsPayment` that fill in the **verified USDC token id** for the network
and parse amounts at **6 decimals**.

```ts
import { verifyUsdcPayment } from "@hbar-kit/payments"

const result = await verifyUsdcPayment({
  network: "mainnet", // required — USDC token ids are network-specific (no default)
  receiver: "0.0.12345",
  amount: "25.00", // decimal string, 6 decimals; ">6 dp" throws InvalidAmountError
  memo: "invoice_123",
  after: new Date(Date.now() - 30 * 60 * 1000),
})
// result.asset === { tokenId: "0.0.456858", decimals: 6, symbol: "USDC" }
```

- **When to use the USDC helper vs `verifyHtsPayment`:** use `verifyUsdcPayment` when you're
  accepting USDC and want the token id + 6-decimal parsing handled for you; use `verifyHtsPayment`
  for any other token or when you need full control over `tokenId`/`decimals`.
- **Verified token ids:** mainnet `0.0.456858`, testnet `0.0.429274` (verified against the Mirror
  Node and Circle's official docs); `previewnet` throws `UnsupportedAssetError`. Also exported as
  `USDC_TOKEN_IDS` / `getUsdcTokenId(network)`.
- **Precision:** amounts are decimal strings, never floats; USDC is always 6 decimals.
- **Custom / mock token:** pass an explicit `tokenId` (still parsed at 6 decimals) for dev/testnet:

  ```ts
  await verifyUsdcPayment({
    network: "testnet",
    tokenId: process.env.TESTNET_USDC_TOKEN_ID!,
    receiver: "0.0.12345",
    amount: "10.00",
    memo: "test_invoice_1",
  })
  ```

Use `isUsdcPaymentResult(result)` to detect USDC results. Full guide:
[Verify a USDC payment](https://devwhodevs.github.io/hbar-kit/guide/verify-usdc-payment).
