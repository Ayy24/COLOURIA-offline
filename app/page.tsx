"use client";

import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    window.location.replace("/colouria/index.html");
  }, []);

  return (
    <main className="launch-screen">
      <section className="launch-card" aria-live="polite">
        <span className="launch-logo" aria-hidden="true">🎨</span>
        <h1>COLOURIA Offline</h1>
        <p>Membuka aplikasi pembelajaran warna…</p>
        <a href="/colouria/index.html">Buka COLOURIA</a>
      </section>
    </main>
  );
}
