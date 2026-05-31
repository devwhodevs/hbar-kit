---
layout: home
hero:
  name: hbar-kit
  text: Native Hedera payment verification for TypeScript
  tagline: Verify HBAR & HTS payments by receiver, amount, memo & time window against the Mirror Node — read-only, non-custodial, in under 20 lines.
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: Verify a payment
      link: /guide/verify-hbar
features:
  - title: Read-only & non-custodial
    details: No private keys. Backend-safe verification against public Mirror Node data.
  - title: Decimal-safe
    details: bigint money end-to-end. No floating point. tinybars and HTS decimals handled correctly.
  - title: Every edge case
    details: Exact, partial, over, duplicate, wrong-memo, wrong-token, out-of-window — all explicit.
---

> **Status:** v0.1.x — beta, pre-1.0. Published to npm and tested; usable today for HBAR/HTS payment verification. The public API may change before 1.0, so pin a version.
