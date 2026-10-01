export type RppCompletionStatus = 'Selesai' | 'Draft' | 'Belum Lengkap';
export type ObsCompletionStatus = 'Selesai' | 'Terjadwal' | 'Belum Terlaksana';

export interface Teacher {
  id: string;
  name: string;
  nip: string;
  unit: string;
  phase: string;
  subject: string;
  problemId: string;
  rootCause: string;
  solution: string;
  scheduleDate: string;
  scheduleTime: string;
  status: 'Terjadwal' | 'Selesai';
  scorePlan: number;
  scoreObs: number;
  notes: string;
  rppStatus?: RppCompletionStatus;
  obsStatus?: ObsCompletionStatus;
}

export interface SchoolConfig {
  npsn: string;
  name: string;
  address: string;
  principal: string;
  principalNip: string;
  academicYear: string;
  semester: string;
  city: string;
  dateReport: string;
}

export interface RubricItem {
  id: number;
  aspect: string;
  desc?: string;
  category?: string;
  scores: {
    0: string;
    1: string;
    2: string;
    3: string;
    4: string;
  };
  max: number;
}

export interface CoachingData {
  tujuan: string;
  strategi: string;
  aktivitas: string;
  asesmen: string;
  kendala: string;
}

export interface ObservationData {
  kelebihan: string;
  perbaikan: string;
  rekomendasi: string;
}

export type UserRole = 'kepsek' | 'guru';

export interface UserSession {
  role: UserRole;
  teacherId?: string; // If role is 'guru', which teacher is logged in
}

export type TabType = 
  | 'dashboard' 
  | 'program' 
  | 'schedule' 
  | 'pra' 
  | 'observation' 
  | 'evaluation' 
  | 'reports';
