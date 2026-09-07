(function () {
  "use strict";

  const VERSION = "artoria-ai-agent-v3";
  const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
  const percent = (value) => Math.round(clamp(value) * 100);

  const conceptNames = {
    Garisan: "Line",
    Rupa: "Shape",
    Bentuk: "Form",
    Jalinan: "Texture",
    Ruang: "Space",
    Warna: "Colour",
    Harmoni: "Harmony",
    Kontra: "Contrast",
    Imbangan: "Balance",
    Irama: "Rhythm",
    Pergerakan: "Movement",
    Penegasan: "Emphasis",
    Kesatuan: "Unity",
    Kepelbagaian: "Variety",
  };

  const suggestions = {
    Garisan: {
      bm: "Pelbagaikan arah, ketebalan atau lengkungan garisan supaya maksudnya lebih jelas.",
      en: "Vary the direction, thickness or curve of the lines so their purpose is clearer.",
    },
    Rupa: {
      bm: "Jelaskan sempadan rupa organik dan geometri supaya mudah dibezakan.",
      en: "Clarify the boundaries of organic and geometric shapes so they are easier to distinguish.",
    },
    Bentuk: {
      bm: "Tambah bahagian cerah dan bayang yang konsisten untuk menunjukkan isi padu.",
      en: "Add consistent highlights and shadows to show volume.",
    },
    Jalinan: {
      bm: "Tambah corak tanda yang sesuai untuk menunjukkan permukaan kasar, licin atau lembut.",
      en: "Add suitable mark patterns to show rough, smooth or soft surfaces.",
    },
    Ruang: {
      bm: "Gunakan pertindihan serta perbezaan saiz objek depan dan belakang untuk menunjukkan kedalaman.",
      en: "Use overlap and different foreground and background sizes to show depth.",
    },
    Warna: {
      bm: "Gunakan hubungan warna yang lebih jelas dan pastikan warna utama menyokong idea karya.",
      en: "Use clearer colour relationships and make sure the main colours support the artwork idea.",
    },
    Harmoni: {
      bm: "Ulang keluarga warna yang serasi pada beberapa bahagian karya.",
      en: "Repeat compatible colour families across several parts of the artwork.",
    },
    Kontra: {
      bm: "Letakkan nilai terang dan gelap atau warna yang sangat berbeza secara bersebelahan.",
      en: "Place light and dark values or strongly different colours next to each other.",
    },
    Imbangan: {
      bm: "Semak saiz, bilangan dan kekuatan warna pada bahagian kiri dan kanan karya.",
      en: "Review the size, number and colour strength on the left and right sides of the artwork.",
    },
    Irama: {
      bm: "Ulang rupa, garisan atau warna mengikut susunan yang lebih konsisten.",
      en: "Repeat shapes, lines or colours in a more consistent sequence.",
    },
    Pergerakan: {
      bm: "Susun garisan atau objek dalam arah yang membimbing pandangan mata.",
      en: "Arrange lines or objects in a direction that guides the viewer's eye.",
    },
    Penegasan: {
      bm: "Pilih satu fokus utama dan bezakan saiz, warna atau nilainya daripada kawasan lain.",
      en: "Choose one main focus and vary its size, colour or value from other areas.",
    },
    Kesatuan: {
      bm: "Ulang beberapa warna, garisan atau rupa yang sama untuk menghubungkan semua bahagian karya.",
      en: "Repeat several colours, lines or shapes to connect all parts of the artwork.",
    },
    Kepelbagaian: {
      bm: "Tambah variasi rupa, saiz, jalinan atau warna tanpa menghilangkan fokus utama.",
      en: "Add variation in shape, size, texture or colour without losing the main focus.",
    },
  };

  function rgbToHsv(r, g, b) {
    const rn = r / 255;
    const gn = g / 255;
    const bn = b / 255;
    const max = Math.max(rn, gn, bn);
    const min = Math.min(rn, gn, bn);
    const delta = max - min;
    let hue = 0;
    if (delta > 0) {
      if (max === rn) hue = 60 * (((gn - bn) / delta) % 6);
      else if (max === gn) hue = 60 * ((bn - rn) / delta + 2);
      else hue = 60 * ((rn - gn) / delta + 4);
    }
    if (hue < 0) hue += 360;
    return { hue, saturation: max === 0 ? 0 : delta / max, value: max };
  }

  function paletteName(r, g, b) {
    const hsv = rgbToHsv(r, g, b);
    if (hsv.value < 0.18) return { bm: "hitam", en: "black" };
    if (hsv.saturation < 0.1 && hsv.value > 0.88) return { bm: "putih", en: "white" };
    if (hsv.saturation < 0.14) return { bm: "kelabu", en: "grey" };
    const names = [
      [15, "merah", "red"],
      [45, "jingga", "orange"],
      [70, "kuning", "yellow"],
      [155, "hijau", "green"],
      [195, "biru kehijauan", "turquoise"],
      [255, "biru", "blue"],
      [285, "ungu", "purple"],
      [330, "magenta", "magenta"],
      [360, "merah jambu", "pink"],
    ];
    const match = names.find(([limit]) => hsv.hue < limit) || names[0];
    return { bm: match[1], en: match[2] };
  }

  function loadImage(source) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("Image could not be read"));
      image.src = source;
    });
  }

  function squaredDistance(a, b) {
    const dr = a[0] - b[0];
    const dg = a[1] - b[1];
    const db = a[2] - b[2];
    return dr * dr + dg * dg + db * db;
  }

  function learnPalette(samples, clusterCount = 6) {
    if (!samples.length) return [];
    const centres = [];
    let first = samples[0];
    let firstScore = -1;
    for (const sample of samples) {
      const hsv = rgbToHsv(sample[0], sample[1], sample[2]);
      const score = hsv.saturation * 1.5 + Math.abs(hsv.value - 0.5);
      if (score > firstScore) {
        first = sample;
        firstScore = score;
      }
    }
    centres.push(first.slice());
    while (centres.length < Math.min(clusterCount, samples.length)) {
      let candidate = samples[0];
      let distance = -1;
      for (const sample of samples) {
        const nearest = Math.min(...centres.map((centre) => squaredDistance(sample, centre)));
        if (nearest > distance) {
          candidate = sample;
          distance = nearest;
        }
      }
      centres.push(candidate.slice());
    }

    let assignments = new Uint8Array(samples.length);
    for (let iteration = 0; iteration < 8; iteration += 1) {
      const sums = centres.map(() => [0, 0, 0, 0]);
      samples.forEach((sample, index) => {
        let best = 0;
        let bestDistance = Infinity;
        centres.forEach((centre, centreIndex) => {
          const distance = squaredDistance(sample, centre);
          if (distance < bestDistance) {
            best = centreIndex;
            bestDistance = distance;
          }
        });
        assignments[index] = best;
        sums[best][0] += sample[0];
        sums[best][1] += sample[1];
        sums[best][2] += sample[2];
        sums[best][3] += 1;
      });
      sums.forEach((sum, index) => {
        if (sum[3]) centres[index] = [sum[0] / sum[3], sum[1] / sum[3], sum[2] / sum[3]];
      });
    }

    const counts = Array(centres.length).fill(0);
    assignments.forEach((assignment) => { counts[assignment] += 1; });
    return centres
      .map((centre, index) => {
        const hsv = rgbToHsv(centre[0], centre[1], centre[2]);
        return {
          rgb: centre,
          weight: counts[index] / samples.length,
          hue: hsv.hue,
          saturation: hsv.saturation,
          value: hsv.value,
          name: paletteName(centre[0], centre[1], centre[2]),
        };
      })
      .filter((cluster) => cluster.weight >= 0.025)
      .sort((a, b) => b.weight - a.weight);
  }

  function projectionRhythm(values) {
    const mean = values.reduce((sum, value) => sum + value, 0) / Math.max(1, values.length);
    const centred = values.map((value) => value - mean);
    const variance = centred.reduce((sum, value) => sum + value * value, 0);
    if (variance < 1e-6) return 0;
    let best = 0;
    const maxLag = Math.max(4, Math.floor(values.length / 3));
    for (let lag = 3; lag <= maxLag; lag += 1) {
      let numerator = 0;
      let left = 0;
      let right = 0;
      for (let index = 0; index < values.length - lag; index += 1) {
        numerator += centred[index] * centred[index + lag];
        left += centred[index] * centred[index];
        right += centred[index + lag] * centred[index + lag];
      }
      const correlation = numerator / Math.sqrt(Math.max(1e-6, left * right));
      best = Math.max(best, correlation);
    }
    return clamp((best - 0.12) / 0.68);
  }

  async function inspectImage(source) {
    const image = await loadImage(source);
    const maxSide = 576;
    const scale = Math.min(1, maxSide / Math.max(image.naturalWidth || image.width, image.naturalHeight || image.height));
    const width = Math.max(1, Math.round((image.naturalWidth || image.width) * scale));
    const height = Math.max(1, Math.round((image.naturalHeight || image.height) * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) throw new Error("Canvas is unavailable");
    context.fillStyle = "#fff";
    context.fillRect(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height);
    const data = context.getImageData(0, 0, width, height).data;
    const count = width * height;
    const luma = new Float32Array(count);
    const corners = [
      [0, 0], [width - 1, 0], [0, height - 1], [width - 1, height - 1],
      [Math.floor(width * 0.04), Math.floor(height * 0.04)],
      [Math.floor(width * 0.96), Math.floor(height * 0.96)],
    ];
    const background = corners.reduce((sum, [x, y]) => {
      const index = (y * width + x) * 4;
      sum[0] += data[index];
      sum[1] += data[index + 1];
      sum[2] += data[index + 2];
      return sum;
    }, [0, 0, 0]).map((value) => value / corners.length);

    let brightnessTotal = 0;
    let brightnessSq = 0;
    let saturationTotal = 0;
    let occupied = 0;
    let leftWeight = 0;
    let rightWeight = 0;
    const samples = [];
    const sampleStep = Math.max(1, Math.ceil(Math.sqrt(count / 7000)));

    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const pixel = y * width + x;
        const index = pixel * 4;
        const r = data[index];
        const g = data[index + 1];
        const b = data[index + 2];
        const value = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        const hsv = rgbToHsv(r, g, b);
        luma[pixel] = value;
        brightnessTotal += value;
        brightnessSq += value * value;
        saturationTotal += hsv.saturation;
        const distanceFromBackground = Math.sqrt(squaredDistance([r, g, b], background));
        const visualWeight = clamp((distanceFromBackground - 12) / 105) + hsv.saturation * 0.35;
        if (distanceFromBackground > 26 || hsv.saturation > 0.18) occupied += 1;
        if (x < width / 2) leftWeight += visualWeight;
        else rightWeight += visualWeight;
        if (x % sampleStep === 0 && y % sampleStep === 0) samples.push([r, g, b]);
      }
    }

    const orientation = Array(8).fill(0);
    const horizontalProjection = Array(48).fill(0);
    const verticalProjection = Array(48).fill(0);
    const saliencyGrid = Array(16).fill(0);
    let edgeTotal = 0;
    let strongEdges = 0;
    let edgeSamples = 0;
    let laplaceTotal = 0;
    for (let y = 1; y < height - 1; y += 1) {
      for (let x = 1; x < width - 1; x += 1) {
        const centre = y * width + x;
        const gx =
          -luma[(y - 1) * width + x - 1] + luma[(y - 1) * width + x + 1]
          - 2 * luma[y * width + x - 1] + 2 * luma[y * width + x + 1]
          - luma[(y + 1) * width + x - 1] + luma[(y + 1) * width + x + 1];
        const gy =
          -luma[(y - 1) * width + x - 1] - 2 * luma[(y - 1) * width + x] - luma[(y - 1) * width + x + 1]
          + luma[(y + 1) * width + x - 1] + 2 * luma[(y + 1) * width + x] + luma[(y + 1) * width + x + 1];
        const edge = Math.hypot(gx, gy) / 4;
        const laplace = Math.abs(
          4 * luma[centre] - luma[centre - 1] - luma[centre + 1]
          - luma[centre - width] - luma[centre + width],
        );
        edgeTotal += edge;
        laplaceTotal += laplace;
        edgeSamples += 1;
        if (edge > 22) {
          strongEdges += 1;
          let angle = Math.atan2(gy, gx) + Math.PI;
          const bin = Math.floor(angle / (2 * Math.PI) * orientation.length) % orientation.length;
          orientation[bin] += edge;
          horizontalProjection[Math.min(47, Math.floor(x / width * 48))] += edge;
          verticalProjection[Math.min(47, Math.floor(y / height * 48))] += edge;
          const gridX = Math.min(3, Math.floor(x / width * 4));
          const gridY = Math.min(3, Math.floor(y / height * 4));
          saliencyGrid[gridY * 4 + gridX] += edge;
        }
      }
    }

    const brightness = brightnessTotal / Math.max(1, count);
    const contrast = Math.sqrt(Math.max(0, brightnessSq / Math.max(1, count) - brightness * brightness));
    const saturation = saturationTotal / Math.max(1, count);
    const palette = learnPalette(samples);
    const colourfulPalette = palette.filter((cluster) => cluster.saturation > 0.14 && cluster.value > 0.15);
    const paletteEntropy = -palette.reduce((sum, cluster) => {
      return cluster.weight > 0 ? sum + cluster.weight * Math.log(cluster.weight) : sum;
    }, 0) / Math.log(Math.max(2, palette.length));
    const dominantShare = palette.slice(0, 3).reduce((sum, cluster) => sum + cluster.weight, 0);
    const orientationTotal = orientation.reduce((sum, value) => sum + value, 0);
    const orientationPeak = Math.max(...orientation) / Math.max(1, orientationTotal);
    const orientationVariety = orientation.filter((value) => value > orientationTotal * 0.075).length / 8;
    const edgeDensity = clamp((strongEdges / Math.max(1, edgeSamples)) / 0.2);
    const texture = clamp((edgeTotal / Math.max(1, edgeSamples) - 5) / 24);
    const sharpness = laplaceTotal / Math.max(1, edgeSamples);
    const balance = clamp(1 - Math.abs(leftWeight - rightWeight) / Math.max(1, leftWeight + rightWeight));
    const rhythm = Math.max(projectionRhythm(horizontalProjection), projectionRhythm(verticalProjection));
    const saliencyTotal = saliencyGrid.reduce((sum, value) => sum + value, 0);
    const saliencyMean = saliencyTotal / 16;
    const saliencyPeak = Math.max(...saliencyGrid);
    const emphasis = clamp((saliencyPeak / Math.max(1, saliencyMean) - 1) / 2.6);
    const focusIndex = saliencyGrid.indexOf(saliencyPeak);
    const focusNames = [
      ["kiri atas", "top left"], ["kiri atas", "top left"], ["kanan atas", "top right"], ["kanan atas", "top right"],
      ["kiri tengah", "middle left"], ["bahagian tengah", "centre"], ["bahagian tengah", "centre"], ["kanan tengah", "middle right"],
      ["kiri tengah", "middle left"], ["bahagian tengah", "centre"], ["bahagian tengah", "centre"], ["kanan tengah", "middle right"],
      ["kiri bawah", "bottom left"], ["kiri bawah", "bottom left"], ["kanan bawah", "bottom right"], ["kanan bawah", "bottom right"],
    ];
    const focus = focusNames[focusIndex] || ["bahagian tengah", "centre"];
    const occupancy = occupied / Math.max(1, count);
    const imageQuality = clamp(
      0.3
      + clamp((contrast - 6) / 34) * 0.24
      + clamp((sharpness - 1.5) / 10) * 0.24
      + clamp(1 - Math.abs(brightness - 135) / 150) * 0.22,
    );

    return {
      width,
      height,
      brightness,
      contrast,
      saturation,
      palette,
      colourfulPalette,
      paletteEntropy: clamp(paletteEntropy),
      dominantShare: clamp(dominantShare),
      edgeDensity,
      texture,
      sharpness,
      balance,
      rhythm,
      emphasis,
      focusBm: focus[0],
      focusEn: focus[1],
      occupancy,
      orientationPeak: clamp(orientationPeak * 3.3),
      orientationVariety: clamp(orientationVariety),
      imageQuality,
    };
  }

  function evaluateConcept(concept, vision) {
    const contrast = clamp(vision.contrast / 62);
    const colourDiversity = clamp(vision.colourfulPalette.length / 6);
    const scores = {
      Garisan: clamp(0.68 * vision.edgeDensity + 0.32 * vision.orientationVariety),
      Rupa: clamp(0.58 * vision.edgeDensity + 0.42 * colourDiversity),
      Bentuk: clamp(0.72 * contrast + 0.28 * vision.emphasis),
      Jalinan: clamp(0.72 * vision.texture + 0.28 * vision.edgeDensity),
      Ruang: clamp(0.35 * vision.balance + 0.25 * vision.emphasis + 0.2 * clamp(vision.occupancy / 0.7) + 0.2 * contrast),
      Warna: clamp(0.58 * clamp(vision.saturation * 2) + 0.42 * colourDiversity),
      Harmoni: clamp(0.7 * vision.dominantShare + 0.3 * vision.balance),
      Kontra: contrast,
      Imbangan: vision.balance,
      Irama: clamp(0.62 * vision.rhythm + 0.23 * vision.edgeDensity + 0.15 * colourDiversity),
      Pergerakan: clamp(0.58 * vision.orientationPeak + 0.42 * vision.edgeDensity),
      Penegasan: vision.emphasis,
      Kesatuan: clamp(0.58 * vision.dominantShare + 0.42 * vision.balance),
      Kepelbagaian: clamp(0.48 * colourDiversity + 0.3 * vision.orientationVariety + 0.22 * vision.texture),
    };
    const evidenceStrength = {
      Garisan: vision.edgeDensity,
      Rupa: clamp((vision.edgeDensity + colourDiversity) / 2),
      Bentuk: contrast,
      Jalinan: vision.texture,
      Ruang: clamp((vision.occupancy + vision.balance) / 2),
      Warna: clamp(vision.saturation * 2),
      Harmoni: vision.dominantShare,
      Kontra: contrast,
      Imbangan: clamp(vision.occupancy * 1.6),
      Irama: vision.rhythm,
      Pergerakan: vision.orientationPeak,
      Penegasan: vision.emphasis,
      Kesatuan: vision.dominantShare,
      Kepelbagaian: colourDiversity,
    };
    const subjective = ["Ruang", "Harmoni", "Irama", "Pergerakan", "Penegasan", "Kesatuan"];
    const cap = subjective.includes(concept) ? 0.86 : 0.92;
    const confidence = Math.min(cap, clamp(0.45 + 0.33 * vision.imageQuality + 0.22 * (evidenceStrength[concept] || 0)));
    return { score: scores[concept] ?? 0.5, confidence };
  }

  function statusFor(score, confidence) {
    if (confidence < 0.55) return "yellow";
    if (score >= 0.68 && confidence >= 0.64) return "green";
    if (score >= 0.36) return "yellow";
    return "red";
  }

  function evidenceFor(concept, vision, confidence) {
    const paletteBm = vision.colourfulPalette.slice(0, 3).map((cluster) => cluster.name.bm).join(", ") || "neutral";
    const paletteEn = vision.colourfulPalette.slice(0, 3).map((cluster) => cluster.name.en).join(", ") || "neutral";
    const evidence = {
      Garisan: [`kepadatan tepi ${percent(vision.edgeDensity)}% dan variasi arah ${percent(vision.orientationVariety)}%`, `edge density ${percent(vision.edgeDensity)}% and direction variety ${percent(vision.orientationVariety)}%`],
      Rupa: [`${vision.colourfulPalette.length} kelompok warna dan sempadan visual`, `${vision.colourfulPalette.length} colour clusters and visual boundaries`],
      Bentuk: [`perbezaan terang-gelap ${percent(clamp(vision.contrast / 62))}%`, `light-dark variation ${percent(clamp(vision.contrast / 62))}%`],
      Jalinan: [`perubahan permukaan ${percent(vision.texture)}%`, `surface variation ${percent(vision.texture)}%`],
      Ruang: [`liputan visual ${percent(vision.occupancy)}% dengan fokus di ${vision.focusBm}`, `visual coverage ${percent(vision.occupancy)}% with focus at the ${vision.focusEn}`],
      Warna: [`kelompok warna ${paletteBm} dengan ketepuan ${percent(clamp(vision.saturation * 2))}%`, `${paletteEn} colour clusters with ${percent(clamp(vision.saturation * 2))}% saturation`],
      Harmoni: [`hubungan palet dominan ${percent(vision.dominantShare)}%`, `dominant palette relationship ${percent(vision.dominantShare)}%`],
      Kontra: [`kontra terang-gelap ${percent(clamp(vision.contrast / 62))}%`, `light-dark contrast ${percent(clamp(vision.contrast / 62))}%`],
      Imbangan: [`agihan berat visual kiri-kanan ${percent(vision.balance)}%`, `left-right visual-weight distribution ${percent(vision.balance)}%`],
      Irama: [`pola pengulangan ${percent(vision.rhythm)}%`, `repetition pattern ${percent(vision.rhythm)}%`],
      Pergerakan: [`keselarasan arah visual ${percent(vision.orientationPeak)}%`, `visual-direction coherence ${percent(vision.orientationPeak)}%`],
      Penegasan: [`tumpuan terkuat di ${vision.focusBm} pada ${percent(vision.emphasis)}%`, `the strongest focus at the ${vision.focusEn} at ${percent(vision.emphasis)}%`],
      Kesatuan: [`kesatuan palet dan imbangan ${percent(clamp((vision.dominantShare + vision.balance) / 2))}%`, `palette unity and balance ${percent(clamp((vision.dominantShare + vision.balance) / 2))}%`],
      Kepelbagaian: [`${vision.colourfulPalette.length} kelompok warna serta variasi tanda ${percent(vision.orientationVariety)}%`, `${vision.colourfulPalette.length} colour clusters and ${percent(vision.orientationVariety)}% mark variety`],
    }[concept] || ["bukti visual pada imej", "visual evidence in the image"];
    return {
      bm: `Bukti AI (keyakinan ${percent(confidence)}%): ${evidence[0]}.`,
      en: `AI evidence (${percent(confidence)}% confidence): ${evidence[1]}.`,
    };
  }

  function feedbackFor(concept, status, vision, confidence) {
    const evidence = evidenceFor(concept, vision, confidence);
    const suggestion = suggestions[concept] || suggestions.Warna;
    if (status === "green") {
      return {
        bm: `${evidence.bm} Ciri ini dikesan dengan jelas dan boleh dikekalkan.`,
        en: `${evidence.en} This feature is detected clearly and can be maintained.`,
      };
    }
    if (status === "yellow") {
      return { bm: `${evidence.bm} ${suggestion.bm}`, en: `${evidence.en} ${suggestion.en}` };
    }
    return {
      bm: `${evidence.bm} Ciri ini belum dikesan dengan cukup jelas. ${suggestion.bm}`,
      en: `${evidence.en} This feature is not detected clearly enough. ${suggestion.en}`,
    };
  }

  async function analyse(options) {
    const {
      imageData,
      baseResult,
      requiredElements = [],
      requiredPrinciples = [],
    } = options || {};
    if (!imageData) return baseResult;
    if (baseResult && baseResult.unclearMessage) return baseResult;

    try {
      const vision = await inspectImage(imageData);
      if (vision.imageQuality < 0.42) {
        return {
          feedback: null,
          weakConcepts: [],
          unclearMessage: {
            bm: "Ejen AI belum mempunyai bukti visual yang cukup stabil. Pastikan karya memenuhi bingkai, terang, tidak silau dan difokuskan sebelum mencuba semula.",
            en: "The AI agent does not yet have enough stable visual evidence. Make sure the artwork fills the frame, is bright, glare-free and focused before trying again.",
          },
        };
      }

      const concepts = [...new Set([...requiredElements, ...requiredPrinciples])]
        .filter((concept) => conceptNames[concept]);
      if (!concepts.length) return baseResult;
      const evaluated = concepts.map((concept) => {
        const result = evaluateConcept(concept, vision);
        const status = statusFor(result.score, result.confidence);
        const feedback = feedbackFor(concept, status, vision, result.confidence);
        return { concept, ...result, status, feedback };
      });
      const strongest = [...evaluated].sort((a, b) => (b.score * b.confidence) - (a.score * a.confidence))[0];
      const weakest = [...evaluated].sort((a, b) => (a.score * a.confidence) - (b.score * b.confidence))[0];
      const weakConcepts = evaluated
        .filter((item) => item.status !== "green")
        .sort((a, b) => a.score - b.score)
        .slice(0, 3)
        .map((item) => item.concept);
      const paletteBm = vision.colourfulPalette.slice(0, 3).map((cluster) => cluster.name.bm).join(", ") || "neutral";
      const paletteEn = vision.colourfulPalette.slice(0, 3).map((cluster) => cluster.name.en).join(", ") || "neutral";
      const strongestNameEn = conceptNames[strongest.concept] || strongest.concept;
      const weakestNameEn = conceptNames[weakest.concept] || weakest.concept;
      const nextSuggestion = suggestions[weakest.concept] || suggestions.Warna;

      return {
        feedback: {
          conceptAnalyses: evaluated.map((item) => ({
            concept: item.concept,
            conceptEn: conceptNames[item.concept],
            status: item.status,
            feedbackBm: item.feedback.bm,
            feedbackEn: item.feedback.en,
          })),
          usedWellBm: `ARTORIA AI paling yakin terhadap ${strongest.concept.toLowerCase()} (${percent(strongest.confidence)}% keyakinan). Bukti ini dikesan terus daripada karya.`,
          usedWellEn: `ARTORIA AI is most confident about ${strongestNameEn.toLowerCase()} (${percent(strongest.confidence)}% confidence). This evidence was detected directly from the artwork.`,
          observedBm: `Ejen AI mempelajari palet karya ini dan menemukan warna ${paletteBm}. Fokus visual terkuat berada di ${vision.focusBm}, manakala imbangan kiri-kanan ialah ${percent(vision.balance)}%.`,
          observedEn: `The AI agent learned this artwork's palette and found ${paletteEn}. The strongest visual focus is at the ${vision.focusEn}, while left-right balance is ${percent(vision.balance)}%.`,
          thinkBm: `Adakah ${weakest.concept.toLowerCase()} sudah membantu idea utama karya, atau masih boleh ditunjukkan dengan lebih jelas?`,
          thinkEn: `Does ${weakestNameEn.toLowerCase()} already support the main idea, or could it be shown more clearly?`,
          nextStepBm: nextSuggestion.bm,
          nextStepEn: nextSuggestion.en,
          agentVersion: VERSION,
        },
        weakConcepts,
        unclearMessage: null,
      };
    } catch (error) {
      console.warn("ARTORIA AI Agent fallback", error);
      return baseResult;
    }
  }

  window.ArtoriaAIAgent = Object.freeze({
    version: VERSION,
    analyse,
  });
}());
