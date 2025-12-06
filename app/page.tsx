"use client";

import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-green-100 text-gray-900 px-6">
      <div className="backdrop-blur-xl bg-white/70 border border-green-200 shadow-2xl rounded-3xl p-10 max-w-lg w-full text-center">
        {/* Judul */}
        <h1 className="text-4xl font-extrabold mb-4 bg-gradient-to-r from-green-600 to-lime-600 text-transparent bg-clip-text">
          Selamat Datang 🌿
        </h1>

        {/* Subtitle */}
        <p className="text-gray-700 text-lg mb-8 leading-relaxed">
          Sistem Diagnosa Penyakit Tanaman Cabai berbasis{" "}
          <span className="font-semibold text-green-700">Forward Chaining</span>
          . Membantu menganalisis gejala dengan cepat, akurat, dan mudah
          digunakan.
        </p>

        {/* Tombol Mulai */}
        <Link
          href="/diagnosa"
          className="inline-block bg-gradient-to-r from-green-500 to-lime-500 text-white font-semibold px-6 py-3 rounded-xl text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all"
        >
          Mulai Diagnosa
        </Link>

        {/* Ornament */}
        <div className="mt-10 flex justify-center opacity-80">
          <div className="h-1 w-24 bg-gradient-to-r from-green-400 to-lime-300 rounded-full"></div>
        </div>

        {/* Nama kelompok */}
        <p className="mt-6 text-sm text-gray-600">
          Kelompok 1 — <span className="text-green-700 font-medium">Delta</span>
          , <span className="text-green-700 font-medium">Azhis</span>,{" "}
          <span className="text-green-700 font-medium">Risky</span>
        </p>
      </div>
    </main>
  );
}
