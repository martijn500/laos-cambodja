/**
 * Compares the site before and after a change, pixel by pixel.
 *
 *   node scripts/compare-screenshots.ts [base-ref] [page…]
 *   node scripts/compare-screenshots.ts origin/main dag-8 dag-14
 *
 * Builds base-ref (default origin/main) in a temporary git worktree and the
 * working tree as it is now, serves both like GitHub Pages, and takes
 * desktop and mobile screenshots of each page with the card open. The map
 * canvas is hidden: tiles differ from run to run. Prints per screenshot
 * how many pixels differ and where; the PNGs and a diff image land in the
 * printed folder. Exit code 1 when anything differs noticeably.
 */
import { execFileSync } from "node:child_process";
import {
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { createServer, type Server } from "node:http";
import { tmpdir } from "node:os";
import { extname, join, resolve } from "node:path";
import { chromium, devices, type Browser } from "@playwright/test";

const BASE_PATH = "/laos-cambodja/";
/** Sum of RGB differences above which a pixel counts as changed */
const TOLERANCE = 30;

const [baseRef = "origin/main", ...pageArgs] = process.argv.slice(2);
const pages = pageArgs.length ? pageArgs : ["dag-8", "dag-14"];
const root = resolve(import.meta.dirname, "..");
const work = mkdtempSync(join(tmpdir(), "compare-screenshots-"));

const TYPES: Record<string, string> = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".webp": "image/webp",
  ".png": "image/png",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
};

function build(sourceDir: string, outDir: string): void {
  execFileSync("npx", ["vite", "build", "--outDir", outDir, "--emptyOutDir"], {
    cwd: sourceDir,
    stdio: "ignore",
  });
}

/** Serves dist/ under BASE_PATH, /dag-8 -> dag-8.html, like GitHub Pages */
function serve(dir: string): Promise<{ server: Server; origin: string }> {
  const server = createServer((request, response) => {
    let path = new URL(request.url ?? "/", "http://x").pathname;
    path = decodeURIComponent(path).replace(BASE_PATH, "/");
    if (path.endsWith("/")) path += "index.html";
    if (!extname(path)) path += ".html";
    try {
      const body = readFileSync(join(dir, path));
      response.writeHead(200, {
        "content-type": TYPES[extname(path)] ?? "application/octet-stream",
      });
      response.end(body);
    } catch {
      response.writeHead(404).end();
    }
  });
  return new Promise((done) => {
    server.listen(0, () => {
      const address = server.address();
      const port = typeof address === "object" && address ? address.port : 0;
      done({ server, origin: `http://localhost:${port}` });
    });
  });
}

const VIEWPORTS = {
  desktop: { viewport: { width: 1400, height: 880 } },
  mobile: devices["Pixel 7"],
};

async function screenshot(
  browser: Browser,
  origin: string,
  page: string,
  viewport: keyof typeof VIEWPORTS,
  file: string,
): Promise<void> {
  const context = await browser.newContext({
    ...VIEWPORTS[viewport],
    reducedMotion: "reduce",
    // The site's CSP forbids the inline style that hides the map canvas
    bypassCSP: true,
  });
  const tab = await context.newPage();
  await tab.goto(`${origin}${BASE_PATH}${page}`);
  await tab
    .locator(".trip-popup-slide h2")
    .waitFor({ timeout: 15_000 })
    .catch(() => undefined); // no map (offline): compare the plain card
  await tab.waitForTimeout(1500);
  await tab.addStyleTag({ content: ".maplibregl-canvas{visibility:hidden}" });
  await tab.screenshot({ path: file });
  await context.close();
}

/** Changed pixels and their bounding box; writes the changes in red */
async function compare(
  browser: Browser,
  before: string,
  after: string,
  diffFile: string,
) {
  const tab = await browser.newPage();
  const dataUrl = (file: string) =>
    `data:image/png;base64,${readFileSync(file).toString("base64")}`;
  const result = await tab.evaluate(
    async ([a, b, tolerance]) => {
      const load = (src: string) =>
        new Promise<HTMLImageElement>((done) => {
          const image = new Image();
          image.onload = () => done(image);
          image.src = src;
        });
      const [imageA, imageB] = await Promise.all([load(a), load(b)]);
      const canvas = document.createElement("canvas");
      canvas.width = imageA.width;
      canvas.height = imageA.height;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("no canvas");
      context.drawImage(imageA, 0, 0);
      const pixelsA = context.getImageData(0, 0, canvas.width, canvas.height);
      context.drawImage(imageB, 0, 0);
      const pixelsB = context.getImageData(0, 0, canvas.width, canvas.height);
      let changed = 0;
      const box = { left: Infinity, top: Infinity, right: -1, bottom: -1 };
      for (let i = 0; i < pixelsA.data.length; i += 4) {
        const difference =
          Math.abs((pixelsA.data[i] ?? 0) - (pixelsB.data[i] ?? 0)) +
          Math.abs((pixelsA.data[i + 1] ?? 0) - (pixelsB.data[i + 1] ?? 0)) +
          Math.abs((pixelsA.data[i + 2] ?? 0) - (pixelsB.data[i + 2] ?? 0));
        if (difference <= tolerance) continue;
        changed += 1;
        const x = (i / 4) % canvas.width;
        const y = Math.floor(i / 4 / canvas.width);
        box.left = Math.min(box.left, x);
        box.top = Math.min(box.top, y);
        box.right = Math.max(box.right, x);
        box.bottom = Math.max(box.bottom, y);
        pixelsB.data.set([255, 0, 0, 255], i);
      }
      context.putImageData(pixelsB, 0, 0);
      return { changed, box, diff: canvas.toDataURL("image/png") };
    },
    [dataUrl(before), dataUrl(after), TOLERANCE] as const,
  );
  await tab.close();
  writeFileSync(
    diffFile,
    Buffer.from(result.diff.split(",")[1] ?? "", "base64"),
  );
  return result;
}

const worktree = join(work, "base");
execFileSync("git", ["worktree", "add", "--detach", worktree, baseRef], {
  cwd: root,
  stdio: "ignore",
});
let failed = false;
try {
  symlinkSync(join(root, "node_modules"), join(worktree, "node_modules"));
  console.log(`Bouwen: ${baseRef} en de huidige werkmap…`);
  build(worktree, join(work, "dist-before"));
  build(root, join(work, "dist-after"));
  const before = await serve(join(work, "dist-before"));
  const after = await serve(join(work, "dist-after"));
  const browser = await chromium.launch();
  for (const page of pages) {
    for (const viewport of Object.keys(
      VIEWPORTS,
    ) as (keyof typeof VIEWPORTS)[]) {
      const name = `${page}-${viewport}`;
      const files = {
        before: join(work, `${name}-before.png`),
        after: join(work, `${name}-after.png`),
        diff: join(work, `${name}-diff.png`),
      };
      await screenshot(browser, before.origin, page, viewport, files.before);
      await screenshot(browser, after.origin, page, viewport, files.after);
      const { changed, box } = await compare(
        browser,
        files.before,
        files.after,
        files.diff,
      );
      if (changed) failed = true;
      console.log(
        changed
          ? `✗ ${name}: ${changed} pixels anders, x ${box.left}–${box.right}, y ${box.top}–${box.bottom}`
          : `✓ ${name}: identiek`,
      );
    }
  }
  await browser.close();
  before.server.close();
  after.server.close();
} finally {
  execFileSync("git", ["worktree", "remove", "--force", worktree], {
    cwd: root,
    stdio: "ignore",
  });
  if (failed) console.log(`Screenshots en diffs (rood = anders): ${work}`);
  else rmSync(work, { recursive: true, force: true });
}
process.exit(failed ? 1 : 0);
