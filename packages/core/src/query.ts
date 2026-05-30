/** Deterministic, bigint-safe hash for TanStack Query keys (used from Phase 3). */
export function hashFn(key: unknown): string {
  return JSON.stringify(key, (_k, value) => {
    if (typeof value === "bigint") return `${value}#bigint`
    if (value && typeof value === "object" && !Array.isArray(value)) {
      return Object.keys(value as Record<string, unknown>)
        .sort()
        .reduce<Record<string, unknown>>((acc, k) => {
          acc[k] = (value as Record<string, unknown>)[k]
          return acc
        }, {})
    }
    return value
  })
}

/** Build a const-style [resource, options] query key, dropping undefined entries. */
export function makeQueryKey<T extends Record<string, unknown>>(
  resource: string,
  options: T,
): readonly [string, Partial<T>] {
  const filtered: Partial<T> = {}
  for (const [k, v] of Object.entries(options)) {
    if (v !== undefined) filtered[k as keyof T] = v as T[keyof T]
  }
  return [resource, filtered] as const
}
