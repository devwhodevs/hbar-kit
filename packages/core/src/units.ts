import { InvalidAmountError } from "./errors.js"

const AMOUNT_RE = /^(-?)(\d*)(?:\.(\d*))?$/

/** Parse a decimal string into a bigint in the smallest unit. Strict: rejects excess precision. */
export function parseUnits(value: string, decimals: number): bigint {
  const m = AMOUNT_RE.exec(value)
  if (!m || value === "" || value === "-" || value === ".") {
    throw new InvalidAmountError(`Invalid amount: "${value}"`)
  }
  const [, sign, whole = "", frac = ""] = m
  if (frac.length > decimals) {
    throw new InvalidAmountError(
      `Amount "${value}" has more precision than ${decimals} decimals allow`,
    )
  }
  const digits = `${whole}${frac.padEnd(decimals, "0")}` || "0"
  const base = BigInt(digits === "" ? "0" : digits)
  return sign === "-" ? -base : base
}

/** Format a bigint smallest-unit value into a trimmed decimal string. */
export function formatUnits(value: bigint, decimals: number): string {
  const neg = value < 0n
  const abs = neg ? -value : value
  const s = abs.toString().padStart(decimals + 1, "0")
  const whole = s.slice(0, s.length - decimals)
  const frac = decimals === 0 ? "" : s.slice(s.length - decimals).replace(/0+$/, "")
  const out = frac ? `${whole}.${frac}` : whole
  return neg && out !== "0" ? `-${out}` : out
}

export const HBAR_DECIMALS = 8
export const parseHbar = (value: string): bigint => parseUnits(value, HBAR_DECIMALS)
export const formatHbar = (value: bigint): string => formatUnits(value, HBAR_DECIMALS)
