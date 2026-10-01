import React, { useState } from 'react';
import { Sparkles, X, Brain, Check, RefreshCw, Send, BookOpen } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

interface AICoachingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AICoachingModal: React.FC<AICoachingModalProps> = ({ isOpen, onClose }) => {
  const [ketunaan, setKetunaan] = useState('Tunarungu / Hambatan Pendengaran');
  const [topic, setTopic] = useState('Diferensiasi & Media Multisensori');
  const [customNote, setCustomNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setIsLoading(true);
    setResponse(null);

    const prompt = `Anda adalah konsultan ahli pendidikan khusus (Pendidikan Luar Biasa / SLB) dan pembina supervisi akademik kepala sekolah SLB Muhammadiyah Ponjong Gunungkidul berpedoman pada Modul KS.02.2026.
Tugas Anda: Berikan rekomendasi praktis, adaptif, dan memuliakan anak berkebutuhan khusus untuk:
- Kategori Hambatan / Ketunaan: ${ketunaan}
- Topik / Fokus: ${topic}
- Catatan Kasus Khusus Guru: ${customNote || 'Siswa pasif dan kesulitan memahami konsep abstrak.'}

Format respon yang rapi dan terstruktur:
1. Analisis Kebutuhan Belajar & Pendekatan Ramah Disabilitas
2. Strategi Praktik Pedagogis (Media Multisensori / Visual Schedule / Konkret)
3. Contoh Pertanyaan Reflektif Coaching KS untuk Guru
4. Rekomendasi Asesmen Autentik / Formatif yang Adil`;

    try {
      // Check if GEMINI_API_KEY is available
      const apiKey = process.env.GEMINI_API_KEY || (import.meta as any).env?.VITE_GEMINI_API_KEY;
      if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
        const ai = new GoogleGenAI({ apiKey });
        const res = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });
        setResponse(res.text || 'Gagal menghasilkan rekomendasi.');
      } else {
        // Fallback domain-expert response tailored for SLB
        setTimeout(() => {
          setResponse(`### Rekomendasi Supervisi & Diferensiasi Pembelajaran SLB

#### 1. Analisis Kebutuhan Belajar (${ketunaan})
- **Karakteristik Kunci**: Peserta didik dengan ${ketunaan} sangat bergantung pada saluran sensorik yang masih berfungsi optimal (kompensatoris).
- **Prinsip Dasar**: Selalu gunakan pendekatan konkret ke semi-konkret sebelum menuju ke konsep simbolik/abstrak. Pastikan instruksi diberikan secara tenang, visual, dan berulang.

#### 2. Strategi Pedagogis Adaptif (${topic})
- **Media Visual-Taktil**: Sediakan kartu simbol bergambar, miniatur benda asli (realia), atau *visual schedule* langkah kerja per 10 menit.
- **Scaffolding Berjenjang**: Pecah tugas besar menjadi 3-4 sub-langkah kecil (*task analysis*).
- **Pemberian Reward**: Berikan penguatan positif segera (*immediate praise*) atas setiap kemajuan kecil unjuk kerja siswa.

#### 3. Pertanyaan Dialogis Coaching Kepala Sekolah untuk Guru
1. *"Dari materi yang diajarkan, bagian mana yang membuat siswa terlihat paling antusias dan mudah memahami?"*
2. *"Dukungan media adaptif atau bahasa visual apa yang menurut Bapak/Ibu dapat mempermudah siswa yang masih pasif?"*
3. *"Bagaimana kita dapat mengukur pemahaman siswa tanpa harus membebani mereka dengan tes tertulis konvensional?"*

#### 4. Rekomendasi Asesmen Autentik
- Gunakan lembar observasi unjuk kerja (*checklist*) kemandirian.
- Catat portofolio hasil karya berupa foto dokumentasi proses dan produk sederhana.`);
          setIsLoading(false);
        }, 1200);
        return;
      }
    } catch (err: any) {
      console.warn('Gemini API call note:', err);
      // Fallback response
      setResponse(`### Rekomendasi Supervisi Pedagogis SLB (${ketunaan})

1. **Optimalisasi Komunikasi Adaptif**: Gunakan bahasa isyarat visual, simbol PECS, atau peraga konkret yang ramah disabilitas.
2. **Kemitraan Pembelajaran**: Libatkan siswa dalam interaksi sebaya dan tugas mandiri berpasangan.
3. **Coaching Reflektif**: Ajak guru mengevaluasi respon siswa dan merancang lembar kerja berjenjang.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-emerald-700" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Asisten AI Coaching & Supervisi SLB
              </h3>
              <p className="text-[11px] text-slate-500">
                Konsultasi strategi diferensiasi, PPI, dan panduan dialog coaching Kepala Sekolah.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3.5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Kategori Hambatan Belajar Siswa:</label>
              <select
                value={ketunaan}
                onChange={(e) => setKetunaan(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium"
              >
                <option value="Tunarungu / Hambatan Pendengaran">Tunarungu (Hambatan Pendengaran)</option>
                <option value="Tunagrahita / Hambatan Intelektual">Tunagrahita (Hambatan Intelektual)</option>
                <option value="Autis / Spektrum Autisme">Spektrum Autisme</option>
                <option value="Tunadaksa / Hambatan Motorik-Fisik">Tunadaksa (Hambatan Motorik-Fisik)</option>
                <option value="Tunanetra / Hambatan Penglihatan">Tunanetra (Hambatan Penglihatan)</option>
                <option value="Tunaganda / Hambatan Majemuk">Tunaganda (Hambatan Majemuk)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Fokus Topik Pembinaan:</label>
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium"
              >
                <option value="Diferensiasi & Media Multisensori">Diferensiasi & Media Multisensori</option>
                <option value="Visual Schedule & Manajemen Perilaku">Visual Schedule & Manajemen Perilaku</option>
                <option value="Asesmen Autentik & Portofolio Vokasi">Asesmen Autentik & Portofolio Vokasi</option>
                <option value="Pertanyaan Dialogis Coaching Pra-Observasi">Pertanyaan Dialogis Coaching Pra-Observasi</option>
                <option value="Tindak Lanjut & Modeling Pasca-Observasi">Tindak Lanjut & Modeling Pasca-Observasi</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700">Catatan Temuan / Kebutuhan Spesifik Guru (Opsional):</label>
            <input
              type="text"
              placeholder="Contoh: Siswa sering tantrum saat peralihan tugas, media belum visual..."
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="pt-1 flex justify-end">
            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className="bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-semibold px-4 py-2.5 rounded-xl transition flex items-center space-x-1.5 shadow"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Menyusun Rekomendasi...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Hasilkan Panduan Rekomendasi</span>
                </>
              )}
            </button>
          </div>

          {/* Response Box */}
          {response && (
            <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 max-h-72 overflow-y-auto text-xs leading-relaxed text-slate-700 whitespace-pre-line">
              {response}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
