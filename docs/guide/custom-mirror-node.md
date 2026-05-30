# Use a custom Mirror Node

```ts
import { createMirrorClient } from "@hbar-kit/mirror"
import { verifyHbarPayment } from "@hbar-kit/payments"

const client = createMirrorClient({
  network: "mainnet",
  baseUrl: "https://your-mirror.example.com",
})

const result = await verifyHbarPayment({ client, receiver: "0.0.12345", amount: "5" })
```

Reusing one `client` reuses connections and the token-decimals cache. Local docker deployments are
typically `http://localhost:5551`.
