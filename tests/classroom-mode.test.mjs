import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

function makeElement() {
  return {
    value: "",
    textContent: "",
    innerHTML: "",
    hidden: false,
    style: {},
    dataset: {},
    scrollTop: 0,
    _textNodes: [],
    classList: { add() {}, remove() {}, toggle() {} },
    querySelectorAll() { return []; },
    hasAttribute() { return false; },
    click() {},
  };
}

test("classroom mode manages 40 pupils, eight groups, timer and scores offline", async () => {
  const elements = new Map();
  const element = (id) => {
    if (!elements.has(id)) elements.set(id, makeElement());
    return elements.get(id);
  };

  const values = new Map();
  const localStorage = {
    getItem(key) { return values.has(key) ? values.get(key) : null; },
    setItem(key, value) { values.set(key, String(value)); },
    removeItem(key) { values.delete(key); },
  };
  const document = {
    getElementById: element,
    querySelectorAll() { return []; },
    createTreeWalker(root) {
      let index = 0;
      return { nextNode() { return root._textNodes[index++] || null; } };
    },
    createElement() { return makeElement(); },
  };
  const context = {
    console,
    document,
    localStorage,
    confirm: () => true,
    prompt: (_label, value) => value,
    setInterval,
    clearInterval,
    setTimeout,
    clearTimeout,
    Date,
    Math,
    Blob,
    URL,
    history: { replaceState() {} },
    location: { href: "", search: "" },
    addEventListener() {},
  };
  context.window = context;
  vm.createContext(context);

  const script = await readFile(new URL("../public/colouria/classroom.js", import.meta.url), "utf8");
  vm.runInContext(script, context, { filename: "classroom.js" });

  element("cm-class-name").value = "5 Bestari";
  element("cm-topic").value = "Warna primer dan sekunder";
  element("cm-duration").value = "60";
  element("cm-group-count").value = "8";
  element("cm-name-paste").value = Array.from({ length: 40 }, (_, index) => `${index + 1}. Murid ${index + 1}`).join("\n");
  element("screen-classroom")._textNodes = [
    { nodeValue: "⚙️ Persediaan" },
    { nodeValue: "Sediakan kelas" },
  ];

  context.initClassroom();
  context.cmAddPastedNames();
  context.cmSaveSetup();
  context.cmAutoGroup();

  let stored = JSON.parse(localStorage.getItem("c2_classroom_v1"));
  let classroom = stored.classes.find((item) => item.id === stored.activeClassId);
  assert.equal(classroom.students.length, 40);
  assert.equal(classroom.groups.length, 8);
  assert.deepEqual(classroom.groups.map((group) => group.studentIds.length), Array(8).fill(5));

  context.cmStartSession();
  stored = JSON.parse(localStorage.getItem("c2_classroom_v1"));
  classroom = stored.classes.find((item) => item.id === stored.activeClassId);
  assert.equal(classroom.sessionActive, true);
  assert.equal(classroom.timerRunning, true);
  assert.ok(classroom.timerEndsAt > Date.now());
  context.cmHandleNavigation("mix");
  assert.equal(element("cm-floating-bar").hidden, false);
  context.cmToggleTimer();
  assert.equal(element("cm-floating-bar").hidden, true);
  context.cmToggleTimer();
  assert.equal(element("cm-floating-bar").hidden, false);

  const firstGroup = classroom.groups[0];
  context.cmAdjustScore(firstGroup.id, 5);
  context.cmToggleActivity("detector");
  context.cmFinishSession();

  stored = JSON.parse(localStorage.getItem("c2_classroom_v1"));
  classroom = stored.classes.find((item) => item.id === stored.activeClassId);
  assert.equal(classroom.groups.find((group) => group.id === firstGroup.id).score, 5);
  assert.equal(classroom.activityDone.detector, true);
  assert.equal(classroom.sessionActive, false);
  assert.equal(classroom.timerRunning, false);

  context.cmSetLanguage("en");
  assert.match(element("cm-activity-grid").innerHTML, /Colour Detector/);
  assert.match(element("cm-scoreboard").innerHTML, /Red Team/);
  assert.equal(element("cm-timer-toggle").textContent, "▶ Start");
  assert.deepEqual(element("screen-classroom")._textNodes.map((node) => node.nodeValue), ["⚙️ Setup", "Set up the class"]);
  context.cmSetLanguage("bm");
  assert.match(element("cm-activity-grid").innerHTML, /Pengesan Warna/);

  localStorage.setItem("c2_lang", "en");
  context.initClassroom();
  assert.equal(element("cm-topic").value, "Primary and secondary colours");
  assert.equal(element("cm-timer-toggle").textContent, "▶ Start");
});

test("service worker refreshes app files online and keeps offline fallbacks", async () => {
  const sw = await readFile(new URL("../public/sw.js", import.meta.url), "utf8");
  assert.match(sw, /colouria-offline-v35-rocket1/);
  const staticFetch = sw.slice(sw.lastIndexOf("event.respondWith"));
  assert.ok(staticFetch.indexOf("await fetch(event.request)") < staticFetch.indexOf("await cache.match(event.request"));
});

test("mobile sound controls start music on their first tap", async () => {
  const artoriaBgm = await readFile(new URL("../public/artoria/bgm.js", import.meta.url), "utf8");
  const colouria = await readFile(new URL("../public/colouria/index.html", import.meta.url), "utf8");

  assert.match(artoriaBgm, /enabled = playing \? !enabled : true/);
  assert.match(artoriaBgm, /event\.target\.closest\?\.\("#artoriaSoundToggle"\)/);
  assert.match(colouria, /soundEnabled = SoftBGM\.playing \? !soundEnabled : true/);
  assert.match(colouria, /event\.target\.closest\?\.\('#soundToggleBtn'\)/);
  assert.match(artoriaBgm, /backgroundVolume = 4\.50/);
  assert.match(colouria, /BACKGROUND_VOLUME = 4\.50/);
  assert.match(artoriaBgm, /limiter\.ratio\.value = 20/);
  assert.match(colouria, /limiter\.ratio\.value = 20/);
  assert.match(artoriaBgm, /classroomTimerIsRunning/);
  assert.match(artoriaBgm, /artoriaClassroomBar/);
});

test("ARThink uses stricter line tracing and interactive bilingual missions offline", async () => {
  const enhancements = await readFile(new URL("../public/artoria/arthink-enhancements.js", import.meta.url), "utf8");
  const lineData = await readFile(new URL("../public/artoria/_next/static/chunks/363-67abd490ca23e6ee.js", import.meta.url), "utf8");
  const linePage = await readFile(new URL("../public/artoria/arthink-game-hub/elemen-seni/garisan/index.html", import.meta.url), "utf8");
  const manifest = await readFile(new URL("../public/offline-assets.json", import.meta.url), "utf8");

  assert.match(enhancements, /sequenceError/);
  assert.match(enhancements, /shapeSignalMatches/);
  assert.match(enhancements, /verticalReversals/);
  assert.match(enhancements, /nearestCoverage\(drawn, guide, tolerance\) < 0\.95/);
  assert.match(enhancements, /spiralShapeMatches/);
  assert.match(enhancements, /meaningful\.length !== 1/);
  assert.match(enhancements, /Misi Pengelas Rupa/);
  assert.match(enhancements, /Balance Mission/);
  assert.match(lineData, /id:"menegak"/);
  assert.doesNotMatch(lineData, /id:"putus"/);
  assert.match(linePage, /\/artoria\/arthink-enhancements\.js/);
  assert.match(manifest, /\/artoria\/arthink-enhancements\.js/);
});

test("classroom mode is accessed from the welcome screen instead of the main menu", async () => {
  const html = await readFile(new URL("../public/colouria/index.html", import.meta.url), "utf8");
  const welcomeStart = html.indexOf('id="screen-welcome"');
  const homeStart = html.indexOf('id="screen-home"');
  const classroomButton = html.indexOf('class="welcome-btn welcome-classroom-btn"');
  assert.ok(classroomButton > welcomeStart && classroomButton < homeStart);
  assert.doesNotMatch(html, /classroom-menu-card/);
});
