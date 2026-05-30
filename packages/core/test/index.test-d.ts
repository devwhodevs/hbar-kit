import { expectTypeOf } from "vitest"
import { parseHbar, resolveNetwork, type HederaNetwork, type NetworkConfig } from "../src/index.js"

expectTypeOf(parseHbar).returns.toEqualTypeOf<bigint>()
expectTypeOf(resolveNetwork).parameter(0).toMatchTypeOf<{ network?: HederaNetwork }>()
expectTypeOf(resolveNetwork).returns.toEqualTypeOf<NetworkConfig>()
