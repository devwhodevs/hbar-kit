# Next.js (Phase 4)

> **Status: planned (Phase 4).**

App-Router route-handler factories — fetch-only, run on Edge or Node.

```ts
// app/api/hbar/check/[id]/route.ts
import { createPaymentCheckHandler } from "@hbar-kit/next"
import { getRequest } from "@/lib/store"

export const { GET } = createPaymentCheckHandler({
  network: "testnet",
  loadRequest: (id) => getRequest(id), // amount derived server-side, never from the client
})
```

Security: derive the amount server-side from your DB/cart; the client only sends an opaque `paymentId`.
Webhooks always re-verify against Mirror Node before settling.
