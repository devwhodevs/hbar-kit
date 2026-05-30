# React (Phase 3)

> **Status: planned (Phase 3).**

Hooks built on TanStack Query.

```tsx
import { useHederaBalance, usePaymentStatus } from "@hbar-kit/react"

function Balance({ accountId }: { accountId: string }) {
  const { data } = useHederaBalance({ accountId })
  return <span>{data?.hbar} ℏ</span>
}

function Status({ transactionId }: { transactionId: string }) {
  const { data } = usePaymentStatus({ transactionId }) // polls until terminal
  return <span>{data?.status}</span>
}
```

Requires `@tanstack/react-query` plus `HbarKitProvider` + `QueryClientProvider`.
