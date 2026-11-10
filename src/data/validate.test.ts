import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { itinerary } from "./itinerary.ts";
import { findTripProblems, type MediaOnDisk } from "./validate.ts";

/** Everything present: one photo and a cartoon for every stop */
function completeMedia(): MediaOnDisk {
  return {
    photoCounts: Object.fromEntries(itinerary.map((stop) => [stop.slug, 1])),
    thumbs: new Set(itinerary.map((stop) => stop.slug)),
    cartoons: new Set(itinerary.map((stop) => stop.slug)),
    strayPhotos: [],
  };
}

describe("findTripProblems", () => {
  it("is quiet when every stop has photos and a cartoon", () => {
    assert.deepEqual(findTripProblems(itinerary, completeMedia()), []);
  });

  it("reports a stop without photos", () => {
    const media = completeMedia();
    const photoCounts = { ...media.photoCounts, "08": 0 };
    const problems = findTripProblems(itinerary, { ...media, photoCounts });
    assert.equal(problems.length, 1);
    assert.match(problems[0]!, /^08 .*geen foto's/);
  });

  it("reports a missing cartoon", () => {
    const media = completeMedia();
    const cartoons = new Set([...media.cartoons].filter((s) => s !== "12-s1"));
    const problems = findTripProblems(itinerary, { ...media, cartoons });
    assert.match(problems.join("\n"), /12-s1 .*geen cartoon/);
  });

  it("reports photos after a gap and folders without a stop", () => {
    const media = completeMedia();
    const problems = findTripProblems(itinerary, {
      ...media,
      photoCounts: { ...media.photoCounts, "99": 1 },
      strayPhotos: ["img/slides/14/04.webp"],
    });
    assert.equal(problems.length, 2);
    assert.match(problems.join("\n"), /14\/04\.webp wordt nooit getoond/);
    assert.match(problems.join("\n"), /img\/slides\/99\/ hoort bij geen/);
  });
});
