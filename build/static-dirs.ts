import { cpSync } from "node:fs";
import type { Plugin } from "vite";

/**
 * Copies folders the app loads by path at runtime (img/slides/08/01.webp)
 * into dist/ as they are. public/ would do the same, but the originals
 * next to them (img/slides-src/) must not end up in the build.
 */
export function staticDirs(folders: string[]): Plugin {
  return {
    name: "static-dirs",
    apply: "build",
    writeBundle({ dir = "dist" }) {
      for (const folder of folders) {
        cpSync(folder, `${dir}/${folder}`, { recursive: true });
      }
    },
  };
}
