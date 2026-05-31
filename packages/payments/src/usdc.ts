import {
  assertEntityId,
  InvalidParamsError,
  UnsupportedAssetError,
  type HederaNetwork,
} from "@hbar-kit/core"
import { verifyHtsPayment, type VerifyHtsParams } from "./verify.js"
import type { PaymentAsset, PaymentResult } from "./types.js"

/** USDC uses 6 decimals on every network Circle issues it on, including Hedera. */
export const USDC_DECIMALS = 6
const USDC_SYMBOL = "USDC"

/**
 * Canonical Circle-issued USDC token ids on Hedera, per network.
 *
 * Verified two independent ways before hardcoding — do NOT change without re-verifying both:
 *
 * 1. Live Hedera Mirror Node token metadata (on-chain ground truth):
 *    - mainnet `GET https://mainnet-public.mirrornode.hedera.com/api/v1/tokens/0.0.456858`
 *      → { symbol: "USDC", name: "USD Coin", decimals: "6", type: "FUNGIBLE_COMMON",
 *          treasury_account_id: "0.0.439909" }
 *    - testnet `GET https://testnet.mirrornode.hedera.com/api/v1/tokens/0.0.429274`
 *      → { symbol: "USDC", name: "USD Coin", decimals: "6", type: "FUNGIBLE_COMMON",
 *          treasury_account_id: "0.0.5176" }
 *
 * 2. Circle's official "USDC Contract Addresses" documentation:
 *    https://developers.circle.com/stablecoins/usdc-contract-addresses
 *    (Hedera row links to hashscan.io/mainnet/token/0.0.456858; Hedera Testnet row links to
 *    hashscan.io/testnet/token/0.0.429274). Circle publishes the native 0.0.x form, not an EVM
 *    address.
 *
 * Previewnet: Circle does not issue USDC there, so there is no verified id. `getUsdcTokenId`
 * throws rather than silently falling back to a mainnet/testnet id.
 */
export const USDC_TOKEN_IDS = {
  mainnet: "0.0.456858",
  testnet: "0.0.429274",
  previewnet: undefined,
} as const satisfies Record<HederaNetwork, string | undefined>

/** Resolve the verified USDC token id for a network, or throw if none is known for it. */
export function getUsdcTokenId(network: HederaNetwork): string {
  const tokenId = USDC_TOKEN_IDS[network]
  if (tokenId === undefined) {
    throw new UnsupportedAssetError(
      `USDC has no verified token id on Hedera ${network}. ` +
        `Pass an explicit \`tokenId\` to verify a custom token, or use "mainnet" or "testnet".`,
      { docsPath: "/guide/verify-usdc-payment" },
    )
  }
  return tokenId
}

/**
 * Params for {@link verifyUsdcPayment}. Same as {@link VerifyHtsParams} minus `tokenId`/`decimals`
 * (USDC is always 6 decimals) and with `network` **required** — USDC token ids and HashScan URLs are
 * network-specific, so there is no implicit default network for the USDC helper.
 */
export interface VerifyUsdcParams extends Omit<VerifyHtsParams, "tokenId" | "decimals" | "network"> {
  network: HederaNetwork
  /**
   * Override the canonical USDC token id — useful for a dev/testnet mock token. The amount is still
   * parsed at 6 decimals. Production mainnet flows should omit this and use the verified token id.
   */
  tokenId?: string
}

/**
 * Verify a USDC payment on Hedera. A convenience wrapper over {@link verifyHtsPayment} that resolves
 * the canonical USDC token id for `network`, forces 6-decimal amount parsing, and tags the result
 * asset as USDC. Every other semantic — `confirmed`/`pending`/`underpaid`/`overpaid`/`duplicate`/
 * `mismatch`/`expired`/`failed`, memo/amount/time-window matching — is identical to HTS verification.
 */
export async function verifyUsdcPayment(p: VerifyUsdcParams): Promise<PaymentResult> {
  if (!p.network) {
    throw new InvalidParamsError(
      "`network` is required for USDC verification — USDC token ids and explorer URLs are network-specific",
      { docsPath: "/guide/verify-usdc-payment" },
    )
  }
  const tokenId = p.tokenId ?? getUsdcTokenId(p.network)
  assertEntityId(tokenId)
  const result = await verifyHtsPayment({ ...p, tokenId, decimals: USDC_DECIMALS })
  // verifyHtsPayment always yields a token asset (never "HBAR"); tag it so consumers can show USDC.
  const asset: PaymentAsset =
    result.asset === "HBAR" ? result.asset : { ...result.asset, symbol: USDC_SYMBOL }
  return { ...result, asset }
}

/**
 * True when a PaymentResult was produced by {@link verifyUsdcPayment} (its asset is tagged
 * `symbol: "USDC"`). Useful for narrowing/displaying results from a mixed payment pipeline.
 */
export function isUsdcPaymentResult(result: PaymentResult): boolean {
  return typeof result.asset === "object" && result.asset.symbol === USDC_SYMBOL
}
