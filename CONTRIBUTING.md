# Contributing to hbar-kit

Thanks for your interest in improving hbar-kit! This guide covers everything you need to get a
change merged.

## Prerequisites

- **Node.js >= 18** (CI runs on 20)
- **pnpm 10** (`corepack enable` then `corepack use pnpm@10`)

## Setup

```bash
git clone https://github.com/devwhodevs/hbar-kit.git
cd hbar-kit
pnpm install
pnpm build      # build all packages (workspace deps resolve through dist)
pnpm test       # run the full test suite
```

## Project layout

This is a pnpm + Turborepo monorepo.

- `packages/core` — zero-dependency primitives (bigint money, ids, timestamps, network, errors)
- `packages/mirror` — typed Hedera Mirror Node REST client
- `packages/payments` — HBAR/HTS payment verification
- `examples/*` — runnable demos
- `docs/` — VitePress documentation site

Packages depend on each other through their built `dist`, so **run `pnpm build` (or
`pnpm --filter @hbar-kit/<pkg> build`) for upstream packages before testing a dependent one.**

## Development workflow

We use **test-driven development**. For any change:

1. Write or update a failing test.
2. Run it and watch it fail: `pnpm --filter @hbar-kit/<pkg> test`
3. Implement the change.
4. Run it and watch it pass.
5. Keep tests honest — never weaken a test to make it pass. If a test reveals a real bug, fix the
   implementation.

Money is always `bigint` in the smallest unit — never floating point. Timestamps keep nanosecond
fidelity. See the design spec for the invariants the codebase relies on.

## Before you open a PR

Run the full pipeline locally — this is exactly what CI runs:

```bash
pnpm lint
pnpm typecheck
pnpm build
pnpm test
pnpm coverage        # core + payments enforce coverage thresholds
pnpm check:publish   # publint + are-the-types-wrong
```

### Add a changeset (required)

Every user-facing change needs a [changeset](https://github.com/changesets/changesets) so the
release notes and version bumps are generated correctly. CI **fails** a PR with no changeset.

```bash
pnpm changeset
```

Pick the affected package(s) and a bump type:

- **patch** — bug fix, no API change
- **minor** — new backwards-compatible feature
- **major** — breaking change

Internal-only changes (docs, examples, CI, tests) don't need a changeset — but if in doubt, add a
patch.

## Commit messages

We follow [Conventional Commits](https://www.conventionalcommits.org/):
`feat(payments): ...`, `fix(mirror): ...`, `docs: ...`, `chore: ...`, `test: ...`.

## Optional: live smoke test

The default suite runs entirely offline against captured fixtures. To sanity-check against the real
testnet Mirror Node (read-only, no keys needed):

```bash
HBARKIT_LIVE=1 pnpm --filter @hbar-kit/mirror test
```

## Code of Conduct

By participating you agree to abide by our [Code of Conduct](./CODE_OF_CONDUCT.md).
