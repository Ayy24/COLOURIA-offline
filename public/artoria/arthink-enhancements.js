(() => {
  "use strict";

  if (!location.pathname.includes("/artoria/arthink-game-hub")) return;

  const copy = new Map([
    ["Adakah ini rupa ORGANIK atau GEOMETRIK?", "Misi Pengelas Rupa 🕵️: Teliti cirinya, kemudian pilih ORGANIK atau GEOMETRIK."],
    ["Is this shape ORGANIC or GEOMETRIC?", "Shape Sorter Mission 🕵️: Study its features, then choose ORGANIC or GEOMETRIC."],
    ["Rupa 2D ini akan menjadi bentuk 3D yang mana?", "Misi Pembina 3D 🧊: Pilih bentuk 3D yang paling sepadan dengan rupa 2D ini."],
    ["Which 3D form will this 2D shape become?", "3D Builder Mission 🧊: Choose the 3D form that best matches this 2D shape."],
    ["Campurkan dua warna ini. Apakah hasilnya?", "Misi Makmal Warna 🧪: Ramalkan warna baharu apabila dua warna ini dicampurkan."],
    ["Mix these two colours. What is the result?", "Colour Lab Mission 🧪: Predict the new colour made by mixing these two colours."],
    ["Apakah jenis jalinan objek ini?", "Misi Detektif Jalinan 🔍: Perhatikan objek, kemudian pilih jalinan yang paling tepat."],
    ["What type of texture does this object have?", "Texture Detective Mission 🔍: Observe the object, then choose its most accurate texture."],
    ["Pilih kombinasi warna yang HARMONI.", "Misi Harmoni 🎼: Pilih gabungan warna yang kelihatan selaras dan menyenangkan."],
    ["Choose the HARMONIOUS colour combination.", "Harmony Mission 🎼: Choose the colour combination that looks coordinated and pleasing."],
    ["Adakah pasangan ini menunjukkan KONTRA yang kuat?", "Misi Kontra ⚡: Bandingkan kedua-duanya—adakah perbezaannya jelas dan kuat?"],
    ["Does this pair show STRONG CONTRAST?", "Contrast Mission ⚡: Compare the pair—are their visual differences clear and strong?"],
    ["Adakah komposisi ini SEIMBANG?", "Misi Imbangan ⚖️: Bandingkan berat visual kiri dan kanan. Adakah komposisi ini seimbang?"],
    ["Is this composition BALANCED?", "Balance Mission ⚖️: Compare the visual weight on both sides. Is the composition balanced?"],
    ["Adakah corak ini mempunyai IRAMA yang jelas?", "Misi Irama 🥁: Cari ulangan yang teratur. Adakah corak ini mempunyai irama yang jelas?"],
    ["Does this pattern have a clear RHYTHM?", "Rhythm Mission 🥁: Look for an orderly repetition. Does this pattern have a clear rhythm?"],
    ["Adakah komposisi ini menunjukkan KESATUAN?", "Misi Kesatuan 🧩: Adakah semua unsur kelihatan saling berkaitan sebagai satu komposisi?"],
    ["Does this composition show UNITY?", "Unity Mission 🧩: Do all the elements look connected as one composition?"],
    ["Pilih komposisi yang menunjukkan kontra paling kuat!", "Cabaran Mata Helang 👀: Pilih komposisi dengan perbezaan visual yang paling ketara!"],
    ["Choose the composition with the strongest contrast!", "Eagle Eye Challenge 👀: Choose the composition with the clearest visual difference!"],
    ["Pilih komposisi yang menunjukkan KEPELBAGAIAN tanpa kelihatan huru-hara.", "Misi Kepelbagaian 🎨: Pilih komposisi yang pelbagai tetapi masih tersusun dan bersatu."],
    ["Choose the composition showing VARIETY without looking chaotic.", "Variety Mission 🎨: Choose a varied composition that still looks organised and unified."]
  ]);

  const routeIcons = {
    garisan: ["〰️", "✏️〰️"], rupa: ["🔷", "🍃🔷"], bentuk: ["📦", "🧊🏗️"],
    warna: ["🌈", "🎨🧪"], ruang: ["🌌", "🔭🌌"], jalinan: ["🧶", "🧶🔍"],
    harmoni: ["🎵", "🎨🎼"], kontra: ["⚡", "🌗⚡"], imbangan: ["⚖️", "🎨⚖️"],
    irama: ["🥁", "🔁🥁"], pergerakan: ["💨", "🌀🏃"], penegasan: ["🎯", "🔦🎯"],
    kesatuan: ["🤝", "🧩🤝"], kepelbagaian: ["🎨", "🎭🌈"]
  };

  const lineKinds = {
    "Garisan Lurus": "straight", "Straight Line": "straight",
    "Garisan Menegak": "vertical", "Vertical Line": "vertical",
    "Garisan Melengkung": "curve", "Curved Line": "curve",
    "Garisan Zigzag": "zigzag", "Zigzag Line": "zigzag",
    "Garisan Beralun": "wave", "Wavy Line": "wave",
    "Garisan Berspiral": "spiral", "Spiral Line": "spiral"
  };

  let strokes = [];
  let drawing = false;
  let challenge = "";

  function canvasPoint(event, canvas) {
    const rect = canvas.getBoundingClientRect();
    return { x: (event.clientX - rect.left) * canvas.width / rect.width, y: (event.clientY - rect.top) * canvas.height / rect.height };
  }

  function lineTitle() {
    const canvas = document.querySelector("canvas[aria-label='Kanvas lukisan'],canvas[aria-label='Drawing canvas']");
    const card = canvas?.closest(".bg-white");
    return card?.querySelector("h3")?.textContent.trim() || "";
  }

  function distance(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  function pathLength(path) {
    let total = 0;
    for (let index = 1; index < path.length; index++) total += distance(path[index - 1], path[index]);
    return total;
  }

  function compactPath(path) {
    const compact = [];
    path.forEach((point) => {
      if (!compact.length || distance(compact[compact.length - 1], point) >= 2) compact.push(point);
    });
    return compact;
  }

  function resamplePath(path, count = 96) {
    if (path.length < 2) return [];
    const lengths = [0];
    for (let index = 1; index < path.length; index++) lengths.push(lengths[index - 1] + distance(path[index - 1], path[index]));
    const total = lengths[lengths.length - 1];
    if (total < 1) return [];
    const result = [];
    let segment = 1;
    for (let index = 0; index < count; index++) {
      const target = total * index / (count - 1);
      while (segment < lengths.length - 1 && lengths[segment] < target) segment++;
      const before = lengths[segment - 1];
      const span = Math.max(0.0001, lengths[segment] - before);
      const amount = (target - before) / span;
      result.push({
        x: path[segment - 1].x + (path[segment].x - path[segment - 1].x) * amount,
        y: path[segment - 1].y + (path[segment].y - path[segment - 1].y) * amount
      });
    }
    return result;
  }

  function quadratic(start, control, end, count) {
    return Array.from({ length: count }, (_, index) => {
      const t = index / (count - 1);
      const mt = 1 - t;
      return {
        x: mt * mt * start.x + 2 * mt * t * control.x + t * t * end.x,
        y: mt * mt * start.y + 2 * mt * t * control.y + t * t * end.y
      };
    });
  }

  function spiralGuide(count = 128) {
    const turns = 3.35;
    return Array.from({ length: count }, (_, index) => {
      const progress = index / (count - 1);
      const radius = 7 + 70 * progress;
      const angle = -Math.PI / 2 + progress * Math.PI * 2 * turns;
      return { x: 200 + Math.cos(angle) * radius, y: 100 + Math.sin(angle) * radius };
    });
  }

  function guideFor(kind) {
    if (kind === "straight") return resamplePath([{ x: 30, y: 100 }, { x: 370, y: 100 }]);
    if (kind === "vertical") return resamplePath([{ x: 200, y: 20 }, { x: 200, y: 180 }]);
    if (kind === "curve") return quadratic({ x: 30, y: 130 }, { x: 200, y: 30 }, { x: 370, y: 130 }, 96);
    if (kind === "zigzag") return resamplePath([
      { x: 30, y: 70 }, { x: 90, y: 130 }, { x: 150, y: 70 }, { x: 210, y: 130 },
      { x: 270, y: 70 }, { x: 330, y: 130 }, { x: 370, y: 90 }
    ]);
    if (kind === "wave") {
      const sections = [
        [{ x: 30, y: 100 }, { x: 80, y: 50 }, { x: 130, y: 100 }],
        [{ x: 130, y: 100 }, { x: 180, y: 150 }, { x: 230, y: 100 }],
        [{ x: 230, y: 100 }, { x: 280, y: 50 }, { x: 330, y: 100 }],
        [{ x: 330, y: 100 }, { x: 355, y: 125 }, { x: 370, y: 110 }]
      ];
      return resamplePath(sections.flatMap((section, index) => quadratic(...section, 28).slice(index ? 1 : 0)), 96);
    }
    if (kind === "spiral") return spiralGuide();
    return [];
  }

  function percentile(values, amount) {
    const sorted = [...values].sort((a, b) => a - b);
    return sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * amount))];
  }

  function nearestCoverage(source, target, tolerance) {
    return source.filter((point) => target.some((guidePoint) => distance(point, guidePoint) <= tolerance)).length / source.length;
  }

  function sequenceError(drawn, guide) {
    const compare = (candidate) => candidate.map((point, index) => distance(point, guide[index]));
    const forward = compare(drawn);
    const reversed = [...drawn].reverse();
    const backward = compare(reversed);
    const forwardMean = forward.reduce((sum, value) => sum + value, 0) / forward.length;
    const backwardMean = backward.reduce((sum, value) => sum + value, 0) / backward.length;
    return forwardMean <= backwardMean
      ? { mean: forwardMean, p90: percentile(forward, 0.9), aligned: drawn }
      : { mean: backwardMean, p90: percentile(backward, 0.9), aligned: reversed };
  }

  function valueSpan(values) {
    return Math.max(...values) - Math.min(...values);
  }

  function correlation(values, target) {
    const meanA = values.reduce((sum, value) => sum + value, 0) / values.length;
    const meanB = target.reduce((sum, value) => sum + value, 0) / target.length;
    let numerator = 0;
    let varianceA = 0;
    let varianceB = 0;
    values.forEach((value, index) => {
      const a = value - meanA;
      const b = target[index] - meanB;
      numerator += a * b;
      varianceA += a * a;
      varianceB += b * b;
    });
    return numerator / Math.sqrt(Math.max(0.0001, varianceA * varianceB));
  }

  function verticalReversals(path) {
    const directions = [];
    for (let index = 8; index < path.length; index += 8) {
      const delta = path[index].y - path[index - 8].y;
      if (Math.abs(delta) < 4) continue;
      const direction = Math.sign(delta);
      if (directions[directions.length - 1] !== direction) directions.push(direction);
    }
    return Math.max(0, directions.length - 1);
  }

  function shapeSignalMatches(kind, path, guide) {
    const xs = path.map((point) => point.x);
    const ys = path.map((point) => point.y);
    const width = valueSpan(xs);
    const height = valueSpan(ys);
    const directness = distance(path[0], path[path.length - 1]) / Math.max(1, pathLength(path));
    if (kind === "straight") return width >= 285 && height <= 26 && directness >= 0.86;
    if (kind === "vertical") return height >= 130 && width <= 26 && directness >= 0.86;
    if (!["curve", "zigzag", "wave"].includes(kind)) return true;

    const guideY = guide.map((point) => point.y);
    const guideSpan = valueSpan(guideY);
    const amplitudeRatio = height / Math.max(1, guideSpan);
    const requiredReversals = kind === "curve" ? 1 : kind === "wave" ? 3 : 4;
    const minimumHeight = kind === "curve" ? 34 : kind === "wave" ? 36 : 44;
    return height >= minimumHeight &&
      amplitudeRatio >= 0.58 && amplitudeRatio <= 1.65 &&
      correlation(ys, guideY) >= 0.68 &&
      verticalReversals(path) >= requiredReversals;
  }

  function spiralShapeMatches(path) {
    const center = { x: 200, y: 100 };
    const polar = path.map((point) => ({ radius: distance(point, center), angle: Math.atan2(point.y - center.y, point.x - center.x) }));
    let unwrapped = polar[0].angle;
    let previous = polar[0].angle;
    let signedRotation = 0;
    let sameDirection = 0;
    const angles = [unwrapped];
    for (let index = 1; index < polar.length; index++) {
      let delta = polar[index].angle - previous;
      while (delta > Math.PI) delta -= Math.PI * 2;
      while (delta < -Math.PI) delta += Math.PI * 2;
      signedRotation += delta;
      unwrapped += delta;
      angles.push(unwrapped);
      previous = polar[index].angle;
    }
    const direction = Math.sign(signedRotation) || 1;
    for (let index = 1; index < angles.length; index++) {
      if (Math.sign(angles[index] - angles[index - 1]) === direction) sameDirection++;
    }
    const radii = polar.map((point) => point.radius);
    const progress = radii.map((_, index) => index / (radii.length - 1));
    const meanRadius = radii.reduce((sum, value) => sum + value, 0) / radii.length;
    const covariance = radii.reduce((sum, value, index) => sum + (value - meanRadius) * (progress[index] - 0.5), 0);
    const radiusVariance = radii.reduce((sum, value) => sum + Math.pow(value - meanRadius, 2), 0);
    const progressVariance = progress.reduce((sum, value) => sum + Math.pow(value - 0.5, 2), 0);
    const radialTrend = Math.abs(covariance / Math.sqrt(Math.max(0.0001, radiusVariance * progressVariance)));
    return Math.abs(signedRotation) >= Math.PI * 5.4 &&
      sameDirection / (angles.length - 1) >= 0.72 &&
      Math.max(...radii) - Math.min(...radii) >= 48 && radialTrend >= 0.7;
  }

  function lineMatches(title) {
    const kind = lineKinds[title];
    if (!kind) return false;
    const meaningful = strokes.map(compactPath).filter((stroke) => stroke.length >= 8 && pathLength(stroke) >= 35);
    if (meaningful.length !== 1) return false;
    const raw = meaningful[0];
    const guideRaw = guideFor(kind);
    const drawn = resamplePath(raw, 96);
    const guide = resamplePath(guideRaw, 96);
    if (drawn.length !== 96 || guide.length !== 96) return false;
    const lengthRatio = pathLength(raw) / pathLength(guideRaw);
    const error = sequenceError(drawn, guide);
    const tolerance = kind === "spiral" ? 18 : 16;
    const averageLimit = kind === "spiral" ? 25 : 21;
    const p90Limit = kind === "spiral" ? 42 : 36;
    if (lengthRatio < 0.68 || lengthRatio > 1.55) return false;
    if (error.mean > averageLimit || error.p90 > p90Limit) return false;
    if (nearestCoverage(drawn, guide, tolerance) < 0.95) return false;
    if (nearestCoverage(guide, drawn, tolerance) < 0.82) return false;
    if (!shapeSignalMatches(kind, error.aligned, guide)) return false;
    return kind !== "spiral" || spiralShapeMatches(drawn);
  }

  function drawSpiralGuide(canvas) {
    if (!canvas || lineKinds[lineTitle()] !== "spiral") return;
    const context = canvas.getContext("2d");
    const guide = spiralGuide();
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.save();
    context.beginPath();
    context.moveTo(guide[0].x, guide[0].y);
    guide.slice(1).forEach((point) => context.lineTo(point.x, point.y));
    context.strokeStyle = "#E91E63";
    context.globalAlpha = 0.32;
    context.lineWidth = 8;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.setLineDash([11, 9]);
    context.stroke();
    context.restore();
  }

  function showAccuracyFeedback(canvas) {
    document.getElementById("arthink-accuracy-feedback")?.remove();
    const box = document.createElement("div");
    box.id = "arthink-accuracy-feedback";
    box.setAttribute("role", "alert");
    box.textContent = /Line$/.test(lineTitle())
      ? "🔎 Not quite yet. At least 95% of your line must stay on the dotted guide, from one end to the other."
      : "🔎 Belum tepat. Sekurang-kurangnya 95% garisan mesti berada di atas panduan putus-putus, dari satu hujung ke hujung yang lain.";
    canvas.closest(".bg-white")?.after(box);
  }

  document.addEventListener("pointerdown", (event) => {
    const canvas = event.target.closest?.("canvas");
    if (!canvas || !location.pathname.includes("/garisan")) return;
    const title = lineTitle();
    if (title !== challenge) {
      strokes = [];
      challenge = title;
      if (lineKinds[title] === "spiral") drawSpiralGuide(canvas);
    }
    drawing = true;
    strokes.push([canvasPoint(event, canvas)]);
    document.getElementById("arthink-accuracy-feedback")?.remove();
  }, true);
  document.addEventListener("pointermove", (event) => {
    const canvas = event.target.closest?.("canvas");
    if (drawing && canvas && location.pathname.includes("/garisan")) strokes[strokes.length - 1]?.push(canvasPoint(event, canvas));
  }, true);
  document.addEventListener("pointerup", () => { drawing = false; }, true);
  document.addEventListener("pointercancel", () => { drawing = false; }, true);

  document.addEventListener("click", (event) => {
    const button = event.target.closest?.("button");
    if (!button || !location.pathname.includes("/garisan")) return;
    const label = button.textContent.trim();
    if (/Padam|Clear|Cuba Lagi|Try Again|Seterusnya|Next|Selesai|Finish/.test(label)) {
      strokes = [];
      document.getElementById("arthink-accuracy-feedback")?.remove();
      if (/Padam|Clear|Cuba Lagi|Try Again/.test(label)) window.setTimeout(() => drawSpiralGuide(document.querySelector("canvas[aria-label='Kanvas lukisan'],canvas[aria-label='Drawing canvas']")), 0);
      return;
    }
    if (!/Semak|Check/.test(label)) return;
    const canvas = document.querySelector("canvas[aria-label='Kanvas lukisan'],canvas[aria-label='Drawing canvas']");
    if (canvas && !lineMatches(lineTitle())) {
      event.preventDefault();
      event.stopImmediatePropagation();
      showAccuracyFeedback(canvas);
    }
  }, true);

  function enhanceTextAndIcons() {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((node) => {
      const trimmed = node.nodeValue.trim();
      if (copy.has(trimmed)) node.nodeValue = node.nodeValue.replace(trimmed, copy.get(trimmed));
    });
    const key = Object.keys(routeIcons).find((name) => location.pathname.includes("/" + name));
    if (key) {
      const [oldIcon, newIcon] = routeIcons[key];
      document.querySelectorAll("main span").forEach((span) => {
        if (span.childElementCount === 0 && span.textContent.trim() === oldIcon) span.textContent = newIcon;
      });
    }
    Object.entries(routeIcons).forEach(([name, icons]) => {
      document.querySelectorAll(`main a[href*="/${name}"]`).forEach((link) => {
        link.querySelectorAll("span").forEach((span) => {
          if (span.childElementCount === 0 && span.textContent.trim() === icons[0]) span.textContent = icons[1];
        });
      });
    });
    const canvas = document.querySelector("canvas[aria-label='Kanvas lukisan'],canvas[aria-label='Drawing canvas']");
    const title = lineTitle();
    if (canvas && title !== challenge) {
      challenge = title;
      strokes = [];
      if (lineKinds[title] === "spiral") window.setTimeout(() => drawSpiralGuide(canvas), 0);
    }
  }

  const style = document.createElement("style");
  style.textContent = `
    #arthink-accuracy-feedback{margin:0 0 1rem;padding:1rem;border:2px solid #fb923c;border-radius:1rem;background:#fff7ed;color:#9a3412;font-size:.95rem;font-weight:800;line-height:1.5;box-shadow:0 8px 22px rgba(249,115,22,.12)}
    body.arthink-enhanced main button:not(:disabled){transition:transform .16s ease,box-shadow .16s ease,filter .16s ease}
    body.arthink-enhanced main button:not(:disabled):hover{transform:translateY(-2px);filter:saturate(1.08);box-shadow:0 9px 20px rgba(124,58,237,.16)}
    body.arthink-enhanced main button:focus-visible{outline:3px solid #7c3aed;outline-offset:3px}
  `;
  document.head.append(style);
  document.body.classList.add("arthink-enhanced");
  enhanceTextAndIcons();
  new MutationObserver(enhanceTextAndIcons).observe(document.body, { childList: true, subtree: true });
})();
