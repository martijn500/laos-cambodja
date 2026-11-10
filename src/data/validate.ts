import type { Stop } from "./itinerary.ts";

/** What exists on disk, as found by build/photo-manifest.ts */
export interface MediaOnDisk {
  /** slug -> number of photos 01.webp, 02.webp… (no gaps) */
  photoCounts: Readonly<Record<string, number>>;
  /** slugs that have img/slides/<slug>/thumb.webp */
  thumbs: ReadonlySet<string>;
  /** slugs that have img/cartoons/<slug>.webp */
  cartoons: ReadonlySet<string>;
  /** files in img/slides/ after a gap in the numbering, never shown */
  strayPhotos: readonly string[];
}

/**
 * Everything that would show up as a broken or empty card. Run at build
 * and dev-server start, so a missing photo fails there and not on the
 * live site.
 */
export function findTripProblems(
  itinerary: readonly Stop[],
  media: MediaOnDisk,
): string[] {
  const problems: string[] = [];
  for (const stop of itinerary) {
    const where = `${stop.slug} (${stop.title})`;
    if (!media.photoCounts[stop.slug]) {
      problems.push(`${where}: geen foto's in img/slides/${stop.slug}/`);
    }
    if (!media.thumbs.has(stop.slug)) {
      problems.push(
        `${where}: geen img/slides/${stop.slug}/thumb.webp (npm run images thumbs)`,
      );
    }
    if (stop.caricature !== false && !media.cartoons.has(stop.slug)) {
      problems.push(`${where}: geen cartoon img/cartoons/${stop.slug}.webp`);
    }
    const [lat, lng] = stop.location.coordinates;
    if (Math.abs(lat) > 90 || Math.abs(lng) > 180) {
      problems.push(`${where}: coördinaten [${lat}, ${lng}] bestaan niet`);
    }
  }
  for (const file of media.strayPhotos) {
    problems.push(
      `${file} wordt nooit getoond: er ontbreekt een eerder nummer`,
    );
  }
  const slugs = new Set(itinerary.map((stop) => stop.slug));
  for (const slug of Object.keys(media.photoCounts)) {
    if (!slugs.has(slug)) {
      problems.push(`img/slides/${slug}/ hoort bij geen enkele stop`);
    }
  }
  return problems;
}
