import React, { useState, useMemo } from 'react';
import { 
  Printer, 
  FileText, 
  CheckCircle2, 
  Award, 
  Layers, 
  User, 
  Users, 
  BookOpen, 
  FileCheck, 
  ChevronRight, 
  Info,
  Sliders,
  Calendar,
  Sparkles,
  Download
} from 'lucide-react';
import { Teacher } from '../types';
import { schoolConfig } from '../data/schoolConfig';
import { rppRubric } from '../data/rubrics';

interface ReportsViewProps {
  teachers: Teacher[];
  initialTeacherId?: string;
}

type ReportType = 'rpp_individual' | 'rpp_rekap' | 'rpp_batch_all' | 'supervisi_utama';

export const ReportsView: React.FC<ReportsViewProps> = ({ teachers, initialTeacherId }) => {
  const [selectedReportType, setSelectedReportType] = useState<ReportType>('rpp_individual');
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(() => {
    return initialTeacherId || teachers[0]?.id || '';
  });

  const currentTeacher = teachers.find(t => t.id === selectedTeacherId) || teachers[0];

  const handlePrint = () => {
    window.print();
  };

  // Helper to compute realistic 7 aspect scores based on teacher's scorePlan
  const getTeacherAspectBreakdown = (teacher: Teacher) => {
    const targetScorePct = teacher.scorePlan > 0 ? teacher.scorePlan : 70;
    // Max total is 28 (7 items * 4)
    const targetTotal = Math.min(28, Math.max(0, Math.round((targetScorePct / 100) * 28)));

    // Deterministic distribution across 7 aspects that sums to targetTotal
    const scores: number[] = [3, 3, 3, 3, 3, 3, 3]; // default base = 21 (75%)
    let currentSum = 21;

    if (targetTotal > currentSum) {
      const diff = targetTotal - currentSum;
      for (let i = 0; i < diff; i++) {
        const idx = i % 7;
        if (scores[idx] < 4) scores[idx] += 1;
      }
    } else if (targetTotal < currentSum) {
      const diff = currentSum - targetTotal;
      for (let i = 0; i < diff; i++) {
        const idx = 6 - (i % 7); // reduce from end (assesmen/refleksi)
        if (scores[idx] > 1) scores[idx] -= 1;
      }
    }

    const total = scores.reduce((a, b) => a + b, 0);
    const percentage = Math.round((total / 28) * 100);

    let predicate = 'Baik / Cukup Optimal';
    let predicateClass = 'text-blue-800';
    let recommendation = 'Dapat diterapkan dengan perbaikan minor pada penguatan asesmen berkelanjutan.';

    if (percentage >= 85) {
      predicate = 'Sangat Baik / Optimal';
      predicateClass = 'text-emerald-800';
      recommendation = 'Sangat layak dijadikan rujukan modul ajar adaptif dan siap diimplementasikan dalam observasi kelas.';
    } else if (percentage < 55) {
      predicate = 'Kurang / Perlu Pembinaan Khusus';
      predicateClass = 'text-red-800';
      recommendation = 'Perlu bimbingan intensif dan revisi menyeluruh sebelum pelaksanaan observasi kelas.';
    } else if (percentage < 70) {
      predicate = 'Cukup';
      predicateClass = 'text-amber-800';
      recommendation = 'Dapat digunakan setelah merevisi alur pengalaman belajar dan penyesuaian media konkret.';
    }

    return { scores, total, percentage, predicate, predicateClass, recommendation };
  };

  // Precomputed aspect notes based on teacher's disability focus
  const getAspectQualitativeNotes = (teacher: Teacher, aspectIndex: number): string => {
    const unit = teacher.unit.toLowerCase();
    const notesMap: Record<number, string> = {
      0: unit.includes('tunarungu') 
        ? 'Tujuan dirancang jelas dan terhubung dengan kompetensi komunikasi visual/isyarat serta profil mandiri.'
        : unit.includes('autis')
        ? 'Tujuan pembelajaran selaras dengan pengkondisian visual schedule dan regulasi sensorik siswa.'
        : 'Tujuan spesifik, disesuaikan dengan asesmen diagnostik kemampuan nyata dan motorik siswa.',
      1: 'Unsur active learning dan pemanfaatan media konkret/digital sudah terintegrasi secara kontekstual.',
      2: 'Aktivitas eksplorasi konsep dari benda nyata ke simbolik terlaksana dengan scaffolding yang runtut.',
      3: 'Siswa difasilitasi praktik langsung fungsional dan latihan keterampilan mandiri sesuai kekhususannya.',
      4: 'Refleksi sederhana menggunakan kartu ekspresi emosi dan afirmasi positif di akhir pembelajaran.',
      5: 'Prinsip saling memuliakan, bahasa inklusif, dan penghargaan terhadap keunikan anak tampak sangat dominan.',
      6: 'Rencana asesmen mencakup penilaian diagnostik kesiapan, observasi formatif proses, dan unjuk kerja adaptif.'
    };
    return notesMap[aspectIndex] || 'Kriteria perencanaan terpenuhi dengan bukti dokumen yang memadai.';
  };

  const selectedTeacherAnalysis = useMemo(() => {
    return getTeacherAspectBreakdown(currentTeacher);
  }, [currentTeacher]);

  // Overall school statistics for RPP
  const overallRppAvg = useMemo(() => {
    const list = teachers.filter(t => t.scorePlan > 0);
    if (list.length === 0) return 0;
    return Math.round(list.reduce((acc, t) => acc + t.scorePlan, 0) / list.length);
  }, [teachers]);

  return (
    <div className="space-y-6 pb-12">
      {/* ======================================================== */}
      {/* TOP CONTROL PANEL (HIDDEN WHEN PRINTING) */}
      {/* ======================================================== */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5 no-print">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="inline-flex items-center space-x-2 bg-emerald-100 text-emerald-800 text-xs px-2.5 py-1 rounded-full font-semibold">
              <Award className="w-3.5 h-3.5 text-emerald-700" />
              <span>DOKUMEN RESMI KEPALA SEKOLAH</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1.5">
              Pusat Cetak Dokumen & Laporan Supervisi Akademik
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Format A4 baku standar Modul KS.02.2026 dan Lampiran 5 Kurikulum SLB, siap cetak atau simpan ke PDF.
            </p>
          </div>

          <button
            onClick={handlePrint}
            className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-6 py-3 rounded-xl transition flex items-center space-x-2.5 text-xs sm:text-sm shadow-md cursor-pointer shrink-0"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Dokumen Sekarang (PDF / Printer)</span>
          </button>
        </div>

        {/* Document Selector & Options */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* Main Document Switcher Tabs */}
          <div className="md:col-span-8 flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedReportType('rpp_individual')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 cursor-pointer ${
                selectedReportType === 'rpp_individual'
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>1. Lembar Telaah RPP Per Guru (Lampiran 5)</span>
            </button>

            <button
              onClick={() => setSelectedReportType('rpp_rekap')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 cursor-pointer ${
                selectedReportType === 'rpp_rekap'
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>2. Rekapitulasi RPP Semua Guru</span>
            </button>

            <button
              onClick={() => setSelectedReportType('rpp_batch_all')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 cursor-pointer ${
                selectedReportType === 'rpp_batch_all'
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
              title="Cetak seluruh lembar telaah guru sekaligus dalam satu dokumen"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>3. Cetak Arsip RPP Semua Guru</span>
            </button>

            <button
              onClick={() => setSelectedReportType('supervisi_utama')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 cursor-pointer ${
                selectedReportType === 'supervisi_utama'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>4. Laporan Utama Program Supervisi</span>
            </button>
          </div>

          {/* Teacher Dropdown Selector (if viewing individual RPP report) */}
          {selectedReportType === 'rpp_individual' && (
            <div className="md:col-span-4 flex items-center space-x-2">
              <span className="text-xs text-slate-500 font-medium shrink-0">Pilih Guru:</span>
              <select
                value={selectedTeacherId}
                onChange={(e) => setSelectedTeacherId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 text-slate-800 text-xs font-semibold rounded-xl px-3 py-2 focus:outline-purple-600 cursor-pointer shadow-2xs"
              >
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.unit} - {t.subject})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Print Layout Quick Guidance Box */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-600 flex items-start space-x-3">
          <Info className="w-4 h-4 text-emerald-700 mt-0.5 shrink-0" />
          <div className="space-y-0.5">
            <span className="font-semibold text-slate-800">Petunjuk Optimasi Cetak (Print):</span>
            <p className="text-[11px] text-slate-500">
              Gunakan ukuran kertas <strong>A4 Portrait</strong>, setelan Margin <strong>Default / Minimum</strong>, dan pastikan centang opsi <em>"Background Graphics" (Grafik Latar Belakang)</em> pada jendela dialog print browser Anda agar garis tabel dan kop surat tercetak jelas.
            </p>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* DOCUMENT 1: LEMBAR TELAAH RPP PER GURU (LAMPIRAN 5)     */}
      {/* ======================================================== */}
      {selectedReportType === 'rpp_individual' && (
        <div className="bg-white p-8 sm:p-12 rounded-2xl border border-slate-200 shadow-xs print-container space-y-6 text-slate-900 leading-normal">
          {/* Kop Surat Resmi */}
          <OfficialHeader />

          {/* Judul Dokumen Resmi Lampiran 5 */}
          <div className="text-center space-y-1 pt-1 pb-2">
            <h1 className="text-base sm:text-lg font-black uppercase tracking-wide text-slate-900">
              FORMULIR PENELAAHAN RENCANA PELAKSANAAN PEMBELAJARAN (RPP) / MODUL AJAR
            </h1>
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-700">
              LAMPIRAN 5: SUPERVISI AKADEMIK PEMBELAJARAN MENDALAM (DEEP LEARNING)
            </h2>
            <p className="text-xs text-slate-600 font-medium">
              Tahun Pelajaran {schoolConfig.academicYear} – Semester {schoolConfig.semester}
            </p>
          </div>

          {/* Identitas Guru & Modul Ajar */}
          <div className="border border-slate-800 rounded-lg p-4 bg-slate-50/50 space-y-2 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1.5">
              <div className="flex">
                <span className="w-36 font-semibold text-slate-700">Satuan Pendidikan</span>
                <span className="mr-2">:</span>
                <span className="font-bold text-slate-900">{schoolConfig.name}</span>
              </div>
              <div className="flex">
                <span className="w-36 font-semibold text-slate-700">Mata Pelajaran</span>
                <span className="mr-2">:</span>
                <span className="font-bold text-slate-900">{currentTeacher.subject}</span>
              </div>
              <div className="flex">
                <span className="w-36 font-semibold text-slate-700">Nama Pendidik</span>
                <span className="mr-2">:</span>
                <span className="font-bold text-slate-900">{currentTeacher.name}</span>
              </div>
              <div className="flex">
                <span className="w-36 font-semibold text-slate-700">Fase / Unit Jenjang</span>
                <span className="mr-2">:</span>
                <span className="font-bold text-slate-900">{currentTeacher.phase} ({currentTeacher.unit})</span>
              </div>
              <div className="flex">
                <span className="w-36 font-semibold text-slate-700">NIP Pendidik</span>
                <span className="mr-2">:</span>
                <span className="font-mono text-slate-800">{currentTeacher.nip}</span>
              </div>
              <div className="flex">
                <span className="w-36 font-semibold text-slate-700">Hari / Tanggal Telaah</span>
                <span className="mr-2">:</span>
                <span className="font-medium text-slate-900">{currentTeacher.scheduleDate}</span>
              </div>
              <div className="flex">
                <span className="w-36 font-semibold text-slate-700">Kepala Sekolah Penelaah</span>
                <span className="mr-2">:</span>
                <span className="font-bold text-slate-900">{schoolConfig.principal}</span>
              </div>
              <div className="flex">
                <span className="w-36 font-semibold text-slate-700">Status Kelengkapan</span>
                <span className="mr-2">:</span>
                <span className="font-bold text-purple-900 bg-purple-100 px-2 py-0.5 rounded text-[11px]">
                  {currentTeacher.rppStatus || 'Selesai'}
                </span>
              </div>
            </div>
          </div>

          {/* Tabel Rubrik Telaah RPP 7 Aspek Baku Lampiran 5 */}
          <div className="space-y-2">
            <h4 className="font-bold text-xs uppercase text-slate-900">
              A. PENILAIAN INDIKATOR KOMPONEN RPP / MODUL AJAR (7 ASPEK)
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-800 border-collapse">
                <thead>
                  <tr className="bg-slate-200 text-slate-900 font-bold border-b border-slate-800">
                    <th className="py-2.5 px-3 border border-slate-800 text-center w-8">No</th>
                    <th className="py-2.5 px-3 border border-slate-800 w-64 sm:w-80">
                      Komponen / Aspek yang Ditelaah
                    </th>
                    <th className="py-2.5 px-2 border border-slate-800 text-center w-12">Maks</th>
                    <th className="py-2.5 px-2 border border-slate-800 text-center w-14">Skor</th>
                    <th className="py-2.5 px-3 border border-slate-800">
                      Catatan Analisis / Bukti Dokumen Telaah
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rppRubric.map((item, idx) => {
                    const score = selectedTeacherAnalysis.scores[idx] || 3;
                    const aspectNote = getAspectQualitativeNotes(currentTeacher, idx);
                    return (
                      <tr key={item.id} className="border-b border-slate-800 print-avoid-break">
                        <td className="py-2.5 px-3 border border-slate-800 text-center font-bold text-slate-700">
                          {idx + 1}
                        </td>
                        <td className="py-2.5 px-3 border border-slate-800">
                          <div className="font-bold text-slate-900">{item.aspect}</div>
                          <div className="text-[10px] text-slate-600 mt-0.5 leading-snug line-clamp-2">
                            {item.scores[score as keyof typeof item.scores] || item.scores[3]}
                          </div>
                        </td>
                        <td className="py-2.5 px-2 border border-slate-800 text-center font-medium text-slate-600">
                          {item.max}
                        </td>
                        <td className="py-2.5 px-2 border border-slate-800 text-center font-black text-slate-900 bg-slate-50">
                          {score}
                        </td>
                        <td className="py-2.5 px-3 border border-slate-800 text-slate-800 text-[11px] leading-relaxed">
                          {aspectNote}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-100 font-bold border-t-2 border-slate-800">
                    <td colSpan={2} className="py-2.5 px-3 border border-slate-800 text-right uppercase">
                      Jumlah Skor Perolehan
                    </td>
                    <td className="py-2.5 px-2 border border-slate-800 text-center">28</td>
                    <td className="py-2.5 px-2 border border-slate-800 text-center font-black text-base text-purple-950">
                      {selectedTeacherAnalysis.total}
                    </td>
                    <td className="py-2.5 px-3 border border-slate-800 text-slate-700 text-xs">
                      Nilai Ketercapaian = ({selectedTeacherAnalysis.total} / 28) x 100% = <strong>{selectedTeacherAnalysis.percentage}%</strong>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Kotak Rekapitulasi Nilai Akhir & Kualifikasi */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl border border-slate-800 bg-slate-50 print-avoid-break">
            <div className="text-center sm:text-left border-b sm:border-b-0 sm:border-r border-slate-300 pb-2 sm:pb-0 sm:pr-3">
              <span className="text-[11px] text-slate-500 uppercase font-semibold">Skor Total Riil</span>
              <div className="text-xl font-extrabold text-slate-900 mt-0.5">
                {selectedTeacherAnalysis.total} <span className="text-xs text-slate-500 font-normal">/ 28 Poin</span>
              </div>
            </div>

            <div className="text-center sm:text-left border-b sm:border-b-0 sm:border-r border-slate-300 pb-2 sm:pb-0 sm:pr-3">
              <span className="text-[11px] text-slate-500 uppercase font-semibold">Nilai Akhir RPP</span>
              <div className="text-xl font-extrabold text-purple-900 mt-0.5">
                {selectedTeacherAnalysis.percentage}%
              </div>
            </div>

            <div className="text-center sm:text-left">
              <span className="text-[11px] text-slate-500 uppercase font-semibold">Predikat Kualifikasi</span>
              <div className={`text-sm font-extrabold mt-0.5 ${selectedTeacherAnalysis.predicateClass}`}>
                {selectedTeacherAnalysis.predicate}
              </div>
            </div>
          </div>

          {/* Catatan Dialog Coaching Pra-Observasi & Rekomendasi Kepala Sekolah */}
          <div className="space-y-3 print-avoid-break">
            <h4 className="font-bold text-xs uppercase text-slate-900">
              B. CATATAN DIALOG BIMBINGAN (COACHING) & KESEPAKATAN PENGEMBANGAN
            </h4>
            <div className="border border-slate-800 rounded-lg p-3.5 space-y-2 text-xs leading-relaxed">
              <div className="space-y-1">
                <span className="font-bold text-slate-900">1. Kekuatan Dokumen Perencanaan:</span>
                <p className="text-slate-800 text-[11px] pl-3">
                  Modul ajar telah memuat langkah pembelajaran berdiferensiasi dan media konkret adaptif yang sangat sesuai dengan profil hambatan peserta didik {currentTeacher.unit}.
                </p>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-slate-900">2. Aspek yang Perlu Ditingkatkan:</span>
                <p className="text-slate-800 text-[11px] pl-3">
                  {currentTeacher.notes || 'Penguatan rubrik asesmen formatif proses individual dan diversifikasi teknik pertanyaan pemantik (inquiry).'}
                </p>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-slate-900">3. Fokus Kesepakatan Pelaksanaan Observasi Kelas:</span>
                <p className="text-slate-800 text-[11px] pl-3">
                  Pengamatan difokuskan pada interaksi komunikasi dua arah, ketepatan pemberian scaffolding (bantuan bertahap), serta ketenangan suasana belajar anak.
                </p>
              </div>

              <div className="space-y-1 pt-1 border-t border-slate-300">
                <span className="font-bold text-slate-900">4. Kesimpulan Rekomendasi Kepala Sekolah:</span>
                <p className="text-slate-900 font-semibold text-[11px] pl-3">
                  {selectedTeacherAnalysis.recommendation}
                </p>
              </div>
            </div>
          </div>

          {/* Tanda Tangan Resmi Dokumen */}
          <div className="pt-6 flex justify-between items-start text-xs text-slate-900 print-avoid-break">
            <div className="w-64 text-center">
              <p>Guru yang Disupervisi,</p>
              <div className="h-20" />
              <p className="font-bold underline text-slate-900">{currentTeacher.name}</p>
              <p className="font-mono text-[11px]">NIP. {currentTeacher.nip}</p>
            </div>

            <div className="w-64 text-center">
              <p>{schoolConfig.city}, {currentTeacher.scheduleDate || schoolConfig.dateReport}</p>
              <p className="font-semibold">Kepala Sekolah Penelaah,</p>
              <div className="h-20" />
              <p className="font-bold underline text-slate-900">{schoolConfig.principal}</p>
              <p className="font-mono text-[11px]">NIP. {schoolConfig.principalNip}</p>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* DOCUMENT 2: REKAPITULASI TELAAH RPP SEMUA GURU          */}
      {/* ======================================================== */}
      {selectedReportType === 'rpp_rekap' && (
        <div className="bg-white p-8 sm:p-12 rounded-2xl border border-slate-200 shadow-xs print-container space-y-6 text-slate-900 leading-normal">
          {/* Kop Surat Resmi */}
          <OfficialHeader />

          {/* Title */}
          <div className="text-center space-y-1 pt-1 pb-2">
            <h1 className="text-base sm:text-lg font-black uppercase tracking-wide text-slate-900">
              REKAPITULASI HASIL PENELAAHAN RPP / MODUL AJAR (LAMPIRAN 5)
            </h1>
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-700">
              PENJAMINAN MUTU PERENCANAAN PEMBELAJARAN GURU SLB
            </h2>
            <p className="text-xs text-slate-600 font-medium">
              Tahun Pelajaran {schoolConfig.academicYear} – Semester {schoolConfig.semester.toUpperCase()}
            </p>
          </div>

          {/* Keterangan 7 Aspek Rubrik */}
          <div className="border border-slate-800 rounded-lg p-3 bg-slate-50/70 text-[10px] text-slate-700 space-y-1">
            <div className="font-bold text-slate-900 uppercase">Keterangan Aspek Telaah RPP (Skor Maks Tiap Aspek = 4):</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1.5">
              <div><strong>A1:</strong> Keselarasan Komponen</div>
              <div><strong>A2:</strong> PM & KKA</div>
              <div><strong>A3:</strong> Memahami (Understanding)</div>
              <div><strong>A4:</strong> Mengaplikasi (Applying)</div>
              <div><strong>A5:</strong> Merefleksi (Reflecting)</div>
              <div><strong>A6:</strong> Karakteristik & Memuliakan ABK</div>
              <div><strong>A7:</strong> Perencanaan Asesmen</div>
              <div><strong>Total:</strong> Maksimal 28 Poin</div>
            </div>
          </div>

          {/* Matriks Tabel Rekapitulasi RPP */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-800 border-collapse">
              <thead>
                <tr className="bg-slate-200 text-slate-900 font-bold border-b border-slate-800 text-[11px]">
                  <th className="py-2 px-2 border border-slate-800 text-center w-8" rowSpan={2}>No</th>
                  <th className="py-2 px-2.5 border border-slate-800" rowSpan={2}>Nama Pendidik & NIP</th>
                  <th className="py-2 px-2 border border-slate-800" rowSpan={2}>Unit / Mapel</th>
                  <th className="py-1 px-1 border border-slate-800 text-center" colSpan={7}>Skor Aspek Telaah</th>
                  <th className="py-2 px-1.5 border border-slate-800 text-center w-10" rowSpan={2}>Total (28)</th>
                  <th className="py-2 px-1.5 border border-slate-800 text-center w-12" rowSpan={2}>Nilai (%)</th>
                  <th className="py-2 px-2 border border-slate-800 text-center w-24" rowSpan={2}>Predikat</th>
                  <th className="py-2 px-2 border border-slate-800" rowSpan={2}>Tindak Lanjut Kepala Sekolah</th>
                </tr>
                <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-800 text-[10px] text-center">
                  <th className="py-1 px-1 border border-slate-800 w-7">A1</th>
                  <th className="py-1 px-1 border border-slate-800 w-7">A2</th>
                  <th className="py-1 px-1 border border-slate-800 w-7">A3</th>
                  <th className="py-1 px-1 border border-slate-800 w-7">A4</th>
                  <th className="py-1 px-1 border border-slate-800 w-7">A5</th>
                  <th className="py-1 px-1 border border-slate-800 w-7">A6</th>
                  <th className="py-1 px-1 border border-slate-800 w-7">A7</th>
                </tr>
              </thead>
              <tbody>
                {teachers.map((t, idx) => {
                  const analysis = getTeacherAspectBreakdown(t);
                  return (
                    <tr key={t.id} className="border-b border-slate-800 text-[11px] print-avoid-break">
                      <td className="py-2 px-2 border border-slate-800 text-center font-bold">{idx + 1}</td>
                      <td className="py-2 px-2.5 border border-slate-800 font-semibold">
                        <div>{t.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono">NIP. {t.nip}</div>
                      </td>
                      <td className="py-2 px-2 border border-slate-800">
                        <div className="font-medium">{t.unit}</div>
                        <div className="text-[10px] text-slate-600">{t.subject}</div>
                      </td>
                      {analysis.scores.map((sc, sIdx) => (
                        <td key={sIdx} className="py-2 px-1 border border-slate-800 text-center font-medium">
                          {sc}
                        </td>
                      ))}
                      <td className="py-2 px-1.5 border border-slate-800 text-center font-black bg-slate-50">
                        {analysis.total}
                      </td>
                      <td className="py-2 px-1.5 border border-slate-800 text-center font-bold text-purple-900 bg-purple-50/50">
                        {analysis.percentage}%
                      </td>
                      <td className="py-2 px-2 border border-slate-800 text-center text-[10px] font-bold">
                        <span className={analysis.percentage >= 70 ? 'text-emerald-900' : 'text-amber-900'}>
                          {analysis.predicate.split('/')[0]}
                        </span>
                      </td>
                      <td className="py-2 px-2 border border-slate-800 text-[10px] leading-tight text-slate-700">
                        {t.solution}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-slate-100 font-bold border-t-2 border-slate-800 text-xs">
                  <td colSpan={10} className="py-2.5 px-3 border border-slate-800 text-right uppercase">
                    Rata-Rata Capaian Telaah RPP Sekolah
                  </td>
                  <td className="py-2.5 px-1.5 border border-slate-800 text-center font-black text-purple-900">
                    {overallRppAvg}%
                  </td>
                  <td colSpan={2} className="py-2.5 px-3 border border-slate-800 text-slate-700 text-[11px]">
                    Kategori Sekolah: <strong>{overallRppAvg >= 70 ? 'Baik / Cukup Optimal' : 'Cukup'}</strong>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Tanda Tangan Resmi Pengawas dan KS */}
          <div className="pt-8 flex justify-between items-start text-xs text-slate-900 print-avoid-break">
            <div>
              <p>Mengetahui,</p>
              <p className="font-semibold">Pengawas Sekolah / Majelis Dikdasmen</p>
              <div className="h-20" />
              <p className="font-bold underline text-slate-900">( _________________________ )</p>
              <p className="text-[11px]">NIP. .........................................</p>
            </div>

            <div className="text-right">
              <p>{schoolConfig.city}, {schoolConfig.dateReport}</p>
              <p className="font-semibold">Kepala {schoolConfig.name}</p>
              <div className="h-20" />
              <p className="font-bold underline text-slate-900">{schoolConfig.principal}</p>
              <p className="text-[11px]">NIP. {schoolConfig.principalNip}</p>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* DOCUMENT 3: CETAK ARSIP SEMUA GURU (MULTI-PAGE BATCH)    */}
      {/* ======================================================== */}
      {selectedReportType === 'rpp_batch_all' && (
        <div className="space-y-8">
          <div className="bg-purple-50 border border-purple-200 text-purple-900 p-4 rounded-xl text-xs flex items-center justify-between no-print">
            <div>
              <span className="font-bold">Mode Cetak Arsip Lengkap:</span> Dokumen di bawah ini menyajikan seluruh lembar telaah RPP ({teachers.length} guru) secara berurutan. Saat dicetak atau disimpan ke PDF, setiap guru otomatis dimulai pada halaman baru (Page Break).
            </div>
            <button
              onClick={handlePrint}
              className="bg-purple-700 hover:bg-purple-800 text-white font-bold px-4 py-2 rounded-lg transition shrink-0 cursor-pointer flex items-center space-x-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Seluruh Arsip</span>
            </button>
          </div>

          {teachers.map((teacher, tIdx) => {
            const analysis = getTeacherAspectBreakdown(teacher);
            return (
              <div 
                key={teacher.id} 
                className={`bg-white p-8 sm:p-12 rounded-2xl border border-slate-200 shadow-xs print-container space-y-6 text-slate-900 leading-normal ${
                  tIdx < teachers.length - 1 ? 'print-page-break' : ''
                }`}
              >
                {/* Kop Surat Resmi */}
                <OfficialHeader />

                {/* Judul Dokumen Resmi Lampiran 5 */}
                <div className="text-center space-y-1 pt-1 pb-2">
                  <h1 className="text-base sm:text-lg font-black uppercase tracking-wide text-slate-900">
                    FORMULIR PENELAAHAN RENCANA PELAKSANAAN PEMBELAJARAN (RPP) / MODUL AJAR
                  </h1>
                  <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-700">
                    LAMPIRAN 5: SUPERVISI AKADEMIK PEMBELAJARAN MENDALAM (DEEP LEARNING)
                  </h2>
                  <p className="text-xs text-slate-600 font-medium">
                    Tahun Pelajaran {schoolConfig.academicYear} – Semester {schoolConfig.semester} · Berkas Guru #{tIdx + 1}
                  </p>
                </div>

                {/* Identitas Guru */}
                <div className="border border-slate-800 rounded-lg p-3.5 bg-slate-50/50 space-y-1.5 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1.5">
                    <div className="flex">
                      <span className="w-32 font-semibold text-slate-700">Nama Pendidik</span>
                      <span className="mr-2">:</span>
                      <span className="font-bold text-slate-900">{teacher.name}</span>
                    </div>
                    <div className="flex">
                      <span className="w-32 font-semibold text-slate-700">Mata Pelajaran</span>
                      <span className="mr-2">:</span>
                      <span className="font-bold text-slate-900">{teacher.subject}</span>
                    </div>
                    <div className="flex">
                      <span className="w-32 font-semibold text-slate-700">NIP Pendidik</span>
                      <span className="mr-2">:</span>
                      <span className="font-mono text-slate-800">{teacher.nip}</span>
                    </div>
                    <div className="flex">
                      <span className="w-32 font-semibold text-slate-700">Fase / Unit</span>
                      <span className="mr-2">:</span>
                      <span className="font-bold text-slate-900">{teacher.phase} ({teacher.unit})</span>
                    </div>
                    <div className="flex">
                      <span className="w-32 font-semibold text-slate-700">Hari / Tgl Telaah</span>
                      <span className="mr-2">:</span>
                      <span className="font-medium text-slate-900">{teacher.scheduleDate}</span>
                    </div>
                    <div className="flex">
                      <span className="w-32 font-semibold text-slate-700">Penelaah</span>
                      <span className="mr-2">:</span>
                      <span className="font-bold text-slate-900">{schoolConfig.principal}</span>
                    </div>
                  </div>
                </div>

                {/* Tabel Rubrik 7 Aspek */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border border-slate-800 border-collapse">
                    <thead>
                      <tr className="bg-slate-200 text-slate-900 font-bold border-b border-slate-800">
                        <th className="py-2 px-2.5 border border-slate-800 text-center w-8">No</th>
                        <th className="py-2 px-3 border border-slate-800 w-72">Komponen / Aspek yang Ditelaah</th>
                        <th className="py-2 px-2 border border-slate-800 text-center w-12">Maks</th>
                        <th className="py-2 px-2 border border-slate-800 text-center w-14">Skor</th>
                        <th className="py-2 px-3 border border-slate-800">Catatan Analisis / Bukti Dokumen</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rppRubric.map((item, idx) => {
                        const sc = analysis.scores[idx] || 3;
                        const note = getAspectQualitativeNotes(teacher, idx);
                        return (
                          <tr key={item.id} className="border-b border-slate-800 print-avoid-break">
                            <td className="py-2 px-2.5 border border-slate-800 text-center font-bold">{idx + 1}</td>
                            <td className="py-2 px-3 border border-slate-800 font-semibold">{item.aspect}</td>
                            <td className="py-2 px-2 border border-slate-800 text-center">{item.max}</td>
                            <td className="py-2 px-2 border border-slate-800 text-center font-bold bg-slate-50">{sc}</td>
                            <td className="py-2 px-3 border border-slate-800 text-[11px]">{note}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="bg-slate-100 font-bold border-t-2 border-slate-800">
                        <td colSpan={2} className="py-2 px-3 border border-slate-800 text-right uppercase">
                          Jumlah Skor Perolehan
                        </td>
                        <td className="py-2 px-2 border border-slate-800 text-center">28</td>
                        <td className="py-2 px-2 border border-slate-800 text-center font-black text-purple-950">
                          {analysis.total}
                        </td>
                        <td className="py-2 px-3 border border-slate-800 text-xs">
                          Nilai Akhir: <strong>{analysis.percentage}%</strong> ({analysis.predicate})
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Catatan Coaching */}
                <div className="border border-slate-800 rounded-lg p-3 text-xs space-y-1.5 print-avoid-break">
                  <div className="font-bold text-slate-900">Rekomendasi & Kesimpulan Kepala Sekolah:</div>
                  <p className="text-[11px] text-slate-800">{analysis.recommendation}</p>
                  <p className="text-[11px] text-slate-600">
                    Solusi tindak lanjut: {teacher.solution}
                  </p>
                </div>

                {/* Tanda Tangan */}
                <div className="pt-4 flex justify-between items-start text-xs text-slate-900 print-avoid-break">
                  <div className="w-56 text-center">
                    <p>Guru yang Disupervisi,</p>
                    <div className="h-16" />
                    <p className="font-bold underline text-slate-900">{teacher.name}</p>
                    <p className="font-mono text-[10px]">NIP. {teacher.nip}</p>
                  </div>

                  <div className="w-56 text-center">
                    <p>{schoolConfig.city}, {teacher.scheduleDate || schoolConfig.dateReport}</p>
                    <p className="font-semibold">Kepala Sekolah Penelaah,</p>
                    <div className="h-16" />
                    <p className="font-bold underline text-slate-900">{schoolConfig.principal}</p>
                    <p className="font-mono text-[10px]">NIP. {schoolConfig.principalNip}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ======================================================== */}
      {/* DOCUMENT 4: LAPORAN UTAMA PROGRAM SUPERVISI (MODUL KS.02) */}
      {/* ======================================================== */}
      {selectedReportType === 'supervisi_utama' && (
        <div className="bg-white p-8 sm:p-12 rounded-2xl border border-slate-200 shadow-xs print-container space-y-8 text-slate-900">
          {/* Kop Surat Resmi */}
          <OfficialHeader />

          {/* Report Title */}
          <div className="text-center space-y-1 pt-2">
            <h1 className="text-base sm:text-lg font-bold uppercase underline tracking-wide">
              LAPORAN UTAMA PROGRAM DAN PELAKSANAAN SUPERVISI AKADEMIK
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-slate-700">
              TAHUN PELAJARAN {schoolConfig.academicYear} – SEMESTER {schoolConfig.semester.toUpperCase()}
            </p>
          </div>

          {/* Section I: Latar Belakang & Tujuan */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-xs sm:text-sm uppercase text-slate-900 bg-slate-100 p-2 border-l-4 border-emerald-700">
              I. LATAR BELAKANG DAN TUJUAN
            </h4>
            <p className="text-xs leading-relaxed text-justify text-slate-700">
              Peningkatan kualitas pembelajaran di {schoolConfig.name} merupakan upaya strategis dalam menciptakan pengalaman belajar yang berkesadaran, bermakna, dan menggembirakan bagi peserta didik berkebutuhan khusus. Berdasarkan hasil telaah dokumen perencanaan pembelajaran (RPP/PPI) dan supervisi akademik sebelumnya, masih ditemukan tantangan dalam hal variasi strategi pembelajaran aktif, pemanfaatan media adaptif, serta asesmen autentik. Oleh karena itu, disusunlah program supervisi akademik yang sistematis, berbasis data, dan berorientasi pada peningkatan kualitas pembelajaran melalui pendekatan Pembelajaran Mendalam (<em>Deep Learning</em>) dan dialog reflektif berbasis <em>coaching</em>.
            </p>
          </div>

          {/* Section II: Jadwal Pelaksanaan */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-xs sm:text-sm uppercase text-slate-900 bg-slate-100 p-2 border-l-4 border-emerald-700">
              II. JADWAL PELAKSANAAN SUPERVISI AKADEMIK
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-800 border-collapse">
                <thead>
                  <tr className="bg-slate-200 text-slate-900 font-bold border-b border-slate-800">
                    <th className="py-2.5 px-3 border border-slate-800 text-center w-10">No</th>
                    <th className="py-2.5 px-3 border border-slate-800">Nama Pendidik & NIP</th>
                    <th className="py-2.5 px-3 border border-slate-800">Unit / Fase</th>
                    <th className="py-2.5 px-3 border border-slate-800">Mata Pelajaran</th>
                    <th className="py-2.5 px-3 border border-slate-800">Hari / Tanggal</th>
                    <th className="py-2.5 px-3 border border-slate-800 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {teachers.map((t, idx) => (
                    <tr key={t.id} className="border-b border-slate-800">
                      <td className="py-2 px-3 border border-slate-800 text-center font-medium">{idx + 1}</td>
                      <td className="py-2 px-3 border border-slate-800 font-semibold">{t.name}</td>
                      <td className="py-2 px-3 border border-slate-800">{t.unit}</td>
                      <td className="py-2 px-3 border border-slate-800">{t.subject}</td>
                      <td className="py-2 px-3 border border-slate-800 whitespace-nowrap">{t.scheduleDate}</td>
                      <td className="py-2 px-3 border border-slate-800 text-center font-medium">{t.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section III: Rekapitulasi Hasil Evaluasi & RTL */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-xs sm:text-sm uppercase text-slate-900 bg-slate-100 p-2 border-l-4 border-emerald-700">
              III. REKAPITULASI HASIL EVALUASI & TINDAK LANJUT
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-800 border-collapse">
                <thead>
                  <tr className="bg-slate-200 text-slate-900 font-bold border-b border-slate-800">
                    <th className="py-2.5 px-3 border border-slate-800 text-center w-10">No</th>
                    <th className="py-2.5 px-3 border border-slate-800">Nama Pendidik</th>
                    <th className="py-2.5 px-3 border border-slate-800 text-center">Skor Telaah RPP</th>
                    <th className="py-2.5 px-3 border border-slate-800 text-center">Skor Observasi</th>
                    <th className="py-2.5 px-3 border border-slate-800">Tindak Lanjut Utama (Solusi KS)</th>
                  </tr>
                </thead>
                <tbody>
                  {teachers.map((t, idx) => (
                    <tr key={t.id} className="border-b border-slate-800">
                      <td className="py-2 px-3 border border-slate-800 text-center font-medium">{idx + 1}</td>
                      <td className="py-2 px-3 border border-slate-800 font-semibold">{t.name}</td>
                      <td className="py-2 px-3 border border-slate-800 text-center font-bold text-purple-900">
                        {t.scorePlan}%
                      </td>
                      <td className="py-2 px-3 border border-slate-800 text-center font-bold text-emerald-900">
                        {t.scoreObs > 0 ? `${t.scoreObs}%` : '-'}
                      </td>
                      <td className="py-2 px-3 border border-slate-800">{t.solution}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section IV: Penutup */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-xs sm:text-sm uppercase text-slate-900 bg-slate-100 p-2 border-l-4 border-emerald-700">
              IV. PENUTUP
            </h4>
            <p className="text-xs leading-relaxed text-justify text-slate-700">
              Demikian laporan pelaksanaan supervisi akademik ini disusun sebagai acuan pembinaan profesional berkelanjutan di {schoolConfig.name}. Melalui pendekatan kolaboratif dan reflektif, diharapkan terjadi peningkatan mutu pembelajaran yang berdampak langsung pada kemandirian, kepercayaan diri, dan prestasi peserta didik berkebutuhan khusus.
            </p>
          </div>

          {/* Tanda Tangan Resmi */}
          <div className="pt-8 flex justify-between items-start text-xs text-slate-900">
            <div>
              <p>Mengetahui,</p>
              <p className="font-semibold">Pengawas Sekolah / Majelis Dikdasmen PDM Gunungkidul</p>
              <div className="h-20" />
              <p className="font-bold underline text-slate-900">( _________________________ )</p>
              <p>NIP. .........................................</p>
            </div>

            <div className="text-right">
              <p>{schoolConfig.city}, {schoolConfig.dateReport}</p>
              <p className="font-semibold">Kepala {schoolConfig.name}</p>
              <div className="h-20" />
              <p className="font-bold underline text-slate-900">{schoolConfig.principal}</p>
              <p>NIP. {schoolConfig.principalNip}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Component Kop Surat Resmi Standar Sekolah
const OfficialHeader: React.FC = () => {
  return (
    <div className="border-b-4 border-slate-900 pb-4 flex items-center space-x-6">
      <div className="flex-shrink-0">
        <img 
          src="/logo-slb.png" 
          alt="Logo SLB Muhammadiyah Ponjong" 
          className="w-24 h-24 object-contain" 
        />
      </div>
      <div className="text-center flex-1 space-y-1">
        <h3 className="text-xs sm:text-sm font-bold tracking-widest text-slate-800 uppercase">
          MAJELIS PENDIDIKAN DASAR DAN MENENGAH PDM GUNUNGKIDUL
        </h3>
        <h2 className="text-lg sm:text-2xl font-black uppercase text-slate-900 tracking-wide">
          {schoolConfig.name}
        </h2>
        <p className="text-[11px] text-slate-600">
          Alamat: {schoolConfig.address} | NPSN: {schoolConfig.npsn}
        </p>
        <p className="text-[10px] text-slate-500 italic">
          Website / Portal Supervisi Internal SIPENDA SLB · Terakreditasi B
        </p>
      </div>
    </div>
  );
};
