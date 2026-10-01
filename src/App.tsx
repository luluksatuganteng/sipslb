import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { HeaderBanner } from './components/HeaderBanner';
import { DashboardView } from './components/DashboardView';
import { ProgramView } from './components/ProgramView';
import { ScheduleView } from './components/ScheduleView';
import { PraObservasiView } from './components/PraObservasiView';
import { ObservationView } from './components/ObservationView';
import { EvaluationView } from './components/EvaluationView';
import { ReportsView } from './components/ReportsView';
import { AICoachingModal } from './components/AICoachingModal';
import { Teacher, TabType, UserRole } from './types';
import { initialTeachers } from './data/initialTeachers';
import { RotateCcw } from 'lucide-react';

const STORAGE_KEY = 'sipenda_slb_ponjong_teachers_v1';
const ROLE_STORAGE_KEY = 'sipenda_slb_ponjong_role_v1';
const TEACHER_STORAGE_KEY = 'sipenda_slb_ponjong_current_teacher_v1';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);

  // User role state: 'kepsek' (Hak Akses Penuh) vs 'guru' (Hanya Edit RPP/RPI)
  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    try {
      const savedRole = localStorage.getItem(ROLE_STORAGE_KEY);
      if (savedRole === 'kepsek' || savedRole === 'guru') {
        return savedRole;
      }
    } catch (e) {
      console.error(e);
    }
    return 'kepsek'; // Default awal: Kepala Sekolah
  });

  // Current active teacher ID if role is 'guru'
  const [currentTeacherId, setCurrentTeacherId] = useState<string>(() => {
    try {
      const savedTeacherId = localStorage.getItem(TEACHER_STORAGE_KEY);
      if (savedTeacherId) return savedTeacherId;
    } catch (e) {
      console.error(e);
    }
    return initialTeachers[0]?.id || 'guru-1';
  });

  // Selected teacher for direct navigation from Dashboard/Review
  const [selectedTeacherForView, setSelectedTeacherForView] = useState<string>(initialTeachers[0]?.id || 'guru-1');

  const handleNavigateToTeacher = (teacherId: string, tab: TabType) => {
    setSelectedTeacherForView(teacherId);
    setActiveTab(tab);
  };

  // Initialize teachers from localStorage or defaults
  const [teachers, setTeachers] = useState<Teacher[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load saved teachers:', e);
    }
    return initialTeachers;
  });

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(teachers));
    } catch (e) {
      console.error('Failed to save teachers:', e);
    }
  }, [teachers]);

  useEffect(() => {
    try {
      localStorage.setItem(ROLE_STORAGE_KEY, currentRole);
    } catch (e) {
      console.error(e);
    }
  }, [currentRole]);

  useEffect(() => {
    try {
      localStorage.setItem(TEACHER_STORAGE_KEY, currentTeacherId);
    } catch (e) {
      console.error(e);
    }
  }, [currentTeacherId]);

  // If role is changed to 'guru' and the current active tab is restricted, redirect to 'pra' or 'dashboard'
  useEffect(() => {
    if (currentRole === 'guru') {
      const restrictedTabs: TabType[] = ['program', 'schedule', 'observation', 'evaluation', 'reports'];
      if (restrictedTabs.includes(activeTab)) {
        setActiveTab('pra');
      }
    }
  }, [currentRole, activeTab]);

  const handleResetData = () => {
    if (window.confirm('Reset data ke kondisi awal SLB Muhammadiyah Ponjong? Perubahan yang belum dicetak akan dikembalikan.')) {
      setTeachers(initialTeachers);
      setCurrentRole('kepsek');
      setCurrentTeacherId(initialTeachers[0].id);
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(ROLE_STORAGE_KEY);
      localStorage.removeItem(TEACHER_STORAGE_KEY);
    }
  };

  const currentTeacherObj = teachers.find(t => t.id === currentTeacherId) || teachers[0];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row font-sans">
      {/* Sidebar Navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        currentRole={currentRole}
        currentTeacherName={currentTeacherObj?.name}
        onOpenAIModal={() => setIsAIModalOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-12">
        {/* Top Role Switcher & Direct Access Banner */}
        <HeaderBanner 
          currentRole={currentRole}
          setCurrentRole={setCurrentRole}
          currentTeacherId={currentTeacherId}
          setCurrentTeacherId={setCurrentTeacherId}
          teachers={teachers}
        />

        {/* Dynamic View Router */}
        <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          {activeTab === 'dashboard' && (
            <DashboardView 
              teachers={teachers} 
              setActiveTab={setActiveTab} 
              currentRole={currentRole}
              currentTeacherId={currentTeacherId}
              onOpenAIModal={() => setIsAIModalOpen(true)}
              onNavigateToTeacher={handleNavigateToTeacher}
            />
          )}

          {activeTab === 'program' && (
            <ProgramView teachers={teachers} />
          )}

          {activeTab === 'schedule' && (
            <ScheduleView 
              teachers={teachers} 
              setTeachers={setTeachers} 
              isKepsek={currentRole === 'kepsek'} 
            />
          )}

          {activeTab === 'pra' && (
            <PraObservasiView 
              teachers={teachers} 
              setTeachers={setTeachers} 
              currentRole={currentRole}
              currentTeacherId={currentTeacherId}
              onOpenAIModal={() => setIsAIModalOpen(true)}
              initialSelectedTeacherId={selectedTeacherForView}
            />
          )}

          {activeTab === 'observation' && (
            <ObservationView 
              teachers={teachers} 
              setTeachers={setTeachers} 
              isKepsek={currentRole === 'kepsek'} 
              onOpenAIModal={() => setIsAIModalOpen(true)}
              initialSelectedTeacherId={selectedTeacherForView}
            />
          )}

          {activeTab === 'evaluation' && (
            <EvaluationView teachers={teachers} />
          )}

          {activeTab === 'reports' && (
            <ReportsView 
              teachers={teachers} 
              initialTeacherId={selectedTeacherForView}
            />
          )}

          {/* Bottom helper row (hidden during printing) */}
          <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 gap-2 no-print">
            <p>
              SIPENDA SLB · Sistem Supervisi & Penjaminan Mutu SLB Muhammadiyah Ponjong
            </p>
            <div className="flex items-center space-x-4">
              <span className="text-[11px] text-slate-400">
                Akses saat ini: <strong className={currentRole === 'kepsek' ? 'text-emerald-700' : 'text-indigo-700'}>
                  {currentRole === 'kepsek' ? 'Kepala Sekolah (Penuh)' : `Guru (${currentTeacherObj?.name})`}
                </strong>
              </span>
              <button
                onClick={handleResetData}
                className="text-[11px] text-slate-400 hover:text-slate-600 flex items-center space-x-1 transition cursor-pointer"
                title="Reset ke data awal"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Data Default</span>
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* AI Coaching Assistant Modal */}
      <AICoachingModal 
        isOpen={isAIModalOpen} 
        onClose={() => setIsAIModalOpen(false)} 
      />
    </div>
  );
}
