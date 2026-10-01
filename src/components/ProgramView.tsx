import React, { useState } from 'react';
import { 
  FileText, 
  BookOpen, 
  Target, 
  Sparkles, 
  HelpCircle,
  Table as TableIcon
} from 'lucide-react';
import { Teacher } from '../types';
import { schoolConfig } from '../data/schoolConfig';

interface ProgramViewProps {
  teachers: Teacher[];
}

export const ProgramView: React.FC<ProgramViewProps> = ({ teachers }) => {
  const [subTab, setSubTab] = useState<'latar' | 'matriks'>('latar');

  return (
    <div className="space-y-6 pb-12">
      {/* Header bar */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-1 rounded-full font-semibold">
            BAB 3 · MODUL KS.02.2026
          </span>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            Program Perencanaan Supervisi Akademik
          </h2>
          <p className="text-xs text-slate-500">
            Penyusunan rencana berbasis identifikasi masalah, akar masalah, dan solusi bantuan bagi guru SLB.
          </p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setSubTab('latar')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
              subTab === 'latar'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Konsep & Dasar Perencanaan
          </button>
          <button
            onClick={() => setSubTab('matriks')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
              subTab === 'matriks'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Matriks Perencanaan Guru (Tabel 3.1)
          </button>
        </div>
      </div>

      {/* Subtab 1: Latar Belakang & Konsep */}
      {subTab === 'latar' ? (
        <div className="space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-800 flex items-center space-x-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                <span>PROGRAM PERENCANAAN SUPERVISI AKADEMIK · {schoolConfig.name.toUpperCase()}</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Tahun Pelajaran {schoolConfig.academicYear} – Semester {schoolConfig.semester} | Kepala Sekolah: {schoolConfig.principal}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Box A: Latar Belakang */}
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200/80 space-y-3">
                <h4 className="font-bold text-slate-800 flex items-center space-x-2 text-sm">
                  <BookOpen className="w-4 h-4 text-emerald-600" />
                  <span>A. Latar Belakang & Urgensi</span>
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed text-justify">
                  Peningkatan mutu pembelajaran di {schoolConfig.name} menuntut pendekatan supervisi akademik yang adaptif terhadap ragam hambatan peserta didik (tunarungu, tunagrahita, autis, tunadaksa). Berdasarkan telaah modul ajar/PPI dan monitoring sebelumnya, ditemukan kesenjangan antara praktik pembelajaran konvensional dengan prinsip <strong>Pembelajaran Mendalam</strong> (Memahami, Mengaplikasi, Merefleksi) serta integrasi media/alat bantu adaptif yang berpusat pada kemandirian anak.
                </p>
              </div>

              {/* Box B: Tujuan */}
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200/80 space-y-3">
                <h4 className="font-bold text-slate-800 flex items-center space-x-2 text-sm">
                  <Target className="w-4 h-4 text-emerald-600" />
                  <span>B. Tujuan Supervisi Akademik</span>
                </h4>
                <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
                  <li>Mengidentifikasi kesenjangan pembelajaran berdasarkan data RPP/PPI dan supervisi sebelumnya.</li>
                  <li>Menganalisis akar masalah pembelajaran secara objektif melalui dialog terbuka.</li>
                  <li>Menentukan solusi pembinaan yang spesifik (coaching, mentoring, pelatihan alat adaptif).</li>
                  <li>Menyiapkan instrumen telaah dan observasi kelas yang ramah disabilitas.</li>
                </ul>
              </div>
            </div>

            {/* Box C: Ruang Lingkup & Fokus */}
            <div className="bg-emerald-50/70 p-5 rounded-xl border border-emerald-200 space-y-3">
              <h4 className="font-bold text-emerald-950 text-sm flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-emerald-700" />
                <span>C. Ruang Lingkup & Fokus Pembelajaran Mendalam SLB</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-emerald-950">
                <div className="bg-white p-3.5 rounded-lg border border-emerald-200/70 shadow-2xs">
                  <strong className="block text-emerald-900 font-bold mb-1">1. Praktik Pedagogis Adaptif</strong>
                  <span className="text-slate-600 text-xs">
                    Penggunaan metode multisensori, visual schedule, dan pembelajaran berdiferensiasi sesuai tingkat hambatan siswa.
                  </span>
                </div>
                <div className="bg-white p-3.5 rounded-lg border border-emerald-200/70 shadow-2xs">
                  <strong className="block text-emerald-900 font-bold mb-1">2. Budaya 'Saling Memuliakan'</strong>
                  <span className="text-slate-600 text-xs">
                    Membangun iklim kelas yang inklusif, menghargai keunikan individu, serta komunikasi verbal dan isyarat yang suportif.
                  </span>
                </div>
                <div className="bg-white p-3.5 rounded-lg border border-emerald-200/70 shadow-2xs">
                  <strong className="block text-emerald-900 font-bold mb-1">3. Asesmen Autentik Vokasi</strong>
                  <span className="text-slate-600 text-xs">
                    Penilaian kemandirian dan keterampilan hidup (life skills) melalui unjuk kerja langsung dan portofolio nyata.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Subtab 2: Matriks Perencanaan Tabel 3.1 */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">
                Matriks Perencanaan Supervisi Akademik Guru (Tabel 3.1)
              </h3>
              <p className="text-xs text-slate-500">
                Berdasarkan hasil identifikasi masalah, akar masalah, dan penentuan solusi bantuan (Tabel 3.1 Modul KS)
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 uppercase font-semibold border-b border-slate-200 text-[11px]">
                  <th className="py-3 px-4">No</th>
                  <th className="py-3 px-4">Nama Guru & Unit</th>
                  <th className="py-3 px-4">Hasil Identifikasi Masalah</th>
                  <th className="py-3 px-4">Akar Masalah</th>
                  <th className="py-3 px-4">Solusi / Cara Bantuan (KS)</th>
                  <th className="py-3 px-4 whitespace-nowrap">Jadwal Supervisi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-700">
                {teachers.map((t, idx) => (
                  <tr key={t.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-medium text-slate-500">{idx + 1}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{t.name}</div>
                      <div className="text-slate-500 font-medium">{t.unit} · {t.phase}</div>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs text-slate-700 leading-relaxed">
                      {t.problemId}
                    </td>
                    <td className="py-3.5 px-4 max-w-xs font-medium text-amber-800 leading-relaxed">
                      {t.rootCause}
                    </td>
                    <td className="py-3.5 px-4 max-w-xs text-emerald-800 font-medium leading-relaxed">
                      {t.solution}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-600 font-medium">
                      {t.scheduleDate}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
