import { describe, it, expect } from "vitest"
import { isEntityId, assertEntityId, txIdToMirror, txIdToSdk } from "../src/ids.js"

describe("entity id", () => {
  it("validates shard.realm.num", () => {
    expect(isEntityId("0.0.12345")).toBe(true)
    expect(isEntityId("0.0.5449")).toBe(true)
    expect(isEntityId("0.0")).toBe(false)
    expect(isEntityId("x.y.z")).toBe(false)
    expect(isEntityId("0.0.-1")).toBe(false)
  })
  it("assertEntityId throws InvalidParamsError on bad input", () => {
    expect(() => assertEntityId("nope")).toThrowError(/invalid account/i)
    expect(() => assertEntityId("0.0.1")).not.toThrow()
  })
})

describe("transaction id conversion", () => {
  it("converts SDK @-form to Mirror dash-form with 9-digit nanos", () => {
    expect(txIdToMirror("0.0.4660654@1748625594.027894000")).toBe(
      "0.0.4660654-1748625594-027894000",
    )
    expect(txIdToMirror("0.0.10@1234567890.1")).toBe("0.0.10-1234567890-000000001")
  })
  it("passes through an already-dash-form id", () => {
    expect(txIdToMirror("0.0.4660654-1748625594-027894000")).toBe(
      "0.0.4660654-1748625594-027894000",
    )
  })
  it("converts Mirror dash-form back to SDK @-form", () => {
    expect(txIdToSdk("0.0.4660654-1748625594-027894000")).toBe(
      "0.0.4660654@1748625594.027894000",
    )
  })
  it("throws on malformed tx id", () => {
    expect(() => txIdToMirror("garbage")).toThrowError(/invalid transaction id/i)
  })
})
