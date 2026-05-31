# Verify a USDC payment on Hedera

USDC on Hedera is a normal **HTS token**, so hbar-kit can already verify it with
[`verifyHtsPayment`](/guide/verify-hts). `verifyUsdcPayment` is a thin convenience wrapper that
fills in the **verified USDC token id** for the network and parses amounts at **6 decimals**, so you
don't rebuild that boilerplate for every invoice, checkout, or payment-link flow.

It is the same read-only, non-custodial verification as the rest of hbar-kit: no private keys, no
funds moved — it only reads public Mirror Node data and tells you whether the expected payment
arrived.

```ts
import { verifyUsdcPayment } from "@hbar-kit/payments"

const result = await verifyUsdcPayment({
  network: "mainnet",
  receiver: "0.0.12345",
  amount: "25.00", // 25 USDC — a decimal string, never a float
  memo: "invoice_123", // your order / invoice id
  after: new Date(Date.now() - 30 * 60 * 1000),
})

if (result.matched) {
  // Confirmed. Mark the invoice paid using result.transactionId as your idempotency key.
}
```

## What it does under the hood

`verifyUsdcPayment` calls `verifyHtsPayment` with:

- the canonical USDC token id for the selected `network`,
- `decimals = 6`,
- the same `receiver` / `amount` / `memo` / time-window rules,
- the same [payment status model](/guide/concepts).

The returned `PaymentResult` is identical to the HTS one, except its `asset` is tagged as USDC:

```ts
result.asset // { tokenId: "0.0.456858", decimals: 6, symbol: "USDC" }
```

Use `isUsdcPaymentResult(result)` (or inspect `result.asset.tokenId`) to detect USDC results in a
mixed pipeline.

## Verified token ids

USDC token ids are **network-specific**, so `network` is **required** — the USDC helper never
assumes mainnet. The ids are verified against the live Hedera Mirror Node and Circle's official
[USDC contract addresses](https://developers.circle.com/stablecoins/usdc-contract-addresses):

| Network    | USDC token id                                       |
| ---------- | --------------------------------------------------- |
| mainnet    | `0.0.456858`                                        |
| testnet    | `0.0.429274`                                        |
| previewnet | _not issued by Circle_ → throws `UnsupportedAssetError` |

```ts
import { getUsdcTokenId, USDC_TOKEN_IDS } from "@hbar-kit/payments"

getUsdcTokenId("mainnet") // "0.0.456858"
USDC_TOKEN_IDS.testnet // "0.0.429274"
```

## Custom / mock tokens (testnet & dev)

For local testing against a mock HTS token, pass an explicit `tokenId`. It is still parsed at 6
decimals and tagged as USDC:

```ts
const result = await verifyUsdcPayment({
  network: "testnet",
  tokenId: process.env.TESTNET_USDC_TOKEN_ID!, // your dev/mock token
  receiver: "0.0.12345",
  amount: "10.00",
  memo: "test_invoice_1",
})
```

Production mainnet flows should omit `tokenId` and use the verified canonical id.

## Amount precision

Amounts are **decimal strings**, never floats, and USDC is always **6 decimals**:

```ts
"25.00" // ✅ 25 USDC
"25.001234" // ✅ 6 decimals
"25.0012345" // ❌ 7 decimals → throws InvalidAmountError
```

## Production checklist

- **Always verify server-side.** Never trust a client-supplied amount, receiver, token id, or memo
  — look them up from your own records, keyed by an opaque order id.
- **Always use a time window** (`after`/`before`) to bound the search.
- **Use a unique memo per payment request** so duplicates are detectable.
- **Handle every status**, not just `confirmed`: `underpaid`, `overpaid`, `duplicate`, `mismatch`,
  `pending`, `expired`.
- **Use `comparison: "atLeast"` only if you accept overpayment**; the default is exact-match.
- **Use `transactionId` for idempotency** in your own database so each payment is processed once.

```ts
const result = await verifyUsdcPayment({
  network: "mainnet",
  receiver: "0.0.12345",
  amount: "25.00",
  memo: "invoice_123",
  after: new Date(Date.now() - 30 * 60 * 1000),
})

switch (result.status) {
  case "confirmed":
    // result.matched === true — settle the order, store result.transactionId
    break
  case "underpaid":
  case "overpaid":
  case "duplicate":
  case "mismatch":
  case "pending":
    // branch on each explicitly
    break
}
```

## Wait for a USDC payment

`waitForUsdcPayment` polls until the payment is confirmed (or `overpaid`/`duplicate`), or until
`timeoutMs` elapses (then `status: "expired"`). It mirrors `waitForHbarPayment` /
`waitForHtsPayment` and accepts `timeoutMs`, `pollIntervalMs`, and an `AbortSignal`:

```ts
import { waitForUsdcPayment } from "@hbar-kit/payments"

const result = await waitForUsdcPayment({
  network: "mainnet",
  receiver: "0.0.12345",
  amount: "25.00",
  memo: "invoice_123",
  timeoutMs: 5 * 60 * 1000,
  pollIntervalMs: 3000,
})
```

## When to use which

- **`verifyUsdcPayment`** — you're accepting USDC and want the token id + 6-decimal parsing handled
  for you. The common case.
- **`verifyHtsPayment`** — any other HTS token, or when you need full control over `tokenId` and
  `decimals`.
