import { InvalidParamsError } from "./errors.js"

export type HederaNetwork = "mainnet" | "testnet" | "previewnet"

export interface NetworkConfig {
  network: HederaNetwork
  baseUrl: string
  hashscan: string
  currency: { symbol: "HBAR"; decimals: 8 }
}

export const NETWORKS: Record<HederaNetwork, NetworkConfig> = {
  mainnet: {
    network: "mainnet",
    baseUrl: "https://mainnet-public.mirrornode.hedera.com",
    hashscan: "https://hashscan.io/mainnet",
    currency: { symbol: "HBAR", decimals: 8 },
  },
  testnet: {
    network: "testnet",
    baseUrl: "https://testnet.mirrornode.hedera.com",
    hashscan: "https://hashscan.io/testnet",
    currency: { symbol: "HBAR", decimals: 8 },
  },
  previewnet: {
    network: "previewnet",
    baseUrl: "https://previewnet.mirrornode.hedera.com",
    hashscan: "https://hashscan.io/previewnet",
    currency: { symbol: "HBAR", decimals: 8 },
  },
}

export interface NetworkInput {
  network?: HederaNetwork
  baseUrl?: string
}

/** Resolve a network input to a full config. Requires `network` or `baseUrl`. */
export function resolveNetwork(input: NetworkInput): NetworkConfig {
  if (!input.network && !input.baseUrl) {
    throw new InvalidParamsError("`network` (or `baseUrl`) is required — there is no default")
  }
  const network: HederaNetwork = input.network ?? "mainnet"
  const preset = NETWORKS[network]
  const baseUrl = input.baseUrl ? input.baseUrl.replace(/\/+$/, "") : preset.baseUrl
  return { ...preset, baseUrl }
}
