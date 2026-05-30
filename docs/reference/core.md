# @hbar-kit/core

## Money
`parseUnits(value, decimals)`, `formatUnits(value, decimals)`, `parseHbar(value)`, `formatHbar(value)` — bigint, strict.

## Network
`NETWORKS`, `resolveNetwork({ network?, baseUrl? })` → `NetworkConfig`.

## IDs & timestamps
`txIdToMirror`, `txIdToSdk`, `isEntityId`, `assertEntityId`, `parseTimestamp(raw)` → `HederaTimestamp`.

## Errors
`HbarKitError` and subclasses: `MirrorHttpError(.status)`, `RateLimitError(.retryAfter)`, `NotFoundError`,
`TimeoutError`, `NetworkError`, `InvalidAmountError`, `InvalidParamsError`, `PaymentVerificationError`.
