# @hbar-kit/payments

## verifyHbarPayment(params)

| Param                 | Type                           | Notes                 |
| --------------------- | ------------------------------ | --------------------- |
| `network` \| `client` | network name \| `MirrorClient` | One is required.      |
| `receiver`            | `string`                       | Account ID `0.0.x`.   |
| `amount`              | `string`                       | HBAR, decimal string. |
| `memo`                | `string?`                      | Correlation key.      |
| `comparison`          | `"exact"\|"atLeast"`           | Default `"exact"`.    |
| `after` / `before`    | `Date\|string`                 | Time window.          |

Returns `Promise<PaymentResult>`:

```ts
interface PaymentResult {
  matched: boolean
  status:
    | "confirmed"
    | "pending"
    | "underpaid"
    | "overpaid"
    | "duplicate"
    | "mismatch"
    | "expired"
    | "failed"
  receiver: string
  asset: "HBAR" | { tokenId: string; decimals: number; symbol?: string }
  transactionId?: string
  payer?: string
  amount?: string
  amountBase?: bigint
  memo?: string
  consensusTimestamp?: string
  explorerUrl?: string
  matches: PaymentMatch[]
  reason?: string
}
```

## verifyHtsPayment(params)

Adds `tokenId: string` and optional `decimals?: number` (auto-fetched when omitted).

## verifyUsdcPayment(params)

Wrapper over `verifyHtsPayment` that resolves the verified USDC token id for `network` (**required**;
mainnet `0.0.456858`, testnet `0.0.429274`, previewnet throws `UnsupportedAssetError`) and forces
`decimals = 6`. Accepts an optional `tokenId` override (dev/mock tokens, still 6 decimals). The
result `asset` is tagged `{ tokenId, decimals: 6, symbol: "USDC" }`. See
[Verify a USDC payment](/guide/verify-usdc-payment).

Also exported: `getUsdcTokenId(network)`, `USDC_TOKEN_IDS`, `USDC_DECIMALS` (= 6), and
`isUsdcPaymentResult(result)`.

## waitForHbarPayment / waitForHtsPayment / waitForUsdcPayment

Adds `timeoutMs?`, `pollIntervalMs?`, `signal?`. Resolves `confirmed` or `expired`.
