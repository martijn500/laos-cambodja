import { test, expect } from "@playwright/test";
import { readFileSync, readdirSync } from "node:fs";

// index.html preloads every module; a new module must be added there too
test("modulepreload lists exactly the modules in js/", () => {
  test.skip(
    test.info().project.name !== "desktop",
    "file check, once is enough",
  );
  const html = readFileSync("index.html", "utf8");
  const preloaded = [...html.matchAll(/rel="modulepreload" href="([^"]+)"/g)]
    .map((match) => match[1])
    .sort();
  const modules = readdirSync("js", { recursive: true })
    .filter((file) => file.endsWith(".js"))
    .map((file) => `js/${file}`)
    .sort();
  expect(preloaded).toEqual(modules);
});
