import { existsSync, readdirSync } from "node:fs";
import type { Plugin, ViteDevServer } from "vite";
import { itinerary } from "../src/data/itinerary.ts";
import { findTripProblems, type MediaOnDisk } from "../src/data/validate.ts";

const VIRTUAL_ID = "virtual:photo-manifest";
const RESOLVED_ID = `\0${VIRTUAL_ID}`;
const SLIDES_DIR = "img/slides";
const CARTOONS_DIR = "img/cartoons";

const photoName = (number: number) => `${String(number).padStart(2, "0")}.webp`;

/** Photos are 01.webp, 02.webp…; count up to the first gap */
function countPhotos(files: ReadonlySet<string>): number {
  let count = 0;
  while (files.has(photoName(count + 1))) count += 1;
  return count;
}

export function readMedia(): MediaOnDisk {
  const photoCounts: Record<string, number> = {};
  const strayPhotos: string[] = [];
  for (const entry of readdirSync(SLIDES_DIR, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const folder = `${SLIDES_DIR}/${entry.name}`;
    const files = new Set(readdirSync(folder));
    const count = countPhotos(files);
    photoCounts[entry.name] = count;
    for (const file of files) {
      const number = /^(\d+)\.webp$/.exec(file)?.[1];
      if (number && Number(number) > count)
        strayPhotos.push(`${folder}/${file}`);
    }
  }
  const cartoons = new Set(
    existsSync(CARTOONS_DIR)
      ? readdirSync(CARTOONS_DIR)
          .filter((file) => file.endsWith(".webp"))
          .map((file) => file.slice(0, -".webp".length))
      : [],
  );
  return { photoCounts, cartoons, strayPhotos };
}

/**
 * `import { photoCounts } from "virtual:photo-manifest"` gives the number
 * of photos per slide, read from img/slides/ when the app is built or the
 * dev server starts. The gallery then knows how many photos there are
 * instead of probing 02, 03… until one 404s. Missing photos or cartoons
 * stop the build with a list of what is missing.
 */
export function photoManifest(): Plugin {
  let server: ViteDevServer | undefined;
  return {
    name: "photo-manifest",
    configureServer(devServer) {
      server = devServer;
      // A photo added or removed while `npm run dev` runs: rebuild the
      // manifest and reload the page
      devServer.watcher.add([SLIDES_DIR, CARTOONS_DIR]);
      const refresh = (file: string) => {
        if (!/img[\\/](slides|cartoons)[\\/]/.test(file)) return;
        const module = devServer.moduleGraph.getModuleById(RESOLVED_ID);
        if (module) devServer.moduleGraph.invalidateModule(module);
        devServer.ws.send({ type: "full-reload" });
      };
      devServer.watcher.on("add", refresh).on("unlink", refresh);
    },
    resolveId(id) {
      return id === VIRTUAL_ID ? RESOLVED_ID : undefined;
    },
    load(id) {
      if (id !== RESOLVED_ID) return undefined;
      const media = readMedia();
      const problems = findTripProblems(itinerary, media);
      if (problems.length) {
        const message = `Reisdata klopt niet:\n  ${problems.join("\n  ")}`;
        // In dev show it in the browser overlay instead of stopping
        if (server) server.config.logger.error(message);
        else this.error(message);
      }
      return `export const photoCounts = ${JSON.stringify(media.photoCounts)};`;
    },
  };
}
