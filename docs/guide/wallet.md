# Wallet (Phase 2)

> **Status: planned (Phase 2).** API documented ahead of implementation.

Connector-agnostic native-Hedera signing over WalletConnect. The dApp builds a transaction with the
Hedera SDK; the wallet signs and executes; hbar-kit confirms via Mirror Node.

```ts
import { createWalletClient, dAppConnector } from "@hbar-kit/wallet"
import { verifyHbarPayment } from "@hbar-kit/payments"

const wallet = createWalletClient({
  chain: "hedera:testnet",
  projectId: process.env.REOWN_PROJECT_ID!,
  metadata: { name: "Shop", description: "Demo", url: "https://shop.test", icons: [] },
})

const { transactionId } = await wallet.transfer({ to: "0.0.12345", amount: 100_000_000n, memo: "order-42" })
const result = await verifyHbarPayment({ network: "testnet", receiver: "0.0.12345", amount: "1", memo: "order-42" })
```

**Why confirm separately?** Wallets disagree on whether execution waits for a receipt, so the returned
`transactionId` is the source of truth and confirmation always goes through Mirror Node.
