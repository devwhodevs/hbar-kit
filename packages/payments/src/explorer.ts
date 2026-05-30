import { NETWORKS, txIdToMirror, type HederaNetwork } from "@hbar-kit/core"

/** HashScan transaction link: consensus timestamp in path, tx id as ?tid query param. */
export function hashscanTxUrl(
  network: HederaNetwork,
  consensusTimestamp: string,
  transactionId: string,
): string {
  return `${NETWORKS[network].hashscan}/transaction/${consensusTimestamp}?tid=${txIdToMirror(transactionId)}`
}
