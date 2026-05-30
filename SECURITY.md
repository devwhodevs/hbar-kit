# Security Policy

hbar-kit verifies **public** Hedera ledger data and is **read-only and non-custodial** — it never
holds funds, never requires private keys, and never signs transactions. Even so, because it is used
in payment-verification paths, we take security reports seriously.

## Supported versions

The latest published minor of each `@hbar-kit/*` package receives security fixes. Pre-1.0 releases
may ship fixes only on the most recent version.

## Reporting a vulnerability

**Please do not open a public issue for security problems.**

Report privately via either:

- GitHub's [private vulnerability reporting](https://github.com/devwhodevs/hbar-kit/security/advisories/new)
  (preferred), or
- email **devwhodevs@gmail.com** with the subject line `hbar-kit security`.

Please include:

- the affected package and version,
- a description of the issue and its impact,
- a minimal reproduction if possible.

We aim to acknowledge reports within 72 hours and to ship a fix or mitigation as quickly as the
severity warrants. We'll credit you in the release notes unless you prefer to remain anonymous.

## Verification guidance (not a vulnerability)

A few behaviors are **by design** — relying on them incorrectly is an integration bug, not a library
vulnerability:

- Memos are public and not unique. Correlate payments by memo **and** amount **and** recipient
  **and** time window — or use a per-request receiving account.
- Confirmation is the Mirror Node's consensus record, never a wallet's return value.
- Always pass a time window (`after`/`before`) and settle idempotently on `transactionId`.

See the [Production notes](https://devwhodevs.github.io/hbar-kit/guide/production-notes) for details.
