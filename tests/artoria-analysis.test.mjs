import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const chunkUrl = new URL(
  "../public/artoria/_next/static/chunks/app/analisis-karya-ai-analysis-screen/page-83eedbb3b6910340.js",
  import.meta.url,
);
const agentUrl = new URL("../public/artoria/ai-agent.js", import.meta.url);
const analysisPageUrl = new URL(
  "../public/artoria/analisis-karya-ai-analysis-screen/index.html",
  import.meta.url,
);

test("ARTORIA uses the enhanced offline artwork scanner", async () => {
  const source = await readFile(chunkUrl, "utf8");
  assert.match(source, /OFFLINE_VISION_VERSION="artoria-vision-v2"/);
  assert.match(source, /paletteBm/);
  assert.match(source, /balanceLR/);
  assert.match(source, /sharpness/);
  assert.match(source, /emptySpace/);
  assert.match(source, /Bukti imbasan:/);
  assert.match(source, /Gambar kelihatan kabur/);
  assert.doesNotMatch(source, /fetch\('\/api\/analyse-artwork'/);
});

test("ARTORIA routes valid scans through the offline AI agent", async () => {
  const [chunk, agent, page] = await Promise.all([
    readFile(chunkUrl, "utf8"),
    readFile(agentUrl, "utf8"),
    readFile(analysisPageUrl, "utf8"),
  ]);

  assert.match(chunk, /window\.ArtoriaAIAgent\.analyse/);
  assert.match(page, /src="\/artoria\/ai-agent\.js" defer/);
  assert.match(agent, /artoria-ai-agent-v3/);
  assert.match(agent, /function learnPalette/);
  assert.match(agent, /function projectionRhythm/);
  assert.match(agent, /Bukti AI \(keyakinan/);
  assert.match(agent, /AI evidence \(/);
  assert.doesNotMatch(agent, /\bfetch\s*\(/);
});
