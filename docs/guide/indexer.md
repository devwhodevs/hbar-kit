# Indexer (Phase 5)

> **Status: planned (Phase 5).**

A small, optional forward-only indexer over the Mirror Node. Hedera's aBFT finality means no reorgs,
so a `consensus_timestamp` cursor is sufficient.

```ts
import { createIndexer } from "@hbar-kit/indexer"

const indexer = createIndexer({
  client,
  path: "/api/v1/transactions",
  query: { "account.id": "0.0.12345" },
  checkpointKey: "payments",
  checkpointStore,
  select: (page) => page.transactions,
  cursorOf: (tx) => tx.consensus_timestamp,
  onBatch: async (rows) => {
    /* idempotent upsert keyed by consensus_timestamp */
  },
})
await indexer.syncToHead() // safe to run-then-exit on serverless/cron
```

A `finalityLagMs` buffer absorbs mirror ingestion lag. An optional gRPC `TopicMessageQuery` variant
shares the same checkpoint contract.
