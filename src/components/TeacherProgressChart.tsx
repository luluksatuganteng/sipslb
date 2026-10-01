import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  Cell,
  PieChart,
  Pie,
  ReferenceLine,
} from 'recharts';
import { 
  BarChart3, 
  PieChart as PieIcon, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  Filter, 
  ArrowUpDown, 
  Eye, 
  FileCheck, 
  Sparkles,
  School,
  ChevronRight,
  Info
} from 'lucide-react';
import { Teacher, TabType, UserRole } from '../types';

interface TeacherProgressChartProps {
  teachers: Teacher[];
  currentRole: UserRole;
  currentTeacherId?: string;
  onNavigateToTeacher?: (teacherId: string, tab: TabType) => void;
  setActiveTab: (tab: TabType) => void;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    name: string;
    dataKey: string;
    color: string;
    payload: {
      id: string;
      name: string;
      unit: string;
      fullUnit: string;
      subject: string;
      rppProgress: number;
      obsProgress: number;
      totalProgress: number;
      scorePlan: number;
      scoreObs: number;
      rppStatus: string;
      obsStatus: string;
    };
  }>;
}

export const TeacherProgressChart: React.FC<TeacherProgressChartProps> = ({
  teachers,
  currentRole,
  currentTeacherId,
  onNavigateToTeacher,
  setActiveTab
}) => {
  // Display Mode: 'progress' (0 - 100% completion) or 'scores' (RPP vs Obs scores)
  const [chartMode, setChartMode] = useState<'progress' | 'scores'>('progress');
  // Unit filter: 'Semua', 'SDLB', 'SMPLB', 'SMALB'
  const [selectedUnit, setSelectedUnit] = useState<string>('Semua');
  // Sorting: 'progress_desc' | 'progress_asc' | 'name'
  const [sortBy, setSortBy] = useState<'progress_desc' | 'progress_asc' | 'name'>('progress_desc');
  // Active hovered/selected teacher for highlight
  const [activeTeacherId, setActiveTeacherId] = useState<string | null>(null);

  // Helper status checkers
  const getRppStatus = (t: Teacher): string => {
    if (t.rppStatus) return t.rppStatus;
    if (t.status === 'Selesai' || t.scorePlan >= 70) return 'Selesai';
    if (t.scorePlan > 0) return 'Draft';
    return 'Belum Lengkap';
  };

  const getObsStatus = (t: Teacher): string => {
    if (t.obsStatus) return t.obsStatus;
    if (t.scoreObs > 0) return 'Selesai';
    if (t.scheduleDate) return 'Terjadwal';
    return 'Belum Terlaksana';
  };

  // Transform teachers data for Recharts
  const chartData = useMemo(() => {
    return teachers.map((t) => {
      const rStatus = getRppStatus(t);
      const oStatus = getObsStatus(t);

      // Tahap 1: Telaah RPP (bobot 50%)
      let rppProgress = 0;
      if (rStatus === 'Selesai') {
        rppProgress = 50;
      } else if (rStatus === 'Draft') {
        rppProgress = 25;
      } else {
        rppProgress = 0;
      }

      // Tahap 2: Observasi Kelas (bobot 50%)
      let obsProgress = 0;
      if (oStatus === 'Selesai') {
        obsProgress = 50;
      } else if (oStatus === 'Terjadwal') {
        obsProgress = 25;
      } else {
        obsProgress = 0;
      }

      const totalProgress = rppProgress + obsProgress;

      // Extract short name for Y-Axis readability
      const shortName = t.name.split(',')[0].trim();
      const unitCode = t.unit.includes('SDLB') 
        ? 'SDLB' 
        : t.unit.includes('SMPLB') 
          ? 'SMPLB' 
          : t.unit.includes('SMALB') 
            ? 'SMALB' 
            : 'SLB';

      return {
        id: t.id,
        name: t.name,
        shortName: `${shortName} (${unitCode})`,
        rawShortName: shortName,
        nip: t.nip,
        unit: unitCode,
        fullUnit: t.unit,
        subject: t.subject,
        rppProgress,
        obsProgress,
        totalProgress,
        scorePlan: t.scorePlan || 0,
        scoreObs: t.scoreObs || 0,
        rppStatus: rStatus,
        obsStatus: oStatus,
        isCompleted: totalProgress === 100,
      };
    });
  }, [teachers]);

  // Filtered & sorted data for BarChart
  const processedBarData = useMemo(() => {
    let result = [...chartData];

    // Filter by unit
    if (selectedUnit !== 'Semua') {
      result = result.filter(item => item.unit === selectedUnit);
    }

    // Sort
    if (sortBy === 'progress_desc') {
      result.sort((a, b) => b.totalProgress - a.totalProgress || b.scorePlan - a.scorePlan);
    } else if (sortBy === 'progress_asc') {
      result.sort((a, b) => a.totalProgress - b.totalProgress || a.scorePlan - b.scorePlan);
    } else if (sortBy === 'name') {
      result.sort((a, b) => a.rawShortName.localeCompare(b.rawShortName));
    }

    return result;
  }, [chartData, selectedUnit, sortBy]);

  // Overall school progress statistics
  const overallStats = useMemo(() => {
    if (chartData.length === 0) return { avgProgress: 0, completedCount: 0, ongoingCount: 0, pendingCount: 0 };

    const totalProg = chartData.reduce((acc, curr) => acc + curr.totalProgress, 0);
    const avgProgress = Math.round(totalProg / chartData.length);
    const completedCount = chartData.filter(d => d.totalProgress === 100).length;
    const ongoingCount = chartData.filter(d => d.totalProgress > 0 && d.totalProgress < 100).length;
    const pendingCount = chartData.filter(d => d.totalProgress === 0).length;

    return { avgProgress, completedCount, ongoingCount, pendingCount };
  }, [chartData]);

  // Donut distribution data for PieChart
  const pieDistributionData = useMemo(() => {
    const tuntas100 = chartData.filter(d => d.totalProgress === 100).length;
    const progres75 = chartData.filter(d => d.totalProgress === 75).length;
    const progres50 = chartData.filter(d => d.totalProgress === 50).length;
    const progres25 = chartData.filter(d => d.totalProgress === 25).length;
    const belumMulai = chartData.filter(d => d.totalProgress === 0).length;

    return [
      { name: 'Tuntas (100%)', count: tuntas100, color: '#10b981' },
      { name: 'Hampir Tuntas (75%)', count: progres75, color: '#0d9488' },
      { name: 'Separuh Jalan (50%)', count: progres50, color: '#8b5cf6' },
      { name: 'Tahap Awal (25%)', count: progres25, color: '#f59e0b' },
      { name: 'Belum Mulai (0%)', count: belumMulai, color: '#94a3b8' },
    ].filter(item => item.count > 0);
  }, [chartData]);

  // Average per unit data
  const unitComparisonData = useMemo(() => {
    const units = ['SDLB', 'SMPLB', 'SMALB'];
    return units.map(u => {
      const unitItems = chartData.filter(d => d.unit === u);
      const totalProg = unitItems.reduce((acc, d) => acc + d.totalProgress, 0);
      const avgProg = unitItems.length > 0 ? Math.round(totalProg / unitItems.length) : 0;
      const tuntasCount = unitItems.filter(d => d.totalProgress === 100).length;
      return {
        unit: u,
        avgProgress: avgProg,
        totalTeachers: unitItems.length,
        tuntasCount
      };
    });
  }, [chartData]);

  // Handle clicking teacher row or bar
  const handleTeacherClick = (teacherId: string, targetTab: TabType = 'pra') => {
    if (onNavigateToTeacher) {
      onNavigateToTeacher(teacherId, targetTab);
    } else {
      setActiveTab(targetTab);
    }
  };

  // Custom Tooltip Renderer
  const CustomBarTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900/95 backdrop-blur-md text-white text-xs p-4 rounded-xl shadow-2xl border border-slate-700 max-w-xs space-y-2.5 z-50">
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="font-extrabold text-sm text-emerald-400">{data.name}</span>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                {data.unit}
              </span>
            </div>
            <div className="text-[11px] text-slate-300 mt-0.5">{data.subject}</div>
          </div>

          <div className="p-2.5 bg-slate-800/80 rounded-lg space-y-2 border border-slate-700/60">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300 font-medium">Total Progres Supervisi:</span>
              <span className="text-sm font-black text-emerald-400">{data.totalProgress}%</span>
            </div>
            <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden flex">
              <div 
                style={{ width: `${data.rppProgress}%` }} 
                className="bg-purple-500 h-full"
                title={`Tahap 1: ${data.rppProgress}%`}
              />
              <div 
                style={{ width: `${data.obsProgress}%` }} 
                className="bg-emerald-500 h-full"
                title={`Tahap 2: ${data.obsProgress}%`}
              />
            </div>
          </div>

          <div className="space-y-1.5 text-[11px]">
            <div className="flex justify-between items-center">
              <span className="text-purple-300 font-medium flex items-center gap-1">
                <FileCheck className="w-3 h-3" />
                Tahap 1 (Telaah RPP):
              </span>
              <span className="font-semibold text-white">
                {data.rppStatus} {data.scorePlan > 0 ? `(${data.scorePlan}%)` : ''}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-emerald-300 font-medium flex items-center gap-1">
                <Eye className="w-3 h-3" />
                Tahap 2 (Observasi):
              </span>
              <span className="font-semibold text-white">
                {data.obsStatus} {data.scoreObs > 0 ? `(${data.scoreObs}%)` : ''}
              </span>
            </div>
          </div>

          {currentRole === 'kepsek' && (
            <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-400 text-center italic">
              Klik batang untuk langsung membuka lembar supervisi
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <section className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-6">
      {/* Section Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
                  Visualisasi Real-Time Progres Supervisi Tiap Guru
                </h3>
                {/* Real-time Indicator Badge */}
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Real-Time Sync</span>
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Pemantauan persentase penyelesaian supervisi akademik (Tahap 1: Telaah RPP 50% + Tahap 2: Observasi Kelas 50%)
              </p>
            </div>
          </div>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setChartMode('progress')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center space-x-1.5 ${
              chartMode === 'progress'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Persentase Progres (0 - 100%)</span>
          </button>
          <button
            onClick={() => setChartMode('scores')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center space-x-1.5 ${
              chartMode === 'scores'
                ? 'bg-white text-purple-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Capaian Skor (%)</span>
          </button>
        </div>
      </div>

      {/* Filter and Sorting Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 pt-1 border-t border-slate-100">
        <div className="flex items-center space-x-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs font-medium text-slate-500">Unit Sekolah:</span>
          <div className="flex space-x-1">
            {['Semua', 'SDLB', 'SMPLB', 'SMALB'].map((unit) => (
              <button
                key={unit}
                onClick={() => setSelectedUnit(unit)}
                className={`px-2.5 py-1 text-xs rounded-lg transition cursor-pointer ${
                  selectedUnit === unit
                    ? 'bg-emerald-700 text-white font-bold shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {unit}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs font-medium text-slate-500">Urutkan:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="text-xs bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-2.5 py-1 font-medium focus:outline-emerald-600 cursor-pointer"
          >
            <option value="progress_desc">Progres Tertinggi ↓</option>
            <option value="progress_asc">Progres Terendah ↑</option>
            <option value="name">Nama Pendidik (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Horizontal Bar Chart of Every Teacher (8 cols) */}
        <div className="lg:col-span-8 bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 sm:p-5 space-y-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1">
            <h4 className="font-bold text-slate-800 text-xs sm:text-sm flex items-center space-x-1.5">
              <span>Grafik Real-Time Tiap Pendidik ({processedBarData.length} Guru)</span>
            </h4>
            <div className="text-[11px] text-slate-500 flex items-center gap-3">
              {chartMode === 'progress' ? (
                <>
                  <span className="inline-flex items-center gap-1 font-medium text-purple-700">
                    <span className="w-2.5 h-2.5 rounded-sm bg-purple-500 inline-block" />
                    Tahap 1: Telaah RPP (Maks 50%)
                  </span>
                  <span className="inline-flex items-center gap-1 font-medium text-emerald-700">
                    <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" />
                    Tahap 2: Observasi (Maks 50%)
                  </span>
                </>
              ) : (
                <>
                  <span className="inline-flex items-center gap-1 font-medium text-purple-700">
                    <span className="w-2.5 h-2.5 rounded-sm bg-purple-500 inline-block" />
                    Skor Telaah RPP
                  </span>
                  <span className="inline-flex items-center gap-1 font-medium text-teal-700">
                    <span className="w-2.5 h-2.5 rounded-sm bg-teal-500 inline-block" />
                    Skor Observasi Kelas
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Recharts BarChart Container */}
          <div 
            className="w-full" 
            style={{ height: Math.max(340, processedBarData.length * 48) }}
          >
            <ResponsiveContainer width="100%" height="100%">
              {chartMode === 'progress' ? (
                <BarChart
                  data={processedBarData}
                  layout="vertical"
                  margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
                  onClick={(state: any) => {
                    if (state && state.activePayload && state.activePayload.length) {
                      const teacherId = state.activePayload[0].payload.id;
                      handleTeacherClick(teacherId, 'pra');
                    }
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis 
                    type="number" 
                    domain={[0, 100]} 
                    tickFormatter={(v) => `${v}%`}
                    tick={{ fontSize: 11, fill: '#64748b' }}
                  />
                  <YAxis 
                    type="category" 
                    dataKey="shortName" 
                    width={150}
                    tick={{ fontSize: 11, fill: '#334155', fontWeight: 500 }}
                  />
                  <Tooltip content={<CustomBarTooltip />} />
                  <ReferenceLine 
                    x={50} 
                    stroke="#9333ea" 
                    strokeDasharray="4 4" 
                    label={{ value: 'Tahap 1 (50%)', fill: '#9333ea', fontSize: 10, position: 'top' }} 
                  />
                  <ReferenceLine 
                    x={100} 
                    stroke="#10b981" 
                    strokeWidth={2}
                    label={{ value: 'Tuntas 100%', fill: '#059669', fontSize: 10, position: 'top' }} 
                  />
                  <Bar 
                    dataKey="rppProgress" 
                    stackId="progress" 
                    fill="#8b5cf6" 
                    name="Tahap 1 (RPP)" 
                    radius={[0, 0, 0, 0]}
                    cursor="pointer"
                  >
                    {processedBarData.map((entry) => (
                      <Cell 
                        key={`cell-rpp-${entry.id}`} 
                        fill={entry.id === currentTeacherId && currentRole === 'guru' ? '#6366f1' : '#8b5cf6'} 
                      />
                    ))}
                  </Bar>
                  <Bar 
                    dataKey="obsProgress" 
                    stackId="progress" 
                    fill="#10b981" 
                    name="Tahap 2 (Observasi)" 
                    radius={[0, 6, 6, 0]}
                    cursor="pointer"
                  >
                    {processedBarData.map((entry) => (
                      <Cell 
                        key={`cell-obs-${entry.id}`} 
                        fill={entry.id === currentTeacherId && currentRole === 'guru' ? '#06b6d4' : '#10b981'} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              ) : (
                <BarChart
                  data={processedBarData}
                  layout="vertical"
                  margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
                  onClick={(state: any) => {
                    if (state && state.activePayload && state.activePayload.length) {
                      const teacherId = state.activePayload[0].payload.id;
                      handleTeacherClick(teacherId, 'reports');
                    }
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis 
                    type="number" 
                    domain={[0, 100]} 
                    tickFormatter={(v) => `${v}%`}
                    tick={{ fontSize: 11, fill: '#64748b' }}
                  />
                  <YAxis 
                    type="category" 
                    dataKey="shortName" 
                    width={150}
                    tick={{ fontSize: 11, fill: '#334155', fontWeight: 500 }}
                  />
                  <Tooltip content={<CustomBarTooltip />} />
                  <ReferenceLine 
                    x={70} 
                    stroke="#dc2626" 
                    strokeDasharray="4 4" 
                    label={{ value: 'Standar KKM (70)', fill: '#dc2626', fontSize: 10, position: 'top' }} 
                  />
                  <Bar 
                    dataKey="scorePlan" 
                    fill="#9333ea" 
                    name="Skor Telaah RPP" 
                    radius={[0, 4, 4, 0]}
                    barSize={12}
                    cursor="pointer"
                  />
                  <Bar 
                    dataKey="scoreObs" 
                    fill="#0d9488" 
                    name="Skor Observasi Kelas" 
                    radius={[0, 4, 4, 0]}
                    barSize={12}
                    cursor="pointer"
                  />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-200">
            <span className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-slate-400" />
              <span>Tip: Klik batang grafik guru untuk menelaah RPP atau mengisi observasi kelas langsung.</span>
            </span>
            <span className="font-semibold text-slate-700">
              Target Ketercapaian: 100% (Kedua Tahap Tuntas)
            </span>
          </div>
        </div>

        {/* Right Column: Breakdown & School Summary (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Donut Chart: Distribusi Ketercapaian */}
          <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-800 text-xs sm:text-sm flex items-center space-x-1.5">
                <PieIcon className="w-4 h-4 text-emerald-700" />
                <span>Distribusi Ketercapaian Supervisi</span>
              </h4>
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                Rata-rata: {overallStats.avgProgress}%
              </span>
            </div>

            {/* Recharts PieChart */}
            <div className="relative h-44 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={46}
                    outerRadius={68}
                    paddingAngle={4}
                    dataKey="count"
                  >
                    {pieDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any, name: any) => [`${value} Guru`, name]}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff', fontSize: '11px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Inner Center Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-black text-slate-900 leading-none">
                  {overallStats.avgProgress}%
                </span>
                <span className="text-[10px] text-slate-400 font-medium mt-0.5">
                  Progres Rata-rata
                </span>
              </div>
            </div>

            {/* Pie Legend List */}
            <div className="space-y-1.5 text-xs pt-1">
              {pieDistributionData.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between py-0.5">
                  <div className="flex items-center space-x-2">
                    <span 
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0" 
                      style={{ backgroundColor: item.color }} 
                    />
                    <span className="text-slate-600 text-[11px]">{item.name}</span>
                  </div>
                  <span className="font-bold text-slate-800 text-[11px]">
                    {item.count} Guru ({Math.round((item.count / chartData.length) * 100)}%)
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Unit Comparison Cards */}
          <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-800 text-xs sm:text-sm flex items-center space-x-1.5">
                <School className="w-4 h-4 text-purple-700" />
                <span>Rata-rata per Jenjang Pendidikan</span>
              </h4>
            </div>

            <div className="space-y-2.5">
              {unitComparisonData.map((u) => (
                <div 
                  key={u.unit} 
                  className="bg-white p-3 rounded-xl border border-slate-200/70 space-y-1.5 shadow-2xs"
                >
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-800">{u.unit}</span>
                    <span className="font-extrabold text-emerald-800">{u.avgProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div 
                      style={{ width: `${u.avgProgress}%` }}
                      className="bg-gradient-to-r from-purple-500 to-emerald-500 h-full rounded-full transition-all"
                    />
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-slate-400">
                    <span>{u.totalTeachers} Guru Terdaftar</span>
                    <span>{u.tuntasCount} Tuntas 100%</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Action Button */}
            <div className="pt-2">
              <button
                onClick={() => setActiveTab('reports')}
                className="w-full py-2 px-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition cursor-pointer shadow-xs"
              >
                <span>Buka Rekapitulasi Supervisi Lengkap</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
