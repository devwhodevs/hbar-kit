import { InvalidParamsError } from "./errors.js"

export interface HederaTimestamp {
  readonly raw: string
  readonly seconds: number
  readonly nanos: number
  toNanos(): bigint
  toDate(): Date
}

const TS_RE = /^(\d{1,15})(?:\.(\d{1,9}))?$/

export function parseTimestamp(raw: string): HederaTimestamp {
  const m = TS_RE.exec(raw)
  if (!m) throw new InvalidParamsError(`Invalid timestamp: "${raw}"`)
  const seconds = Number(m[1])
  const nanosStr = (m[2] ?? "").padEnd(9, "0")
  const nanos = Number(nanosStr)
  return {
    raw,
    seconds,
    nanos,
    toNanos: () => BigInt(m![1]!) * 1_000_000_000n + BigInt(nanosStr || "0"),
    toDate: () => new Date(seconds * 1000 + Math.floor(nanos / 1_000_000)),
  }
}

export function dateToTimestamp(date: Date): string {
  const ms = date.getTime()
  const seconds = Math.floor(ms / 1000)
  const millis = ms - seconds * 1000
  return `${seconds}.${String(millis).padStart(3, "0")}000000`
}

export type TsOp = "eq" | "ne" | "gt" | "gte" | "lt" | "lte"

export function tsFilter(op: TsOp, value: string | Date): string {
  const v = value instanceof Date ? dateToTimestamp(value) : value
  return `${op}:${v}`
}
