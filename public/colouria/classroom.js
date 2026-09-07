(function () {
  "use strict";

  const STORAGE_KEY = "c2_classroom_v1";
  const GROUP_COLOURS = ["#ef4444", "#2563eb", "#eab308", "#22a35a", "#8b5cf6", "#f97316", "#ec4899", "#06a6c7", "#795548", "#64748b"];
  const GROUP_NAMES = ["Merah", "Biru", "Kuning", "Hijau", "Ungu", "Jingga", "Merah Jambu", "Biru Muda", "Coklat", "Kelabu"];
  const GROUP_NAMES_EN = ["Red", "Blue", "Yellow", "Green", "Purple", "Orange", "Pink", "Light Blue", "Brown", "Grey"];
  const ACTIVITIES = [
    { id: "detector", icon: "🔍", nameBm: "Pengesan Warna", nameEn: "Colour Detector", descBm: "Imbas objek dan minta kumpulan meneka warna", descEn: "Scan an object and ask teams to guess its colour", kind: "internal", target: "lens" },
    { id: "colorblind", icon: "👁️", nameBm: "Simulasi Buta Warna", nameEn: "Colour Blindness Simulation", descBm: "Perhatikan perubahan warna dan bincang bersama", descEn: "Observe colour changes and discuss them together", kind: "internal", target: "colorblind" },
    { id: "learn", icon: "📚", nameBm: "Belajar", nameEn: "Learn", descBm: "Terangkan elemen seni dan prinsip rekaan", descEn: "Explain the elements of art and principles of design", kind: "link", target: "/artoria/belajar-learn-screen/" },
    { id: "activities", icon: "🧩", nameBm: "Aktiviti Warna", nameEn: "Colour Activities", descBm: "Padanan, campuran dan makmal warna", descEn: "Colour matching, mixing and colour lab", kind: "internal", target: "aktiviti" },
    { id: "mix", icon: "🧪", nameBm: "Campuran Warna", nameEn: "Colour Mixing", descBm: "Ramalkan dan campurkan dua warna primer", descEn: "Predict and mix two primary colours", kind: "internal", target: "mix" },
    { id: "arthink", icon: "🧠", nameBm: "ARTHINK", nameEn: "ARTHINK", descBm: "Cabaran Elemen Seni dan Prinsip Rekaan", descEn: "Elements of Art and Principles of Design challenge", kind: "link", target: "/artoria/arthink-game-hub/" },
    { id: "runner", icon: "🏎️", nameBm: "Paint Runner", nameEn: "Paint Runner", descBm: "Wakil kumpulan bermain dan mengumpul markah", descEn: "A team representative plays and earns points", kind: "link", target: "/paint-runner/?classroom=1" },
    { id: "workshop", icon: "🛠️", nameBm: "Bengkel Warna", nameEn: "Colour Workshop", descBm: "Misi warna berdasarkan Taksonomi Bloom", descEn: "Colour missions based on Bloom's Taxonomy", kind: "internal", target: "magic-color-lab" },
    { id: "create", icon: "🖌️", nameBm: "Jom Berkarya", nameEn: "Let's Create", descBm: "Hasilkan karya fizikal atau digital", descEn: "Create a physical or digital artwork", kind: "link", target: "/artoria/jom-berkarya-create-task-screen/" },
    { id: "analysis", icon: "✨", nameBm: "Analisis Karya", nameEn: "Artwork Analysis", descBm: "Analisis karya kumpulan pada peranti", descEn: "Analyse a team's artwork on the device", kind: "link", target: "/artoria/analisis-karya-ai-analysis-screen/" },
    { id: "gallery", icon: "🖼️", nameBm: "Galeri Saya", nameEn: "My Gallery", descBm: "Lihat semula karya yang telah disimpan", descEn: "Review saved artworks", kind: "link", target: "/artoria/galeri-saya-gallery-screen/" },
    { id: "canvas", icon: "🎨", nameBm: "Kanvas Saya", nameEn: "My Canvas", descBm: "Wakil kumpulan melukis pada peranti guru", descEn: "A team representative draws on the teacher's device", kind: "internal", target: "canvas" },
  ];

  const CM_TEXT_PAIRS = [
    ["COLOURIA FOR TEACHERS", "COLOURIA FOR TEACHERS"], ["Mod Kelas", "Classroom Mode"], ["🧑‍🏫 Mod Kelas", "🧑‍🏫 Classroom Mode"],
    ["Satu peranti guru · Seluruh kelas terlibat", "One teacher device · The whole class takes part"],
    ["Persediaan", "Setup"], ["Murid", "Pupils"], ["Kawal Kelas", "Manage Class"], ["Keputusan", "Results"],
    ["⚙️ Persediaan", "⚙️ Setup"], ["👥 Murid", "👥 Pupils"], ["🎯 Kawal Kelas", "🎯 Manage Class"], ["🏆 Keputusan", "🏆 Results"],
    ["LANGKAH 1", "STEP 1"], ["Sediakan kelas", "Set up the class"], ["Disimpan dalam peranti", "Saved on this device"],
    ["Kelas disimpan", "Saved classes"], ["＋ Kelas Baharu", "＋ New Class"], ["Padam", "Delete"],
    ["Nama kelas", "Class name"], ["Contoh: 5 Bestari", "Example: Year 5 Bestari"],
    ["Topik pembelajaran", "Learning topic"], ["Contoh: Warna primer dan sekunder", "Example: Primary and secondary colours"],
    ["Tempoh kelas", "Class duration"], ["30 minit", "30 minutes"], ["45 minit", "45 minutes"], ["60 minit", "60 minutes"],
    ["Bilangan kumpulan", "Number of teams"], ["4 kumpulan", "4 teams"], ["5 kumpulan", "5 teams"], ["6 kumpulan", "6 teams"],
    ["10 kumpulan", "10 teams"],
    ["💾 Simpan Persediaan", "💾 Save Setup"], ["LANGKAH 2", "STEP 2"], ["Masukkan nama murid", "Add pupil names"], ["murid", "pupils"],
    ["Muat naik fail Excel, CSV atau TXT. Guru juga boleh menampal senarai nama di bawah.", "Upload an Excel, CSV or TXT file. You can also paste the name list below."],
    ["📂 Muat Naik Senarai Nama", "📂 Upload Name List"], ["⬇️ Contoh CSV", "⬇️ CSV Template"],
    ["Atau tampal nama, satu nama pada setiap baris", "Or paste names, one name per line"], ["＋ Masukkan Nama", "＋ Add Names"],
    ["Teruskan ke Murid & Kumpulan →", "Continue to Pupils & Teams →"], ["LANGKAH 3", "STEP 3"],
    ["Kehadiran dan kumpulan", "Attendance and Teams"], ["hadir ·", "present ·"], ["tidak hadir", "absent"],
    ["Cari nama murid…", "Search pupil names…"], ["✓ Semua Hadir", "✓ All Present"], ["✨ Bahagi Kumpulan Automatik", "✨ Create Teams Automatically"],
    ["Senarai murid", "Pupil list"], ["Tekan ✓ untuk kehadiran", "Tap ✓ to mark attendance"],
    ["Pembahagian kumpulan", "Team allocation"], ["Belum dibahagikan", "Not allocated yet"],
    ["← Persediaan", "← Setup"], ["🚀 Mula Sesi Kelas", "🚀 Start the Class Session"],
    ["SESI KELAS BERLANGSUNG", "LIVE CLASS SESSION"], ["Kelas belum dimulakan", "Class has not started"],
    ["Sediakan kelas dan kumpulan dahulu.", "Set up the class and teams first."], ["MASA KELAS", "CLASS TIME"], ["▶ Mula", "▶ Start"],
    ["CABUTAN RAWAK", "RANDOM PICK"], ["Pilih murid atau kumpulan", "Pick a pupil or team"], ["Sedia untuk memilih", "Ready to pick"],
    ["Nama tidak akan berulang sehingga semua mendapat giliran.", "Names will not repeat until everyone has had a turn."],
    ["👤 Pilih Murid", "👤 Pick Pupil"], ["👥 Pilih Kumpulan", "👥 Pick Team"],
    ["Tetapkan semula semua giliran", "Reset all turns"], ["MARKAH SEMASA", "CURRENT SCORE"], ["Papan markah", "Scoreboard"],
    ["Tetapkan Semula", "Reset"], ["AKTIVITI SESI", "SESSION ACTIVITIES"], ["Gunakan fungsi COLOURIA", "Use COLOURIA features"],
    ["selesai", "completed"], ["Pilih aktiviti mengikut aliran pengajaran. Markah dan rekod kelas kekal disimpan.", "Choose activities to suit the lesson flow. Scores and class records remain saved."],
    ["← Murid", "← Pupils"], ["🏆 Tamat & Lihat Keputusan", "🏆 Finish & View Results"],
    ["RUMUSAN SESI", "SESSION SUMMARY"], ["Sedia untuk meraikan kelas!", "Ready to celebrate the class!"],
    ["Markah dan aktiviti akan dipaparkan selepas sesi dimulakan.", "Scores and activities will appear after the session starts."],
    ["RINGKASAN", "SUMMARY"], ["REKOD TERKINI", "RECENT RECORDS"], ["← Kembali ke Sesi", "← Return to Session"],
    ["💾 Simpan Rekod Sesi", "💾 Save Session Record"], ["✨ Sesi Baharu", "✨ New Session"],
    ["🧑‍🏫 Kembali ke Mod Kelas", "🧑‍🏫 Return to Classroom Mode"], ["Sesi Kelas", "Class Session"],
    ["Tutup", "Close"], ["Baik, faham!", "Got it!"], ["Panduan Mod Kelas", "Classroom Mode Guide"],
    ["Kembali ke menu utama", "Back to main menu"], ["Kembali ke halaman pembukaan", "Back to welcome screen"], ["Bahagian Mod Kelas", "Classroom Mode sections"],
  ];

  let cmLanguage = localStorage.getItem("c2_lang") === "en" ? "en" : "bm";
  const L = (bm, en) => cmLanguage === "en" ? en : bm;

  function displayGroupName(group) {
    if (!group) return L("Belum berkumpulan", "Not in a team");
    if (cmLanguage !== "en") return group.name;
    const index = GROUP_NAMES.findIndex((name) => group.name === "Kumpulan " + name);
    return index >= 0 ? GROUP_NAMES_EN[index] + " Team" : group.name;
  }

  function displayClassName(cls) {
    const name = cls?.name || "";
    if (cmLanguage === "en" && name === "Kelas Baharu") return "New Class";
    if (cmLanguage === "bm" && name === "New Class") return "Kelas Baharu";
    return name || L("Kelas Baharu", "New Class");
  }

  function displayTopic(cls) {
    const topic = cls?.topic || "";
    if (cmLanguage === "en" && topic === "Warna primer dan sekunder") return "Primary and secondary colours";
    if (cmLanguage === "bm" && topic === "Primary and secondary colours") return "Warna primer dan sekunder";
    return topic || L("Topik belum ditetapkan", "Topic not set");
  }

  function translateClassroomDom() {
    if (typeof document.createTreeWalker !== "function") return;
    const showText = typeof NodeFilter === "undefined" ? 4 : NodeFilter.SHOW_TEXT;
    const bmToEn = new Map(CM_TEXT_PAIRS);
    const enToBm = new Map(CM_TEXT_PAIRS.map(([bm, en]) => [en, bm]));
    const translate = (value) => {
      const trimmed = String(value || "").trim();
      if (!trimmed) return value;
      const translated = (cmLanguage === "en" ? bmToEn : enToBm).get(trimmed);
      return translated == null ? value : String(value).replace(trimmed, translated);
    };
    ["screen-classroom", "cm-floating-bar", "cm-modal"].forEach((id) => {
      const root = document.getElementById(id);
      if (!root) return;
      const walker = document.createTreeWalker(root, showText);
      let node;
      while ((node = walker.nextNode())) node.nodeValue = translate(node.nodeValue);
      [root, ...root.querySelectorAll("[placeholder],[title],[aria-label]")].forEach((element) => {
        ["placeholder", "title", "aria-label"].forEach((attribute) => {
          if (element.hasAttribute && element.hasAttribute(attribute)) element.setAttribute(attribute, translate(element.getAttribute(attribute)));
        });
      });
    });
  }

  let store = loadStore();
  let currentTab = "setup";
  let currentScreenId = "classroom";
  let timerInterval = null;
  let spinTimeout = null;

  function uid(prefix) {
    return prefix + "_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function emptyClass() {
    return {
      id: uid("class"),
      name: "Kelas Baharu",
      topic: "Warna primer dan sekunder",
      duration: 60,
      groupCount: 8,
      students: [],
      groups: [],
      pickedStudents: [],
      pickedGroups: [],
      activeGroupId: null,
      activityDone: {},
      timerRemaining: 3600,
      timerRunning: false,
      timerEndsAt: null,
      sessionActive: false,
      sessionStartedAt: null,
      sessionCompletedAt: null,
      history: [],
    };
  }

  function loadStore() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (saved && Array.isArray(saved.classes)) return saved;
    } catch (_) {}
    const cls = emptyClass();
    return { activeClassId: cls.id, classes: [cls] };
  }

  function saveStore() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    const chip = document.getElementById("cm-save-status");
    if (chip) {
      chip.textContent = L("✓ Disimpan dalam peranti", "✓ Saved on this device");
      setTimeout(() => { if (chip) chip.textContent = L("Disimpan dalam peranti", "Saved on this device"); }, 1100);
    }
  }

  function activeClass() {
    let cls = store.classes.find((item) => item.id === store.activeClassId);
    if (!cls) {
      cls = store.classes[0] || emptyClass();
      if (!store.classes.length) store.classes.push(cls);
      store.activeClassId = cls.id;
    }
    cls.students = Array.isArray(cls.students) ? cls.students : [];
    cls.groups = Array.isArray(cls.groups) ? cls.groups : [];
    cls.history = Array.isArray(cls.history) ? cls.history : [];
    cls.pickedStudents = Array.isArray(cls.pickedStudents) ? cls.pickedStudents : [];
    cls.pickedGroups = Array.isArray(cls.pickedGroups) ? cls.pickedGroups : [];
    cls.activityDone = cls.activityDone || {};
    return cls;
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }

  function shuffle(items) {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function message(text, bad) {
    const el = document.getElementById("cm-import-message");
    if (el) {
      el.textContent = text;
      el.style.color = bad ? "#bc3650" : "#087f83";
    }
    if (typeof window.toast === "function") window.toast(text);
  }

  function callSound(name) {
    const fn = window[name];
    if (typeof fn === "function") fn();
  }

  window.initClassroom = function initClassroom() {
    cmLanguage = localStorage.getItem("c2_lang") === "en" ? "en" : "bm";
    store = loadStore();
    renderClassSelect();
    renderSetup();
    renderStudents();
    renderGroups();
    renderLive();
    renderScoreboard();
    renderActivities();
    renderResults();
    syncTimerInterval();
    cmOpenTab(currentTab);
    translateClassroomDom();
  };

  window.cmSetLanguage = function cmSetLanguage(lang) {
    cmLanguage = lang === "en" ? "en" : "bm";
    localStorage.setItem("c2_lang", cmLanguage);
    renderClassSelect();
    renderSetup();
    renderStudents();
    renderGroups();
    renderLive();
    renderScoreboard();
    renderActivities();
    renderResults();
    translateClassroomDom();
  };

  function renderClassSelect() {
    const select = document.getElementById("cm-class-select");
    if (!select) return;
    select.innerHTML = store.classes.map((cls) => `<option value="${escapeHtml(cls.id)}">${escapeHtml(displayClassName(cls))}</option>`).join("");
    select.value = activeClass().id;
  }

  function renderSetup() {
    const cls = activeClass();
    const name = document.getElementById("cm-class-name");
    const topic = document.getElementById("cm-topic");
    const duration = document.getElementById("cm-duration");
    const groups = document.getElementById("cm-group-count");
    if (name) name.value = displayClassName(cls);
    if (topic) topic.value = displayTopic(cls);
    if (duration) duration.value = String(cls.duration || 60);
    if (groups) {
      const savedValue = String(cls.groupCount || 8);
      const availableValues = groups.options ? Array.from(groups.options, (option) => option.value) : null;
      groups.value = availableValues && !availableValues.includes(savedValue) ? "6" : savedValue;
    }
    updateCounts();
  }

  window.cmOpenTab = function cmOpenTab(tab) {
    currentTab = tab;
    document.querySelectorAll(".cm-tab").forEach((button) => button.classList.toggle("active", button.dataset.cmTab === tab));
    document.querySelectorAll(".cm-panel").forEach((panel) => panel.classList.toggle("active", panel.id === "cm-panel-" + tab));
    if (tab === "students") { renderStudents(); renderGroups(); }
    if (tab === "control") { renderLive(); renderScoreboard(); renderActivities(); }
    if (tab === "results") renderResults();
    const screen = document.getElementById("screen-classroom");
    if (screen) screen.scrollTop = 0;
    translateClassroomDom();
  };

  window.cmSaveSetup = function cmSaveSetup() {
    const cls = activeClass();
    const newCount = Number(document.getElementById("cm-group-count").value || 8);
    cls.name = document.getElementById("cm-class-name").value.trim() || L("Kelas Baharu", "New Class");
    cls.topic = document.getElementById("cm-topic").value.trim() || L("Warna primer dan sekunder", "Primary and secondary colours");
    cls.duration = Number(document.getElementById("cm-duration").value || 60);
    if (cls.groupCount !== newCount && cls.groups.length) {
      cls.groups = [];
      cls.students.forEach((student) => { student.groupId = null; });
    }
    cls.groupCount = newCount;
    if (!cls.sessionActive) cls.timerRemaining = cls.duration * 60;
    saveStore();
    renderClassSelect();
    renderLive();
    message(L("Persediaan kelas telah disimpan. ✓", "Class setup has been saved. ✓"));
  };

  window.cmNewClass = function cmNewClass() {
    const cls = emptyClass();
    store.classes.push(cls);
    store.activeClassId = cls.id;
    saveStore();
    renderClassSelect();
    renderSetup();
    renderStudents();
    renderGroups();
    cmOpenTab("setup");
  };

  window.cmDeleteClass = function cmDeleteClass() {
    const cls = activeClass();
    if (!confirm(L(`Padam ${cls.name}? Senarai murid dan rekod kelas ini akan dipadam.`, `Delete ${cls.name}? Its pupil list and class records will be deleted.`))) return;
    store.classes = store.classes.filter((item) => item.id !== cls.id);
    if (!store.classes.length) store.classes.push(emptyClass());
    store.activeClassId = store.classes[0].id;
    saveStore();
    initClassroom();
  };

  window.cmLoadSelectedClass = function cmLoadSelectedClass() {
    const select = document.getElementById("cm-class-select");
    if (!select) return;
    store.activeClassId = select.value;
    saveStore();
    renderSetup();
    renderStudents();
    renderGroups();
    renderLive();
    renderScoreboard();
    renderActivities();
    renderResults();
  };

  function cleanName(value) {
    const text = String(value == null ? "" : value)
      .replace(/^\s*["']|["']\s*$/g, "")
      .replace(/^\s*\d+\s*[.\-)\/:]?\s*/, "")
      .replace(/\s+/g, " ").trim();
    if (!text || /^\d+$/.test(text) || /^(nama|name|nama murid|student|murid|no|bil)$/i.test(text)) return "";
    return text.slice(0, 80);
  }

  function namesFromRows(rows) {
    if (!Array.isArray(rows)) return [];
    let nameColumn = -1;
    let headerRow = -1;
    for (let r = 0; r < Math.min(rows.length, 5); r++) {
      const row = Array.isArray(rows[r]) ? rows[r] : [];
      const found = row.findIndex((cell) => /^(nama|name|nama murid|student name|murid)$/i.test(String(cell).trim()));
      if (found >= 0) { nameColumn = found; headerRow = r; break; }
    }
    const names = [];
    rows.forEach((rawRow, index) => {
      if (index === headerRow) return;
      const row = Array.isArray(rawRow) ? rawRow : [rawRow];
      let candidate = nameColumn >= 0 ? row[nameColumn] : "";
      if (!candidate) {
        const textCells = row.map(cleanName).filter(Boolean);
        candidate = textCells.length ? textCells[textCells.length - 1] : "";
      }
      const name = cleanName(candidate);
      if (name) names.push(name);
    });
    return names;
  }

  function addNames(names) {
    const cls = activeClass();
    const existing = new Set(cls.students.map((student) => student.name.toLocaleLowerCase("ms")));
    let added = 0;
    names.forEach((name) => {
      const cleaned = cleanName(name);
      const key = cleaned.toLocaleLowerCase("ms");
      if (!cleaned || existing.has(key)) return;
      cls.students.push({ id: uid("student"), name: cleaned, present: true, groupId: null });
      existing.add(key);
      added++;
    });
    if (added) {
      cls.groups = [];
      cls.pickedStudents = [];
      cls.pickedGroups = [];
      saveStore();
    }
    renderStudents();
    renderGroups();
    updateCounts();
    return added;
  }

  window.cmAddPastedNames = function cmAddPastedNames() {
    const input = document.getElementById("cm-name-paste");
    const names = (input.value || "").split(/\r?\n/).map(cleanName).filter(Boolean);
    const added = addNames(names);
    input.value = "";
    message(added ? L(`${added} nama murid berjaya dimasukkan. ✓`, `${added} pupil names were added. ✓`) : L("Tiada nama baharu ditemui.", "No new names were found."), !added);
  };

  window.cmImportFile = async function cmImportFile(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    try {
      const ext = file.name.split(".").pop().toLowerCase();
      let names = [];
      if (ext === "xlsx" || ext === "xls") {
        if (window.COLOURIA_XLSX_READY) await window.COLOURIA_XLSX_READY;
        if (!window.XLSX) throw new Error(L("Pembaca Excel belum tersedia", "The Excel reader is not available"));
        const data = await file.arrayBuffer();
        const workbook = window.XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = window.XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
        names = namesFromRows(rows);
      } else {
        const text = await file.text();
        const rows = text.split(/\r?\n/).map((line) => line.split(/\t|,|;/));
        names = namesFromRows(rows);
      }
      const added = addNames(names);
      message(added ? L(`${added} nama daripada ${file.name} berjaya dimasukkan. ✓`, `${added} names from ${file.name} were added. ✓`) : L("Fail dibaca tetapi tiada nama baharu ditemui.", "The file was read, but no new names were found."), !added);
    } catch (error) {
      message(L("Fail tidak dapat dibaca. Cuba gunakan templat CSV atau semak lajur Nama Murid.", "The file could not be read. Try the CSV template or check the Pupil Name column."), true);
    } finally {
      event.target.value = "";
    }
  };

  window.cmDownloadTemplate = function cmDownloadTemplate() {
    const content = "No,Nama Murid\n1,Aiman Hakim\n2,Siti Aisyah\n3,Nur Amani\n";
    const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "template-nama-murid-colouria.csv";
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  };

  window.cmPrepareClass = function cmPrepareClass() {
    cmSaveSetup();
    if (!activeClass().students.length) {
      message(L("Masukkan senarai nama murid dahulu.", "Add the pupil name list first."), true);
      return;
    }
    cmOpenTab("students");
  };

  function updateCounts() {
    const cls = activeClass();
    const present = cls.students.filter((student) => student.present).length;
    const values = {
      "cm-student-count": cls.students.length,
      "cm-present-count": present,
      "cm-absent-count": cls.students.length - present,
    };
    Object.entries(values).forEach(([id, value]) => { const el = document.getElementById(id); if (el) el.textContent = value; });
  }

  window.cmRenderStudents = renderStudents;
  function renderStudents() {
    const list = document.getElementById("cm-student-list");
    if (!list) return;
    const cls = activeClass();
    const query = (document.getElementById("cm-student-search")?.value || "").trim().toLocaleLowerCase("ms");
    const filtered = cls.students.filter((student) => !query || student.name.toLocaleLowerCase("ms").includes(query));
    list.innerHTML = filtered.length ? filtered.map((student, index) => `
      <div class="cm-student-row ${student.present ? "" : "absent"}">
        <button class="cm-attendance" onclick="cmToggleAttendance('${student.id}')" aria-label="${L("Tukar kehadiran", "Change attendance for")} ${escapeHtml(student.name)}">${student.present ? "✓" : "×"}</button>
        <button class="cm-student-name" onclick="cmEditStudent('${student.id}')" title="${L("Tekan untuk mengedit nama", "Tap to edit the name")}">${index + 1}. ${escapeHtml(student.name)}</button>
        <select class="cm-student-group" onchange="cmMoveStudent('${student.id}',this.value)" ${student.present && cls.groups.length ? "" : "disabled"} aria-label="${L("Kumpulan", "Team for")} ${escapeHtml(student.name)}">
          <option value="">${L("Belum berkumpulan", "Not in a team")}</option>
          ${cls.groups.map((group) => `<option value="${group.id}" ${student.groupId === group.id ? "selected" : ""}>${escapeHtml(displayGroupName(group))}</option>`).join("")}
        </select>
        <button class="cm-remove" onclick="cmRemoveStudent('${student.id}')" aria-label="${L("Padam", "Delete")} ${escapeHtml(student.name)}">×</button>
      </div>`).join("") : `<div class="cm-empty">${L("Belum ada nama murid. Muat naik atau tampal senarai di bahagian Persediaan.", "There are no pupil names yet. Upload or paste a list in Setup.")}</div>`;
    updateCounts();
  }

  window.cmToggleAttendance = function cmToggleAttendance(id) {
    const cls = activeClass();
    const student = cls.students.find((item) => item.id === id);
    if (!student) return;
    student.present = !student.present;
    student.groupId = null;
    cls.groups = [];
    cls.pickedStudents = cls.pickedStudents.filter((studentId) => studentId !== id);
    saveStore();
    renderStudents();
    renderGroups();
  };

  window.cmSetAllAttendance = function cmSetAllAttendance(value) {
    const cls = activeClass();
    cls.students.forEach((student) => { student.present = Boolean(value); student.groupId = null; });
    cls.groups = [];
    saveStore();
    renderStudents();
    renderGroups();
  };

  window.cmRemoveStudent = function cmRemoveStudent(id) {
    const cls = activeClass();
    cls.students = cls.students.filter((student) => student.id !== id);
    cls.groups = [];
    cls.pickedStudents = cls.pickedStudents.filter((studentId) => studentId !== id);
    saveStore();
    renderStudents();
    renderGroups();
  };

  window.cmEditStudent = function cmEditStudent(id) {
    const cls = activeClass();
    const student = cls.students.find((item) => item.id === id);
    if (!student) return;
    const edited = prompt(L("Edit nama murid:", "Edit pupil name:"), student.name);
    if (edited == null) return;
    const name = cleanName(edited);
    if (!name) return;
    const duplicate = cls.students.some((item) => item.id !== id && item.name.toLocaleLowerCase("ms") === name.toLocaleLowerCase("ms"));
    if (duplicate) { message(L("Nama tersebut sudah berada dalam senarai.", "That name is already in the list."), true); return; }
    student.name = name;
    saveStore();
    renderStudents();
    renderGroups();
  };

  window.cmMoveStudent = function cmMoveStudent(studentId, groupId) {
    const cls = activeClass();
    const student = cls.students.find((item) => item.id === studentId);
    if (!student || !student.present) return;
    cls.groups.forEach((group) => { group.studentIds = group.studentIds.filter((id) => id !== studentId); });
    const target = cls.groups.find((group) => group.id === groupId);
    student.groupId = target ? target.id : null;
    if (target && !target.studentIds.includes(studentId)) target.studentIds.push(studentId);
    saveStore();
    renderStudents();
    renderGroups();
  };

  window.cmAutoGroup = function cmAutoGroup() {
    cmSaveSetup();
    const cls = activeClass();
    const present = shuffle(cls.students.filter((student) => student.present));
    if (!present.length) {
      showModal("👥", L("Tiada murid hadir", "No pupils are present"), L("Tandakan kehadiran atau masukkan nama murid sebelum membahagikan kumpulan.", "Mark attendance or add pupil names before creating teams."));
      return;
    }
    const count = Math.max(1, Math.min(cls.groupCount || 8, present.length));
    const oldScores = new Map(cls.groups.map((group, index) => [index, Number(group.score || 0)]));
    cls.groups = Array.from({ length: count }, (_, index) => ({
      id: uid("group"), name: "Kumpulan " + GROUP_NAMES[index], colour: GROUP_COLOURS[index], studentIds: [], score: oldScores.get(index) || 0,
    }));
    present.forEach((student, index) => {
      const group = cls.groups[index % count];
      group.studentIds.push(student.id);
      student.groupId = group.id;
    });
    cls.students.filter((student) => !student.present).forEach((student) => { student.groupId = null; });
    cls.pickedGroups = [];
    cls.activeGroupId = cls.groups[0]?.id || null;
    saveStore();
    renderGroups();
    renderScoreboard();
    message(L(`${present.length} murid dibahagikan kepada ${count} kumpulan. ✨`, `${present.length} pupils were divided into ${count} teams. ✨`));
  };

  function renderGroups() {
    const cls = activeClass();
    const list = document.getElementById("cm-group-list");
    const hint = document.getElementById("cm-group-hint");
    if (!list) return;
    if (!cls.groups.length) {
      list.innerHTML = `<div class="cm-empty" style="grid-column:1/-1">${L("Tekan “Bahagi Kumpulan Automatik” untuk menyusun murid.", "Tap “Create Teams Automatically” to arrange pupils.")}</div>`;
      if (hint) hint.textContent = L("Belum dibahagikan", "Not allocated yet");
      return;
    }
    if (hint) hint.textContent = L(`${cls.groups.length} kumpulan`, `${cls.groups.length} teams`);
    list.innerHTML = cls.groups.map((group) => {
      const members = group.studentIds.map((id) => cls.students.find((student) => student.id === id)).filter(Boolean);
      return `<div class="cm-group-card" style="--cm-color:${group.colour}">
        <div class="cm-group-title"><span>${escapeHtml(displayGroupName(group))}</span><b>${members.length}</b></div>
        <div class="cm-group-members">${members.length ? members.map((student) => `<span>• ${escapeHtml(student.name)}</span>`).join("") : L("Tiada ahli", "No members")}</div>
      </div>`;
    }).join("");
  }

  window.cmStartSession = function cmStartSession() {
    cmSaveSetup();
    const cls = activeClass();
    if (!cls.students.some((student) => student.present)) {
      showModal("👥", L("Senarai murid diperlukan", "A pupil list is required"), L("Masukkan nama dan tandakan murid yang hadir dahulu.", "Add names and mark the pupils who are present first."));
      return;
    }
    if (!cls.groups.length) cmAutoGroup();
    cls.sessionActive = true;
    cls.sessionStartedAt = new Date().toISOString();
    cls.sessionCompletedAt = null;
    cls.timerRemaining = cls.duration * 60;
    cls.timerRunning = true;
    cls.timerEndsAt = Date.now() + cls.timerRemaining * 1000;
    cls.activityDone = {};
    cls.pickedStudents = [];
    cls.pickedGroups = [];
    cls.activeGroupId = cls.groups[0]?.id || null;
    saveStore();
    syncTimerInterval();
    renderLive();
    renderScoreboard();
    renderActivities();
    cmOpenTab("control");
    callSound("sfxAchieve");
  };

  function formatTime(seconds) {
    const safe = Math.max(0, Number(seconds || 0));
    return `${String(Math.floor(safe / 60)).padStart(2, "0")}:${String(safe % 60).padStart(2, "0")}`;
  }

  function timerIsActivelyRunning(cls) {
    if (!cls.sessionActive || !cls.timerRunning) return false;
    const remaining = cls.timerEndsAt
      ? Math.max(0, Math.ceil((Number(cls.timerEndsAt) - Date.now()) / 1000))
      : Number(cls.timerRemaining || 0);
    return remaining > 0;
  }

  function syncFloatingBar() {
    const bar = document.getElementById("cm-floating-bar");
    if (!bar) return;
    const excluded = ["classroom", "home", "welcome"];
    bar.hidden = !(timerIsActivelyRunning(activeClass()) && !excluded.includes(currentScreenId));
  }

  function updateTimerDisplay() {
    const cls = activeClass();
    const text = formatTime(cls.timerRemaining);
    ["cm-timer", "cm-floating-timer"].forEach((id) => { const el = document.getElementById(id); if (el) el.textContent = text; });
    const toggle = document.getElementById("cm-timer-toggle");
    if (toggle) toggle.textContent = cls.timerRunning ? L("⏸ Jeda", "⏸ Pause") : L("▶ Mula", "▶ Start");
    syncFloatingBar();
  }

  function syncTimerInterval() {
    clearInterval(timerInterval);
    const cls = activeClass();
    updateTimerDisplay();
    if (!cls.timerRunning) return;
    if (!cls.timerEndsAt) cls.timerEndsAt = Date.now() + Number(cls.timerRemaining || 0) * 1000;
    timerInterval = setInterval(() => {
      const current = activeClass();
      if (!current.timerRunning) return;
      current.timerRemaining = Math.max(0, Math.ceil((Number(current.timerEndsAt || Date.now()) - Date.now()) / 1000));
      if (current.timerRemaining <= 0) {
        current.timerRunning = false;
        current.timerEndsAt = null;
        clearInterval(timerInterval);
        callSound("sfxAchieve");
        showModal("⏰", L("Masa tamat!", "Time is up!"), L("Aktiviti telah selesai. Guru boleh meneruskan sesi, menetapkan semula pemasa atau melihat keputusan kelas.", "The activity has ended. You can continue, reset the timer or view the class results."));
      }
      saveStore();
      updateTimerDisplay();
    }, 1000);
  }

  window.cmToggleTimer = function cmToggleTimer() {
    const cls = activeClass();
    if (cls.timerRemaining <= 0) cls.timerRemaining = cls.duration * 60;
    if (cls.timerRunning) {
      cls.timerRemaining = Math.max(0, Math.ceil((Number(cls.timerEndsAt || Date.now()) - Date.now()) / 1000));
      cls.timerRunning = false;
      cls.timerEndsAt = null;
    } else {
      cls.timerRunning = true;
      cls.timerEndsAt = Date.now() + Number(cls.timerRemaining || 0) * 1000;
    }
    saveStore();
    syncTimerInterval();
  };

  window.cmResetTimer = function cmResetTimer() {
    const cls = activeClass();
    cls.timerRemaining = cls.duration * 60;
    cls.timerRunning = false;
    cls.timerEndsAt = null;
    saveStore();
    syncTimerInterval();
  };

  function renderLive() {
    const cls = activeClass();
    const title = document.getElementById("cm-live-title");
    const topic = document.getElementById("cm-live-topic");
    const floating = document.getElementById("cm-floating-class");
    if (title) title.textContent = displayClassName(cls);
    if (topic) topic.textContent = displayTopic(cls);
    if (floating) floating.textContent = `${displayClassName(cls)} · ${displayTopic(cls)}`;
    updateTimerDisplay();
  }

  function groupForStudent(student) {
    return activeClass().groups.find((group) => group.id === student.groupId);
  }

  function animatePick(finalIcon, finalTitle, finalSubtitle, callback) {
    const result = document.getElementById("cm-random-result");
    if (!result) return;
    clearTimeout(spinTimeout);
    result.classList.add("spinning");
    result.innerHTML = `<div class="cm-random-icon">🎲</div><strong>${L("Memilih…", "Picking…")}</strong><span>${L("Tunggu sebentar", "Please wait")}</span>`;
    spinTimeout = setTimeout(() => {
      result.classList.remove("spinning");
      result.innerHTML = `<div class="cm-random-icon">${finalIcon}</div><strong>${escapeHtml(finalTitle)}</strong><span>${escapeHtml(finalSubtitle)}</span>`;
      callSound("sfxAchieve");
      if (callback) callback();
    }, 760);
  }

  window.cmPickStudent = function cmPickStudent() {
    const cls = activeClass();
    const present = cls.students.filter((student) => student.present);
    if (!present.length) { showModal("👤", L("Tiada murid hadir", "No pupils are present"), L("Masukkan nama atau kemas kini kehadiran dahulu.", "Add names or update attendance first.")); return; }
    let available = present.filter((student) => !cls.pickedStudents.includes(student.id));
    let reset = false;
    if (!available.length) { cls.pickedStudents = []; available = present; reset = true; }
    const selected = available[Math.floor(Math.random() * available.length)];
    cls.pickedStudents.push(selected.id);
    const group = groupForStudent(selected);
    if (group) cls.activeGroupId = group.id;
    saveStore();
    animatePick("🎉", selected.name, `${group ? displayGroupName(group) : L("Belum berkumpulan", "Not in a team")}${reset ? L(" · Semua sudah mendapat giliran, pusingan baharu bermula", " · Everyone has had a turn; a new round begins") : ""}`, renderScoreboard);
  };

  window.cmPickGroup = function cmPickGroup() {
    const cls = activeClass();
    if (!cls.groups.length) { showModal("👥", L("Kumpulan belum tersedia", "Teams are not ready"), L("Bahagikan murid kepada kumpulan dahulu.", "Divide the pupils into teams first.")); return; }
    let available = cls.groups.filter((group) => !cls.pickedGroups.includes(group.id));
    let reset = false;
    if (!available.length) { cls.pickedGroups = []; available = cls.groups; reset = true; }
    const selected = available[Math.floor(Math.random() * available.length)];
    cls.pickedGroups.push(selected.id);
    cls.activeGroupId = selected.id;
    saveStore();
    animatePick("🎊", displayGroupName(selected), L(`Wakil kumpulan boleh bersedia${reset ? " · Pusingan kumpulan baharu" : ""}`, `The team representative can get ready${reset ? " · New team round" : ""}`), renderScoreboard);
  };

  window.cmResetPicks = function cmResetPicks() {
    const cls = activeClass();
    cls.pickedStudents = [];
    cls.pickedGroups = [];
    saveStore();
    const result = document.getElementById("cm-random-result");
    if (result) result.innerHTML = `<div class="cm-random-icon">🎲</div><strong>${L("Semua giliran telah ditetapkan semula", "All turns have been reset")}</strong><span>${L("Sedia untuk cabutan baharu.", "Ready for a new pick.")}</span>`;
  };

  function renderScoreboard() {
    const list = document.getElementById("cm-scoreboard");
    if (!list) return;
    const cls = activeClass();
    if (!cls.groups.length) {
      list.innerHTML = `<div class="cm-empty">${L("Bahagikan murid kepada kumpulan untuk membuka papan markah.", "Divide pupils into teams to open the scoreboard.")}</div>`;
      return;
    }
    list.innerHTML = [...cls.groups].sort((a, b) => Number(b.score || 0) - Number(a.score || 0)).map((group) => `
      <div class="cm-score-row" style="--cm-color:${group.colour};${cls.activeGroupId === group.id ? "outline:2px solid " + group.colour : ""}">
        <div class="cm-score-name">${cls.activeGroupId === group.id ? "⭐ " : ""}${escapeHtml(displayGroupName(group))}</div>
        <button class="cm-score-btn minus" onclick="cmAdjustScore('${group.id}',-5)" aria-label="${L("Tolak lima markah", "Subtract five points")}">−</button>
        <div class="cm-score-value">${Number(group.score || 0)}</div>
        <button class="cm-score-btn plus" onclick="cmAdjustScore('${group.id}',5)" aria-label="${L("Tambah lima markah", "Add five points")}">＋</button>
      </div>`).join("");
  }

  window.cmAdjustScore = function cmAdjustScore(groupId, points) {
    const group = activeClass().groups.find((item) => item.id === groupId);
    if (!group) return;
    group.score = Math.max(0, Number(group.score || 0) + Number(points || 0));
    activeClass().activeGroupId = group.id;
    saveStore();
    renderScoreboard();
    if (points > 0) callSound("sfxCorrect");
  };

  window.cmResetScores = function cmResetScores() {
    if (!confirm(L("Tetapkan semula semua markah kumpulan kepada 0?", "Reset all team scores to 0?"))) return;
    activeClass().groups.forEach((group) => { group.score = 0; });
    saveStore();
    renderScoreboard();
  };

  function renderActivities() {
    const grid = document.getElementById("cm-activity-grid");
    if (!grid) return;
    const cls = activeClass();
    grid.innerHTML = ACTIVITIES.map((activity) => {
      const done = Boolean(cls.activityDone[activity.id]);
      return `<div class="cm-activity-item ${done ? "done" : ""}">
        <div class="cm-activity-icon">${activity.icon}</div>
        <div class="cm-activity-copy"><strong>${escapeHtml(L(activity.nameBm, activity.nameEn))}</strong><span>${escapeHtml(L(activity.descBm, activity.descEn))}</span></div>
        <div class="cm-activity-actions">
          <button onclick="cmLaunchActivity('${activity.id}')">${L("Buka", "Open")}</button>
          <button class="done-btn" onclick="cmToggleActivity('${activity.id}')">${done ? L("✓ Selesai", "✓ Done") : L("Tanda Selesai", "Mark Done")}</button>
        </div>
      </div>`;
    }).join("");
    const count = document.getElementById("cm-activity-done");
    if (count) count.textContent = ACTIVITIES.filter((activity) => cls.activityDone[activity.id]).length;
    const total = document.getElementById("cm-activity-total");
    if (total) total.textContent = ACTIVITIES.length;
  }

  window.cmLaunchActivity = function cmLaunchActivity(id) {
    const activity = ACTIVITIES.find((item) => item.id === id);
    if (!activity) return;
    saveStore();
    if (activity.kind === "internal" && typeof window.go === "function") window.go(activity.target);
    else window.location.href = activity.target;
  };

  window.cmToggleActivity = function cmToggleActivity(id) {
    const cls = activeClass();
    cls.activityDone[id] = !cls.activityDone[id];
    saveStore();
    renderActivities();
    if (cls.activityDone[id]) callSound("sfxCorrect");
  };

  window.cmFinishSession = function cmFinishSession() {
    const cls = activeClass();
    cls.timerRunning = false;
    cls.timerEndsAt = null;
    cls.sessionActive = false;
    cls.sessionCompletedAt = new Date().toISOString();
    saveStore();
    syncTimerInterval();
    renderResults();
    cmOpenTab("results");
    callSound("sfxAchieve");
  };

  function sortedGroups() {
    return [...activeClass().groups].sort((a, b) => Number(b.score || 0) - Number(a.score || 0));
  }

  function renderResults() {
    const cls = activeClass();
    const sorted = sortedGroups();
    const winner = sorted[0];
    const title = document.getElementById("cm-winner-title");
    const summary = document.getElementById("cm-results-summary");
    if (title) title.textContent = winner ? L(`Tahniah ${displayGroupName(winner)}!`, `Congratulations, ${displayGroupName(winner)}!`) : L("Sedia untuk meraikan kelas!", "Ready to celebrate the class!");
    if (summary) summary.textContent = winner ? L(`${displayGroupName(winner)} mendahului dengan ${Number(winner.score || 0)} markah.`, `${displayGroupName(winner)} leads with ${Number(winner.score || 0)} points.`) : L("Bahagikan murid kepada kumpulan dan mulakan sesi dahulu.", "Divide pupils into teams and start the session first.");
    const podium = document.getElementById("cm-podium");
    if (podium) {
      const top = sorted.slice(0, 3);
      const order = top.length >= 3 ? [top[1], top[0], top[2]] : top;
      podium.innerHTML = order.length ? order.map((group) => {
        const actualRank = sorted.findIndex((item) => item.id === group.id) + 1;
        const rankClass = actualRank === 1 ? "first" : actualRank === 2 ? "second" : "third";
        const medal = actualRank === 1 ? "🥇" : actualRank === 2 ? "🥈" : "🥉";
        return `<div class="cm-podium-step ${rankClass}" style="--cm-color:${group.colour}"><div class="cm-podium-rank">${medal}</div><strong>${escapeHtml(displayGroupName(group))}</strong><b>${Number(group.score || 0)}</b><span> ${L("markah", "points")}</span></div>`;
      }).join("") : `<div class="cm-empty">${L("Keputusan akan dipaparkan di sini.", "Results will appear here.")}</div>`;
    }
    const present = cls.students.filter((student) => student.present).length;
    const done = ACTIVITIES.filter((activity) => cls.activityDone[activity.id]).length;
    const stats = document.getElementById("cm-session-stats");
    if (stats) stats.innerHTML = `
      <div class="cm-stat"><b>${present}</b><span>${L("MURID HADIR", "PUPILS PRESENT")}</span></div>
      <div class="cm-stat"><b>${cls.groups.length}</b><span>${L("KUMPULAN", "TEAMS")}</span></div>
      <div class="cm-stat"><b>${done}/${ACTIVITIES.length}</b><span>${L("AKTIVITI SELESAI", "ACTIVITIES COMPLETED")}</span></div>
      <div class="cm-stat"><b>${formatTime(cls.duration * 60 - cls.timerRemaining)}</b><span>${L("MASA DIGUNAKAN", "TIME USED")}</span></div>`;
    const history = document.getElementById("cm-history-list");
    if (history) history.innerHTML = cls.history.length ? cls.history.slice(-4).reverse().map((record) => `<div class="cm-history-row"><b>${escapeHtml(record.date)}</b> · ${escapeHtml(record.topic)}<br>${escapeHtml(record.winner)} · ${record.activities}/${ACTIVITIES.length} ${L("aktiviti", "activities")}</div>`).join("") : `<div class="cm-empty">${L("Belum ada rekod sesi disimpan.", "No session records have been saved yet.")}</div>`;
  }

  window.cmSaveSessionRecord = function cmSaveSessionRecord() {
    const cls = activeClass();
    const winner = sortedGroups()[0];
    const record = {
      id: uid("session"),
      date: new Date().toLocaleString(cmLanguage === "en" ? "en-GB" : "ms-MY", { dateStyle: "medium", timeStyle: "short" }),
      topic: cls.topic,
      winner: winner ? `${displayGroupName(winner)} (${Number(winner.score || 0)} ${L("markah", "points")})` : L("Tiada pemenang", "No winner"),
      activities: ACTIVITIES.filter((activity) => cls.activityDone[activity.id]).length,
      present: cls.students.filter((student) => student.present).length,
    };
    cls.history.push(record);
    cls.history = cls.history.slice(-20);
    saveStore();
    renderResults();
    showModal("💾", L("Rekod sesi disimpan", "Session record saved"), `${record.date}<br>${escapeHtml(record.winner)}<br>${record.activities}/${ACTIVITIES.length} ${L("aktiviti selesai", "activities completed")}.`);
  };

  window.cmNewSession = function cmNewSession() {
    if (!confirm(L("Mulakan sesi baharu? Nama murid dan kumpulan dikekalkan, manakala markah dan aktiviti akan ditetapkan semula.", "Start a new session? Pupil names and teams will be kept, while scores and activities will be reset."))) return;
    const cls = activeClass();
    cls.groups.forEach((group) => { group.score = 0; });
    cls.pickedStudents = [];
    cls.pickedGroups = [];
    cls.activityDone = {};
    cls.timerRemaining = cls.duration * 60;
    cls.timerRunning = false;
    cls.timerEndsAt = null;
    cls.sessionActive = false;
    cls.sessionStartedAt = null;
    cls.sessionCompletedAt = null;
    saveStore();
    syncTimerInterval();
    renderLive();
    renderScoreboard();
    renderActivities();
    cmOpenTab("control");
  };

  window.cmHandleNavigation = function cmHandleNavigation(screenId) {
    currentScreenId = screenId;
    syncFloatingBar();
    renderLive();
  };

  function showModal(icon, title, body) {
    const modal = document.getElementById("cm-modal");
    if (!modal) return;
    document.getElementById("cm-modal-icon").textContent = icon;
    document.getElementById("cm-modal-title").textContent = title;
    document.getElementById("cm-modal-body").innerHTML = body;
    modal.hidden = false;
  }

  window.cmCloseModal = function cmCloseModal() {
    const modal = document.getElementById("cm-modal");
    if (modal) modal.hidden = true;
  };

  window.cmShowHelp = function cmShowHelp() {
    showModal("🧑‍🏫", L("Cara menggunakan Mod Kelas", "How to use Classroom Mode"), L(`<div class="cm-help-list">
      <div><b>1. Persediaan</b><br>Isi nama kelas, topik dan muat naik senarai murid.</div>
      <div><b>2. Murid</b><br>Tandakan kehadiran dan bahagikan kumpulan secara automatik.</div>
      <div><b>3. Kawal Kelas</b><br>Gunakan pemasa, cabutan rawak, markah dan aktiviti COLOURIA.</div>
      <div><b>4. Keputusan</b><br>Raikan pemenang dan simpan rekod sesi dalam peranti.</div>
    </div>`, `<div class="cm-help-list">
      <div><b>1. Setup</b><br>Enter the class name and topic, then upload the pupil list.</div>
      <div><b>2. Pupils</b><br>Mark attendance and create teams automatically.</div>
      <div><b>3. Class Control</b><br>Use the timer, random pick, scores and COLOURIA activities.</div>
      <div><b>4. Results</b><br>Celebrate the winner and save the session record on this device.</div>
    </div>`));
  };

  window.addEventListener("storage", (event) => {
    if (event.key !== STORAGE_KEY) return;
    store = loadStore();
    renderScoreboard();
    renderResults();
  });
})();
