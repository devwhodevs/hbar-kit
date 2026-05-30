import { InvalidParamsError } from "./errors.js"

const ENTITY_RE = /^\d+\.\d+\.\d+$/

export function isEntityId(value: string): boolean {
  return ENTITY_RE.test(value)
}
export function assertEntityId(value: string): string {
  if (!isEntityId(value)) throw new InvalidParamsError(`Invalid account/entity id: "${value}"`)
  return value
}

const padNanos = (nanos: string): string => nanos.padStart(9, "0").slice(0, 9)

// SDK form:  0.0.payer@seconds.nanos     Mirror form: 0.0.payer-seconds-nanos
const SDK_TX_RE = /^(\d+\.\d+\.\d+)@(\d+)\.(\d+)$/
const MIRROR_TX_RE = /^(\d+\.\d+\.\d+)-(\d+)-(\d+)$/

export function txIdToMirror(id: string): string {
  if (MIRROR_TX_RE.test(id)) return id
  const m = SDK_TX_RE.exec(id)
  if (!m) throw new InvalidParamsError(`Invalid transaction id: "${id}"`)
  const [, account, seconds, nanos] = m
  return `${account}-${seconds}-${padNanos(nanos!)}`
}
export function txIdToSdk(id: string): string {
  if (SDK_TX_RE.test(id)) return id
  const m = MIRROR_TX_RE.exec(id)
  if (!m) throw new InvalidParamsError(`Invalid transaction id: "${id}"`)
  const [, account, seconds, nanos] = m
  return `${account}@${seconds}.${padNanos(nanos!)}`
}
