import { resolveNetwork, type NetworkInput } from "@hbar-kit/core"
import { http, type TransportOptions, type Transport } from "./transport.js"
import { createTransactionsResource, type TransactionsResource } from "./resources/transactions.js"
import { createAccountsResource, type AccountsResource } from "./resources/accounts.js"
import { createTokensResource, type TokensResource } from "./resources/tokens.js"
import { createBalancesResource, type BalancesResource } from "./resources/balances.js"

export interface MirrorClientConfig extends NetworkInput, TransportOptions {
  transport?: Transport
}

export interface MirrorClient {
  baseUrl: string
  transport: Transport
  transactions: TransactionsResource
  accounts: AccountsResource
  tokens: TokensResource
  balances: BalancesResource
}

export function createMirrorClient(config: MirrorClientConfig): MirrorClient {
  const { baseUrl } = resolveNetwork(config)
  const transportOptions: TransportOptions = {}
  if (config.fetch !== undefined) transportOptions.fetch = config.fetch
  if (config.retryCount !== undefined) transportOptions.retryCount = config.retryCount
  if (config.retryDelay !== undefined) transportOptions.retryDelay = config.retryDelay
  if (config.timeout !== undefined) transportOptions.timeout = config.timeout
  if (config.headers !== undefined) transportOptions.headers = config.headers
  const transport = config.transport ?? http(baseUrl, transportOptions)
  return {
    baseUrl: transport.baseUrl,
    transport,
    transactions: createTransactionsResource(transport),
    accounts: createAccountsResource(transport),
    tokens: createTokensResource(transport),
    balances: createBalancesResource(transport),
  }
}
