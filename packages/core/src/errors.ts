export interface HbarKitErrorOptions {
  cause?: unknown
  details?: string
  docsPath?: string
}

export class HbarKitError extends Error {
  readonly shortMessage: string
  readonly details: string | undefined
  readonly docsPath: string | undefined
  constructor(message: string, opts: HbarKitErrorOptions = {}) {
    super(message, opts.cause !== undefined ? { cause: opts.cause } : undefined)
    this.name = "HbarKitError"
    this.shortMessage = message
    this.details = opts.details
    this.docsPath = opts.docsPath
  }
  /** Walk the cause chain; returns the first error matching fn, or the deepest cause. */
  walk(fn?: (err: unknown) => boolean): unknown {
    return walkCauseChain(this, fn)
  }
}

/** Walk an error's cause chain; returns the first match for fn, or the deepest cause. */
function walkCauseChain(start: unknown, fn?: (err: unknown) => boolean): unknown {
  let current: unknown = start
  while (current) {
    if (fn?.(current)) return current
    const next: unknown = (current as { cause?: unknown }).cause
    if (!next) return fn ? null : current
    current = next
  }
  return null
}

export class MirrorHttpError extends HbarKitError {
  readonly status: number
  constructor(message: string, status: number, opts?: HbarKitErrorOptions) {
    super(message, opts)
    this.name = "MirrorHttpError"
    this.status = status
  }
}
export class RateLimitError extends MirrorHttpError {
  readonly retryAfter: number | undefined
  constructor(message: string, opts?: HbarKitErrorOptions & { retryAfter?: number }) {
    super(message, 429, opts)
    this.name = "RateLimitError"
    this.retryAfter = opts?.retryAfter
  }
}
export class NotFoundError extends HbarKitError {
  constructor(message: string, opts?: HbarKitErrorOptions) {
    super(message, opts); this.name = "NotFoundError"
  }
}
export class TimeoutError extends HbarKitError {
  constructor(message: string, opts?: HbarKitErrorOptions) {
    super(message, opts); this.name = "TimeoutError"
  }
}
export class NetworkError extends HbarKitError {
  constructor(message: string, opts?: HbarKitErrorOptions) {
    super(message, opts); this.name = "NetworkError"
  }
}
export class InvalidAmountError extends HbarKitError {
  constructor(message: string, opts?: HbarKitErrorOptions) {
    super(message, opts); this.name = "InvalidAmountError"
  }
}
export class InvalidParamsError extends HbarKitError {
  constructor(message: string, opts?: HbarKitErrorOptions) {
    super(message, opts); this.name = "InvalidParamsError"
  }
}
export class PaymentVerificationError extends HbarKitError {
  constructor(message: string, opts?: HbarKitErrorOptions) {
    super(message, opts); this.name = "PaymentVerificationError"
  }
}
