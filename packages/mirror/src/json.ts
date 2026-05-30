// Fields whose integer values may exceed Number.MAX_SAFE_INTEGER and must be bigint.
const BIGINT_KEYS = ["amount", "balance", "charged_tx_fee", "serial_number"]

/**
 * Parse Mirror Node JSON, coercing known integer money fields to bigint losslessly.
 * Wraps `"key": <integer>` in a sentinel string BEFORE JSON.parse so large integers
 * never pass through a lossy JS number, then revives them as bigint.
 */
export function parseJsonWithBigInt(text: string): unknown {
  const keyAlternation = BIGINT_KEYS.join("|")
  const re = new RegExp(`("(?:${keyAlternation})"\\s*:\\s*)(-?\\d+)`, "g")
  const marked = text.replace(re, (_m, prefix: string, num: string) => `${prefix}" bi:${num}"`)
  return JSON.parse(marked, (_k, value) => {
    if (typeof value === "string" && value.startsWith(" bi:")) return BigInt(value.slice(4))
    return value
  })
}
