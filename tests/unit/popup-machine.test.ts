import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  initialPopupMachine,
  stepPopup,
  type PopupMachine,
} from "../../src/map/popup-machine.ts";

const want = (index: number | null) => ({ type: "want", index }) as const;
const closed = { type: "closed" } as const;
const open = (index: number): PopupMachine => ({
  phase: { name: "open", index },
  wanted: index,
});

describe("popup machine", () => {
  it("opens the wanted card when the map is ready", () => {
    const step = stepPopup(initialPopupMachine, want(3), true);
    assert.deepEqual(step.effect, { type: "open", index: 3 });
    assert.deepEqual(step.machine, open(3));
  });

  it("waits while the map can't show a card, and opens later", () => {
    const waiting = stepPopup(initialPopupMachine, want(3), false);
    assert.equal(waiting.effect, null);
    assert.deepEqual(waiting.machine.phase, { name: "closed" });
    // e.g. the map stopped moving: step again with the same wish
    const later = stepPopup(waiting.machine, want(3), true);
    assert.deepEqual(later.effect, { type: "open", index: 3 });
  });

  it("does nothing when the open card is wanted again", () => {
    const step = stepPopup(open(3), want(3), true);
    assert.equal(step.effect, null);
    assert.deepEqual(step.machine, open(3));
  });

  it("closes the open card towards the next one", () => {
    const step = stepPopup(open(3), want(5), true);
    assert.deepEqual(step.effect, { type: "close", index: 3, toward: 5 });
    assert.deepEqual(step.machine.phase, { name: "closing", index: 3 });
  });

  it("closes without a next card", () => {
    const step = stepPopup(open(3), want(null), true);
    assert.deepEqual(step.effect, { type: "close", index: 3, toward: null });
  });

  it("keeps only the latest wish while closing, then opens that one", () => {
    let machine = stepPopup(open(3), want(4), true).machine;
    for (const index of [5, 6, 2]) {
      const step = stepPopup(machine, want(index), true);
      assert.equal(step.effect, null, "no second card mid-close");
      machine = step.machine;
    }
    const done = stepPopup(machine, closed, true);
    assert.deepEqual(done.effect, { type: "open", index: 2 });
  });

  it("can reopen the card that is closing (back and forth)", () => {
    const closing = stepPopup(open(3), want(4), true).machine;
    const back = stepPopup(closing, want(3), true).machine;
    const done = stepPopup(back, closed, true);
    assert.deepEqual(done.effect, { type: "open", index: 3 });
  });

  it("ends closed when nothing is wanted after the close", () => {
    const closing = stepPopup(open(3), want(null), true).machine;
    const done = stepPopup(closing, closed, true);
    assert.equal(done.effect, null);
    assert.deepEqual(done.machine, { phase: { name: "closed" }, wanted: null });
  });

  it("ignores a stray 'closed' when nothing is closing", () => {
    const step = stepPopup(open(3), closed, true);
    assert.equal(step.effect, null);
    assert.deepEqual(step.machine, open(3));
  });
});
