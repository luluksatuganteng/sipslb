import React, { useState } from 'react';
import { ShieldCheck, User, ChevronDown, Check, LogOut, Lock, KeyRound } from 'lucide-react';
import { UserRole, Teacher } from '../types';
import { schoolConfig } from '../data/schoolConfig';

interface HeaderBannerProps {
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  currentTeacherId?: string;
  setCurrentTeacherId: (id: string) => void;
  teachers: Teacher[];
}

export const HeaderBanner: React.FC<HeaderBannerProps> = ({
  currentRole,
  setCurrentRole,
  currentTeacherId,
  setCurrentTeacherId,
  teachers
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const selectedTeacher = teachers.find(t => t.id === currentTeacherId) || teachers[0];

  const handleSelectRole = (role: UserRole, teacherId?: string) => {
    setCurrentRole(role);
    if (teacherId) {
      setCurrentTeacherId(teacherId);
    }
    setDropdownOpen(false);
  };

  return (
    <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 no-print">
      {/* Current Active Account Pill */}
      <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
        <div
          className={`flex items-center space-x-2.5 px-3.5 py-1.5 rounded-xl border text-xs font-medium shadow-xs transition ${
            currentRole === 'kepsek'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
              : 'bg-indigo-50 border-indigo-300 text-indigo-950'
          }`}
        >
          <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                currentRole === 'kepsek' ? 'bg-emerald-400' : 'bg-indigo-400'
              }`}
            ></span>
            <span
              className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                currentRole === 'kepsek' ? 'bg-emerald-600' : 'bg-indigo-600'
              }`}
            ></span>
          </span>

          <div className="truncate flex items-center gap-1.5">
            {currentRole === 'kepsek' ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0" />
                <span className="text-emerald-700 font-semibold">Login: Kepala Sekolah</span>
                <span className="text-slate-400">·</span>
                <strong className="text-emerald-950 font-bold truncate">{schoolConfig.principal}</strong>
                <span className="text-[10px] bg-emerald-200/70 text-emerald-800 px-1.5 py-0.5 rounded font-bold ml-1 hidden md:inline">
                  HAK AKSES PENUH
                </span>
              </>
            ) : (
              <>
                <User className="w-3.5 h-3.5 text-indigo-700 flex-shrink-0" />
                <span className="text-indigo-700 font-semibold">Login: Guru SLB</span>
                <span className="text-slate-400">·</span>
                <strong className="text-indigo-950 font-bold truncate">{selectedTeacher?.name}</strong>
                <span className="text-[10px] bg-indigo-200/70 text-indigo-800 px-1.5 py-0.5 rounded font-bold ml-1 hidden md:inline">
                  INPUT & EDIT RPP / RPI
                </span>
              </>
            )}
          </div>
        </div>

        {/* Switch Role Button */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <span>Ganti Hak Akses</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
          </button>

          {/* Role selection dropdown */}
          {dropdownOpen && (
            <>
              <div 
                className="fixed inset-0 z-30" 
                onClick={() => setDropdownOpen(false)} 
              />
              <div className="absolute left-0 sm:left-auto sm:right-0 mt-1.5 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl z-40 p-2 space-y-1 text-xs animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-2 border-b border-slate-100">
                  <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                    Pilih Peran Pengguna (Hak Akses)
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Uji coba navigasi & kewenangan Kepala Sekolah vs Guru
                  </p>
                </div>

                {/* Option: Kepala Sekolah */}
                <button
                  type="button"
                  onClick={() => handleSelectRole('kepsek')}
                  className={`w-full text-left p-2.5 rounded-xl transition flex items-start justify-between ${
                    currentRole === 'kepsek'
                      ? 'bg-emerald-50 text-emerald-950 border border-emerald-200'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-1.5 font-bold text-slate-900">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Kepala Sekolah (Hak Akses Penuh)</span>
                    </div>
                    <p className="text-[11px] text-slate-500 pl-5">
                      Kelola guru, rubrik telaah, observasi kelas, evaluasi & cetak laporan resmi.
                    </p>
                  </div>
                  {currentRole === 'kepsek' && (
                    <Check className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
                  )}
                </button>

                {/* Divider */}
                <div className="pt-1 pb-1 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Masuk sebagai Guru (Hanya Edit RPP / RPI)
                </div>

                {/* List of Teachers */}
                <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
                  {teachers.map((t) => {
                    const isSelected = currentRole === 'guru' && currentTeacherId === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => handleSelectRole('guru', t.id)}
                        className={`w-full text-left p-2 rounded-lg transition flex items-center justify-between text-[11px] ${
                          isSelected
                            ? 'bg-indigo-50 text-indigo-950 font-semibold border border-indigo-200'
                            : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="truncate">
                          <div className="font-semibold truncate">{t.name}</div>
                          <div className="text-[10px] text-slate-400 truncate">{t.unit}</div>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-indigo-700 flex-shrink-0 ml-1" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Permission helper tag */}
      <div className="flex items-center space-x-2 text-[11px] font-medium">
        {currentRole === 'kepsek' ? (
          <span className="inline-flex items-center space-x-1 bg-emerald-100/80 text-emerald-800 px-2.5 py-1 rounded-lg">
            <Lock className="w-3 h-3 text-emerald-700" />
            <span>Mode: Administrator Utama (Super Admin)</span>
          </span>
        ) : (
          <span className="inline-flex items-center space-x-1 bg-amber-100/80 text-amber-800 px-2.5 py-1 rounded-lg">
            <Lock className="w-3 h-3 text-amber-700" />
            <span>Mode Guru: Terkunci di Menu Telaah & Input RPP/RPI</span>
          </span>
        )}
      </div>
    </div>
  );
};
