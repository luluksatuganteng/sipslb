import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  CheckCircle2, 
  FileCheck, 
  Eye, 
  ArrowRight, 
  Calendar, 
  Quote, 
  Award, 
  ChevronRight, 
  TrendingUp, 
  Sparkles, 
  UserCheck,
  AlertTriangle,
  Clock,
  CheckCircle,
  BarChart3,
  Layers,
  Filter,
  Search,
  BookOpen,
  ArrowUpRight,
  ShieldCheck,
  Check
} from 'lucide-react';
import { Teacher, TabType, UserRole, RppCompletionStatus, ObsCompletionStatus } from '../types';
import { motivationalQuotes } from '../data/rubrics';
import { schoolConfig } from '../data/schoolConfig';
import { TeacherProgressChart } from './TeacherProgressChart';

interface DashboardViewProps {
  teachers: Teacher[];
  setActiveTab: (tab: TabType) => void;
  currentRole: UserRole;
  currentTeacherId?: string;
  onOpenAIModal?: () => void;
  onNavigateToTeacher?: (teacherId: string, tab: TabType) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ 
  teachers, 
  setActiveTab,
  currentRole,
  currentTeacherId,
  onOpenAIModal,
  onNavigateToTeacher
}) => {
  const totalTeachers = teachers.length;

  // Helper status checkers
  const getRppStatus = (t: Teacher): RppCompletionStatus => {
    if (t.rppStatus) return t.rppStatus;
    if (t.status === 'Selesai' || t.scorePlan >= 70) return 'Selesai';
    if (t.scorePlan > 0) return 'Draft';
    return 'Belum Lengkap';
  };

  const getObsStatus = (t: Teacher): ObsCompletionStatus => {
    if (t.obsStatus) return t.obsStatus;
    if (t.scoreObs > 0) return 'Selesai';
    if (t.scheduleDate) return 'Terjadwal';
    return 'Belum Terlaksana';
  };

  // 1. RPP Summary Statistics
  const rppCompletedTeachers = useMemo(() => teachers.filter(t => getRppStatus(t) === 'Selesai'), [teachers]);
  const rppDraftTeachers = useMemo(() => teachers.filter(t => getRppStatus(t) === 'Draft'), [teachers]);
  const rppPendingTeachers = useMemo(() => teachers.filter(t => getRppStatus(t) === 'Belum Lengkap'), [teachers]);

  const rppCompletedCount = rppCompletedTeachers.length;
  const rppDraftCount = rppDraftTeachers.length;
  const rppPendingCount = rppPendingTeachers.length;
  const rppCompletionPct = totalTeachers > 0 ? Math.round((rppCompletedCount / totalTeachers) * 100) : 0;

  const evaluatedRpp = teachers.filter(t => (t.scorePlan || 0) > 0);
  const avgPlan = evaluatedRpp.length > 0
    ? Math.round(evaluatedRpp.reduce((acc, t) => acc + t.scorePlan, 0) / evaluatedRpp.length)
    : 0;

  // 2. Observation Summary Statistics
  const obsCompletedTeachers = useMemo(() => teachers.filter(t => getObsStatus(t) === 'Selesai'), [teachers]);
  const obsScheduledTeachers = useMemo(() => teachers.filter(t => getObsStatus(t) === 'Terjadwal'), [teachers]);
  const obsPendingTeachers = useMemo(() => teachers.filter(t => getObsStatus(t) === 'Belum Terlaksana'), [teachers]);

  const obsCompletedCount = obsCompletedTeachers.length;
  const obsScheduledCount = obsScheduledTeachers.length;
  const obsPendingCount = obsPendingTeachers.length;
  const obsCompletionPct = totalTeachers > 0 ? Math.round((obsCompletedCount / totalTeachers) * 100) : 0;

  const evaluatedObs = teachers.filter(t => (t.scoreObs || 0) > 0);
  const avgObs = evaluatedObs.length > 0 
    ? Math.round(evaluatedObs.reduce((acc, t) => acc + t.scoreObs, 0) / evaluatedObs.length) 
    : 0;

  // 3. Combined / Full Supervision Completion
  const bothCompletedTeachers = useMemo(() => 
    teachers.filter(t => getRppStatus(t) === 'Selesai' && getObsStatus(t) === 'Selesai'),
    [teachers]
  );
  const bothCompletedCount = bothCompletedTeachers.length;
  const overallSupervisionPct = totalTeachers > 0 ? Math.round((bothCompletedCount / totalTeachers) * 100) : 0;

  // 4. Breakdown per Unit / Jenjang
  const unitStats = useMemo(() => {
    const units = ['SDLB', 'SMPLB', 'SMALB'];
    return units.map(u => {
      const unitTeachers = teachers.filter(t => t.unit.includes(u));
      const uTotal = unitTeachers.length;
      const uRppDone = unitTeachers.filter(t => getRppStatus(t) === 'Selesai').length;
      const uObsDone = unitTeachers.filter(t => getObsStatus(t) === 'Selesai').length;
      const uBothDone = unitTeachers.filter(t => getRppStatus(t) === 'Selesai' && getObsStatus(t) === 'Selesai').length;
      const rppPct = uTotal > 0 ? Math.round((uRppDone / uTotal) * 100) : 0;
      const obsPct = uTotal > 0 ? Math.round((uObsDone / uTotal) * 100) : 0;

      return {
        unit: u,
        teachers: unitTeachers,
        total: uTotal,
        rppDone: uRppDone,
        obsDone: uObsDone,
        bothDone: uBothDone,
        rppPct,
        obsPct
      };
    });
  }, [teachers]);

  // Interactive filtering for Principal review table
  const [statusFilter, setStatusFilter] = useState<'all' | 'need_rpp' | 'need_obs' | 'complete'>('all');
  const [selectedUnitFilter, setSelectedUnitFilter] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredTeachers = useMemo(() => {
    return teachers.filter(t => {
      const rppStatus = getRppStatus(t);
      const obsStatus = getObsStatus(t);

      // Status filter
      if (statusFilter === 'need_rpp' && rppStatus === 'Selesai') return false;
      if (statusFilter === 'need_obs' && obsStatus === 'Selesai') return false;
      if (statusFilter === 'complete' && !(rppStatus === 'Selesai' && obsStatus === 'Selesai')) return false;

      // Unit filter
      if (selectedUnitFilter !== 'Semua' && !t.unit.includes(selectedUnitFilter)) return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchName = t.name.toLowerCase().includes(query);
        const matchSubject = t.subject.toLowerCase().includes(query);
        const matchNip = t.nip.toLowerCase().includes(query);
        if (!matchName && !matchSubject && !matchNip) return false;
      }

      return true;
    });
  }, [teachers, statusFilter, selectedUnitFilter, searchQuery]);

  const loggedInTeacher = teachers.find(t => t.id === currentTeacherId) || teachers[0];

  // Rotating quote
  const [quoteIndex, setQuoteIndex] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setQuoteIndex(prev => (prev + 1) % motivationalQuotes.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  const activeQuote = motivationalQuotes[quoteIndex];

  const handleActionClick = (teacherId: string, targetTab: TabType) => {
    if (onNavigateToTeacher) {
      onNavigateToTeacher(teacherId, targetTab);
    } else {
      setActiveTab(targetTab);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Hero Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-teal-950 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center space-x-2 bg-emerald-800/80 border border-emerald-600/50 px-3 py-1 rounded-full text-xs font-semibold text-emerald-200">
            <Award className="w-3.5 h-3.5 text-yellow-300" />
            <span>
              {currentRole === 'kepsek' 
                ? 'Portal Super Admin & Evaluasi Supervisi Kepala Sekolah' 
                : 'Portal Pendidik & Supervisi Guru SLB'}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            SIPENDA SLB · {schoolConfig.name}
          </h2>

          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            {currentRole === 'kepsek'
              ? 'Selamat datang, Bapak Kepala Sekolah. Tinjau statistik penyelesaian formulir telaah RPP dan instrumen observasi kelas pendidik SLB Muhammadiyah Ponjong di bawah ini.'
              : `Selamat datang, ${loggedInTeacher?.name}. Hak akses Anda terfokus pada penyusunan, pengunggahan, dan pengeditan Modul Ajar / Rencana Pembelajaran Individual (RPI).`}
          </p>

          <div className="pt-2 flex flex-wrap gap-2.5">
            {currentRole === 'guru' ? (
              <button
                onClick={() => setActiveTab('pra')}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition flex items-center space-x-1.5 shadow cursor-pointer"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Input & Edit RPP / RPI Anda</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </button>
            ) : (
              <>
                <button
                  onClick={() => setActiveTab('pra')}
                  className="bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition flex items-center space-x-1.5 shadow cursor-pointer"
                >
                  <FileCheck className="w-3.5 h-3.5" />
                  <span>Telaah RPP Guru ({rppDraftCount + rppPendingCount} Menunggu)</span>
                </button>
                <button
                  onClick={() => setActiveTab('observation')}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition flex items-center space-x-1.5 shadow cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Observasi Kelas ({obsScheduledCount} Terjadwal)</span>
                </button>
                <button
                  onClick={() => setActiveTab('reports')}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-medium text-xs px-3.5 py-2.5 rounded-xl border border-slate-700 transition flex items-center space-x-1.5 cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Cetak Laporan</span>
                </button>
              </>
            )}

            {onOpenAIModal && (
              <button
                onClick={onOpenAIModal}
                className="bg-teal-700/60 hover:bg-teal-600/80 text-teal-200 hover:text-white font-medium text-xs px-3.5 py-2.5 rounded-xl border border-teal-500/40 transition flex items-center space-x-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                <span>AI Rekomendasi PPI</span>
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Quote Slider */}
        <div className="w-full lg:w-80 bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10 text-xs relative z-10 space-y-2">
          <div className="flex items-center space-x-1.5 text-emerald-300 font-semibold text-[11px]">
            <Quote className="w-3.5 h-3.5" />
            <span>Refleksi Pendidikan SLB</span>
          </div>
          <p className="text-slate-200 italic leading-relaxed text-[11px] min-h-[56px]">
            "{activeQuote.quote}"
          </p>
          <div className="text-[10px] text-emerald-300/80 font-medium text-right">
            — {activeQuote.author}
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* SECTION 1: FORM COMPLETION SUMMARY STATISTICS & GAUGES */}
      {/* ======================================================== */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1">
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-emerald-700" />
              <span>Statistik Penyelesaian Formulir Supervisi</span>
            </h3>
            <p className="text-xs text-slate-500">
              Visualisasi kemajuan pengisian & telaah dokumen RPP (Tahap 1) dan lembar observasi kelas (Tahap 2)
            </p>
          </div>
          <div className="text-xs text-slate-400 bg-slate-50 border border-slate-200 px-3 py-1 rounded-lg">
            Tahun Ajaran {schoolConfig.academicYear} · {schoolConfig.semester}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card A: Formulir Telaah RPP / RPI (Lampiran 5) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
            
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-11 h-11 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                    <FileCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-purple-600 bg-purple-50 px-2 py-0.5 rounded">
                      Tahap 1
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm mt-0.5">Form Telaah RPP / RPI</h4>
                  </div>
                </div>
                <span className="text-2xl font-black text-purple-900">{rppCompletionPct}%</span>
              </div>

              {/* Progress Bar with Multiple Segments */}
              <div>
                <div className="flex justify-between text-xs mb-1.5 font-medium">
                  <span className="text-slate-600">Progres Kelengkapan</span>
                  <span className="text-purple-900 font-bold">{rppCompletedCount} dari {totalTeachers} Guru</span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
                  <div 
                    style={{ width: `${(rppCompletedCount / totalTeachers) * 100}%` }}
                    className="bg-purple-600 h-full transition-all duration-500"
                    title={`Selesai Ditelaah: ${rppCompletedCount}`}
                  />
                  <div 
                    style={{ width: `${(rppDraftCount / totalTeachers) * 100}%` }}
                    className="bg-amber-400 h-full transition-all duration-500"
                    title={`Draft Diajukan: ${rppDraftCount}`}
                  />
                  <div 
                    style={{ width: `${(rppPendingCount / totalTeachers) * 100}%` }}
                    className="bg-slate-300 h-full transition-all duration-500"
                    title={`Belum Lengkap: ${rppPendingCount}`}
                  />
                </div>
              </div>

              {/* Breakdown Status Chips */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                <div className="bg-purple-50/70 border border-purple-100 p-2.5 rounded-xl text-center">
                  <div className="text-[10px] text-purple-700 font-medium">Selesai Ditelaah</div>
                  <div className="text-base font-extrabold text-purple-900 mt-0.5">{rppCompletedCount}</div>
                  <div className="text-[10px] text-purple-600">Terverifikasi KS</div>
                </div>
                <div className="bg-amber-50/70 border border-amber-100 p-2.5 rounded-xl text-center">
                  <div className="text-[10px] text-amber-700 font-medium">Draft Guru</div>
                  <div className="text-base font-extrabold text-amber-900 mt-0.5">{rppDraftCount}</div>
                  <div className="text-[10px] text-amber-600">Menunggu Telaah</div>
                </div>
                <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-center">
                  <div className="text-[10px] text-slate-500 font-medium">Belum Lengkap</div>
                  <div className="text-base font-extrabold text-slate-700 mt-0.5">{rppPendingCount}</div>
                  <div className="text-[10px] text-slate-400">Perlu Diisi</div>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400">Rata-rata Skor: </span>
                <span className="font-bold text-purple-800">{avgPlan}%</span>
                <span className="text-[11px] text-slate-400 ml-1">(Lampiran 5)</span>
              </div>
              <button
                onClick={() => setActiveTab('pra')}
                className="text-purple-700 hover:text-purple-900 font-semibold flex items-center space-x-1 transition cursor-pointer"
              >
                <span>Buka Form</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card B: Formulir Observasi Kelas (Lampiran 6) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />

            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <Eye className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      Tahap 2
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm mt-0.5">Form Observasi Kelas</h4>
                  </div>
                </div>
                <span className="text-2xl font-black text-emerald-900">{obsCompletionPct}%</span>
              </div>

              {/* Progress Bar with Multiple Segments */}
              <div>
                <div className="flex justify-between text-xs mb-1.5 font-medium">
                  <span className="text-slate-600">Progres Keterlaksanaan</span>
                  <span className="text-emerald-900 font-bold">{obsCompletedCount} dari {totalTeachers} Guru</span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
                  <div 
                    style={{ width: `${(obsCompletedCount / totalTeachers) * 100}%` }}
                    className="bg-emerald-600 h-full transition-all duration-500"
                    title={`Selesai Diobservasi: ${obsCompletedCount}`}
                  />
                  <div 
                    style={{ width: `${(obsScheduledCount / totalTeachers) * 100}%` }}
                    className="bg-teal-400 h-full transition-all duration-500"
                    title={`Menunggu Jadwal: ${obsScheduledCount}`}
                  />
                  <div 
                    style={{ width: `${(obsPendingCount / totalTeachers) * 100}%` }}
                    className="bg-slate-300 h-full transition-all duration-500"
                    title={`Belum Terlaksana: ${obsPendingCount}`}
                  />
                </div>
              </div>

              {/* Breakdown Status Chips */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                <div className="bg-emerald-50/70 border border-emerald-100 p-2.5 rounded-xl text-center">
                  <div className="text-[10px] text-emerald-700 font-medium">Selesai Dinilai</div>
                  <div className="text-base font-extrabold text-emerald-900 mt-0.5">{obsCompletedCount}</div>
                  <div className="text-[10px] text-emerald-600">Sudah Masuk Skor</div>
                </div>
                <div className="bg-teal-50/70 border border-teal-100 p-2.5 rounded-xl text-center">
                  <div className="text-[10px] text-teal-700 font-medium">Terjadwal</div>
                  <div className="text-base font-extrabold text-teal-900 mt-0.5">{obsScheduledCount}</div>
                  <div className="text-[10px] text-teal-600">Siap Dikelola</div>
                </div>
                <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-center">
                  <div className="text-[10px] text-slate-500 font-medium">Belum Mulai</div>
                  <div className="text-base font-extrabold text-slate-700 mt-0.5">{obsPendingCount}</div>
                  <div className="text-[10px] text-slate-400">Jadwalkan</div>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400">Rata-rata Skor: </span>
                <span className="font-bold text-emerald-800">{avgObs > 0 ? `${avgObs}%` : '-'}</span>
                <span className="text-[11px] text-slate-400 ml-1">(Lampiran 6)</span>
              </div>
              <button
                onClick={() => setActiveTab('observation')}
                className="text-emerald-700 hover:text-emerald-900 font-semibold flex items-center space-x-1 transition cursor-pointer"
              >
                <span>Buka Form</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card C: Ringkasan Supervisi Tuntas & Kesiapan Laporan */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 text-white rounded-2xl p-5 shadow-xs flex flex-col justify-between relative overflow-hidden">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-11 h-11 rounded-xl bg-white/10 text-emerald-400 flex items-center justify-center backdrop-blur-md">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-300 bg-emerald-900/60 px-2 py-0.5 rounded border border-emerald-600/40">
                      Tuntas Supervisi
                    </span>
                    <h4 className="font-bold text-white text-sm mt-0.5">Penjaminan Mutu</h4>
                  </div>
                </div>
                <span className="text-2xl font-black text-emerald-300">{overallSupervisionPct}%</span>
              </div>

              {/* Funnel Visual */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-300 font-medium">
                  <span>RPP & Observasi Selesai</span>
                  <span className="font-bold text-white">{bothCompletedCount} / {totalTeachers} Pendidik</span>
                </div>
                <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    style={{ width: `${overallSupervisionPct}%` }}
                    className="bg-emerald-400 h-full rounded-full transition-all duration-500 shadow-sm"
                  />
                </div>
              </div>

              {/* Status Checklist List */}
              <div className="space-y-1.5 text-xs text-slate-200 pt-1">
                <div className="flex items-center justify-between py-1 border-b border-white/10">
                  <span className="text-slate-300">1. Pendidik Terdaftar</span>
                  <span className="font-semibold text-white">{totalTeachers} Guru</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-white/10">
                  <span className="text-slate-300">2. RPP Siap / Selesai</span>
                  <span className="font-semibold text-purple-300">{rppCompletedCount} Guru ({rppCompletionPct}%)</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-300">3. Observasi Tuntas</span>
                  <span className="font-semibold text-emerald-300">{obsCompletedCount} Guru ({obsCompletionPct}%)</span>
                </div>
              </div>
            </div>

            <div className="pt-3 mt-3 border-t border-white/10 flex items-center justify-between text-xs">
              <span className="text-slate-400">Siap terbit sertifikat/rapor:</span>
              <button
                onClick={() => setActiveTab('reports')}
                className="text-emerald-300 hover:text-white font-semibold flex items-center space-x-1 transition cursor-pointer"
              >
                <span>Lihat Laporan</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* SECTION 1.5: RECHARTS REAL-TIME DATA VISUALIZATION */}
      {/* ======================================================== */}
      <TeacherProgressChart
        teachers={teachers}
        currentRole={currentRole}
        currentTeacherId={currentTeacherId}
        onNavigateToTeacher={onNavigateToTeacher}
        setActiveTab={setActiveTab}
      />

      {/* ======================================================== */}
      {/* SECTION 2: BREAKDOWN BY UNIT (SDLB, SMPLB, SMALB) & ALERTS */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Unit Matrix Progress */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                <Layers className="w-4 h-4 text-emerald-700" />
                <span>Progres Supervisi Berdasarkan Jenjang Pendidikan</span>
              </h4>
              <p className="text-xs text-slate-500">
                Pemantauan tingkat kelengkapan telaah RPP dan pelaksanaan observasi per unit sekolah
              </p>
            </div>
            <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-200">
              3 Unit Pendidikan
            </span>
          </div>

          <div className="space-y-4 pt-1">
            {unitStats.map((item) => (
              <div 
                key={item.unit}
                className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition space-y-2.5"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-extrabold text-slate-800 text-sm">{item.unit}</span>
                    <span className="text-xs text-slate-400">({item.total} Guru Pendidik)</span>
                  </div>
                  <div className="text-xs font-medium text-slate-600 flex items-center space-x-3">
                    <span>RPP: <strong className="text-purple-700">{item.rppDone}/{item.total}</strong></span>
                    <span>Observasi: <strong className="text-emerald-700">{item.obsDone}/{item.total}</strong></span>
                    <span className="bg-slate-200/80 px-2 py-0.5 rounded text-[11px] font-bold text-slate-700">
                      Tuntas: {item.bothDone}/{item.total}
                    </span>
                  </div>
                </div>

                {/* Dual Mini Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                      <span>Kelengkapan RPP</span>
                      <span className="font-semibold text-purple-800">{item.rppPct}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        style={{ width: `${item.rppPct}%` }} 
                        className="bg-purple-600 h-full rounded-full transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                      <span>Pelaksanaan Observasi</span>
                      <span className="font-semibold text-emerald-800">{item.obsPct}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        style={{ width: `${item.obsPct}%` }} 
                        className="bg-emerald-600 h-full rounded-full transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actionable Alerts & Next Agenda for Principal */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
              <Clock className="w-4 h-4 text-emerald-700" />
              <span>Agenda & Catatan Kepala Sekolah</span>
            </h4>

            {/* Alert 1: RPP needing review */}
            {rppDraftCount > 0 ? (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs space-y-1">
                <div className="flex items-center space-x-1.5 font-bold text-amber-900">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                  <span>{rppDraftCount} RPP Menunggu Telaah KS</span>
                </div>
                <p className="text-amber-800 text-[11px]">
                  Terdapat dokumen RPP/RPI yang telah diajukan guru dan siap dilakukan dialog bimbingan serta pemberian skor.
                </p>
                <button
                  onClick={() => {
                    setStatusFilter('need_rpp');
                    const targetEl = document.getElementById('table-review-section');
                    targetEl?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="text-[11px] font-bold text-amber-900 underline mt-1 block cursor-pointer"
                >
                  Tinjau Guru Ini →
                </button>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs flex items-center space-x-2 text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Semua pengajuan RPP telah ditelaah oleh Kepala Sekolah.</span>
              </div>
            )}

            {/* Alert 2: Next scheduled observation */}
            {obsScheduledTeachers.length > 0 && (
              <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-xs space-y-1.5">
                <div className="flex items-center space-x-1.5 font-bold text-teal-900">
                  <Calendar className="w-3.5 h-3.5 text-teal-700" />
                  <span>Jadwal Observasi Terdekat</span>
                </div>
                <div className="text-[11px] text-teal-900">
                  <div className="font-semibold">{obsScheduledTeachers[0].name}</div>
                  <div className="text-teal-700 font-medium">
                    {obsScheduledTeachers[0].scheduleDate} · {obsScheduledTeachers[0].scheduleTime} WIB
                  </div>
                  <div className="text-teal-600 text-[10px] mt-0.5">
                    {obsScheduledTeachers[0].unit} - {obsScheduledTeachers[0].subject}
                  </div>
                </div>
                <button
                  onClick={() => handleActionClick(obsScheduledTeachers[0].id, 'observation')}
                  className="text-[11px] font-bold text-teal-800 hover:text-teal-950 flex items-center space-x-1 pt-0.5 cursor-pointer"
                >
                  <span>Mulai Lembar Observasi</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* Alert 3: Ready for report */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
              <div className="font-semibold text-slate-800 flex items-center space-x-1.5">
                <FileCheck className="w-3.5 h-3.5 text-slate-600" />
                <span>Laporan Siap Terbit</span>
              </div>
              <p className="text-[11px] text-slate-600">
                {bothCompletedCount} pendidik telah tuntas kedua tahapan supervisi dan siap dicetak hasil rekapitulasinya.
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('schedule')}
            className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition flex items-center justify-center space-x-1.5 cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Kelola Kalender Jadwal Supervisi</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* SECTION 3: INTERACTIVE TEACHER COMPLETION REVIEW TABLE */}
      {/* ======================================================== */}
      <div id="table-review-section" className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Table Header & Interactive Filter Bar */}
        <div className="p-5 border-b border-slate-100 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                <span>Daftar Verifikasi Kelengkapan Guru untuk Kepala Sekolah</span>
              </h3>
              <p className="text-xs text-slate-500">
                {currentRole === 'kepsek'
                  ? 'Klik tombol aksi pada masing-masing pendidik untuk langsung menelaah RPP atau mengisi formulir observasi kelas'
                  : `Menampilkan status supervisi Anda (${loggedInTeacher?.name}) dan rekan sejawat`}
              </p>
            </div>

            <div className="flex items-center space-x-2 text-xs">
              <span className="text-slate-400">Menampilkan:</span>
              <span className="font-bold text-slate-800">{filteredTeachers.length} dari {totalTeachers} Guru</span>
            </div>
          </div>

          {/* Filter Bar Controls */}
          <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-3 pt-1">
            {/* Quick Status Filters */}
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  statusFilter === 'all'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Semua Guru ({totalTeachers})
              </button>

              <button
                onClick={() => setStatusFilter('need_rpp')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center space-x-1 cursor-pointer ${
                  statusFilter === 'need_rpp'
                    ? 'bg-purple-700 text-white shadow-xs'
                    : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200'
                }`}
              >
                <span>RPP Belum Selesai</span>
                <span className="bg-purple-200/80 text-purple-900 px-1.5 py-0.2 rounded text-[10px] font-bold">
                  {rppDraftCount + rppPendingCount}
                </span>
              </button>

              <button
                onClick={() => setStatusFilter('need_obs')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center space-x-1 cursor-pointer ${
                  statusFilter === 'need_obs'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                }`}
              >
                <span>Observasi Belum Selesai</span>
                <span className="bg-emerald-200/80 text-emerald-900 px-1.5 py-0.2 rounded text-[10px] font-bold">
                  {obsScheduledCount + obsPendingCount}
                </span>
              </button>

              <button
                onClick={() => setStatusFilter('complete')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center space-x-1 cursor-pointer ${
                  statusFilter === 'complete'
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200'
                }`}
              >
                <Check className="w-3 h-3" />
                <span>Supervisi Tuntas ({bothCompletedCount})</span>
              </button>
            </div>

            {/* Search and Unit Filter */}
            <div className="flex items-center space-x-2">
              {/* Unit Dropdown */}
              <select
                value={selectedUnitFilter}
                onChange={(e) => setSelectedUnitFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-lg px-2.5 py-1.5 focus:outline-emerald-600 cursor-pointer"
              >
                <option value="Semua">Semua Jenjang</option>
                <option value="SDLB">SDLB</option>
                <option value="SMPLB">SMPLB</option>
                <option value="SMALB">SMALB</option>
              </select>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari guru / mapel..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-emerald-600 w-36 sm:w-44"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200 text-[11px]">
                <th className="py-3 px-4">No</th>
                <th className="py-3 px-4">Pendidik SLB & NIP</th>
                <th className="py-3 px-4">Unit & Mapel</th>
                <th className="py-3 px-4 text-center">Status Form RPP (Tahap 1)</th>
                <th className="py-3 px-4 text-center">Status Observasi (Tahap 2)</th>
                <th className="py-3 px-4 text-center">Progres Tahapan</th>
                <th className="py-3 px-4 text-right">Tindakan Kepala Sekolah</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredTeachers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Tidak ada data pendidik yang cocok dengan filter yang dipilih.
                  </td>
                </tr>
              ) : (
                filteredTeachers.map((t, idx) => {
                  const isCurrentTeacher = currentRole === 'guru' && t.id === currentTeacherId;
                  const rppStatus = getRppStatus(t);
                  const obsStatus = getObsStatus(t);
                  const isFullyComplete = rppStatus === 'Selesai' && obsStatus === 'Selesai';

                  return (
                    <tr 
                      key={t.id} 
                      className={`transition ${
                        isCurrentTeacher 
                          ? 'bg-indigo-50/70 font-medium' 
                          : isFullyComplete 
                            ? 'bg-emerald-50/20 hover:bg-emerald-50/40' 
                            : 'hover:bg-slate-50/80'
                      }`}
                    >
                      {/* No */}
                      <td className="py-3.5 px-4 font-medium text-slate-500">{idx + 1}</td>

                      {/* Nama Guru */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 flex items-center space-x-1.5">
                          <span>{t.name}</span>
                          {isCurrentTeacher && (
                            <span className="text-[10px] bg-indigo-200 text-indigo-900 px-1.5 py-0.2 rounded font-bold">
                              Anda
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">NIP: {t.nip}</div>
                      </td>

                      {/* Unit & Mapel */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">{t.unit}</div>
                        <div className="text-[11px] text-slate-500 font-medium">{t.subject}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{t.scheduleDate} ({t.scheduleTime})</div>
                      </td>

                      {/* Status Form RPP (Tahap 1) */}
                      <td className="py-3.5 px-4 text-center">
                        {rppStatus === 'Selesai' ? (
                          <div className="inline-flex flex-col items-center">
                            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                              <CheckCircle2 className="w-3 h-3 text-purple-700" />
                              <span>Selesai Ditelaah</span>
                            </span>
                            <span className="text-[11px] font-bold text-purple-900 mt-0.5">
                              Skor: {t.scorePlan}%
                            </span>
                          </div>
                        ) : rppStatus === 'Draft' ? (
                          <div className="inline-flex flex-col items-center">
                            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                              <Clock className="w-3 h-3 text-amber-700" />
                              <span>Draft Diajukan</span>
                            </span>
                            <span className="text-[10px] text-amber-700 mt-0.5">Menunggu Telaah KS</span>
                          </div>
                        ) : (
                          <div className="inline-flex flex-col items-center">
                            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                              <AlertTriangle className="w-3 h-3 text-slate-400" />
                              <span>Belum Lengkap</span>
                            </span>
                            <span className="text-[10px] text-slate-400 mt-0.5">Perlu Input RPP</span>
                          </div>
                        )}
                      </td>

                      {/* Status Observasi (Tahap 2) */}
                      <td className="py-3.5 px-4 text-center">
                        {obsStatus === 'Selesai' ? (
                          <div className="inline-flex flex-col items-center">
                            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                              <span>Selesai Dinilai</span>
                            </span>
                            <span className="text-[11px] font-bold text-emerald-900 mt-0.5">
                              Skor: {t.scoreObs}%
                            </span>
                          </div>
                        ) : obsStatus === 'Terjadwal' ? (
                          <div className="inline-flex flex-col items-center">
                            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-teal-50 text-teal-800 border border-teal-200">
                              <Calendar className="w-3 h-3 text-teal-600" />
                              <span>Terjadwal</span>
                            </span>
                            <span className="text-[10px] text-teal-700 mt-0.5">{t.scheduleDate}</span>
                          </div>
                        ) : (
                          <div className="inline-flex flex-col items-center">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-500">
                              Belum Mulai
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Progres Tahapan Visual Step */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center space-x-1">
                          {/* Step 1: RPP */}
                          <div 
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                              rppStatus === 'Selesai'
                                ? 'bg-purple-600 text-white'
                                : rppStatus === 'Draft'
                                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                  : 'bg-slate-100 text-slate-400 border border-slate-300'
                            }`}
                            title={`Tahap 1 RPP: ${rppStatus}`}
                          >
                            {rppStatus === 'Selesai' ? '✓' : '1'}
                          </div>

                          {/* Connector */}
                          <div className={`w-4 h-0.5 ${rppStatus === 'Selesai' ? 'bg-purple-400' : 'bg-slate-200'}`} />

                          {/* Step 2: Observation */}
                          <div 
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                              obsStatus === 'Selesai'
                                ? 'bg-emerald-600 text-white'
                                : obsStatus === 'Terjadwal'
                                  ? 'bg-teal-100 text-teal-800 border border-teal-300'
                                  : 'bg-slate-100 text-slate-400 border border-slate-300'
                            }`}
                            title={`Tahap 2 Observasi: ${obsStatus}`}
                          >
                            {obsStatus === 'Selesai' ? '✓' : '2'}
                          </div>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {isFullyComplete ? 'Tuntas 100%' : rppStatus === 'Selesai' ? 'Tahap 1 Selesai' : 'Belum Selesai'}
                        </div>
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3.5 px-4 text-right">
                        {currentRole === 'kepsek' ? (
                          <div className="flex items-center justify-end space-x-1.5">
                            {rppStatus !== 'Selesai' ? (
                              <button
                                onClick={() => handleActionClick(t.id, 'pra')}
                                className="px-2.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition text-[11px] flex items-center space-x-1 cursor-pointer shadow-xs"
                                title="Buka telaah RPP bersama guru ini"
                              >
                                <span>Telaah RPP</span>
                                <ChevronRight className="w-3 h-3" />
                              </button>
                            ) : obsStatus !== 'Selesai' ? (
                              <button
                                onClick={() => handleActionClick(t.id, 'observation')}
                                className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition text-[11px] flex items-center space-x-1 cursor-pointer shadow-xs"
                                title="Buka instrumen lembar observasi kelas"
                              >
                                <span>Observasi</span>
                                <ChevronRight className="w-3 h-3" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleActionClick(t.id, 'reports')}
                                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-semibold transition text-[11px] flex items-center space-x-1 cursor-pointer"
                                title="Lihat hasil rekapitulasi nilai lengkap"
                              >
                                <span>Rapor</span>
                                <ArrowUpRight className="w-3 h-3 text-slate-500" />
                              </button>
                            )}
                          </div>
                        ) : isCurrentTeacher ? (
                          <button
                            onClick={() => setActiveTab('pra')}
                            className="px-2.5 py-1.5 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg font-medium transition text-[11px] cursor-pointer"
                          >
                            Edit RPP
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">Hanya lihat</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
