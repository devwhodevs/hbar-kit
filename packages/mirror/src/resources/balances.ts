import { assertEntityId } from "@hbar-kit/core"
import type { Transport } from "../transport.js"

export interface BalancesResource {
  get(accountId: string): Promise<{ accountId: string; balance: bigint; timestamp: string }>
}

export function createBalancesResource(transport: Transport): BalancesResource {
  return {
    async get(accountId) {
      assertEntityId(accountId)
      const body = (await transport.get(`/api/v1/balances?account.id=${accountId}&limit=1`)) as {
        timestamp: string
        balances: { account: string; balance: bigint }[]
      }
      return { accountId, balance: body.balances?.[0]?.balance ?? 0n, timestamp: body.timestamp }
    },
  }
}
