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
  asset: "HBAR" | { tokenId: string; decimals: number }
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

## waitForHbarPayment / waitForHtsPayment

Adds `timeoutMs?`, `pollIntervalMs?`, `signal?`. Resolves `confirmed` or `expired`.
