import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Calendar, 
  Clock, 
  X, 
  Check, 
  Save, 
  UserPlus,
  BookOpen
} from 'lucide-react';
import { Teacher } from '../types';

interface ScheduleViewProps {
  teachers: Teacher[];
  setTeachers: React.Dispatch<React.SetStateAction<Teacher[]>>;
  isKepsek?: boolean;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({ 
  teachers, 
  setTeachers,
  isKepsek = true 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [unitFilter, setUnitFilter] = useState('Semua');
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [formData, setFormData] = useState<Partial<Teacher>>({
    name: '',
    nip: '',
    unit: 'SDLB (Tunarungu / Hambatan Pendengaran)',
    phase: 'Fase A (Kelas 1-2)',
    subject: 'Tematik & Bina Diri',
    problemId: 'Perlu penguatan strategi pembelajaran aktif multisensori.',
    rootCause: 'Guru memerlukan pengembangan variasi media pembelajaran adaptif.',
    solution: 'Pendampingan klinis & eksplorasi media pembelajaran konkret.',
    scheduleDate: new Date().toISOString().split('T')[0],
    scheduleTime: '08.00 - 09.20',
    status: 'Terjadwal',
    scorePlan: 70,
    scoreObs: 0,
    notes: 'Jadwal supervisi baru telah didaftarkan.'
  });

  const filteredTeachers = teachers.filter((t) => {
    const matchesSearch = 
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.unit.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesUnit = 
      unitFilter === 'Semua' ? true : t.unit.includes(unitFilter);

    return matchesSearch && matchesUnit;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    const newTeacher: Teacher = {
      id: `guru-${Date.now()}`,
      name: formData.name || '',
      nip: formData.nip || '-',
      unit: formData.unit || 'SDLB',
      phase: formData.phase || 'Fase A',
      subject: formData.subject || 'Tematik',
      problemId: formData.problemId || 'Identifikasi awal pembelajaran',
      rootCause: formData.rootCause || 'Pengembangan strategi diferensiasi',
      solution: formData.solution || 'Coaching & pendampingan individual',
      scheduleDate: formData.scheduleDate || '2026-05-02',
      scheduleTime: formData.scheduleTime || '08.00 - 09.20',
      status: (formData.status as 'Terjadwal' | 'Selesai') || 'Terjadwal',
      scorePlan: formData.scorePlan || 70,
      scoreObs: formData.scoreObs || 0,
      notes: formData.notes || ''
    };

    setTeachers((prev) => [...prev, newTeacher]);
    setIsAddOpen(false);
    setFormData({
      name: '',
      nip: '',
      unit: 'SDLB (Tunarungu / Hambatan Pendengaran)',
      phase: 'Fase A (Kelas 1-2)',
      subject: 'Tematik & Bina Diri',
      problemId: 'Perlu penguatan strategi pembelajaran aktif multisensori.',
      rootCause: 'Guru memerlukan pengembangan variasi media pembelajaran adaptif.',
      solution: 'Pendampingan klinis & eksplorasi media pembelajaran konkret.',
      scheduleDate: new Date().toISOString().split('T')[0],
      scheduleTime: '08.00 - 09.20',
      status: 'Terjadwal',
      scorePlan: 70,
      scoreObs: 0,
      notes: ''
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeacher) return;

    setTeachers((prev) =>
      prev.map((t) => (t.id === editingTeacher.id ? editingTeacher : t))
    );
    setEditingTeacher(null);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Yakin ingin menghapus guru "${name}" dari daftar supervisi?`)) {
      setTeachers((prev) => prev.filter((t) => t.id !== id));
    }
  };

  const handleToggleStatus = (id: string) => {
    setTeachers((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const nextStatus = t.status === 'Terjadwal' ? 'Selesai' : 'Terjadwal';
          return { ...t, status: nextStatus };
        }
        return t;
      })
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Title & Action Bar */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-1 rounded-full font-semibold">
            JADWAL & PROFIL GURU
          </span>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            Manajemen Jadwal & Profil Pendidik SLB
          </h2>
          <p className="text-xs text-slate-500">
            Daftar lengkap guru dan rekapitulasi penilaian supervisi akademik SLB Muhammadiyah Ponjong.
          </p>
        </div>

        {isKepsek && (
          <button
            onClick={() => setIsAddOpen(true)}
            className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition flex items-center space-x-2 shadow-sm"
          >
            <UserPlus className="w-4 h-4" />
            <span>Tambah Guru Baru</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama guru atau mapel..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Unit Filter segmented tabs */}
        <div className="flex items-center space-x-1 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <span className="text-[11px] text-slate-400 font-semibold mr-1 uppercase">Unit:</span>
          {['Semua', 'SDLB', 'SMPLB', 'SMALB'].map((unit) => (
            <button
              key={unit}
              onClick={() => setUnitFilter(unit)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                unitFilter === unit
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {unit}
            </button>
          ))}
        </div>
      </div>

      {/* Teachers Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 uppercase font-semibold border-b border-slate-200 text-[11px]">
                <th className="py-3 px-4">No</th>
                <th className="py-3 px-4">Nama Guru & NIP</th>
                <th className="py-3 px-4">Unit / Ketunaan</th>
                <th className="py-3 px-4">Fase / Mapel</th>
                <th className="py-3 px-4">Jadwal Supervisi</th>
                <th className="py-3 px-4 text-center">Skor RPP</th>
                <th className="py-3 px-4 text-center">Skor Observasi</th>
                <th className="py-3 px-4 text-center">Status</th>
                {isKepsek && <th className="py-3 px-4 text-right">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700">
              {filteredTeachers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    Tidak ditemukan data pendidik yang cocok.
                  </td>
                </tr>
              ) : (
                filteredTeachers.map((t, idx) => (
                  <tr key={t.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4 font-medium text-slate-500">{idx + 1}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{t.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">NIP: {t.nip}</div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">
                      {t.unit}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{t.subject}</div>
                      <div className="text-[11px] text-slate-400">{t.phase}</div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center space-x-1.5 font-medium text-slate-800">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{t.scheduleDate}</span>
                      </div>
                      <div className="flex items-center space-x-1.5 text-[11px] text-slate-400">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{t.scheduleTime}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-purple-800">
                      <span className="bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-lg text-xs">
                        {t.scorePlan}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-emerald-800">
                      {t.scoreObs > 0 ? (
                        <span className="bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg text-xs">
                          {t.scoreObs}%
                        </span>
                      ) : (
                        <span className="text-slate-400 font-normal">-</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleToggleStatus(t.id)}
                        title="Klik untuk beralih status"
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold transition ${
                          t.status === 'Selesai'
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                        }`}
                      >
                        {t.status}
                      </button>
                    </td>
                    {isKepsek && (
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => setEditingTeacher(t)}
                            className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-slate-100 rounded-lg transition"
                            title="Edit Data Guru"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(t.id, t.name)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Hapus Data Guru"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add Teacher */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Tambah Data Guru & Jadwal Baru</h3>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Nama Guru & Gelar:</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Siti Rahmawati, S.Pd."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">NIP:</label>
                  <input
                    type="text"
                    placeholder="19920101 202001 2 001"
                    value={formData.nip}
                    onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Unit / Ketunaan:</label>
                  <input
                    type="text"
                    placeholder="SDLB (Tunarungu)"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Fase / Kelas:</label>
                  <input
                    type="text"
                    placeholder="Fase B (Kelas 4)"
                    value={formData.phase}
                    onChange={(e) => setFormData({ ...formData, phase: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Mata Pelajaran:</label>
                  <input
                    type="text"
                    placeholder="Keterampilan & Tematik"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Tanggal Supervisi:</label>
                  <input
                    type="date"
                    value={formData.scheduleDate}
                    onChange={(e) => setFormData({ ...formData, scheduleDate: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Jam Pelajaran:</label>
                  <input
                    type="text"
                    value={formData.scheduleTime}
                    onChange={(e) => setFormData({ ...formData, scheduleTime: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Identifikasi Masalah:</label>
                <textarea
                  rows={2}
                  value={formData.problemId}
                  onChange={(e) => setFormData({ ...formData, problemId: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Rencana Bantuan / Solusi KS:</label>
                <input
                  type="text"
                  value={formData.solution}
                  onChange={(e) => setFormData({ ...formData, solution: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 text-white rounded-xl font-semibold hover:bg-emerald-800 transition flex items-center space-x-1.5 shadow"
                >
                  <Save className="w-4 h-4" />
                  <span>Tambahkan Guru</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit Teacher */}
      {editingTeacher && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Edit Profil Guru & Jadwal Supervisi</h3>
              <button onClick={() => setEditingTeacher(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Nama Guru & Gelar:</label>
                <input
                  type="text"
                  required
                  value={editingTeacher.name}
                  onChange={(e) => setEditingTeacher({ ...editingTeacher, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">NIP:</label>
                  <input
                    type="text"
                    value={editingTeacher.nip}
                    onChange={(e) => setEditingTeacher({ ...editingTeacher, nip: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Unit / Ketunaan:</label>
                  <input
                    type="text"
                    value={editingTeacher.unit}
                    onChange={(e) => setEditingTeacher({ ...editingTeacher, unit: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Fase / Kelas:</label>
                  <input
                    type="text"
                    value={editingTeacher.phase}
                    onChange={(e) => setEditingTeacher({ ...editingTeacher, phase: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Mata Pelajaran:</label>
                  <input
                    type="text"
                    value={editingTeacher.subject}
                    onChange={(e) => setEditingTeacher({ ...editingTeacher, subject: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Tanggal Supervisi:</label>
                  <input
                    type="date"
                    value={editingTeacher.scheduleDate}
                    onChange={(e) => setEditingTeacher({ ...editingTeacher, scheduleDate: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Jam Pelajaran:</label>
                  <input
                    type="text"
                    value={editingTeacher.scheduleTime}
                    onChange={(e) => setEditingTeacher({ ...editingTeacher, scheduleTime: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Skor RPP (%):</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={editingTeacher.scorePlan}
                    onChange={(e) => setEditingTeacher({ ...editingTeacher, scorePlan: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Skor Observasi (%):</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={editingTeacher.scoreObs}
                    onChange={(e) => setEditingTeacher({ ...editingTeacher, scoreObs: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Status Supervisi:</label>
                <select
                  value={editingTeacher.status}
                  onChange={(e) => setEditingTeacher({ ...editingTeacher, status: e.target.value as 'Terjadwal' | 'Selesai' })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Terjadwal">Terjadwal</option>
                  <option value="Selesai">Selesai</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end space-x-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingTeacher(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 text-white rounded-xl font-semibold hover:bg-emerald-800 transition flex items-center space-x-1.5 shadow"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
