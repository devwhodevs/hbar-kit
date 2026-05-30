import { describe, it, expect } from "vitest"
import {
  HbarKitError, InvalidAmountError, InvalidParamsError, NotFoundError,
} from "../src/errors.js"

describe("error hierarchy", () => {
  it("all subclasses extend HbarKitError and set name", () => {
    const e = new InvalidAmountError("bad")
    expect(e).toBeInstanceOf(HbarKitError)
    expect(e).toBeInstanceOf(Error)
    expect(e.name).toBe("InvalidAmountError")
    expect(e.message).toBe("bad")
  })
  it("carries shortMessage and cause", () => {
    const cause = new Error("root")
    const e = new InvalidParamsError("nope", { cause })
    expect(e.shortMessage).toBe("nope")
    expect(e.cause).toBe(cause)
  })
  it("walk() returns the cause chain", () => {
    const root = new Error("root")
    const mid = new NotFoundError("mid", { cause: root })
    const top = new InvalidParamsError("top", { cause: mid })
    expect(top.walk((e) => e === root)).toBe(root)
  })
})
