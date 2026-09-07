(function loadOfflineExcelReader() {
  const parts = [
    "/colouria/vendor/xlsx.full.min.part1.txt",
    "/colouria/vendor/xlsx.full.min.part2.txt",
    "/colouria/vendor/xlsx.full.min.part3.txt",
    "/colouria/vendor/xlsx.full.min.part4.txt",
    "/colouria/vendor/xlsx.full.min.part5.txt",
    "/colouria/vendor/xlsx.full.min.part6.txt",
  ];

  window.COLOURIA_XLSX_READY = Promise.all(
    parts.map(async (url) => {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Unable to load ${url}`);
      return response.text();
    }),
  ).then((sourceParts) => {
    const script = document.createElement("script");
    script.textContent = sourceParts.join("");
    document.head.appendChild(script);
    script.remove();
    if (!window.XLSX) throw new Error("Offline Excel reader failed to start");
    return window.XLSX;
  });
})();
