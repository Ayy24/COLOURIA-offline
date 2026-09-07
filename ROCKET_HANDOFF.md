# Panduan Pengubahsuaian di Rocket

## Peraturan wajib

1. Kekalkan COLOURIA sebagai aplikasi utama. ARTORIA ialah modul di bawah aliran **Mula Kelas Hari Ini**.
2. Kekalkan semua laluan mutlak sedia ada seperti `/colouria/`, `/artoria/` dan `/paint-runner/`.
3. Semua fungsi pembelajaran mesti terus berfungsi tanpa Internet selepas aset dicache.
4. Jangan tambah CDN, Google Fonts, API luaran atau kunci API. Analisis Karya menggunakan ejen AI visual luar talian yang tersedia dalam projek.
5. Kekalkan pilihan Bahasa Melayu standard dan Bahasa Inggeris pada semua skrin.
6. Kekalkan data Mod Kelas dalam `localStorage`, akses kamera dengan kebenaran pengguna, muzik latar dan kesan bunyi.
7. Jika fail baharu ditambah di bawah `public/`, tambah laluannya ke `public/offline-assets.json`.
8. Selepas setiap perubahan, jalankan `npm test` dan `npm run build`.

## Kawasan fungsi

| Fungsi | Fail utama |
|---|---|
| Skrin utama, simulasi buta warna, audio | `public/colouria/index.html` |
| Mod Kelas | `public/colouria/classroom.js`, `public/colouria/classroom.css` |
| ARTORIA | `public/artoria/` |
| Ejen Analisis Karya | `public/artoria/ai-agent.js` |
| Muzik ARTORIA | `public/artoria/bgm.js` |
| Paint Runner | `public/paint-runner/index.html` |
| Sokongan luar talian | `public/sw.js`, `public/offline-assets.json` |

## Jangan ubah tanpa ujian visual

- susun atur kamera pada telefon dan tablet;
- bar pemasa Mod Kelas pada halaman ARTORIA;
- pengecaman garisan ARThink;
- imbangan muzik latar dengan kesan bunyi;
- urutan rehat dan kenaikan tahap Paint Runner.
