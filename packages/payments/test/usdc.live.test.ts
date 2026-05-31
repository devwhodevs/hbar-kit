import { describe, it, expect } from "vitest"
import { createMirrorClient } from "@hbar-kit/mirror"
import { USDC_TOKEN_IDS, getUsdcTokenId, USDC_DECIMALS } from "../src/usdc.js"

const LIVE = process.env.HBARKIT_LIVE === "1"

/**
 * Opt-in, read-only live check against the public Hedera Mirror Node. Confirms the hardcoded USDC
 * token ids still resolve to the real Circle USDC on each network. No private keys, no funds moved —
 * only a public token-metadata read. Skipped unless HBARKIT_LIVE=1 so it never blocks normal CI.
 *
 *   HBARKIT_LIVE=1 pnpm --filter @hbar-kit/payments test
 */
describe.runIf(LIVE)("USDC registry — live Mirror Node smoke (opt-in)", () => {
  for (const network of ["mainnet", "testnet"] as const) {
    it(
      `${network} USDC token ${USDC_TOKEN_IDS[network]} exists with symbol USDC and 6 decimals`,
      async () => {
        const client = createMirrorClient({ network })
        const token = await client.tokens.get(getUsdcTokenId(network))
        expect(token.tokenId).toBe(USDC_TOKEN_IDS[network])
        expect(token.symbol).toBe("USDC")
        expect(token.decimals).toBe(USDC_DECIMALS)
        expect(token.type).toBe("FUNGIBLE_COMMON")
      },
      20_000,
    )
  }
})
