"use client";
import React, { useEffect, useState } from "react";

type Rule = {
  id: number;
  nama_penyakit: string;
  gejala: string[];
  solusi: string;
};

const ATURAN: Rule[] = [
  {
    id: 1,
    nama_penyakit: "Antraknosa (Patek)",
    gejala: [
      "bercak hitam cekung pada buah",
      "keluaran spora berwarna oranye",
      "buah membusuk",
    ],
    solusi:
      "Buang buah yang terinfeksi, semprot fungisida (mankozeb / klorotalonil), tingkatkan sirkulasi udara.",
  },
  {
    id: 2,
    nama_penyakit: "Layu Fusarium",
    gejala: [
      "daun layu",
      "jaringan pembuluh berwarna coklat",
      "pertumbuhan terhambat",
    ],
    solusi:
      "Perbaiki drainase, gunakan Trichoderma, cabut tanaman terinfeksi untuk mencegah penyebaran.",
  },
  {
    id: 3,
    nama_penyakit: "Embun Tepung",
    gejala: [
      "serbuk jamur putih pada daun",
      "daun menggulung",
      "fotosintesis menurun",
    ],
    solusi:
      "Semprot fungisida sulfur, kurangi kelembapan, tingkatkan paparan sinar matahari.",
  },
  {
    id: 4,
    nama_penyakit: "Layu Bakteri",
    gejala: [
      "daun layu",
      "pertumbuhan terhambat",
      "jaringan pembuluh berwarna coklat",
    ],
    solusi:
      "Segera cabut tanaman yang terinfeksi, hindari penyiraman berlebih, gunakan varietas tahan penyakit.",
  },
  {
    id: 5,
    nama_penyakit: "Busuk Akar",
    gejala: [
      "daun layu",
      "daun menguning",
      "akar membusuk",
      "pertumbuhan terhambat",
    ],
    solusi:
      "Perbaiki aerasi tanah, kurangi frekuensi penyiraman, aplikasikan fungisida pada tanah.",
  },
];

const SEMUA_GEJALA = Array.from(
  new Set(ATURAN.flatMap((r) => r.gejala))
).sort();

interface Hasil {
  penyakit: string;
  solusi: string;
  gejala: string[];
}

interface Riwayat {
  id: string;
  tanggal: string;
  gejala: string[];
  hasil: Hasil[];
}

export default function ForwardChainingDiagnosa() {
  const [halaman, setHalaman] = useState<"diagnosa" | "riwayat">("diagnosa");
  const [gejalaDipilih, setGejalaDipilih] = useState<string[]>([]);
  const [hasil, setHasil] = useState<Hasil[]>([]);
  const [riwayat, setRiwayat] = useState<Riwayat[]>([]);
  const [tampilkanHasil, setTampilkanHasil] = useState(false);

  useEffect(() => {
    try {
      const data = localStorage.getItem("riwayat_forward_chaining");
      if (data) setRiwayat(JSON.parse(data));
    } catch (e) {
      console.warn("Gagal memuat riwayat:", e);
      setRiwayat([]);
    }
  }, []);

  const toggleGejala = (g: string) => {
    setGejalaDipilih((prev) =>
      prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]
    );
  };

  // Forward chaining exact match:
  // rule cocok jika semua gejala rule terpenuhi oleh gejalaDipilih
  const lakukanDiagnosa = () => {
    if (gejalaDipilih.length === 0) {
      alert("Silakan pilih minimal satu gejala terlebih dahulu.");
      return;
    }

    const matched: Hasil[] = ATURAN.filter((rule) =>
      rule.gejala.every((g) => gejalaDipilih.includes(g))
    ).map((r) => ({
      penyakit: r.nama_penyakit,
      solusi: r.solusi,
      gejala: r.gejala,
    }));

    setHasil(matched);
    setTampilkanHasil(true);

    const entri: Riwayat = {
      id: Date.now().toString(),
      tanggal: new Date().toLocaleString(),
      gejala: gejalaDipilih,
      hasil: matched,
    };

    const updated = [entri, ...riwayat];
    setRiwayat(updated);
    localStorage.setItem("riwayat_forward_chaining", JSON.stringify(updated));
  };

  const resetForm = () => {
    setGejalaDipilih([]);
    setHasil([]);
    setTampilkanHasil(false);
  };

  const hapusSemuaRiwayat = () => {
    if (confirm("Hapus semua riwayat diagnosa?")) {
      setRiwayat([]);
      localStorage.removeItem("riwayat_forward_chaining");
    }
  };

  const hapusRiwayatItem = (id: string) => {
    const updated = riwayat.filter((r) => r.id !== id);
    setRiwayat(updated);
    localStorage.setItem("riwayat_forward_chaining", JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      {/* Header */}
      <header className="bg-green-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">
            🌶 Sistem Diagnosa Penyakit Tanaman Cabai (Forward Chaining)
          </h1>
        </div>
      </header>

      {/* Nav */}
      <nav className="bg-white shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex gap-4 py-4">
            <button
              onClick={() => setHalaman("diagnosa")}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                halaman === "diagnosa"
                  ? "bg-green-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Diagnosa Baru
            </button>

            <button
              onClick={() => setHalaman("riwayat")}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                halaman === "riwayat"
                  ? "bg-green-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Riwayat Diagnosa
            </button>
          </div>
        </div>
      </nav>

      {/* Main */}
      <main className="container mx-auto px-4 py-8">
        {halaman === "diagnosa" ? (
          <div className="max-w-6xl mx-auto">
            {!tampilkanHasil ? (
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                  Pilih Gejala yang Diamati
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                  {SEMUA_GEJALA.map((g) => (
                    <label
                      key={g}
                      className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        gejalaDipilih.includes(g)
                          ? "border-green-600 bg-green-50"
                          : "border-gray-200 hover:border-green-300"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={gejalaDipilih.includes(g)}
                        onChange={() => toggleGejala(g)}
                        className="w-5 h-5 text-green-600"
                      />
                      <span className="text-gray-700">{g}</span>
                    </label>
                  ))}
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={lakukanDiagnosa}
                    className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                  >
                    🔍 Mulai Diagnosa
                  </button>

                  <button
                    onClick={resetForm}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                  >
                    Reset
                  </button>
                </div>

                <p className="mt-4 text-sm text-gray-600">
                  Catatan: dengan mode <strong>Exact Match</strong>, sebuah
                  aturan dianggap cocok hanya jika semua gejala pada aturan
                  tersebut dipilih.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">
                    Hasil Diagnosa
                  </h2>

                  {hasil.length > 0 ? (
                    <div className="space-y-4">
                      {hasil.map((h, idx) => (
                        <div
                          key={idx}
                          className="border-2 border-green-200 rounded-lg p-6 bg-green-50"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <h3 className="text-xl font-bold text-gray-800">
                              {h.penyakit}
                            </h3>
                          </div>

                          <div className="mb-3">
                            <p className="text-sm text-gray-600 font-semibold mb-1">
                              Gejala pada aturan:
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {h.gejala.map((g) => (
                                <span
                                  key={g}
                                  className="bg-white px-3 py-1 rounded-full text-sm text-gray-700 border border-green-300"
                                >
                                  {g}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div>
                            <p className="text-sm text-gray-600 font-semibold mb-1">
                              Rekomendasi Penanganan:
                            </p>
                            <p className="text-gray-700">{h.solusi}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600 text-center py-8">
                      Tidak ditemukan aturan yang semua gejalanya dipenuhi. Coba
                      pilih lebih banyak gejala atau gunakan kombinasi gejala
                      lain.
                    </p>
                  )}

                  <div className="mt-6 flex gap-4">
                    <button
                      onClick={resetForm}
                      className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
                    >
                      Diagnosa Baru
                    </button>
                    <button
                      onClick={() => setTampilkanHasil(false)}
                      className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                    >
                      Kembali Pilih Gejala
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  Riwayat Diagnosa
                </h2>
                {riwayat.length > 0 && (
                  <button
                    onClick={hapusSemuaRiwayat}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Hapus Semua
                  </button>
                )}
              </div>

              {riwayat.length === 0 ? (
                <p className="text-gray-600 text-center py-8">
                  Belum ada riwayat diagnosa.
                </p>
              ) : (
                <div className="space-y-6">
                  {riwayat.map((r) => (
                    <div
                      key={r.id}
                      className="border-2 border-gray-200 rounded-lg p-6"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-sm text-gray-600">
                            Tanggal: {r.tanggal}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            Gejala: {r.gejala.join(", ")}
                          </p>
                        </div>
                        <button
                          onClick={() => hapusRiwayatItem(r.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Hapus
                        </button>
                      </div>

                      <div className="space-y-2">
                        {r.hasil.length > 0 ? (
                          r.hasil.map((h, i) => (
                            <div
                              key={i}
                              className="flex justify-between items-center bg-gray-50 p-3 rounded"
                            >
                              <span className="font-medium text-gray-800">
                                {h.penyakit}
                              </span>
                              <span className="text-green-600 font-semibold">
                                Cocok
                              </span>
                            </div>
                          ))
                        ) : (
                          <div className="bg-gray-50 p-3 rounded text-sm text-gray-600">
                            Tidak ada aturan yang cocok pada diagnosa ini.
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-green-600 text-white mt-12 py-6">
        <div className="container mx-auto px-4 text-center">
          <p>Sistem Pakar Penyakit Cabai © {new Date().getFullYear()}</p>
          <p className="text-sm text-green-100 mt-2">
            Metode: Forward Chaining (Exact Match)
          </p>
        </div>
      </footer>
    </div>
  );
}

// "use client";
// import React, { useEffect, useState } from "react";
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
// } from "recharts";

// // Utilitas penggabungan Certainty Factor
// const gabungCF = (cf1: number, cf2: number): number => {
//   if (cf1 > 0 && cf2 > 0) {
//     return cf1 + cf2 * (1 - cf1);
//   } else if (cf1 < 0 && cf2 < 0) {
//     return cf1 + cf2 * (1 + cf1);
//   } else {
//     return (cf1 + cf2) / (1 - Math.min(Math.abs(cf1), Math.abs(cf2)));
//   }
// };

// // Basis pengetahuan (semua teks sudah Bahasa Indonesia)
// const ATURAN = [
//   {
//     id: 1,
//     nama_penyakit: "Antraknosa (Patek)",
//     gejala: [
//       "bercak hitam cekung pada buah",
//       "keluaran spora berwarna oranye",
//       "buah membusuk",
//     ],
//     solusi:
//       "Buang buah yang terinfeksi, semprot fungisida (mankozeb / klorotalonil), tingkatkan sirkulasi udara.",
//     cf_rule: 0.85,
//   },
//   {
//     id: 2,
//     nama_penyakit: "Layu Fusarium",
//     gejala: [
//       "daun layu",
//       "jaringan pembuluh berwarna coklat",
//       "pertumbuhan terhambat",
//     ],
//     solusi:
//       "Perbaiki drainase, gunakan Trichoderma, cabut tanaman terinfeksi untuk mencegah penyebaran.",
//     cf_rule: 0.9,
//   },
//   {
//     id: 3,
//     nama_penyakit: "Embun Tepung",
//     gejala: [
//       "serbuk jamur putih pada daun",
//       "daun menggulung",
//       "fotosintesis menurun",
//     ],
//     solusi:
//       "Semprot fungisida sulfur, kurangi kelembapan, tingkatkan paparan sinar matahari.",
//     cf_rule: 0.75,
//   },
//   {
//     id: 4,
//     nama_penyakit: "Layu Bakteri",
//     gejala: [
//       "daun layu",
//       "pertumbuhan terhambat",
//       "jaringan pembuluh berwarna coklat",
//     ],
//     solusi:
//       "Segera cabut tanaman yang terinfeksi, hindari penyiraman berlebih, gunakan varietas tahan penyakit.",
//     cf_rule: 0.88,
//   },
//   {
//     id: 5,
//     nama_penyakit: "Busuk Akar",
//     gejala: [
//       "daun layu",
//       "daun menguning",
//       "akar membusuk",
//       "pertumbuhan terhambat",
//     ],
//     solusi:
//       "Perbaiki aerasi tanah, kurangi frekuensi penyiraman, aplikasikan fungisida pada tanah.",
//     cf_rule: 0.82,
//   },
// ];

// const SEMUA_GEJALA = Array.from(
//   new Set(ATURAN.flatMap((r) => r.gejala))
// ).sort();

// interface HasilDiagnosa {
//   penyakit: string;
//   keyakinan: number; // persen (0-100)
//   solusi: string;
//   gejalaCocok: string[];
// }

// interface RiwayatItem {
//   id: string;
//   tanggal: string;
//   gejala: string[];
//   hasil: HasilDiagnosa[];
// }

// export default function AplikasiDiagnosaCabai() {
//   const [halaman, setHalaman] = useState<"diagnosa" | "riwayat">("diagnosa");
//   const [gejalaDipilih, setGejalaDipilih] = useState<string[]>([]);
//   const [hasilDiagnosa, setHasilDiagnosa] = useState<HasilDiagnosa[]>([]);
//   const [riwayat, setRiwayat] = useState<RiwayatItem[]>([]);
//   const [tampilkanHasil, setTampilkanHasil] = useState(false);

//   // Load riwayat dari localStorage
//   useEffect(() => {
//     try {
//       const data = localStorage.getItem("riwayat_diagnosa_cabai");
//       if (data) setRiwayat(JSON.parse(data));
//     } catch (e) {
//       // kalau parsing error, reset
//       console.warn("Gagal memuat riwayat:", e);
//       setRiwayat([]);
//     }
//   }, []);

//   const toggleGejala = (g: string) => {
//     setGejalaDipilih((prev) =>
//       prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]
//     );
//   };

//   const lakukanDiagnosa = () => {
//     if (gejalaDipilih.length === 0) {
//       alert("Silakan pilih minimal satu gejala terlebih dahulu.");
//       return;
//     }

//     const hasil: HasilDiagnosa[] = [];
//     const userCF = 0.8; // asumsi kepastian pengguna per gejala

//     ATURAN.forEach((aturan) => {
//       const cocok = aturan.gejala.filter((g) => gejalaDipilih.includes(g));
//       if (cocok.length > 0) {
//         let cfGabung = userCF * aturan.cf_rule;
//         for (let i = 1; i < cocok.length; i++) {
//           cfGabung = gabungCF(cfGabung, userCF * aturan.cf_rule);
//         }

//         hasil.push({
//           penyakit: aturan.nama_penyakit,
//           keyakinan: cfGabung * 100,
//           solusi: aturan.solusi,
//           gejalaCocok: cocok,
//         });
//       }
//     });

//     // urutkan berdasarkan keyakinan tertinggi
//     hasil.sort((a, b) => b.keyakinan - a.keyakinan);

//     setHasilDiagnosa(hasil);
//     setTampilkanHasil(true);

//     const entri: RiwayatItem = {
//       id: Date.now().toString(),
//       tanggal: new Date().toLocaleString(),
//       gejala: gejalaDipilih,
//       hasil,
//     };

//     const updated = [entri, ...riwayat];
//     setRiwayat(updated);
//     localStorage.setItem("riwayat_diagnosa_cabai", JSON.stringify(updated));
//   };

//   const resetForm = () => {
//     setGejalaDipilih([]);
//     setHasilDiagnosa([]);
//     setTampilkanHasil(false);
//   };

//   const hapusRiwayatSemua = () => {
//     if (confirm("Hapus semua riwayat diagnosa?")) {
//       setRiwayat([]);
//       localStorage.removeItem("riwayat_diagnosa_cabai");
//     }
//   };

//   const hapusRiwayatItem = (id: string) => {
//     const updated = riwayat.filter((r) => r.id !== id);
//     setRiwayat(updated);
//     localStorage.setItem("riwayat_diagnosa_cabai", JSON.stringify(updated));
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
//       {/* Header */}
//       <header className="bg-green-600 text-white shadow-lg">
//         <div className="container mx-auto px-4 py-6">
//           <h1 className="text-3xl font-bold">
//             🌶 Sistem Diagnosa Penyakit Tanaman Cabai
//           </h1>
//           <p className="text-green-100 mt-2">
//             Sistem Pakar — Algoritma Certainty Factor
//           </p>
//         </div>
//       </header>

//       {/* Nav */}
//       <nav className="bg-white shadow-md">
//         <div className="container mx-auto px-4">
//           <div className="flex gap-4 py-4">
//             <button
//               onClick={() => setHalaman("diagnosa")}
//               className={`px-6 py-2 rounded-lg font-medium transition-colors ${
//                 halaman === "diagnosa"
//                   ? "bg-green-600 text-white"
//                   : "bg-gray-200 text-gray-700 hover:bg-gray-300"
//               }`}
//             >
//               Diagnosa Baru
//             </button>

//             <button
//               onClick={() => setHalaman("riwayat")}
//               className={`px-6 py-2 rounded-lg font-medium transition-colors ${
//                 halaman === "riwayat"
//                   ? "bg-green-600 text-white"
//                   : "bg-gray-200 text-gray-700 hover:bg-gray-300"
//               }`}
//             >
//               Riwayat Diagnosa
//             </button>
//           </div>
//         </div>
//       </nav>

//       {/* Main */}
//       <main className="container mx-auto px-4 py-8">
//         {halaman === "diagnosa" ? (
//           <div className="max-w-6xl mx-auto">
//             {!tampilkanHasil ? (
//               <div className="bg-white rounded-lg shadow-lg p-8">
//                 <h2 className="text-2xl font-bold text-gray-800 mb-6">
//                   Pilih Gejala yang Diamati
//                 </h2>

//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
//                   {SEMUA_GEJALA.map((g) => (
//                     <label
//                       key={g}
//                       className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
//                         gejalaDipilih.includes(g)
//                           ? "border-green-600 bg-green-50"
//                           : "border-gray-200 hover:border-green-300"
//                       }`}
//                     >
//                       <input
//                         type="checkbox"
//                         checked={gejalaDipilih.includes(g)}
//                         onChange={() => toggleGejala(g)}
//                         className="w-5 h-5 text-green-600"
//                       />
//                       <span className="text-gray-700">{g}</span>
//                     </label>
//                   ))}
//                 </div>

//                 <div className="flex gap-4">
//                   <button
//                     onClick={lakukanDiagnosa}
//                     className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors"
//                   >
//                     🔍 Mulai Diagnosa
//                   </button>

//                   <button
//                     onClick={resetForm}
//                     className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
//                   >
//                     Reset
//                   </button>
//                 </div>
//               </div>
//             ) : (
//               <div className="space-y-6">
//                 <div className="bg-white rounded-lg shadow-lg p-8">
//                   <h2 className="text-2xl font-bold text-gray-800 mb-6">
//                     Hasil Diagnosa
//                   </h2>

//                   {hasilDiagnosa.length > 0 ? (
//                     <>
//                       <div className="mb-8">
//                         <ResponsiveContainer width="100%" height={300}>
//                           <BarChart
//                             data={hasilDiagnosa.map((h) => ({
//                               name: h.penyakit,
//                               confidence: Number(h.keyakinan.toFixed(1)),
//                             }))}
//                           >
//                             <CartesianGrid strokeDasharray="3 3" />
//                             <XAxis
//                               dataKey="name"
//                               angle={-45}
//                               textAnchor="end"
//                               height={100}
//                             />
//                             <YAxis
//                               label={{
//                                 value: "Keyakinan (%)",
//                                 angle: -90,
//                                 position: "insideLeft",
//                               }}
//                             />
//                             <Tooltip />
//                             <Legend />
//                             <Bar dataKey="confidence" />
//                           </BarChart>
//                         </ResponsiveContainer>
//                       </div>

//                       <div className="space-y-4">
//                         {hasilDiagnosa.map((h, idx) => (
//                           <div
//                             key={idx}
//                             className="border-2 border-green-200 rounded-lg p-6 bg-green-50"
//                           >
//                             <div className="flex justify-between items-start mb-3">
//                               <h3 className="text-xl font-bold text-gray-800">
//                                 {h.penyakit}
//                               </h3>
//                               <span className="bg-green-600 text-white px-4 py-1 rounded-full font-semibold">
//                                 {h.keyakinan.toFixed(1)}%
//                               </span>
//                             </div>

//                             <div className="mb-3">
//                               <p className="text-sm text-gray-600 font-semibold mb-1">
//                                 Gejala yang Cocok:
//                               </p>
//                               <div className="flex flex-wrap gap-2">
//                                 {h.gejalaCocok.map((g) => (
//                                   <span
//                                     key={g}
//                                     className="bg-white px-3 py-1 rounded-full text-sm text-gray-700 border border-green-300"
//                                   >
//                                     {g}
//                                   </span>
//                                 ))}
//                               </div>
//                             </div>

//                             <div>
//                               <p className="text-sm text-gray-600 font-semibold mb-1">
//                                 Rekomendasi Penanganan:
//                               </p>
//                               <p className="text-gray-700">{h.solusi}</p>
//                             </div>
//                           </div>
//                         ))}
//                       </div>
//                     </>
//                   ) : (
//                     <p className="text-gray-600 text-center py-8">
//                       Tidak ada penyakit yang cocok dengan gejala yang dipilih.
//                     </p>
//                   )}

//                   <button
//                     onClick={resetForm}
//                     className="mt-6 w-full bg-gray-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
//                   >
//                     Diagnosa Baru
//                   </button>
//                 </div>
//               </div>
//             )}
//           </div>
//         ) : (
//           <div className="max-w-6xl mx-auto">
//             <div className="bg-white rounded-lg shadow-lg p-8">
//               <div className="flex justify-between items-center mb-6">
//                 <h2 className="text-2xl font-bold text-gray-800">
//                   Riwayat Diagnosa
//                 </h2>
//                 {riwayat.length > 0 && (
//                   <button
//                     onClick={hapusRiwayatSemua}
//                     className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
//                   >
//                     Hapus Semua
//                   </button>
//                 )}
//               </div>

//               {riwayat.length === 0 ? (
//                 <p className="text-gray-600 text-center py-8">
//                   Belum ada riwayat diagnosa.
//                 </p>
//               ) : (
//                 <div className="space-y-6">
//                   {riwayat.map((r) => (
//                     <div
//                       key={r.id}
//                       className="border-2 border-gray-200 rounded-lg p-6"
//                     >
//                       <div className="flex justify-between items-start mb-4">
//                         <div>
//                           <p className="text-sm text-gray-600">
//                             Tanggal: {r.tanggal}
//                           </p>
//                           <p className="text-sm text-gray-600 mt-1">
//                             Gejala: {r.gejala.join(", ")}
//                           </p>
//                         </div>
//                         <button
//                           onClick={() => hapusRiwayatItem(r.id)}
//                           className="text-red-600 hover:text-red-800"
//                         >
//                           Hapus
//                         </button>
//                       </div>

//                       <div className="space-y-2">
//                         {r.hasil.slice(0, 3).map((h, i) => (
//                           <div
//                             key={i}
//                             className="flex justify-between items-center bg-gray-50 p-3 rounded"
//                           >
//                             <span className="font-medium text-gray-800">
//                               {h.penyakit}
//                             </span>
//                             <span className="text-green-600 font-semibold">
//                               {h.keyakinan.toFixed(1)}%
//                             </span>
//                           </div>
//                         ))}
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </div>
//         )}
//       </main>

//       {/* Footer */}
//       <footer className="bg-green-600 text-white mt-12 py-6">
//         <div className="container mx-auto px-4 text-center">
//           <p>Sistem Pakar Penyakit Cabai © {new Date().getFullYear()}</p>
//           <p className="text-sm text-green-100 mt-2">
//             Menggunakan Algoritma Certainty Factor
//           </p>
//         </div>
//       </footer>
//     </div>
//   );
// }
