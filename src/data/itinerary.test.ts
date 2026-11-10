import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { itinerary, stopAt } from "./itinerary.ts";

describe("itinerary", () => {
  it("numbers days in order and gives side quests their day's number", () => {
    let day = 0;
    for (const stop of itinerary) {
      if (stop.sideQuest) {
        assert.equal(stop.day, day, `${stop.title} shares its day`);
      } else {
        assert.equal(stop.day, day + 1, `${stop.title} is the next day`);
        day = stop.day;
      }
    }
  });

  it("gives every stop a unique slug: 08 for a day, 08-s1 for its side quest", () => {
    const slugs = itinerary.map((stop) => stop.slug);
    assert.equal(new Set(slugs).size, slugs.length);
    for (const stop of itinerary) {
      const day = String(stop.day).padStart(2, "0");
      assert.match(
        stop.slug,
        stop.sideQuest ? new RegExp(`^${day}-s\\d+$`) : new RegExp(`^${day}$`),
      );
    }
  });

  it("keeps a stop's date for its side quests", () => {
    for (const stop of itinerary.filter((s) => s.sideQuest)) {
      assert.equal(stopAt(stop.index - 1).date, stop.date);
    }
  });

  it("flips [lat, lng] into MapLibre's [lng, lat]", () => {
    const [lat, lng] = itinerary[0]!.location.coordinates;
    assert.deepEqual(itinerary[0]!.lngLat, [lng, lat]);
  });

  it("stopAt throws outside the trip", () => {
    assert.throws(() => stopAt(itinerary.length), /No stop at index/);
  });
});
