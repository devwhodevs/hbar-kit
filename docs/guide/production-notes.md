# Production notes

- **Rate limits.** Public Mirror Nodes throttle (HTTP 429). hbar-kit retries with backoff + jitter
  and honors `Retry-After`. For sustained volume, self-host or use a commercial provider via `baseUrl`.
- **Time windows.** Always pass `after` (and ideally `before`). The range is capped at 7 days; hbar-kit
  paginates within your window.
- **Idempotency.** Settle on `transactionId`. Treat `duplicate` explicitly.
- **Network must match.** `network` is required — testnet IDs can't accidentally hit mainnet.
- **Memos are public and non-unique.** Correlate by memo + amount + receiver + window. For higher
  assurance use a per-request receiving account.
- **Confirmation = Mirror Node, not the wallet.** Even after Phase 2, always confirm via verification.
