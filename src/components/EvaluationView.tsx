import React, { useState } from 'react';
import { 
  LineChart, 
  Table as TableIcon, 
  Award, 
  HelpCircle, 
  CheckCircle2, 
  Clock, 
  TrendingUp,
  FileSpreadsheet
} from 'lucide-react';
import { Teacher } from '../types';
import { schoolConfig } from '../data/schoolConfig';

interface EvaluationViewProps {
  teachers: Teacher[];
}

export const EvaluationView: React.FC<EvaluationViewProps> = ({ teachers }) => {
  const [subTab, setSubTab] = useState<'evaluasi' | 'rtl'>('evaluasi');

  return (
    <div className="space-y-6 pb-12">
      {/* Title Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-1 rounded-full font-semibold">
            BAB 5 · EVALUASI & REFLEKSI
          </span>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            Evaluasi, Refleksi Mandiri KS, dan Tindak Lanjut (RTL)
          </h2>
          <p className="text-xs text-slate-500">
            Menerjemahkan data observasi menjadi tindakan pembinaan nyata yang terukur bagi pendidik SLB.
          </p>
        </div>

        {/* Subtabs Selector */}
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setSubTab('evaluasi')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
              subTab === 'evaluasi'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Analisis Kuantitatif & Kualitatif
          </button>
          <button
            onClick={() => setSubTab('rtl')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
              subTab === 'rtl'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Rencana Tindak Lanjut (RTL)
          </button>
        </div>
      </div>

      {subTab === 'evaluasi' ? (
        <div className="space-y-6">
          {/* Table Rekapitulasi */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs space-y-6 p-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="font-bold text-slate-900 text-sm">
                Rekapitulasi Hasil Evaluasi Supervisi Akademik Guru
              </h3>
              <p className="text-xs text-slate-500">
                {schoolConfig.name} · Semester {schoolConfig.semester} {schoolConfig.academicYear}
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 uppercase font-semibold border-b border-slate-200 text-[11px]">
                    <th className="py-3 px-4">No</th>
                    <th className="py-3 px-4">Nama Pendidik & Unit</th>
                    <th className="py-3 px-4 text-center">Skor Telaah RPP</th>
                    <th className="py-3 px-4 text-center">Skor Observasi</th>
                    <th className="py-3 px-4">Refleksi Akar Masalah</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-700">
                  {teachers.map((t, idx) => (
                    <tr key={t.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4 font-medium text-slate-500">{idx + 1}</td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{t.name}</div>
                        <div className="text-slate-500 font-medium">{t.unit}</div>
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-purple-800">
                        <span className="bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-lg text-xs">
                          {t.scorePlan}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-emerald-800">
                        {t.scoreObs > 0 ? (
                          <span className="bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg text-xs">
                            {t.scoreObs}%
                          </span>
                        ) : (
                          <span className="text-slate-400 font-normal">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-600 max-w-xs leading-relaxed">
                        {t.rootCause}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                          t.status === 'Selesai' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Official Principal Interpretation Card */}
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-2">
              <h4 className="font-bold text-slate-800 text-sm flex items-center space-x-2">
                <Award className="w-4 h-4 text-emerald-600" />
                <span>Interpretasi Kepala Sekolah (Analisis Komprehensif):</span>
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed text-justify">
                Secara umum, perencanaan dan pelaksanaan pembelajaran di <strong>{schoolConfig.name}</strong> sudah berjalan pada kategori <strong>Baik (Rata-rata 73%)</strong>. Guru-guru menunjukkan dedikasi dan kesabaran tinggi dalam mendampingi anak berkebutuhan khusus. Namun, penguatan masih diperlukan pada optimalisasi media pembelajaran adaptif berbasis TIK/multisensori, peningkatan aktivitas berpikir kritis fungsional (HOTS sederhana), serta pembiasaan refleksi mandiri di akhir pembelajaran bagi siswa disabilitas sesuai fase kemampuannya.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Subtab 2: Matriks Rencana Tindak Lanjut (RTL) */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
            <h3 className="font-bold text-slate-900 text-sm">
              Matriks Rencana Tindak Lanjut (RTL) & Pembinaan Berkelanjutan
            </h3>
            <p className="text-xs text-slate-500">
              Tindak lanjut spesifik, terukur, dan berjadwal untuk peningkatan mutu pembelajaran SLB.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 uppercase font-semibold border-b border-slate-200 text-[11px]">
                  <th className="py-3 px-4">No</th>
                  <th className="py-3 px-4">Nama Pendidik</th>
                  <th className="py-3 px-4">Temuan / Area Perbaikan</th>
                  <th className="py-3 px-4">Tindak Lanjut (Solusi Spesifik)</th>
                  <th className="py-3 px-4">Peran Kepala Sekolah</th>
                  <th className="py-3 px-4 whitespace-nowrap">Waktu Monitor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-700">
                {teachers.map((t, idx) => (
                  <tr key={t.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4 font-medium text-slate-500">{idx + 1}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{t.name}</td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-xs leading-relaxed">
                      {t.problemId}
                    </td>
                    <td className="py-3.5 px-4 text-emerald-800 font-semibold max-w-xs leading-relaxed">
                      {t.solution}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">
                      Coaching & Modeling Klinis
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap font-medium text-slate-600">
                      2 Minggu ke depan
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
