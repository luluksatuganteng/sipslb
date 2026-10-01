import React, { useState, useEffect } from 'react';
import { 
  FileCheck, 
  HelpCircle, 
  Check, 
  Save, 
  UserCheck, 
  Info, 
  Sparkles, 
  X,
  MessageSquare,
  Award,
  Upload,
  FileText,
  FileCode,
  Link as LinkIcon,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { Teacher, CoachingData, UserRole } from '../types';
import { rppRubric } from '../data/rubrics';

interface PraObservasiViewProps {
  teachers: Teacher[];
  setTeachers: React.Dispatch<React.SetStateAction<Teacher[]>>;
  currentRole: UserRole;
  currentTeacherId?: string;
  onOpenAIModal?: () => void;
  initialSelectedTeacherId?: string;
}

export const PraObservasiView: React.FC<PraObservasiViewProps> = ({ 
  teachers, 
  setTeachers,
  currentRole,
  currentTeacherId,
  onOpenAIModal,
  initialSelectedTeacherId
}) => {
  // If guru, select logged-in teacher; otherwise allow switching
  const [selectedId, setSelectedId] = useState<string>(() => {
    if (currentRole === 'guru' && currentTeacherId) {
      return currentTeacherId;
    }
    return initialSelectedTeacherId || teachers[0]?.id || '';
  });

  // Keep selectedId in sync if currentTeacherId changes in guru mode or initialSelectedTeacherId changes
  useEffect(() => {
    if (currentRole === 'guru' && currentTeacherId) {
      setSelectedId(currentTeacherId);
    } else if (initialSelectedTeacherId) {
      setSelectedId(initialSelectedTeacherId);
    }
  }, [currentRole, currentTeacherId, initialSelectedTeacherId]);

  const currentTeacher = teachers.find(t => t.id === selectedId) || teachers[0];

  // Tab switch inside RPP: "Dokumen & Input RPP/RPI" vs "Rubrik Penilaian KS"
  const [activeSubTab, setActiveSubTab] = useState<'input_rpp' | 'rubrik'>(() => {
    return currentRole === 'guru' ? 'input_rpp' : 'rubrik';
  });

  // Scores map: aspect id -> score (0-4)
  const [scores, setScores] = useState<Record<number, number>>(() => {
    return rppRubric.reduce((acc, item) => ({ ...acc, [item.id]: 3 }), {});
  });

  const [activeRubricModal, setActiveRubricModal] = useState<number | null>(null);

  // Form input RPP / RPI (Modul Ajar / PPI) yang dapat diisi oleh Guru atau KS
  const [rppForm, setRppForm] = useState({
    title: `Modul Ajar & RPI: ${currentTeacher?.subject || 'Tematik'} (${currentTeacher?.unit || 'SDLB'})`,
    phase: currentTeacher?.phase || 'Fase B',
    subject: currentTeacher?.subject || '',
    alokasiWaktu: '2 JP x 35 Menit (Pertemuan 1)',
    hambatanBelajar: currentTeacher?.unit || 'Tunarungu',
    tujuanPembelajaran: 'Peserta didik mampu mengidentifikasi dan mencocokkan simbol bilangan 1-10 menggunakan benda konkret dan bahasa isyarat visual secara mandiri.',
    profilPelajarPancasila: 'Mandiri, Bernalar Kritis, dan Bergotong Royong',
    saranaMedia: 'Kartu angka bertekstur, balok kubus konkret, video isyarat interaktif, dan lembar kerja bergambar adaptif.',
    modelPembelajaran: 'Direct Instruction & Multisensory Active Learning',
    kegiatanAwal: '1. Mengucapkan salam dan menanyakan kabar dengan komunikasi ramah isyarat.\n2. Apersepsi menghubungkan konsep berhitung dengan rutinitas sarapan pagi di rumah.',
    kegiatanInti: '1. MEMAHAMI: Guru mendemonstrasikan balok konkret dan kartu simbol.\n2. MENGAPLIKASI: Siswa bekerja berpasangan menyusun balok sesuai kartu instruksi visual.\n3. PENDAMPINGAN: Guru memberikan bimbingan individual untuk anak yang memerlukan repetisi.',
    kegiatanPenutup: '1. MEREFLEKSI: Siswa memilih emoticon senyum atas perasaan belajar hari ini.\n2. Apresiasi dan umpan balik hangat atas usaha keras siswa.',
    linkDokumenDrive: 'https://drive.google.com/file/d/1kJSGIS6DewCNchMLqaTgu2OfkdxDwH5I/view?usp=sharing',
  });

  const [coachingData, setCoachingData] = useState<CoachingData>({
    tujuan: 'Memastikan siswa tunarungu memahami konsep bilangan dengan bantuan media benda konkret dan bahasa isyarat visual.',
    strategi: 'Menggunakan metode demonstrasi multisensori, kartu gambar peraga, dan bimbingan sebaya berpasangan.',
    aktivitas: 'Siswa mengamati benda nyata, berdiskusi kelompok kecil, dan mempraktikkan unjuk kerja mandiri.',
    asesmen: 'Asesmen diagnostik awal kesiapan, observasi formatif proses, dan lembar kerja adaptif berilustrasi.',
    kendala: 'Sebagian siswa memerlukan pendampingan motorik dan repetisi isyarat yang lebih intensif.'
  });

  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // Sync initial scores with teacher's scorePlan
  useEffect(() => {
    if (currentTeacher) {
      const targetScore = currentTeacher.scorePlan || 70;
      const basePerItem = Math.min(4, Math.max(1, Math.round((targetScore / 100) * 4)));
      setScores(rppRubric.reduce((acc, item) => ({ ...acc, [item.id]: basePerItem }), {}));
      
      setRppForm(prev => ({
        ...prev,
        title: `Modul Ajar & RPI: ${currentTeacher.subject} (${currentTeacher.unit})`,
        phase: currentTeacher.phase,
        subject: currentTeacher.subject,
        hambatanBelajar: currentTeacher.unit,
      }));
    }
  }, [selectedId, currentTeacher]);

  const handleScoreChange = (aspectId: number, val: number) => {
    if (currentRole !== 'kepsek') {
      alert('Pemberian skor rubrik hanya dilakukan oleh Kepala Sekolah saat telaah bersama guru.');
      return;
    }
    setScores(prev => ({ ...prev, [aspectId]: val }));
  };

  const totalObtained = Object.values(scores).reduce((a, b) => a + b, 0);
  const maxScore = rppRubric.length * 4;
  const percentage = Math.round((totalObtained / maxScore) * 100);

  let categoryLabel = 'Terlaksana / Optimal (85% - 100%)';
  let categoryColor = 'text-emerald-800 bg-emerald-50 border-emerald-200';

  if (percentage < 55) {
    categoryLabel = 'Belum Terlihat (< 55%): Perlu pendampingan intensif';
    categoryColor = 'text-red-800 bg-red-50 border-red-200';
  } else if (percentage < 70) {
    categoryLabel = 'Cukup (55% - 69%)';
    categoryColor = 'text-amber-800 bg-amber-50 border-amber-200';
  } else if (percentage < 85) {
    categoryLabel = 'Belum Optimal / Baik (70% - 84%)';
    categoryColor = 'text-blue-800 bg-blue-50 border-blue-200';
  }

  // Simpan Input Modul Ajar / RPI oleh Guru
  const handleSaveRppDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTeacher) return;

    setTeachers(prev =>
      prev.map(t => {
        if (t.id === currentTeacher.id) {
          return {
            ...t,
            subject: rppForm.subject || t.subject,
            phase: rppForm.phase || t.phase,
            rppStatus: t.rppStatus === 'Selesai' ? 'Selesai' : 'Draft',
            notes: `RPP/RPI telah diperbarui oleh guru (${new Date().toLocaleDateString('id-ID')}). Judul: ${rppForm.title}`
          };
        }
        return t;
      })
    );

    setSaveMessage(`Dokumen RPP / RPI ${currentTeacher.name} berhasil disimpan dan diserahkan ke Kepala Sekolah.`);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 4500);
  };

  // Simpan Nilai Telaah KS
  const handleSaveTelaahKS = () => {
    if (currentRole !== 'kepsek') {
      alert('Hanya Kepala Sekolah yang dapat menyimpan hasil penilaian rubrik.');
      return;
    }
    if (!currentTeacher) return;

    setTeachers(prev =>
      prev.map(t => {
        if (t.id === currentTeacher.id) {
          return {
            ...t,
            scorePlan: percentage,
            rppStatus: 'Selesai',
            notes: `Hasil telaah RPP oleh KS: ${percentage}% (${categoryLabel}). Tujuan: ${coachingData.tujuan.slice(0, 80)}...`
          };
        }
        return t;
      })
    );

    setSaveMessage(`Hasil penilaian telaah RPP ${currentTeacher.name} berhasil disimpan. Skor diperbarui menjadi ${percentage}%.`);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 4500);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-1 rounded-full font-semibold">
            TAHAP 1 · PRA-OBSERVASI & RPP/RPI
          </span>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            {currentRole === 'guru' ? 'Penyusunan & Pengunggahan RPP / RPI Guru' : 'Telaah Dokumen RPP (Lampiran 5) & Coaching'}
          </h2>
          <p className="text-xs text-slate-500">
            {currentRole === 'guru' 
              ? 'Input dan perbarui data Modul Ajar / Rencana Pembelajaran Individual (RPI) Anda sebelum jadwal supervisi.'
              : '7 Aspek Resmi SLB Muhammadiyah Ponjong lengkap dengan penilaian rubrik skor 0-4 dan dialog coaching.'}
          </p>
        </div>

        <div className="w-full sm:w-auto flex flex-wrap items-center gap-3">
          {/* Final Calculated Score Box */}
          <div className="bg-purple-50 border border-purple-200 px-4 py-2 rounded-xl text-center flex-1 sm:flex-initial">
            <span className="text-[10px] uppercase font-bold text-purple-600 block">
              Skor Telaah RPP
            </span>
            <span className="text-xl font-extrabold text-purple-900">
              {percentage}% <span className="text-xs font-semibold text-purple-700">({totalObtained}/{maxScore})</span>
            </span>
          </div>

          {/* Teacher Selector - Locked for Guru if login as specific teacher, editable for KS */}
          {currentRole === 'kepsek' ? (
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs cursor-pointer"
            >
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.unit})
                </option>
              ))}
            </select>
          ) : (
            <div className="py-2.5 px-3 bg-indigo-50 border border-indigo-200 rounded-xl text-xs font-bold text-indigo-900">
              Profil: {currentTeacher?.name}
            </div>
          )}
        </div>
      </div>

      {/* Selected Teacher Profile Card */}
      {currentTeacher && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-slate-900 text-sm">{currentTeacher.name}</span>
              <span className="text-slate-400 font-mono text-xs">NIP: {currentTeacher.nip}</span>
              {currentRole === 'guru' && (
                <span className="bg-indigo-100 text-indigo-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Akun Anda
                </span>
              )}
            </div>
            <div className="text-xs text-slate-600">
              <span className="font-medium text-emerald-800">{currentTeacher.unit}</span> · 
              <span className="font-medium text-slate-700 ml-1">{currentTeacher.phase}</span> · 
              <span className="text-slate-500 ml-1">Mapel: {currentTeacher.subject}</span> · 
              <span className="text-slate-500 ml-1">Jadwal: {currentTeacher.scheduleDate}</span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className={`px-3 py-1.5 rounded-xl border text-xs font-semibold ${categoryColor}`}>
              Status Mutu RPP: {categoryLabel}
            </div>
          </div>
        </div>
      )}

      {/* Sub-tab Navigation (Input RPP vs Rubrik Telaah) */}
      <div className="flex bg-slate-200/80 p-1.5 rounded-2xl w-full sm:w-auto self-start border border-slate-300">
        <button
          type="button"
          onClick={() => setActiveSubTab('input_rpp')}
          className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 ${
            activeSubTab === 'input_rpp'
              ? 'bg-white text-indigo-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText className="w-4 h-4 text-indigo-600" />
          <span>Formulir & Dokumen RPP / RPI (Bisa Diisi Guru)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('rubrik')}
          className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 ${
            activeSubTab === 'rubrik'
              ? 'bg-white text-emerald-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Award className="w-4 h-4 text-emerald-600" />
          <span>Rubrik Telaah KS (Lampiran 5) & Catatan Coaching</span>
        </button>
      </div>

      {/* Toast Save Alert */}
      {saveSuccess && (
        <div className="bg-emerald-600 text-white p-4 rounded-xl shadow-lg flex items-center justify-between text-xs animate-in fade-in slide-in-from-top duration-300">
          <div className="flex items-center space-x-2">
            <Check className="w-5 h-5 flex-shrink-0" />
            <span className="font-semibold">{saveMessage}</span>
          </div>
          <button onClick={() => setSaveSuccess(false)} className="text-emerald-100 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* SECTION 1: FORMULIR INPUT & EDIT RPP / RPI OLEH GURU */}
      {activeSubTab === 'input_rpp' && (
        <form onSubmit={handleSaveRppDoc} className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <span className="bg-indigo-100 text-indigo-800 text-[11px] font-bold px-2 py-0.5 rounded-full">
                  PANDUAN GURU SLB
                </span>
                <h3 className="font-bold text-slate-900 text-base">
                  Input & Edit Modul Ajar / Rencana Pembelajaran Individual (RPI)
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Lengkapi komponen perencanaan pembelajaran adaptif untuk memudahkan kepala sekolah menelaah keselarasan sebelum observasi.
              </p>
            </div>

            {onOpenAIModal && (
              <button
                type="button"
                onClick={onOpenAIModal}
                className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold px-3 py-2 rounded-xl text-xs flex items-center space-x-1.5 border border-indigo-200 transition"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Bantuan AI Menyusun PPI</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1 md:col-span-2">
              <label className="font-bold text-slate-700">Judul Modul Ajar / RPI:</label>
              <input
                type="text"
                required
                value={rppForm.title}
                onChange={(e) => setRppForm({ ...rppForm, title: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-semibold text-slate-900"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Mata Pelajaran / Program Khusus:</label>
              <input
                type="text"
                required
                value={rppForm.subject}
                onChange={(e) => setRppForm({ ...rppForm, subject: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Fase / Kelas & Alokasi Waktu:</label>
              <input
                type="text"
                value={`${rppForm.phase} - ${rppForm.alokasiWaktu}`}
                onChange={(e) => setRppForm({ ...rppForm, alokasiWaktu: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="font-bold text-slate-700">Tujuan Pembelajaran Berdiferensiasi (Spesifik & Terukur):</label>
              <textarea
                rows={2}
                required
                value={rppForm.tujuanPembelajaran}
                onChange={(e) => setRppForm({ ...rppForm, tujuanPembelajaran: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Sarana, Media Adaptif, & Alat Bantu ABK:</label>
              <textarea
                rows={2}
                value={rppForm.saranaMedia}
                onChange={(e) => setRppForm({ ...rppForm, saranaMedia: e.target.value })}
                placeholder="Contoh: Realia konkret, kartu simbol, visual schedule, audio amplifier..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Model Pembelajaran & Pendekatan Deep Learning:</label>
              <textarea
                rows={2}
                value={rppForm.modelPembelajaran}
                onChange={(e) => setRppForm({ ...rppForm, modelPembelajaran: e.target.value })}
                placeholder="Contoh: Multisensory active learning, Direct Instruction, TEACCH approach..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Kegiatan Awal (Pengondisian Mental & Apersepsi Ramah):</label>
              <textarea
                rows={3}
                value={rppForm.kegiatanAwal}
                onChange={(e) => setRppForm({ ...rppForm, kegiatanAwal: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Kegiatan Inti (Memahami, Mengaplikasi, Kolaborasi):</label>
              <textarea
                rows={3}
                value={rppForm.kegiatanInti}
                onChange={(e) => setRppForm({ ...rppForm, kegiatanInti: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="font-bold text-slate-700">Kegiatan Penutup & Refleksi Siswa Disabilitas:</label>
              <textarea
                rows={2}
                value={rppForm.kegiatanPenutup}
                onChange={(e) => setRppForm({ ...rppForm, kegiatanPenutup: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="font-bold text-slate-700 flex items-center space-x-1.5">
                <LinkIcon className="w-3.5 h-3.5 text-indigo-600" />
                <span>Link Tautan Berkas Dokumen RPP Lengkap / Google Drive:</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://drive.google.com/file/..."
                  value={rppForm.linkDokumenDrive}
                  onChange={(e) => setRppForm({ ...rppForm, linkDokumenDrive: e.target.value })}
                  className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-mono text-[11px]"
                />
                {rppForm.linkDokumenDrive && (
                  <a
                    href={rppForm.linkDokumenDrive}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl font-semibold flex items-center space-x-1 transition"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Buka Tautan</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="text-[11px] text-slate-500">
              * Guru dapat mengedit dan menginput RPP / RPI kapan saja sebelum observasi dilaksanakan.
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto bg-indigo-700 hover:bg-indigo-800 text-white font-semibold text-xs px-6 py-3 rounded-xl transition flex items-center justify-center space-x-2 shadow-md cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Simpan & Serahkan RPP / RPI</span>
            </button>
          </div>
        </form>
      )}

      {/* SECTION 2: RUBRIK PENILAIAN TELAAH RPP OLEH KEPALA SEKOLAH */}
      {activeSubTab === 'rubrik' && (
        <div className="space-y-6">
          {/* Rubrik Penilaian RPP (Lampiran 5) */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Rubrik Penilaian Perencanaan Pembelajaran (Lampiran 5 Modul KS)
                </h3>
                <p className="text-xs text-slate-500">
                  {currentRole === 'kepsek' 
                    ? 'Tentukan skor (0 - 4) untuk tiap aspek. Skor otomatis tersimpan ke rapor mutu pendidik.' 
                    : 'Pratinjau rubrik penilaian telaah yang digunakan Kepala Sekolah.'}
                </p>
              </div>

              {currentRole === 'guru' && (
                <span className="text-[11px] bg-amber-50 text-amber-800 font-semibold px-2.5 py-1 rounded-lg border border-amber-200">
                  Mode Lihat: Skor rubrik hanya diubah oleh KS
                </span>
              )}
            </div>

            <div className="divide-y divide-slate-100">
              {rppRubric.map((item) => {
                const currentScore = scores[item.id] ?? 3;
                return (
                  <div key={item.id} className="p-5 hover:bg-slate-50/60 transition space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-start space-x-2.5">
                        <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                          {item.id}
                        </span>
                        <div>
                          <h4 className="font-bold text-slate-800 text-xs sm:text-sm">
                            {item.aspect}
                          </h4>
                          <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                            Skor aktif saat ini: {item.scores[currentScore as keyof typeof item.scores]}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setActiveRubricModal(item.id)}
                        className="self-start sm:self-auto text-xs text-emerald-700 hover:text-emerald-800 font-semibold flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 transition"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>Lihat Rubrik 0-4</span>
                      </button>
                    </div>

                    {/* Score Selector Segmented 0 - 4 */}
                    <div className="grid grid-cols-5 gap-2 pt-1">
                      {[0, 1, 2, 3, 4].map((sc) => (
                        <button
                          key={sc}
                          type="button"
                          disabled={currentRole !== 'kepsek'}
                          onClick={() => handleScoreChange(item.id, sc)}
                          className={`py-2 px-2 rounded-xl text-xs font-bold transition flex flex-col items-center justify-center space-y-0.5 border ${
                            currentScore === sc
                              ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          } ${currentRole !== 'kepsek' ? 'cursor-default opacity-85' : 'cursor-pointer'}`}
                        >
                          <span className="text-xs">Skor {sc}</span>
                          <span className="text-[10px] font-normal opacity-80 hidden sm:inline">
                            {sc === 4 ? 'Sangat Baik' : sc === 3 ? 'Baik' : sc === 2 ? 'Cukup' : sc === 1 ? 'Kurang' : 'Tidak Ada'}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Catatan Wawancara Pra-Observasi (Coaching) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
            <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                  <span>Catatan Dialog Pra-Observasi (Coaching Percakapan KS & Guru)</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Dokumentasi percakapan persiapan mengajar antara Kepala Sekolah dan Guru sebelum masuk kelas.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">1. Tujuan Pembelajaran & Dimensi Profil Lulusan:</label>
                <textarea
                  rows={2}
                  disabled={currentRole !== 'kepsek'}
                  value={coachingData.tujuan}
                  onChange={(e) => setCoachingData({ ...coachingData, tujuan: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-100"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">2. Strategi Pembelajaran & Metode Diferensiasi ABK:</label>
                <textarea
                  rows={2}
                  disabled={currentRole !== 'kepsek'}
                  value={coachingData.strategi}
                  onChange={(e) => setCoachingData({ ...coachingData, strategi: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-100"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">3. Aktivitas Peserta Didik (Memahami, Mengaplikasi, Merefleksi):</label>
                <textarea
                  rows={2}
                  disabled={currentRole !== 'kepsek'}
                  value={coachingData.aktivitas}
                  onChange={(e) => setCoachingData({ ...coachingData, aktivitas: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-100"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">4. Rencana Asesmen (Diagnostik Awal & Formatif Proses):</label>
                <textarea
                  rows={2}
                  disabled={currentRole !== 'kepsek'}
                  value={coachingData.asesmen}
                  onChange={(e) => setCoachingData({ ...coachingData, asesmen: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-100"
                />
              </div>

              <div className="md:col-span-2 space-y-1">
                <label className="font-bold text-slate-700">5. Kesiapan Khusus & Antisipasi Hambatan Belajar Siswa:</label>
                <textarea
                  rows={2}
                  disabled={currentRole !== 'kepsek'}
                  value={coachingData.kendala}
                  onChange={(e) => setCoachingData({ ...coachingData, kendala: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-100"
                />
              </div>
            </div>

            {/* Submit Save Button for KS */}
            {currentRole === 'kepsek' && (
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveTelaahKS}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs px-6 py-3 rounded-xl transition flex items-center space-x-2 shadow-md cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Hasil Telaah RPP & Nilai Mutu Guru</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Detail Kriteria Rubrik */}
      {activeRubricModal !== null && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl border border-slate-200 max-h-[85vh] overflow-y-auto">
            {(() => {
              const item = rppRubric.find(r => r.id === activeRubricModal);
              if (!item) return null;
              return (
                <>
                  <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                    <div>
                      <span className="text-[10px] font-bold text-emerald-700 uppercase">
                        Kriteria Rubrik Aspek {item.id}
                      </span>
                      <h3 className="font-bold text-slate-900 text-sm mt-0.5">{item.aspect}</h3>
                    </div>
                    <button
                      onClick={() => setActiveRubricModal(null)}
                      className="text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-3 text-xs">
                    {[4, 3, 2, 1, 0].map((scoreLevel) => (
                      <div
                        key={scoreLevel}
                        className={`p-3 rounded-xl border ${
                          scores[item.id] === scoreLevel 
                            ? 'bg-emerald-50/80 border-emerald-300 ring-2 ring-emerald-500/20' 
                            : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className={`font-bold text-xs ${
                            scoreLevel === 4 ? 'text-emerald-800' : scoreLevel === 3 ? 'text-blue-800' : scoreLevel === 2 ? 'text-amber-800' : 'text-slate-700'
                          }`}>
                            Skor {scoreLevel}: {scoreLevel === 4 ? 'Sangat Baik' : scoreLevel === 3 ? 'Baik' : scoreLevel === 2 ? 'Cukup' : scoreLevel === 1 ? 'Kurang' : 'Tidak Ada'}
                          </span>
                          {currentRole === 'kepsek' && (
                            <button
                              type="button"
                              onClick={() => {
                                handleScoreChange(item.id, scoreLevel);
                                setActiveRubricModal(null);
                              }}
                              className="text-[11px] font-semibold text-emerald-700 hover:underline cursor-pointer"
                            >
                              Pilih Skor Ini
                            </button>
                          )}
                        </div>
                        <p className="text-slate-600 text-[11px] leading-relaxed">
                          {item.scores[scoreLevel as keyof typeof item.scores]}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setActiveRubricModal(null)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs cursor-pointer"
                    >
                      Tutup
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};
