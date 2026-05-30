import { assertEntityId } from "@hbar-kit/core"
import type { Transport } from "../transport.js"
import { normalizeToken } from "../normalize.js"
import type { RawToken, Token } from "../types.js"

export interface TokensResource {
  get(tokenId: string): Promise<Token>
}

export function createTokensResource(transport: Transport): TokensResource {
  return {
    async get(tokenId) {
      assertEntityId(tokenId)
      return normalizeToken((await transport.get(`/api/v1/tokens/${tokenId}`)) as RawToken)
    },
  }
}
