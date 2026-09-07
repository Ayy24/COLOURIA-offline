(() => {
  "use strict";

  let context, musicGain, noise, timer, step = 0, playing = false, enabled = true;
  const notes = [64, 67, 69, null, 67, 64, 62, null, 64, 67, 72, 69, 67, null, 64, null, 62, 64, 67, null, 69, 67, 64, null, 62, 64, 67, 64, 62, null, 60, null];
  const chords = [[60, 64, 67], [55, 59, 62], [57, 60, 64], [53, 57, 60]];
  const beat = 60 / 104 / 2;
  const backgroundVolume = 4.50;
  const hz = (midi) => 440 * Math.pow(2, (midi - 69) / 12);

  function tone(midi, start, volume) {
    const body = context.createOscillator();
    const bell = context.createOscillator();
    const bodyGain = context.createGain();
    const bellGain = context.createGain();
    const filter = context.createBiquadFilter();
    body.type = "triangle";
    bell.type = "sine";
    body.frequency.value = hz(midi);
    bell.frequency.value = hz(midi) * 2;
    filter.type = "lowpass";
    filter.frequency.value = 2100;
    bodyGain.gain.setValueAtTime(0.0001, start);
    bodyGain.gain.exponentialRampToValueAtTime(volume, start + 0.018);
    bodyGain.gain.exponentialRampToValueAtTime(0.0001, start + 0.42);
    bellGain.gain.setValueAtTime(0.0001, start);
    bellGain.gain.exponentialRampToValueAtTime(volume * 0.2, start + 0.012);
    bellGain.gain.exponentialRampToValueAtTime(0.0001, start + 0.19);
    body.connect(filter); filter.connect(bodyGain); bodyGain.connect(musicGain);
    bell.connect(bellGain); bellGain.connect(musicGain);
    body.start(start); bell.start(start);
    body.stop(start + 0.46); bell.stop(start + 0.22);
  }

  function pad(chord, start) {
    chord.forEach((midi, index) => {
      const osc = context.createOscillator();
      const gain = context.createGain();
      const filter = context.createBiquadFilter();
      osc.type = "sine";
      osc.frequency.value = hz(midi);
      filter.type = "lowpass";
      filter.frequency.value = 1050;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.linearRampToValueAtTime(0.018 - index * 0.002, start + 0.28);
      gain.gain.setValueAtTime(0.014 - index * 0.001, start + beat * 6.2);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + beat * 7.8);
      osc.connect(filter); filter.connect(gain); gain.connect(musicGain);
      osc.start(start); osc.stop(start + beat * 8);
    });
  }

  function bass(midi, start) {
    const osc = context.createOscillator();
    const gain = context.createGain();
    osc.type = "sine";
    osc.frequency.value = hz(midi - 12);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.04, start + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + beat * 1.45);
    osc.connect(gain); gain.connect(musicGain);
    osc.start(start); osc.stop(start + beat * 1.55);
  }

  function shaker(start, strong) {
    if (!noise) {
      noise = context.createBuffer(1, Math.floor(context.sampleRate * 0.08), context.sampleRate);
      const data = noise.getChannelData(0);
      for (let index = 0; index < data.length; index++) data[index] = Math.random() * 2 - 1;
    }
    const source = context.createBufferSource();
    const filter = context.createBiquadFilter();
    const gain = context.createGain();
    source.buffer = noise;
    filter.type = "highpass";
    filter.frequency.value = 5200;
    gain.gain.setValueAtTime(strong ? 0.012 : 0.007, start);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.055);
    source.connect(filter); filter.connect(gain); gain.connect(musicGain);
    source.start(start); source.stop(start + 0.075);
  }

  function schedule() {
    if (!playing) return;
    const now = context.currentTime + 0.04;
    for (let i = 0; i < 16; i++) {
      const position = (step + i) % notes.length;
      const at = now + i * beat;
      const note = notes[position];
      if (note !== null) tone(note, at, position % 8 === 0 ? 0.055 : 0.043);
      shaker(at, position % 4 === 2);
      if (position % 8 === 0) {
        const chord = chords[Math.floor(position / 8) % chords.length];
        pad(chord, at); bass(chord[0], at);
      } else if (position % 4 === 0) {
        bass(chords[Math.floor(position / 8) % chords.length][0], at);
      }
    }
    step = (step + 16) % notes.length;
    timer = window.setTimeout(schedule, (16 * beat - 0.13) * 1000);
  }

  function start() {
    if (!enabled || playing) return;
    context ||= new (window.AudioContext || window.webkitAudioContext)();
    musicGain ||= (() => {
      const gain = context.createGain();
      const limiter = context.createDynamicsCompressor();
      limiter.threshold.value = -8;
      limiter.knee.value = 0;
      limiter.ratio.value = 20;
      limiter.attack.value = 0.003;
      limiter.release.value = 0.22;
      gain.connect(limiter); limiter.connect(context.destination);
      return gain;
    })();
    if (context.state === "suspended") context.resume();
    musicGain.gain.cancelScheduledValues(context.currentTime);
    musicGain.gain.setValueAtTime(0.0001, context.currentTime);
    musicGain.gain.linearRampToValueAtTime(backgroundVolume, context.currentTime + 0.35);
    playing = true;
    schedule();
  }

  function pause() {
    playing = false;
    window.clearTimeout(timer);
    if (!context || !musicGain) return;
    musicGain.gain.cancelScheduledValues(context.currentTime);
    musicGain.gain.setValueAtTime(Math.max(0.0001, musicGain.gain.value), context.currentTime);
    musicGain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.18);
  }

  function updateButton() {
    const button = document.getElementById("artoriaSoundToggle");
    if (!button) return;
    button.textContent = enabled ? "🔊" : "🔇";
    button.setAttribute("aria-pressed", String(enabled));
    button.setAttribute("aria-label", enabled ? "Turn off background music" : "Turn on background music");
  }

  function toggle() {
    enabled = playing ? !enabled : true;
    if (enabled) start(); else pause();
    updateButton();
  }

  function mountToggle() {
    const languageButton = [...document.querySelectorAll("button")]
      .find((button) => /^(BM|EN)$/.test(button.textContent.trim()));
    const languageToggle = languageButton?.parentElement;
    if (!languageToggle || document.getElementById("artoriaSoundToggle")) return;
    languageToggle.id = "artoriaLanguageToggle";
    const button = document.createElement("button");
    button.id = "artoriaSoundToggle";
    button.type = "button";
    button.addEventListener("click", toggle);
    languageToggle.before(button);
    updateButton();
  }

  function classroomTimerIsRunning() {
    try {
      const store = JSON.parse(localStorage.getItem("c2_classroom_v1") || "null");
      const classroom = store?.classes?.find((item) => item.id === store.activeClassId);
      if (!classroom?.sessionActive || !classroom.timerRunning) return false;
      const remaining = classroom.timerEndsAt
        ? Math.max(0, Math.ceil((Number(classroom.timerEndsAt) - Date.now()) / 1000))
        : Number(classroom.timerRemaining || 0);
      return remaining > 0;
    } catch (_) {
      return false;
    }
  }

  function mountClassroomBar() {
    const link = document.querySelector('a[href="/colouria/index.html?screen=classroom"]');
    const bar = link?.closest("aside");
    if (!bar) return;
    bar.id = "artoriaClassroomBar";
    bar.hidden = !classroomTimerIsRunning();
  }

  function mountInterface() {
    mountToggle();
    mountClassroomBar();
  }

  const styles = document.createElement("style");
  styles.textContent = `
    #artoriaSoundToggle{width:34px;height:34px;display:grid;place-items:center;flex:0 0 auto;border:1.5px solid rgba(255,182,193,.5);border-radius:999px;background:rgba(255,255,255,.6);color:#A855F7;font-size:16px;line-height:1;transition:transform .15s ease,background-color .15s ease}
    #artoriaSoundToggle:hover{background:rgba(255,255,255,.92);transform:translateY(-1px)}
    #artoriaSoundToggle:active{transform:scale(.94)}
    #artoriaLanguageToggle button{padding-left:.6rem!important;padding-right:.6rem!important}
    #artoriaClassroomBar{color:#fff!important;background:linear-gradient(105deg,#067f83 0%,#3859c9 52%,#8138d6 100%)!important;border:2px solid rgba(255,255,255,.78)!important;box-shadow:0 14px 38px rgba(43,34,112,.38),0 0 0 3px rgba(123,69,232,.12)!important;backdrop-filter:blur(16px) saturate(1.25)!important}
    #artoriaClassroomBar[hidden]{display:none!important}
    #artoriaClassroomBar a{color:#4d359c!important;background:#fff!important;border:1px solid rgba(255,255,255,.9)!important;box-shadow:0 4px 12px rgba(31,37,96,.2)!important;white-space:nowrap!important}
    #artoriaClassroomBar p,#artoriaClassroomBar strong{color:#fff!important;-webkit-text-fill-color:#fff!important;opacity:1!important;text-shadow:0 1px 2px rgba(20,20,80,.42)!important}
    @media (max-width:430px){#artoriaSoundToggle{width:31px;height:31px;font-size:14px}#artoriaLanguageToggle button{padding-left:.46rem!important;padding-right:.46rem!important;font-size:11px!important}}
  `;
  document.head.append(styles);
  window.ArtoriaBGM = { start, pause, toggle, get playing() { return playing; } };
  mountInterface();
  new MutationObserver(mountInterface).observe(document.documentElement, { childList: true, subtree: true });
  window.addEventListener("storage", mountClassroomBar);
  window.setInterval(mountClassroomBar, 1000);

  const unlockOnFirstInteraction = (event) => {
    if (event.target.closest?.("#artoriaSoundToggle")) return;
    start();
    document.removeEventListener("pointerdown", unlockOnFirstInteraction);
  };
  document.addEventListener("pointerdown", unlockOnFirstInteraction, { passive: true });
  document.addEventListener("keydown", start, { once: true });
})();
