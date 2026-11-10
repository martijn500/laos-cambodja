import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { rgbStringToHsl } from "./color.ts";

describe("rgbStringToHsl", () => {
  it("converts the neon colours the beam uses", () => {
    assert.deepEqual(rgbStringToHsl("rgb(255, 0, 0)"), [0, 100, 50]);
    assert.deepEqual(rgbStringToHsl("rgb(0 255 0)"), [120, 100, 50]);
  });

  it("handles grey (no hue) and rgba strings", () => {
    assert.deepEqual(rgbStringToHsl("rgb(128, 128, 128)").slice(0, 2), [0, 0]);
    assert.deepEqual(rgbStringToHsl("rgba(0, 0, 255, 0.5)"), [240, 100, 50]);
  });

  it("falls back to neon pink for an unreadable colour", () => {
    const [hue] = rgbStringToHsl("transparent");
    assert.ok(hue > 320 && hue < 340, `pink hue, got ${hue}`);
  });
});
