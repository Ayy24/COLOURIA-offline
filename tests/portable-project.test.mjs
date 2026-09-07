import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");

test("project uses a standard Rocket-compatible Next.js TypeScript setup", async () => {
  const pkg = JSON.parse(await read("package.json"));
  const config = await read("next.config.ts");
  const files = JSON.stringify(pkg);

  assert.equal(pkg.scripts.dev, "next dev");
  assert.match(pkg.scripts.build, /^next build(?: --webpack)?$/);
  assert.ok(pkg.dependencies.next);
  assert.ok(pkg.devDependencies.typescript);
  assert.doesNotMatch(files, /vinext|wrangler|cloudflare/i);
  assert.match(config, /output: "export"/);
});

test("all core applications and offline support are present", async () => {
  const required = [
    "public/colouria/index.html",
    "public/colouria/classroom.js",
    "public/artoria/index.html",
    "public/artoria/ai-agent.js",
    "public/paint-runner/index.html",
    "public/manifest.webmanifest",
    "public/offline-assets.json",
    "public/sw.js",
  ];

  await Promise.all(required.map((path) => stat(new URL(path, root))));
  const assets = JSON.parse(await read("public/offline-assets.json"));
  for (const path of ["/colouria/index.html", "/artoria/index.html", "/paint-runner/index.html"]) {
    assert.ok(assets.includes(path), `${path} must be cached for offline use`);
  }
});

test("offline artwork agent remains local and bilingual", async () => {
  const agent = await read("public/artoria/ai-agent.js");
  assert.match(agent, /artoria-ai-agent-v3/);
  assert.match(agent, /Bukti AI \(keyakinan/);
  assert.match(agent, /AI evidence \(/);
  assert.doesNotMatch(agent, /\bfetch\s*\(/);
});

test("classroom and audio features remain available", async () => {
  const classroom = await read("public/colouria/classroom.js");
  const colouria = await read("public/colouria/index.html");
  const artoriaBgm = await read("public/artoria/bgm.js");
  assert.match(classroom, /c2_classroom_v1/);
  assert.match(classroom, /cmSetLanguage/);
  assert.match(classroom, /await window\.COLOURIA_XLSX_READY/);
  assert.match(colouria, /xlsx-loader\.js/);
  assert.match(colouria, /soundToggleBtn/);
  assert.match(artoriaBgm, /artoriaSoundToggle/);
});
