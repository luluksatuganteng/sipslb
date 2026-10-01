import React, { useState, useEffect } from 'react';
import { 
  Eye, 
  HelpCircle, 
  Check, 
  Save, 
  UserCheck, 
  Sparkles, 
  X,
  FileCheck2,
  Award,
  AlertCircle
} from 'lucide-react';
import { Teacher, ObservationData } from '../types';
import { observationRubric } from '../data/rubrics';

interface ObservationViewProps {
  teachers: Teacher[];
  setTeachers: React.Dispatch<React.SetStateAction<Teacher[]>>;
  isKepsek?: boolean;
  onOpenAIModal?: () => void;
  initialSelectedTeacherId?: string;
}

export const ObservationView: React.FC<ObservationViewProps> = ({ 
  teachers, 
  setTeachers,
  isKepsek = true,
  onOpenAIModal,
  initialSelectedTeacherId
}) => {
  const [selectedId, setSelectedId] = useState<string>(initialSelectedTeacherId || teachers[0]?.id || '');

  useEffect(() => {
    if (initialSelectedTeacherId) {
      setSelectedId(initialSelectedTeacherId);
    }
  }, [initialSelectedTeacherId]);

  const currentTeacher = teachers.find(t => t.id === selectedId) || teachers[0];

  // Observation scores: indicator id -> score 0-4
  const [scores, setScores] = useState<Record<number, number>>(() => {
    return observationRubric.reduce((acc, item) => ({ ...acc, [item.id]: 3 }), {});
  });

  const [activeRubricModal, setActiveRubricModal] = useState<number | null>(null);

  const [obsNotes, setObsNotes] = useState<ObservationData>({
    kelebihan: 'Guru sangat sabar, menggunakan media konkret multisensori yang menarik perhatian peserta didik.',
    perbaikan: 'Perlu penguatan teknik bertanya pemantik dan pelibatan merata siswa yang masih pasif.',
    rekomendasi: 'Menerapkan metode pembelajaran berdiferensiasi dan visual schedule secara berkelanjutan.'
  });

  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync initial scores with teacher's scoreObs if available
  useEffect(() => {
    if (currentTeacher) {
      const targetScore = currentTeacher.scoreObs > 0 ? currentTeacher.scoreObs : 74;
      const basePerItem = Math.min(4, Math.max(1, Math.round((targetScore / 100) * 4)));
      setScores(observationRubric.reduce((acc, item) => ({ ...acc, [item.id]: basePerItem }), {}));
    }
  }, [selectedId]);

  const handleScoreChange = (id: number, val: number) => {
    setScores(prev => ({ ...prev, [id]: val }));
  };

  const totalObtained = Object.values(scores).reduce((a, b) => a + b, 0);
  const maxScore = observationRubric.length * 4; // 14 * 4 = 56
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

  // Group rubric items by category
  const categories = Array.from(new Set(observationRubric.map(r => r.category || 'Umum')));

  const handleSaveObservation = () => {
    if (!currentTeacher) return;

    setTeachers(prev =>
      prev.map(t => {
        if (t.id === currentTeacher.id) {
          return {
            ...t,
            scoreObs: percentage,
            status: 'Selesai',
            obsStatus: 'Selesai',
            notes: `Observasi Kelas: ${percentage}% (${categoryLabel}). Rekomendasi: ${obsNotes.rekomendasi}`
          };
        }
        return t;
      })
    );

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 4000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Title Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-1 rounded-full font-semibold">
            TAHAP 2 · OBSERVASI KELAS
          </span>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            Instrumen Observasi Kelas (Lampiran 6 Modul KS)
          </h2>
          <p className="text-xs text-slate-500">
            14 Indikator utama pengamatan pelaksanaan pembelajaran lengkap dengan kriteria skor 0-4.
          </p>
        </div>

        <div className="w-full sm:w-auto flex flex-wrap items-center gap-3">
          {/* Calculated Observation Score */}
          <div className="bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-xl text-center flex-1 sm:flex-initial">
            <span className="text-[10px] uppercase font-bold text-emerald-700 block">
              Skor Observasi Kelas
            </span>
            <span className="text-xl font-extrabold text-emerald-900">
              {percentage}% <span className="text-xs font-semibold text-emerald-700">({totalObtained}/{maxScore})</span>
            </span>
          </div>

          {/* Teacher Selector */}
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
          >
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.unit}) - Status: {t.status}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Teacher Profile Summary Card */}
      {currentTeacher && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-slate-900 text-sm">{currentTeacher.name}</span>
              <span className="text-slate-400 font-mono text-xs">NIP: {currentTeacher.nip}</span>
            </div>
            <div className="text-xs text-slate-600">
              <span className="font-semibold text-emerald-800">{currentTeacher.unit}</span> · 
              <span className="font-medium text-slate-700 ml-1">{currentTeacher.phase}</span> · 
              <span className="text-slate-500 ml-1">Mapel: {currentTeacher.subject}</span> · 
              <span className="text-slate-500 ml-1">Jadwal: {currentTeacher.scheduleDate} ({currentTeacher.scheduleTime})</span>
            </div>
          </div>

          <div className={`px-3 py-1.5 rounded-xl border text-xs font-semibold ${categoryColor}`}>
            Predikat: {categoryLabel}
          </div>
        </div>
      )}

      {/* Toast Save Alert */}
      {saveSuccess && (
        <div className="bg-emerald-600 text-white p-4 rounded-xl shadow-lg flex items-center justify-between text-xs animate-in fade-in slide-in-from-top duration-300">
          <div className="flex items-center space-x-2">
            <Check className="w-5 h-5 flex-shrink-0" />
            <span className="font-semibold">
              Hasil observasi kelas untuk {currentTeacher?.name} berhasil disimpan! Skor {percentage}% tercatat dan status otomatis diperbarui menjadi 'Selesai'.
            </span>
          </div>
          <button onClick={() => setSaveSuccess(false)} className="text-emerald-100 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 14 Indikator Observasi Berdasarkan Kategori */}
      <div className="space-y-6">
        {categories.map((cat, catIdx) => {
          const items = observationRubric.filter(r => r.category === cat);
          return (
            <div key={cat} className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="px-6 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                  <h3 className="font-bold text-slate-800 text-xs sm:text-sm uppercase tracking-wide">
                    {cat}
                  </h3>
                </div>
                <span className="text-[11px] font-semibold text-slate-500">
                  {items.length} Indikator
                </span>
              </div>

              <div className="divide-y divide-slate-100">
                {items.map((item) => {
                  const currentScore = scores[item.id] ?? 3;
                  return (
                    <div key={item.id} className="p-5 hover:bg-slate-50/60 transition space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                        <div className="flex items-start space-x-2.5 max-w-3xl">
                          <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                            {item.id}
                          </span>
                          <div>
                            <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                              {item.aspect}
                            </h4>
                            {item.desc && (
                              <p className="text-xs text-slate-600 mt-0.5 italic">
                                {item.desc}
                              </p>
                            )}
                            <p className="text-[11px] text-emerald-800 font-medium mt-1">
                              Deskripsi Kriteria Skor Aktif: {item.scores[currentScore as keyof typeof item.scores]}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setActiveRubricModal(item.id)}
                          className="self-start sm:self-auto text-xs text-emerald-700 hover:text-emerald-800 font-semibold flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 transition whitespace-nowrap"
                        >
                          <HelpCircle className="w-3.5 h-3.5" />
                          <span>Rubrik 0-4</span>
                        </button>
                      </div>

                      {/* 0-4 Selector Buttons */}
                      <div className="grid grid-cols-5 gap-2 pt-1">
                        {[0, 1, 2, 3, 4].map((sc) => (
                          <button
                            key={sc}
                            type="button"
                            onClick={() => handleScoreChange(item.id, sc)}
                            className={`py-2 px-2 rounded-xl text-xs font-bold transition flex flex-col items-center justify-center space-y-0.5 border ${
                              currentScore === sc
                                ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
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
          );
        })}
      </div>

      {/* Catatan Pasca Observasi & Rekomendasi Kepala Sekolah */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
        <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
              <FileCheck2 className="w-4 h-4 text-emerald-600" />
              <span>Catatan Pasca Observasi & Rekomendasi Kepala Sekolah</span>
            </h3>
            <p className="text-xs text-slate-500">
              Umpan balik konstruktif untuk penguatan kompetensi pendidik anak berkebutuhan khusus.
            </p>
          </div>
          {onOpenAIModal && (
            <button
              onClick={onOpenAIModal}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center space-x-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Buat Rekomendasi AI</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="space-y-1">
            <label className="font-bold text-slate-700">1. Kelebihan / Kekuatan Guru:</label>
            <textarea
              rows={3}
              value={obsNotes.kelebihan}
              onChange={(e) => setObsNotes({ ...obsNotes, kelebihan: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700">2. Aspek yang Perlu Ditingkatkan:</label>
            <textarea
              rows={3}
              value={obsNotes.perbaikan}
              onChange={(e) => setObsNotes({ ...obsNotes, perbaikan: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700">3. Rekomendasi Tindak Lanjut KS:</label>
            <textarea
              rows={3}
              value={obsNotes.rekomendasi}
              onChange={(e) => setObsNotes({ ...obsNotes, rekomendasi: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Submit Save Button */}
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={handleSaveObservation}
            className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs px-6 py-3 rounded-xl transition flex items-center space-x-2 shadow-md"
          >
            <Save className="w-4 h-4" />
            <span>Simpan & Perbarui Skor Otomatis Guru</span>
          </button>
        </div>
      </div>

      {/* Modal Detail Kriteria Rubrik */}
      {activeRubricModal !== null && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl border border-slate-200 max-h-[85vh] overflow-y-auto">
            {(() => {
              const item = observationRubric.find(r => r.id === activeRubricModal);
              if (!item) return null;
              return (
                <>
                  <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                    <div>
                      <span className="text-[10px] font-bold text-emerald-700 uppercase">
                        Rubrik Lampiran 6 · Indikator {item.id}
                      </span>
                      <h3 className="font-bold text-slate-900 text-sm mt-0.5">{item.aspect}</h3>
                      {item.desc && <p className="text-xs text-slate-500 italic mt-0.5">{item.desc}</p>}
                    </div>
                    <button
                      onClick={() => setActiveRubricModal(null)}
                      className="text-slate-400 hover:text-slate-600"
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
                          <button
                            type="button"
                            onClick={() => {
                              handleScoreChange(item.id, scoreLevel);
                              setActiveRubricModal(null);
                            }}
                            className="text-[11px] font-semibold text-emerald-700 hover:underline"
                          >
                            Pilih Skor Ini
                          </button>
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
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs"
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
