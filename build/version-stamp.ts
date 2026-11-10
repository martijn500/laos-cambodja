import { execFileSync } from "node:child_process";
import type { Plugin } from "vite";

/** Short commit hash of the build, "+dirty" with uncommitted changes */
function gitVersion(): string {
  try {
    const hash = execFileSync("git", ["rev-parse", "--short", "HEAD"], {
      encoding: "utf8",
    }).trim();
    const dirty = execFileSync("git", ["status", "--porcelain"], {
      encoding: "utf8",
    }).trim();
    return dirty ? `${hash}+dirty` : hash;
  } catch {
    return "unknown";
  }
}

/**
 * <meta name="version" content="9216828 2026-11-10T10:30:00Z"> in every
 * page, so view-source on the live site says which commit it runs.
 */
export function versionStamp(): Plugin {
  return {
    name: "version-stamp",
    apply: "build",
    transformIndexHtml: () => [
      {
        tag: "meta",
        attrs: {
          name: "version",
          content: `${gitVersion()} ${new Date().toISOString().replace(/\.\d+Z$/, "Z")}`,
        },
        injectTo: "head",
      },
    ],
  };
}
