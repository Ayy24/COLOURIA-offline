# COLOURIA Offline

COLOURIA ialah aplikasi pembelajaran warna dan Seni Visual dwibahasa (BM/BI) untuk murid sekolah rendah. ARTORIA, Paint Runner, Mod Kelas dan analisis karya luar talian dikekalkan sebagai sebahagian daripada pengalaman COLOURIA.

Repositori ini ialah versi portable untuk Rocket.new dan platform standard Next.js. Ia tidak bergantung pada Vinext, Wrangler, API awan, CDN atau kunci API.

## Jalankan projek

Keperluan: Node.js 20.9 atau lebih baharu.

```bash
npm install
npm run dev
```

Buka `http://localhost:3000`. Halaman utama akan membawa pengguna ke `/colouria/index.html`.

## Uji dan bina

```bash
npm test
npm run build
```

Hasil binaan statik berada dalam folder `out/`. Untuk menguji pemasangan dan mod luar talian, hidangkan folder tersebut melalui HTTPS atau `localhost`; service worker tidak berfungsi apabila fail HTML dibuka terus menggunakan `file://`.

## Import ke Rocket.new

1. Sambungkan akaun GitHub kepada Rocket.
2. Pilih **Build → + → Clone from GitHub**.
3. Pilih repositori `COLOURIA-offline`.
4. Jalankan `npm install` dan `npm run dev` jika diminta.

## Struktur penting

- `app/` — pintu masuk standard Next.js + TypeScript.
- `public/colouria/` — aplikasi utama COLOURIA dan Mod Kelas.
- `public/artoria/` — modul ARTORIA, ARThink dan Analisis Karya AI luar talian.
- `public/paint-runner/` — permainan Paint Runner.
- `public/sw.js` dan `public/offline-assets.json` — cache untuk penggunaan luar talian.
- `tests/` — ujian regresi fungsi utama.

Lihat `ROCKET_HANDOFF.md` sebelum meminta AI mengubah projek ini.
