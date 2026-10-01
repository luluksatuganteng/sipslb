import React from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  CalendarDays, 
  UserCheck, 
  Eye, 
  LineChart, 
  Printer, 
  Menu, 
  X,
  Sparkles,
  Lock,
  ShieldCheck,
  User
} from 'lucide-react';
import { TabType, UserRole } from '../types';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  currentRole: UserRole;
  currentTeacherName?: string;
  onOpenAIModal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab,
  currentRole,
  currentTeacherName,
  onOpenAIModal 
}) => {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  // Define nav items with role access rules
  // If role === 'guru', only 'pra' (RPP/RPI) and 'dashboard' (view-only overview) or 'schedule' (view) are accessible
  const navItems: { 
    id: TabType; 
    label: string; 
    icon: React.ElementType; 
    tag?: string;
    allowedRoles: UserRole[];
    highlightForGuru?: boolean;
  }[] = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: LayoutDashboard,
      allowedRoles: ['kepsek', 'guru'] 
    },
    { 
      id: 'pra', 
      label: 'Input & Telaah RPP / RPI', 
      icon: UserCheck, 
      tag: 'Bisa Diedit Guru',
      allowedRoles: ['kepsek', 'guru'],
      highlightForGuru: true
    },
    { 
      id: 'program', 
      label: 'Program Perencanaan (Bab 3)', 
      icon: FileText, 
      tag: 'Bab 3',
      allowedRoles: ['kepsek'] 
    },
    { 
      id: 'schedule', 
      label: 'Jadwal & Profil Guru', 
      icon: CalendarDays,
      allowedRoles: ['kepsek'] 
    },
    { 
      id: 'observation', 
      label: 'Observasi Kelas (Lampiran 6)', 
      icon: Eye, 
      tag: 'Khusus KS',
      allowedRoles: ['kepsek'] 
    },
    { 
      id: 'evaluation', 
      label: 'Evaluasi & Refleksi KS', 
      icon: LineChart, 
      tag: 'Khusus KS',
      allowedRoles: ['kepsek'] 
    },
    { 
      id: 'reports', 
      label: 'Dokumen & Cetak Laporan', 
      icon: Printer, 
      tag: 'Resmi',
      allowedRoles: ['kepsek'] 
    },
  ];

  const handleSelect = (tab: TabType, isAllowed: boolean) => {
    if (!isAllowed) {
      alert('Akses Terbatas: Menu ini hanya dapat diakses dan diedit oleh Kepala Sekolah.');
      return;
    }
    setActiveTab(tab);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Top Header */}
      <div className="md:hidden bg-slate-900 text-white px-4 py-3 flex items-center justify-between shadow-md z-40 sticky top-0 no-print">
        <div className="flex items-center space-x-3">
          <img 
            src="https://i.ibb.co.com/HT7X9Gjq/logo-slb-ponjong.png" 
            alt="Logo SLB Muhammadiyah Ponjong" 
            className="w-8 h-8 object-contain bg-white rounded p-0.5" 
          />
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white leading-tight">SIPENDA SLB</h1>
            <p className="text-[10px] text-emerald-400 font-medium">SLB Muhammadiyah Ponjong</p>
          </div>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 text-slate-300 hover:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          aria-label="Toggle navigation"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Backdrop for mobile */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 md:hidden no-print"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main Sidebar Desktop & Mobile Drawer */}
      <aside 
        className={`fixed md:sticky top-0 left-0 h-screen w-72 bg-slate-900 text-slate-200 z-50 flex flex-col justify-between border-r border-slate-800 transition-transform duration-300 ease-in-out no-print ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-5 flex-1 flex flex-col min-h-0 overflow-y-auto">
          {/* Logo & School Header */}
          <div className="flex items-center space-x-3.5 pb-6 border-b border-slate-400">
            <div className="w-12 h-12 rounded-xl bg-white/95 p-1.5 flex items-center justify-center shadow-inner flex-shrink-0">
              <img 
                src="https://i.ibb.co.com/HT7X9Gjq/logo-slb-ponjong.png" 
                alt="Logo SLB Muhammadiyah Ponjong" 
                className="w-full h-full object-contain" 
              />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">SI-SUPERVISI</div>
              <h2 className="text-base font-extrabold text-white tracking-tight leading-tight truncate">SIPENDA SLB</h2>
              <p className="text-[11px] text-slate-400 truncate">SLB Muhammadiyah Ponjong</p>
            </div>
          </div>

          {/* User Role Badge in Sidebar */}
          <div className="mt-4 p-3 rounded-xl bg-slate-800/80 border border-slate-700/70 text-xs">
            <div className="flex items-center space-x-2">
              {currentRole === 'kepsek' ? (
                <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              ) : (
                <User className="w-4 h-4 text-indigo-400 flex-shrink-0" />
              )}
              <span className="font-bold text-white uppercase text-[11px]">
                {currentRole === 'kepsek' ? 'Kepala Sekolah' : 'Pendidik / Guru'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 leading-snug truncate">
              {currentRole === 'kepsek' 
                ? 'Hak Akses Penuh: Edit & Input Seluruh Instrumen'
                : `Akses: ${currentTeacherName || 'Guru'} (Input RPP/RPI)`}
            </p>
          </div>

          {/* Navigation Links */}
          <nav className="mt-5 space-y-1.5 flex-1">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2 flex items-center justify-between">
              <span>Navigasi Sistem</span>
              {currentRole === 'guru' && (
                <span className="text-[10px] text-indigo-400 lowercase font-mono">mode guru</span>
              )}
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const isAllowed = item.allowedRoles.includes(currentRole);

              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id, isAllowed)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
                    isActive
                      ? currentRole === 'guru' && item.highlightForGuru
                        ? 'bg-indigo-700 text-white shadow-md shadow-indigo-900/30'
                        : 'bg-emerald-700 text-white shadow-md shadow-emerald-900/30'
                      : isAllowed
                        ? item.highlightForGuru && currentRole === 'guru'
                          ? 'bg-indigo-950/70 text-indigo-200 border border-indigo-700/50 hover:bg-indigo-900'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        : 'text-slate-500 opacity-60 hover:bg-slate-800/40 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center space-x-3 truncate">
                    <Icon className={`w-4 h-4 flex-shrink-0 ${
                      isActive 
                        ? 'text-white' 
                        : isAllowed 
                          ? 'text-slate-400' 
                          : 'text-slate-600'
                    }`} />
                    <span className="truncate">{item.label}</span>
                  </div>

                  <div className="flex items-center space-x-1.5 flex-shrink-0">
                    {!isAllowed && (
                      <span title="Terkunci untuk akun guru">
                        <Lock className="w-3.5 h-3.5 text-slate-500" />
                      </span>
                    )}
                    {item.tag && (
                      <span className={`text-[10px] font-normal px-1.5 py-0.5 rounded ${
                        isActive 
                          ? 'bg-white/20 text-white font-medium' 
                          : item.highlightForGuru && currentRole === 'guru'
                            ? 'bg-indigo-800 text-indigo-200 font-semibold'
                            : 'text-slate-400 bg-slate-800/60'
                      }`}>
                        {item.tag}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </nav>

          {/* AI Helper Banner */}
          {onOpenAIModal && (
            <div className="mt-4 pt-4 border-t border-slate-800">
              <button
                onClick={() => {
                  setMobileOpen(false);
                  onOpenAIModal();
                }}
                className="w-full bg-gradient-to-r from-emerald-900/60 to-teal-900/60 border border-emerald-500/40 hover:border-emerald-400 p-3 rounded-xl text-left transition group"
              >
                <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold mb-1">
                  <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
                  <span>Asisten AI RPP & PPI SLB</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-tight">
                  Bantuan perumusan diferensiasi, media adaptif, & instrumen asesmen ABK.
                </p>
              </button>
            </div>
          )}
        </div>

        {/* Footer Identity */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/50 text-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <span>Tahun Ajaran</span>
            <span className="font-semibold text-slate-200">2025/2026 (Ganjil)</span>
          </div>
          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <span>Hak Akses Anda</span>
            <span className={`font-semibold ${currentRole === 'kepsek' ? 'text-emerald-400' : 'text-indigo-400'}`}>
              {currentRole === 'kepsek' ? 'Hak Penuh (KS)' : 'Guru (Edit RPP/RPI)'}
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};
