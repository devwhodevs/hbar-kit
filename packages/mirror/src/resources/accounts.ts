import { assertEntityId } from "@hbar-kit/core"
import type { Transport } from "../transport.js"
import { normalizeAccountBalance } from "../normalize.js"
import type { AccountBalance, RawAccount } from "../types.js"

export interface AccountsResource {
  getBalance(accountId: string): Promise<AccountBalance>
  isAssociated(accountId: string, tokenId: string): Promise<boolean>
}

export function createAccountsResource(transport: Transport): AccountsResource {
  return {
    async getBalance(accountId) {
      assertEntityId(accountId)
      return normalizeAccountBalance((await transport.get(`/api/v1/accounts/${accountId}`)) as RawAccount)
    },
    async isAssociated(accountId, tokenId) {
      assertEntityId(accountId)
      assertEntityId(tokenId)
      const body = (await transport.get(`/api/v1/accounts/${accountId}/tokens?token.id=${tokenId}`)) as { tokens?: unknown[] }
      return Array.isArray(body.tokens) && body.tokens.length > 0
    },
  }
}
