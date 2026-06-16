import React, { useState } from 'react';
import { useDb } from '../context/DbContext';
import { Material, Assignment, Grade } from '../types';
import { 
  LayoutDashboard, 
  BookOpen, 
  FileText, 
  Award, 
  Settings, 
  Plus, 
  Edit3, 
  Trash2, 
  ExternalLink,
  ChevronRight,
  LogOut,
  CheckCircle2,
  AlertCircle,
  ToggleLeft,
  X,
  FileCheck,
  Calendar,
  Printer
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function TeacherPanel() {
  const {
    teachers,
    classes,
    subjects,
    students,
    materials, addMaterial, editMaterial, deleteMaterial,
    assignments, addAssignment, editAssignment, deleteAssignment,
    grades, gradeAssignment, resetAssignmentValue,
    currentUser, logout, updateTeacherPassword
  } = useDb();

  const [activeTab, setActiveTab] = useState<'dash' | 'materi' | 'tugas' | 'nilai' | 'setting'>('dash');

  // Identify teacher
  const currentTeacher = teachers.find(t => t.id === currentUser?.id);
  const teacherSubjects = currentTeacher?.subjectsTaught || [];

  // Flatten active classes & subjects this teacher actually teaches
  const activeClassIds = Array.from(new Set(teacherSubjects.flatMap(s => s.classIds)));
  const activeSubjectIds = Array.from(new Set(teacherSubjects.map(s => s.subjectId)));

  // States
  const [modalType, setModalType] = useState<'create' | 'edit' | 'grade' | null>(null);
  const [targetEntity, setTargetEntity] = useState<'materi' | 'tugas' | 'nilai' | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Material Form
  const [mTitle, setMTitle] = useState('');
  const [mDesc, setMDesc] = useState('');
  const [mLink, setMLink] = useState('');
  const [mClassIds, setMClassIds] = useState<string[]>([]);
  const [mSubjectId, setMSubjectId] = useState('');

  // Tugas Form
  const [tTitle, setTTitle] = useState('');
  const [tDesc, setTDesc] = useState('');
  const [tDueDate, setTDueDate] = useState('');
  const [tLink, setTLink] = useState('');
  const [tClassIds, setTClassIds] = useState<string[]>([]);
  const [tSubjectId, setTSubjectId] = useState('');
  const [tFormEnabled, setTFormEnabled] = useState(true);
  const [tPreviewEnabled, setTPreviewEnabled] = useState(true);

  // Grade Form
  const [gValue, setGValue] = useState<number>(100);
  const [gFeedback, setGFeedback] = useState('');
  const [selectedGradeItem, setSelectedGradeItem] = useState<Grade | null>(null);

  // Filter valuation
  const [selectedAsgFilter, setSelectedAsgFilter] = useState<string>('');
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Filter by Jenjang Kelas (Grade level)
  const [mGradeFilter, setMGradeFilter] = useState<'ALL' | '7' | '8' | '9'>('ALL');
  const [tGradeFilter, setTGradeFilter] = useState<'ALL' | '7' | '8' | '9'>('ALL');

  // Password Update
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [passMsg, setPassMsg] = useState({ type: '', text: '' });

  // Notifications
  const [toast, setToast] = useState('');
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  // Materials CRUD
  const handleSaveMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mTitle || mClassIds.length === 0 || !mSubjectId) return;

    if (modalType === 'create') {
      mClassIds.forEach(classId => {
        addMaterial(mTitle, mDesc, mLink, classId, mSubjectId, currentUser!.id);
      });
      triggerToast(`Materi berhasil diunggah ke ${mClassIds.length} kelas!`);
    } else if (modalType === 'edit' && editingId) {
      editMaterial(editingId, mTitle, mDesc, mLink, mClassIds[0], mSubjectId);
      triggerToast('Materi berhasil diperbarui!');
    }
    closeModal();
  };

  // Tugas CRUD
  const handleSaveAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tTitle || tClassIds.length === 0 || !tSubjectId || !tDueDate) return;

    if (modalType === 'create') {
      tClassIds.forEach(classId => {
        addAssignment(tTitle, tDesc, tDueDate, tLink, classId, tSubjectId, currentUser!.id, tFormEnabled, tPreviewEnabled);
      });
      triggerToast(`Tugas latihan berhasil diposting ke ${tClassIds.length} kelas!`);
    } else if (modalType === 'edit' && editingId) {
      editAssignment(editingId, tTitle, tDesc, tDueDate, tLink, tClassIds[0], tSubjectId, tFormEnabled, tPreviewEnabled);
      triggerToast('Tugas latihan berhasil diperbarui!');
    }
    closeModal();
  };

  // Grading Submit
  const handleSaveGrading = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGradeItem) return;
    gradeAssignment(selectedGradeItem.id, gValue, gFeedback);
    triggerToast('Nilai dan capaian berhasil dikonfirmasi!');
    closeModal();
  };

  const closeModal = () => {
    setModalType(null);
    setTargetEntity(null);
    setEditingId(null);
    setSelectedGradeItem(null);
    
    // reset form
    setMTitle('');
    setMDesc('');
    setMLink('');
    setMClassIds([]);
    setMSubjectId('');

    setTTitle('');
    setTDesc('');
    setTDueDate('');
    setTLink('');
    setTClassIds([]);
    setTSubjectId('');
    setTFormEnabled(true);
    setTPreviewEnabled(true);

    setGValue(100);
    setGFeedback('');
  };

  const openEditModal = (entity: 'materi' | 'tugas', item: any) => {
    setModalType('edit');
    setTargetEntity(entity);
    setEditingId(item.id);

    if (entity === 'materi') {
      setMTitle(item.title);
      setMDesc(item.description);
      setMLink(item.link);
      setMClassIds([item.classId]);
      setMSubjectId(item.subjectId);
    } else if (entity === 'tugas') {
      setTTitle(item.title);
      setTDesc(item.description);
      setTDueDate(item.dueDate);
      setTLink(item.link);
      setTClassIds([item.classId]);
      setTSubjectId(item.subjectId);
      setTFormEnabled(item.formEnabled);
      setTPreviewEnabled(item.previewEnabled ?? true);
    }
  };

  const openAddModal = (entity: 'materi' | 'tugas') => {
    setModalType('create');
    setTargetEntity(entity);
    
    // Auto populate subject / class if only one exists
    if (activeSubjectIds.length === 1) {
      setMSubjectId(activeSubjectIds[0]);
      setTSubjectId(activeSubjectIds[0]);
    }
    if (activeClassIds.length === 1) {
      setMClassIds([activeClassIds[0]]);
      setTClassIds([activeClassIds[0]]);
    } else {
      setMClassIds([]);
      setTClassIds([]);
    }
  };

  const openGradingModal = (gradeItem: Grade) => {
    setSelectedGradeItem(gradeItem);
    setModalType('grade');
    setTargetEntity('nilai');
    setGValue(gradeItem.grade ?? 100);
    setGFeedback(gradeItem.feedback ?? '');
  };

  // Change Password
  const handleUpdatePwd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTeacher) return;
    if (oldPass !== currentTeacher.password) {
      setPassMsg({ type: 'error', text: 'Password lama salah!' });
      return;
    }
    if (newPass.length < 5) {
      setPassMsg({ type: 'error', text: 'Password baru minimal 5 karakter!' });
      return;
    }
    updateTeacherPassword(currentTeacher.nik, newPass);
    setPassMsg({ type: 'success', text: 'Password berhasil diperbarui!' });
    setOldPass('');
    setNewPass('');
  };

  // Filter entities created by this teacher
  const teacherMaterials = materials.filter(m => m.teacherId === currentUser?.id);
  const teacherAssignments = assignments.filter(a => a.teacherId === currentUser?.id);

  // Filtered by Grade level (Jenjang Kelas) helper
  const filteredMaterials = teacherMaterials.filter(m => {
    if (mGradeFilter === 'ALL') return true;
    return m.classId.startsWith(mGradeFilter);
  });

  const filteredAssignments = teacherAssignments.filter(a => {
    if (tGradeFilter === 'ALL') return true;
    return a.classId.startsWith(tGradeFilter);
  });

  // Gather grades filtered by assignments made by this teacher
  const currentGrades = grades.filter(g => {
    const isTeacherAsg = teacherAssignments.some(a => a.id === g.assignmentId);
    if (!isTeacherAsg) return false;
    if (g.status === 'RESET' || g.status === 'NOT_SUBMITTED') return false;
    if (selectedAsgFilter && g.assignmentId !== selectedAsgFilter) return false;
    return true;
  });

  // Calculate statistics
  const ungradedCount = grades.filter(g => 
    teacherAssignments.some(a => a.id === g.assignmentId) && g.status === 'SUBMITTED'
  ).length;

  return (
    <div id="teacher-shell" className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Toast alert */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-semibold px-5 py-3 rounded-xl shadow-lg border border-slate-800 flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-100/95 text-slate-700 border-r border-slate-200 p-6 min-h-screen justify-between select-none font-sans shadow-xs">
        <div className="space-y-8">
          {/* School logo */}
          <div className="flex items-center gap-3 border-b border-slate-150 pb-5">
            <div className="bg-teal-50 p-1.5 rounded-xl border border-teal-100/60 shadow-xs">
              <img 
                src="https://www.alirsyad.or.id/wp-content/uploads/download/alirsyad-alislamiyyah.png" 
                alt="Logo Al Irsyad" 
                className="w-7 h-7 object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h1 className="font-bold text-slate-900 text-sm tracking-tight leading-none mb-1 font-serif-heading">E-Learning Guru</h1>
              <span className="text-[10px] font-mono tracking-wider text-teal-605 uppercase font-extrabold">SMP Al Irsyad</span>
            </div>
          </div>

          {/* Menus */}
          <nav className="space-y-1.5">
            <button
              onClick={() => setActiveTab('dash')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold tracking-wide transition-all duration-200 cursor-pointer border ${
                activeTab === 'dash' 
                  ? 'bg-teal-600 border-teal-700 text-white shadow-sm' 
                  : 'bg-transparent border-transparent hover:bg-slate-50 text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" /> Ringkasan
            </button>
            <button
              onClick={() => setActiveTab('materi')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold tracking-wide transition-all duration-200 cursor-pointer border ${
                activeTab === 'materi' 
                  ? 'bg-teal-600 border-teal-700 text-white shadow-sm' 
                  : 'bg-transparent border-transparent hover:bg-slate-50 text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-4 h-4" /> Kelola Materi
            </button>
            <button
              onClick={() => setActiveTab('tugas')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold tracking-wide transition-all duration-200 cursor-pointer border ${
                activeTab === 'tugas' 
                  ? 'bg-teal-600 border-teal-700 text-white shadow-sm' 
                  : 'bg-transparent border-transparent hover:bg-slate-50 text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-4 h-4" /> Kelola Tugas
            </button>
            <button
              onClick={() => setActiveTab('nilai')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold tracking-wide transition-all duration-200 cursor-pointer border ${
                activeTab === 'nilai' 
                  ? 'bg-teal-600 border-teal-700 text-white shadow-sm' 
                  : 'bg-transparent border-transparent hover:bg-slate-50 text-slate-600 hover:text-slate-900'
              }`}
            >
              <Award className="w-4 h-4" /> Kelola Nilai {ungradedCount > 0 && <span className="bg-emerald-500 text-teal-950 text-[9px] px-1.5 py-0.5 rounded-full font-bold ml-auto">{ungradedCount}</span>}
            </button>
            <button
              onClick={() => setActiveTab('setting')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold tracking-wide transition-all duration-200 cursor-pointer border ${
                activeTab === 'setting' 
                  ? 'bg-teal-600 border-teal-700 text-white shadow-sm' 
                  : 'bg-transparent border-transparent hover:bg-slate-50 text-slate-600 hover:text-slate-900'
              }`}
            >
              <Settings className="w-4 h-4" /> Pengaturan
            </button>
          </nav>
        </div>

        {/* Footer info & Logout */}
        <div className="border-t border-slate-150 pt-5 space-y-4">
          <div className="flex items-center gap-2">
            <div className="bg-teal-50 border border-teal-150 w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-teal-850">
              {currentTeacher?.name?.substring(0, 1) || 'G'}
            </div>
            <div className="max-w-[150px] overflow-hidden">
              <p className="text-xs font-bold text-slate-800 leading-none truncate">{currentTeacher?.name}</p>
              <span className="text-[10px] text-slate-400 font-mono">NIK: {currentTeacher?.nik}</span>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 hover:text-indigo-800 text-xs font-bold py-2.5 rounded-xl border border-indigo-150/70 transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" /> Keluar Sesi
          </button>
        </div>
      </aside>

      {/* MOBILE HEADER */}
      <header className="md:hidden bg-slate-100  text-slate-800 border-b border-slate-200 px-4 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-teal-600 animate-pulse" />
          <div className="text-left">
            <h1 className="font-bold text-xs text-slate-900 tracking-tight">Portal Guru Al Irsyad</h1>
            <p className="text-[9px] text-slate-500 font-mono truncate max-w-[150px]">{currentTeacher?.name}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="text-red-650 hover:text-red-700 p-2 rounded-lg bg-red-50 border border-red-100 cursor-pointer text-xs"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </header>

      {/* MOBILE MAIN WINDOW WITH DETAILED TAB-CONTENT */}
      <main id="teacher-main-pane" className="flex-1 p-4 sm:p-8 lg:p-10 pb-24 md:pb-10 overflow-y-auto font-sans text-left">
        {/* Page Title */}
        <div className="mb-8 select-none flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/50 pb-4">
          <div>
            <p className="text-xs text-slate-400 uppercase font-mono tracking-wider">HALAMAN PANEL GURU</p>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">
              {activeTab === 'dash' && `Selamat Datang, ${currentTeacher?.name}`}
              {activeTab === 'materi' && 'Kelola Ringkasan Materi'}
              {activeTab === 'tugas' && 'Bank Kompetensi Tugas'}
              {activeTab === 'nilai' && 'Penilaian & Riwayat Pengumpulan'}
              {activeTab === 'setting' && 'Seting & Keamanan Password'}
            </h2>
          </div>
        </div>

        {/* TAB 1: DASHBOARD */}
        {activeTab === 'dash' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-xs flex flex-col justify-between h-32">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Materi Terposting</p>
                <div>
                  <h3 className="text-3xl font-black text-teal-700">{teacherMaterials.length}</h3>
                  <p className="text-2xs text-slate-400 mt-1">Dokumen Pengajaran</p>
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-xs flex flex-col justify-between h-32">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tugas Dibuat</p>
                <div>
                  <h3 className="text-3xl font-black text-indigo-700">{teacherAssignments.length}</h3>
                  <p className="text-2xs text-slate-400 mt-1">Latihan Mandiri Siswa</p>
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-xs flex flex-col justify-between h-32">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Perlu Dinilai</p>
                <div>
                  <h3 className="text-3xl font-black text-rose-700">{ungradedCount}</h3>
                  <p className="text-2xs text-slate-400 mt-1">Menunggu Evaluasi Anda</p>
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-xs flex flex-col justify-between h-32">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mata Latihan</p>
                <div>
                  <h3 className="text-3xl font-black text-emerald-700">{teacherSubjects.length}</h3>
                  <p className="text-2xs text-slate-400 mt-1">Mata Pelajaran Diampu</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Taught Subjects List */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-xs lg:col-span-5 space-y-4">
                <h4 className="font-bold text-slate-900 border-b border-slate-100 pb-3">Subjek Beban Pengajaran Anda</h4>
                <div className="space-y-3">
                  {teacherSubjects.map((alloc, idx) => {
                    const sub = subjects.find(s => s.id === alloc.subjectId);
                    return (
                      <div key={idx} className="flex flex-col gap-1 border-l-2 border-teal-600 pl-3">
                        <p className="text-sm font-bold text-slate-900">{sub?.name || alloc.subjectId}</p>
                        <div className="flex gap-1.5 flex-wrap">
                          {alloc.classIds.map(clsId => (
                            <span key={clsId} className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded border">
                              {clsId}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Ungraded Submissions checklist */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-xs lg:col-span-7 space-y-4">
                <h4 className="font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
                  <span>Antrean Koreksi Terbaru</span>
                  <span className="bg-red-100 text-red-700 text-2xs px-2 py-0.5 rounded-full font-extrabold">{ungradedCount} Baru</span>
                </h4>
                
                {ungradedCount === 0 ? (
                  <p className="text-xs text-slate-400 italic text-center py-6">Semua pengumpulan tugas terkoreksi habis! Bagus sekali!</p>
                ) : (
                  <div className="divide-y divide-slate-100 max-h-56 overflow-y-auto">
                    {grades.filter(g => teacherAssignments.some(a => a.id === g.assignmentId) && g.status === 'SUBMITTED').map(g => {
                      const asg = teacherAssignments.find(a => a.id === g.assignmentId);
                      const std = students.find(s => s.id === g.studentId);
                      return (
                        <div key={g.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                          <div>
                            <p className="font-bold text-slate-900 truncate max-w-xs">{std?.name || g.studentId}</p>
                            <p className="text-[10px] text-slate-400">{asg?.title} • Kelas {g.classId}</p>
                          </div>
                          <button
                            onClick={() => { setActiveTab('nilai'); setSelectedAsgFilter(g.assignmentId); }}
                            className="bg-slate-950 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg hover:bg-teal-700 transition"
                          >
                            Koreksi
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: KELOLA MATERI */}
        {activeTab === 'materi' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between sm:items-center bg-white p-5 rounded-2xl border border-slate-200/50">
              <div>
                <p className="text-xs font-semibold text-slate-500">Materi Terposting Anda</p>
                <h3 className="text-lg font-black text-slate-900 mt-0.5">{teacherMaterials.length} Dokumen Pengajaran</h3>
              </div>
              <button
                onClick={() => openAddModal('materi')}
                className="bg-teal-600 text-white font-bold text-xs inline-flex items-center gap-1.5 px-4 py-3 rounded-xl hover:bg-teal-700 transition cursor-pointer shadow-sm select-none"
              >
                <Plus className="w-4 h-4" /> Unggah Materi Belajar
              </button>
            </div>

            {/* Jenjang Kelas Filter Picker */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between border-b border-slate-200/50 pb-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mr-1">Saring Jenjang:</span>
                {(['ALL', '7', '8', '9'] as const).map(g => (
                  <button
                    key={g}
                    onClick={() => setMGradeFilter(g)}
                    className={`px-4 py-2 text-xs font-black rounded-xl transition-all duration-200 border cursor-pointer ${
                      mGradeFilter === g
                        ? 'bg-gradient-to-r from-teal-600 to-teal-700 text-white shadow-md border-teal-500/20'
                        : 'bg-white text-slate-600 hover:text-slate-900 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {g === 'ALL' ? 'Semua Jenjang' : `Kelas ${g}`}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-slate-400 font-mono font-bold tracking-wider uppercase">
                Menampilkan: {filteredMaterials.length} materi
              </p>
            </div>

            {filteredMaterials.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-2xl border text-slate-400 text-xs shadow-2xs">
                {teacherMaterials.length === 0 
                  ? "Anda belum mengunggah materi pengajaran." 
                  : `Tidak ada materi untuk jenjang kelas ${mGradeFilter === 'ALL' ? '' : mGradeFilter}.`}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMaterials.map(m => {
                  const sName = subjects.find(s => s.id === m.subjectId)?.name || m.subjectId;
                  return (
                    <div key={m.id} className="bg-white p-5 rounded-2xl border border-slate-200 transition-all duration-350 hover:shadow-lg hover:shadow-slate-200/40 hover:border-slate-300 space-y-4 flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                          <span className="bg-teal-50/70 text-teal-800 text-[10px] font-black px-2.5 py-1 rounded-lg border border-teal-100 tracking-wider uppercase">
                            Kelas {m.classId}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono font-bold tracking-tight inline-flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-300" /> {new Date(m.createdAt).toLocaleDateString('id-ID')}
                          </span>
                        </div>
                        <h4 className="font-serif-heading font-extrabold text-slate-900 text-sm tracking-tight leading-snug text-left">{m.title}</h4>
                        <p className="text-xs text-slate-600 font-medium line-clamp-3 text-left leading-relaxed">{m.description || 'Tidak ada deskripsi tambahan'}</p>
                      </div>

                      <div className="border-t border-slate-100 pt-3.5 flex items-center justify-between">
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-205/60 max-w-[140px] truncate" title={sName}>
                          {sName}
                        </div>
                        <div className="flex gap-1.5">
                          {m.link && (
                            <a
                              href={m.link}
                              target="_blank"
                              rel="noreferrer"
                              className="text-slate-500 hover:text-indigo-600 w-9 h-9 rounded-xl border border-slate-150 flex items-center justify-center bg-slate-50/80 hover:bg-slate-100/90 transition-all cursor-pointer"
                              title="Buka Link Canva/Materi"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                          <button
                            onClick={() => openEditModal('materi', m)}
                            className="text-slate-500 hover:text-teal-600 w-9 h-9 rounded-xl border border-slate-150 flex items-center justify-center bg-slate-50/80 hover:bg-slate-100/95 cursor-pointer transition-all"
                            title="Edit Materi"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setConfirmDialog({
                              isOpen: true,
                              title: 'Hapus Materi Pembelajaran',
                              message: 'Apakah Anda yakin ingin menghapus materi pembelajaran ini secara permanen dari sistem?',
                              onConfirm: () => {
                                deleteMaterial(m.id);
                                triggerToast('Materi berhasil dihapus!');
                              }
                            })}
                            className="text-slate-500 hover:text-red-700 w-9 h-9 rounded-xl border border-slate-150 flex items-center justify-center bg-slate-50/80 hover:bg-slate-100/95 cursor-pointer transition-all"
                            title="Hapus Materi"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: KELOLA TUGAS */}
        {activeTab === 'tugas' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between sm:items-center bg-white p-5 rounded-2xl border border-slate-200/50">
              <div>
                <p className="text-xs font-semibold text-slate-500">Tugas Dibuat Anda</p>
                <h3 className="text-lg font-black text-slate-900 mt-0.5">{teacherAssignments.length} Latihan Mandiri</h3>
              </div>
              <button
                onClick={() => openAddModal('tugas')}
                className="bg-teal-600 text-white font-bold text-xs inline-flex items-center gap-1.5 px-4 py-3 rounded-xl hover:bg-teal-700 transition cursor-pointer shadow-sm select-none"
              >
                <Plus className="w-4 h-4" /> Posting Tugas Baru
              </button>
            </div>

            {/* Jenjang Kelas Filter Picker */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between border-b border-slate-200/50 pb-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mr-1">Saring Jenjang:</span>
                {(['ALL', '7', '8', '9'] as const).map(g => (
                  <button
                    key={g}
                    onClick={() => setTGradeFilter(g)}
                    className={`px-4 py-2 text-xs font-black rounded-xl transition-all duration-200 border cursor-pointer ${
                      tGradeFilter === g
                        ? 'bg-gradient-to-r from-teal-600 to-teal-700 text-white shadow-md border-teal-500/20'
                        : 'bg-white text-slate-600 hover:text-slate-900 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {g === 'ALL' ? 'Semua Jenjang' : `Kelas ${g}`}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-slate-400 font-mono font-bold tracking-wider uppercase">
                Menampilkan: {filteredAssignments.length} tugas
              </p>
            </div>

            {filteredAssignments.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-2xl border text-slate-400 text-xs shadow-2xs">
                {teacherAssignments.length === 0 
                  ? "Anda belum memposting tugas latihan kelas." 
                  : `Tidak ada tugas latihan untuk jenjang kelas ${tGradeFilter === 'ALL' ? '' : tGradeFilter}.`}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAssignments.map(a => {
                  const sName = subjects.find(sub => sub.id === a.subjectId)?.name || a.subjectId;
                  return (
                    <div key={a.id} className="bg-white p-5 rounded-2xl border border-slate-200 transition-all duration-350 hover:shadow-lg hover:shadow-slate-200/40 hover:border-slate-300 space-y-4 flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                          <span className="bg-slate-100/90 text-slate-700 text-[10px] font-black px-2.5 py-1 rounded-lg border border-slate-205 tracking-wider uppercase">
                            Kelas {a.classId}
                          </span>
                          <span className="text-[10px] px-2.5 py-1 bg-indigo-50 border border-indigo-150 text-indigo-700 rounded-lg font-bold uppercase font-mono tracking-tight">
                            OFF-{a.id.substring(4, 8) || a.id}
                          </span>
                        </div>
                        <h4 className="font-serif-heading font-extrabold text-slate-900 text-sm tracking-tight leading-snug text-left">{a.title}</h4>
                        <p className="text-xs text-slate-600 font-medium line-clamp-3 leading-relaxed text-left">{a.description}</p>
                        
                        <div className="grid grid-cols-2 gap-3 bg-slate-50/80 border border-slate-201/50 p-3 rounded-xl mt-3 text-left">
                          <div>
                            <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 block mb-0.5">Batas Waktu</span>
                            <span className="text-xs font-bold text-slate-700 font-mono inline-flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {a.dueDate}
                            </span>
                          </div>
                          <div>
                            <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 block mb-0.5">Form Pengumpulan</span>
                            <span className={`text-xs font-black inline-flex items-center gap-1 ${a.formEnabled ? 'text-teal-600' : 'text-amber-500'}`}>
                              {a.formEnabled ? (
                                <>
                                  <span className="relative flex h-2 w-2 shrink-0">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                                  </span>
                                  <span className="font-mono uppercase font-black tracking-wider text-2xs">AKTIF</span>
                                </>
                              ) : (
                                <>
                                  <span className="inline-flex rounded-full h-2 w-2 bg-amber-400 shrink-0"></span>
                                  <span className="font-mono uppercase font-black tracking-wider text-2xs">NONAKTIF</span>
                                </>
                              )}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-slate-100 pt-3.5 flex items-center justify-between">
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-205/60 max-w-[140px] truncate" title={sName}>
                          {sName}
                        </div>
                        <div className="flex gap-1.5">
                          {a.link && (
                            <a
                              href={a.link}
                              target="_blank"
                              rel="noreferrer"
                              className="text-slate-500 hover:text-indigo-600 w-9 h-9 rounded-xl border border-slate-150 flex items-center justify-center bg-slate-50/80 hover:bg-slate-100/90 transition-all cursor-pointer"
                              title="Buka Link Quizizz/Latihan"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                          <button
                            onClick={() => openEditModal('tugas', a)}
                            className="text-slate-500 hover:text-teal-600 w-9 h-9 rounded-xl border border-slate-150 flex items-center justify-center bg-slate-50/80 hover:bg-slate-100/95 cursor-pointer transition-all"
                            title="Edit Tugas"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setConfirmDialog({
                              isOpen: true,
                              title: 'Hapus Tugas Latihan',
                              message: 'Apakah Anda yakin ingin menghapus tugas latihan ini? Riwayat pengisian nilai dan riwayat pengumpulan siswa terkait tugas ini akan ikut terhapus secara permanen.',
                              onConfirm: () => {
                                deleteAssignment(a.id);
                                triggerToast('Tugas latihan berhasil dihapus!');
                              }
                            })}
                            className="text-slate-500 hover:text-red-700 w-9 h-9 rounded-xl border border-slate-150 flex items-center justify-center bg-slate-50/80 hover:bg-slate-100/95 cursor-pointer transition-all"
                            title="Hapus Tugas"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: KELOLA NILAI */}
        {activeTab === 'nilai' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between bg-white p-4 rounded-xl border border-slate-200/50">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">Saring berdasarkan Tugas:</span>
                <select
                  className="text-xs font-bold p-2 border rounded-lg bg-slate-50 focus:outline-none"
                  value={selectedAsgFilter}
                  onChange={(e) => setSelectedAsgFilter(e.target.value)}
                >
                  <option value="">-- Semua Pengumpulan --</option>
                  {teacherAssignments.map(a => (
                    <option key={a.id} value={a.id}>{a.title} ({classes.find(c => c.id === a.classId)?.name})</option>
                  ))}
                </select>
              </div>
              <p className="text-xs text-slate-400 font-semibold flex items-center gap-3 self-end sm:self-center">
                <span>Ditemukan: <b>{currentGrades.length}</b> masukan</span>
                {selectedAsgFilter && (
                  <button
                    onClick={() => setShowPrintModal(true)}
                    className="inline-flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition shadow-3xs cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" /> Cetak Daftar Nilai
                  </button>
                )}
              </p>
            </div>

            {currentGrades.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-2xl border text-slate-400 text-xs">Belum ada input pengumpulan tugas yang dilaporkan untuk tugas target ini.</div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                        <th className="p-4 pl-6 text-left">Siswa</th>
                        <th className="p-4 text-left">Nama Latihan / Tugas</th>
                        <th className="p-4 text-left">Submisi Link</th>
                        <th className="p-4 text-center">Status</th>
                        <th className="p-4 text-center">Nilai</th>
                        <th className="p-4 text-left">Capaian / Feedback</th>
                        <th className="p-4 pr-6 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {currentGrades.map(g => {
                        const std = students.find(s => s.id === g.studentId);
                        const asg = teacherAssignments.find(a => a.id === g.assignmentId);
                        return (
                          <tr key={g.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-4 pl-6">
                              <p className="font-bold text-slate-900 text-left">{std?.name || g.studentId}</p>
                              <p className="text-[10px] text-slate-400">NIS: {std?.nis} • Kelas {g.classId}</p>
                            </td>
                            <td className="p-4 font-medium text-slate-800 text-left truncate max-w-xs">{asg?.title || 'Tugas Terhapus'}</td>
                            <td className="p-4 text-left">
                              {(!asg || !asg.formEnabled || g.submissionLink === 'Form submission not required' || !g.submissionLink) ? (
                                <span className="text-slate-450 font-mono font-bold text-xs">-</span>
                              ) : (
                                <a
                                  href={g.submissionLink}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-teal-600 hover:underline inline-flex items-center gap-1 font-mono font-medium text-[11px]"
                                >
                                  Buka Berkas <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </td>
                            <td className="p-4 text-center">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                g.status === 'GRADED' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-amber-50 text-amber-700 border border-amber-100'
                              }`}>
                                {g.status === 'GRADED' ? 'Telah Dinilai' : 'Belum Dinilai'}
                              </span>
                            </td>
                            <td className="p-4 text-center">
                              {g.grade !== undefined ? (
                                <span className="text-sm font-black text-slate-950 font-mono">{g.grade}</span>
                              ) : (
                                <span className="text-slate-300 font-mono">--</span>
                              )}
                            </td>
                            <td className="p-4 text-left italic text-slate-500 max-w-xs truncate">{g.feedback || 'Belum diberikan deskripsi kompetensi'}</td>
                            <td className="p-4 pr-6 text-right">
                              <div className="inline-flex gap-1">
                                <button
                                  onClick={() => openGradingModal(g)}
                                  className="bg-slate-950 hover:bg-teal-700 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg transition leading-none cursor-pointer"
                                >
                                  {g.status === 'GRADED' ? 'Re-Nilai' : 'Beri Nilai'}
                                </button>
                                <button
                                  onClick={() => setConfirmDialog({
                                    isOpen: true,
                                    title: 'Reset Pengumpulan Tugas',
                                    message: 'Apakah Anda yakin ingin me-reset pengumpulan tugas siswa ini? Nilai, umpan balik, dan tautan laporan tugas siswa akan dihapus agar siswa dapat mengirimkan ulang tugas baru.',
                                    onConfirm: () => {
                                      resetAssignmentValue(g.id);
                                      triggerToast('Pengumpulan tugas murid berhasil di-reset!');
                                    }
                                  })}
                                  className="bg-red-50 hover:bg-red-100 border border-red-100 text-red-600 font-bold text-[10px] px-2.5 py-1.5 rounded-lg transition cursor-pointer"
                                  title="Reset pengerjaan agar siswa bisa mengulang"
                                >
                                  Reset
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: PENGATURAN */}
        {activeTab === 'setting' && (
          <div className="max-w-md bg-white p-6 rounded-2xl border border-slate-200/60 shadow-xs space-y-6 text-slate-700">
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Ubah Sandi Akun Guru</h4>
              <p className="text-xs text-slate-500 mt-1">Ganti password NIK bawaan asali Anda dengan kombinasi baru demi keamanan data pendidik.</p>
            </div>

            <form onSubmit={handleUpdatePwd} className="space-y-4">
              {passMsg.text && (
                <div className={`p-3 rounded-lg text-xs font-medium border flex items-center gap-1.5 ${
                  passMsg.type === 'error' ? 'bg-red-50 border-red-100 text-red-600' : 'bg-green-50 border-green-100 text-green-700'
                }`}>
                  {passMsg.type === 'error' ? <AlertCircle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  {passMsg.text}
                </div>
              )}

              <div>
                <label className="block text-2xs font-bold text-slate-400 uppercase tracking-widest mb-1 text-left">Password Sekarang</label>
                <input
                  type="password"
                  required
                  placeholder="Ketik password lama"
                  className="w-full text-xs font-mono px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-teal-600"
                  value={oldPass}
                  onChange={(e) => setOldPass(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-2xs font-bold text-slate-400 uppercase tracking-widest mb-1 text-left">Password Baru</label>
                <input
                  type="password"
                  required
                  placeholder="Ketik password baru"
                  className="w-full text-xs font-mono px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-teal-600"
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="w-full bg-teal-600 text-white font-bold text-xs py-3 rounded-xl hover:bg-teal-700 transition cursor-pointer shadow-xs"
              >
                Simpan Password Baru
              </button>
            </form>
          </div>
        )}
      </main>

      {/* MOBILE BOTTOM NAVIGATION BAR FOR TEACHERS */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white text-slate-500 border-t border-slate-200 grid grid-cols-5 h-16 z-40 select-none pb-safe shadow-lg">
        <button
          onClick={() => setActiveTab('dash')}
          className={`flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors ${activeTab === 'dash' ? 'text-teal-600 font-extrabold' : 'hover:text-slate-950'}`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span className="text-[8px] tracking-tight">Ringkasan</span>
        </button>
        <button
          onClick={() => setActiveTab('materi')}
          className={`flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors ${activeTab === 'materi' ? 'text-teal-600 font-extrabold' : 'hover:text-slate-950'}`}
        >
          <BookOpen className="w-4 h-4" />
          <span className="text-[8px] tracking-tight">Materi</span>
        </button>
        <button
          onClick={() => setActiveTab('tugas')}
          className={`flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors ${activeTab === 'tugas' ? 'text-teal-600 font-extrabold' : 'hover:text-slate-950'}`}
        >
          <FileText className="w-4 h-4" />
          <span className="text-[8px] tracking-tight">Tugas</span>
        </button>
        <button
          onClick={() => setActiveTab('nilai')}
          className={`flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors ${activeTab === 'nilai' ? 'text-teal-600 font-extrabold' : 'hover:text-slate-950'}`}
        >
          <Award className="w-4 h-4" />
          <span className="text-[8px] tracking-tight">Nilai</span>
        </button>
        <button
          onClick={() => setActiveTab('setting')}
          className={`flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors ${activeTab === 'setting' ? 'text-teal-600 font-extrabold' : 'hover:text-slate-950'}`}
        >
          <Settings className="w-4 h-4" />
          <span className="text-[8px] tracking-tight">Setting</span>
        </button>
      </nav>

      {/* OVERLAY COMPONENT FOR MUTABLE MODALS */}
      <AnimatePresence>
        {modalType && targetEntity && (
          <div id="teacher-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden border border-slate-100 my-8"
            >
              {/* Modal Head */}
              <div className="bg-slate-50 text-slate-950 px-6 py-5 border-b border-slate-200/80 flex justify-between items-center text-left">
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900 tracking-tight font-serif-heading">
                    {modalType === 'create' ? 'Posting Baru ' : modalType === 'grade' ? 'Beri Nilai &amp; Feedback ' : 'Edit Data '}
                    {targetEntity === 'materi' && 'Dokumen Materi'}
                    {targetEntity === 'tugas' && 'Mata Latihan/Tugas'}
                    {targetEntity === 'nilai' && 'Penilaian Siswa'}
                  </h4>
                  <p className="text-[10px] text-teal-650 font-mono tracking-wider uppercase font-bold mt-1">Portal Guru SMP Al Irsyad</p>
                </div>
                <button
                  onClick={closeModal}
                  className="text-slate-400 hover:text-slate-705 w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-lg hover:bg-slate-100 cursor-pointer transition-colors"
                >
                  &times;
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                
                {/* FOR MATERI */}
                {targetEntity === 'materi' && (
                  <form onSubmit={handleSaveMaterial} className="space-y-4 text-xs">
                    <div>
                      <label className="block text-[9px] font-black text-slate-600 uppercase tracking-wider mb-1 text-left">Judul Materi Belajar</label>
                      <input
                        type="text"
                        required
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-teal-600 bg-white"
                        placeholder="Contoh: Bab I: Akhlak Kepada Orang Tua"
                        value={mTitle}
                        onChange={(e) => setMTitle(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-black text-slate-600 uppercase tracking-wider mb-1 text-left">Deskripsi Singkat / Pokok Kajian</label>
                      <textarea
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-teal-600 bg-white resize-none"
                        placeholder="Tulis ringkasan singkat apa yang dipelajari murid di modul ini..."
                        value={mDesc}
                        onChange={(e) => setMDesc(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-black text-slate-600 uppercase tracking-wider mb-1 text-left">Tautan Materi (Canva / GDocs / Slides)</label>
                      <input
                        type="url"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-teal-600 bg-white font-mono"
                        placeholder="https://canva.com/design/your-materials-slides"
                        value={mLink}
                        onChange={(e) => setMLink(e.target.value)}
                      />
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-[9px] font-black text-slate-600 uppercase tracking-wider mb-1 text-left">Mapel Terkait</label>
                        <select
                          required
                          className="w-full px-3 py-3 rounded-xl border border-slate-200 bg-white h-11 text-xs"
                          value={mSubjectId}
                          onChange={(e) => setMSubjectId(e.target.value)}
                        >
                          <option value="">-- Pilih Mapel --</option>
                          {activeSubjectIds.map(subId => (
                            <option key={subId} value={subId}>
                              {subjects.find(s => s.id === subId)?.name || subId}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[9px] font-black text-slate-600 uppercase tracking-wider mb-2 text-left">
                          Tujuan Kelas {modalType === 'create' ? '(Bisa Pilih Lebih Dari 1)' : '(Pilih Kelas)'}
                        </label>
                        {activeClassIds.length === 0 ? (
                          <p className="text-2xs text-slate-400 italic text-left">Belum ada kelas yang ditugaskan untuk Anda.</p>
                        ) : (
                          <div className="flex flex-wrap gap-1.5 p-3 rounded-xl border border-slate-100 bg-slate-50/50">
                            {activeClassIds.map(clsId => {
                              const isSelected = mClassIds.includes(clsId);
                              const classObj = classes.find(c => c.id === clsId);
                              return (
                                <button
                                  type="button"
                                  key={clsId}
                                  onClick={() => {
                                    if (isSelected) {
                                      setMClassIds(mClassIds.filter(id => id !== clsId));
                                    } else {
                                      if (modalType === 'edit') {
                                        setMClassIds([clsId]);
                                      } else {
                                        setMClassIds([...mClassIds, clsId]);
                                      }
                                    }
                                  }}
                                  className={`px-3 py-2 rounded-lg text-xs font-bold border transition duration-150 cursor-pointer select-none ${
                                    isSelected 
                                      ? 'bg-teal-600 border-teal-600 text-white shadow-xs' 
                                      : 'bg-white border-slate-250 text-slate-700 hover:bg-slate-50'
                                  }`}
                                >
                                  Kelas {classObj?.name || clsId}
                                </button>
                              );
                            })}
                          </div>
                        )}
                        {mClassIds.length === 0 && (
                          <p className="text-[10px] text-red-500 font-semibold mt-1 text-left">* Wajib memilih minimal 1 kelas tujuan.</p>
                        )}
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-xl cursor-pointer"
                    >
                      {modalType === 'create' ? 'Posting Dokumen Materi' : 'Simpan Pembaruan Materi'}
                    </button>
                  </form>
                )}

                {/* FOR TUGAS */}
                {targetEntity === 'tugas' && (
                  <form onSubmit={handleSaveAssignment} className="space-y-4 text-xs">
                    <div>
                      <label className="block text-[9px] font-black text-slate-600 uppercase tracking-wider mb-1 text-left">Judul Tugas Latihan</label>
                      <input
                        type="text"
                        required
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-teal-600 bg-white"
                        placeholder="Contoh: Latihan Soal Aljabar Linear"
                        value={tTitle}
                        onChange={(e) => setTTitle(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-black text-slate-600 uppercase tracking-wider mb-1 text-left">Keterangan Deskripsi Pengerjaan</label>
                      <textarea
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-teal-600 bg-white resize-none"
                        placeholder="Berikan instruksi pengerjaan tugas secara mendetail bagi murid..."
                        value={tDesc}
                        onChange={(e) => setTDesc(e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[9px] font-black text-slate-600 uppercase tracking-wider mb-1 text-left">Batas Waktu Pengumpulan</label>
                        <input
                          type="date"
                          required
                          className="w-full px-4 py-3 h-11 rounded-xl border border-slate-200 outline-none focus:border-teal-600 bg-white font-mono"
                          value={tDueDate}
                          onChange={(e) => setTDueDate(e.target.value)}
                        />
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="block text-[9px] font-black text-slate-600 uppercase tracking-wider text-left">
                            Tautan Tugas (Quizizz/GForm/Kahoot)
                          </label>
                          <button
                            type="button"
                            onClick={() => setTPreviewEnabled(!tPreviewEnabled)}
                            className={`text-[9px] font-black px-2 py-0.5 rounded-md border transition cursor-pointer flex items-center gap-1 ${
                              tPreviewEnabled 
                                ? 'bg-teal-50 border-teal-200 text-teal-700 hover:bg-teal-100/70' 
                                : 'bg-slate-100 border-slate-200 text-slate-400 hover:bg-slate-200/70'
                            }`}
                            title="Tampilkan/sembunyikan pratinjau media di halaman murid"
                          >
                            <span>PRATINJAU:</span>
                            <span className="font-mono">{tPreviewEnabled ? 'ON' : 'OFF'}</span>
                          </button>
                        </div>
                        <input
                          type="url"
                          className="w-full px-4 py-3 h-11 rounded-xl border border-slate-200 outline-none focus:border-teal-600 bg-white font-mono"
                          placeholder="https://quizizz.com/join..."
                          value={tLink}
                          onChange={(e) => setTLink(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-[9px] font-black text-slate-600 uppercase tracking-wider mb-1 text-left">Mapel Terkait</label>
                        <select
                          required
                          className="w-full px-3 py-3 rounded-xl border border-slate-200 bg-white h-11 text-xs"
                          value={tSubjectId}
                          onChange={(e) => setTSubjectId(e.target.value)}
                        >
                          <option value="">-- Pilih Mapel --</option>
                          {activeSubjectIds.map(subId => (
                            <option key={subId} value={subId}>
                              {subjects.find(s => s.id === subId)?.name || subId}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[9px] font-black text-slate-600 uppercase tracking-wider mb-2 text-left">
                          Tujuan Kelas {modalType === 'create' ? '(Bisa Pilih Lebih Dari 1)' : '(Pilih Kelas)'}
                        </label>
                        {activeClassIds.length === 0 ? (
                          <p className="text-2xs text-slate-400 italic text-left">Belum ada kelas yang ditugaskan untuk Anda.</p>
                        ) : (
                          <div className="flex flex-wrap gap-1.5 p-3 rounded-xl border border-slate-100 bg-slate-50/50">
                            {activeClassIds.map(clsId => {
                              const isSelected = tClassIds.includes(clsId);
                              const classObj = classes.find(c => c.id === clsId);
                              return (
                                <button
                                  type="button"
                                  key={clsId}
                                  onClick={() => {
                                    if (isSelected) {
                                      setTClassIds(tClassIds.filter(id => id !== clsId));
                                    } else {
                                      if (modalType === 'edit') {
                                        setTClassIds([clsId]);
                                      } else {
                                        setTClassIds([...tClassIds, clsId]);
                                      }
                                    }
                                  }}
                                  className={`px-3 py-2 rounded-lg text-xs font-bold border transition duration-150 cursor-pointer select-none ${
                                    isSelected 
                                      ? 'bg-teal-600 border-teal-600 text-white shadow-xs' 
                                      : 'bg-white border-slate-250 text-slate-700 hover:bg-slate-50'
                                  }`}
                                >
                                  Kelas {classObj?.name || clsId}
                                </button>
                              );
                            })}
                          </div>
                        )}
                        {tClassIds.length === 0 && (
                          <p className="text-[10px] text-red-500 font-semibold mt-1 text-left">* Wajib memilih minimal 1 kelas tujuan.</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between bg-slate-50 border p-3.5 rounded-xl">
                      <div className="text-left">
                        <span className="font-extrabold text-slate-900 block text-xs">Form Pengumpulan Berkas</span>
                        <span className="text-[10px] text-slate-500">Izinkan murid mengirimkan tautan laporan/drive tugas di sistem.</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setTFormEnabled(!tFormEnabled)}
                        className={`font-mono text-2xs font-extrabold px-3 py-1.5 rounded-lg border transition ${
                          tFormEnabled ? 'bg-teal-50 border-teal-200 text-teal-700' : 'bg-slate-100 border-slate-200 text-slate-400'
                        }`}
                      >
                        {tFormEnabled ? 'AKTIF (ON)' : 'MATI (OFF)'}
                      </button>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-xl cursor-pointer"
                    >
                      {modalType === 'create' ? 'Posting Tugas Latihan Baru' : 'Simpan Pembaruan Tugas'}
                    </button>
                  </form>
                )}

                {/* FOR GRADING AND WRITING ASSESSMENT */}
                {targetEntity === 'nilai' && selectedGradeItem && (
                  <form onSubmit={handleSaveGrading} className="space-y-4 text-xs font-sans">
                    <div className="bg-slate-50 p-4 rounded-xl border text-left space-y-1.5">
                      <p className="text-2xs font-bold text-slate-400 uppercase tracking-widest mb-1">DATA SUBMISI siswa</p>
                      <p className="text-xs text-slate-800">Nama Siswa: <b>{students.find(s => s.id === selectedGradeItem.studentId)?.name || selectedGradeItem.studentId}</b></p>
                      <p className="text-xs text-slate-800">Tugas: <b>{assignments.find(a => a.id === selectedGradeItem.assignmentId)?.title}</b></p>
                      {(() => {
                        const asg = assignments.find(a => a.id === selectedGradeItem.assignmentId);
                        const isNotRequired = !asg || !asg.formEnabled || selectedGradeItem.submissionLink === 'Form submission not required' || !selectedGradeItem.submissionLink;
                        if (isNotRequired) {
                          return (
                            <p className="text-xs text-slate-800">
                              Tautan Laporan: <span className="text-slate-450 font-mono font-bold ml-1">-</span>
                            </p>
                          );
                        }
                        return (
                          <p className="text-xs text-slate-800">
                            Tautan Laporan: 
                            <a href={selectedGradeItem.submissionLink} target="_blank" rel="noreferrer" className="text-teal-600 hover:underline inline-flex items-center gap-1 ml-1 font-mono">
                              {selectedGradeItem.submissionLink} <ExternalLink className="w-3 h-3" />
                            </a>
                          </p>
                        );
                      })()}
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-2xs font-bold text-slate-400 uppercase tracking-widest mb-1 text-left">Nilai Angka (Skala 0-100)</label>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          required
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-teal-600 bg-white font-mono text-sm"
                          placeholder="Masukkan nilai numerik"
                          value={gValue}
                          onChange={(e) => setGValue(Number(e.target.value))}
                        />
                      </div>

                      <div>
                        <label className="block text-2xs font-bold text-slate-400 uppercase tracking-widest mb-1 text-left">Ulasan / Catatan Capaian Siswa (Feedback)</label>
                        <textarea
                          rows={3}
                          required
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-teal-600 bg-white resize-none"
                          placeholder="Ketik capaian spesifik, saran, atau pujian membangun bagi murid..."
                          value={gFeedback}
                          onChange={(e) => setGFeedback(e.target.value)}
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-xl cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <FileCheck className="w-4 h-4" /> Konfirmasi Penilaian Akurat
                    </button>
                  </form>
                )}

              </div>
            </motion.div>
          </div>
        )}

        {showPrintModal && selectedAsgFilter && (
          <div id="print-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-xs p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              className="bg-white w-full max-w-4xl rounded-2xl shadow-xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50 shrink-0">
                <div className="flex items-center gap-2">
                  <Printer className="w-5 h-5 text-teal-650" />
                  <h3 className="font-extrabold text-slate-900 text-sm tracking-tight">Pratinjau Cetak Daftar Nilai</h3>
                </div>
                <button
                  onClick={() => setShowPrintModal(false)}
                  className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-700 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable Preview Area */}
              <div className="p-8 overflow-y-auto flex-1 bg-slate-50/50">
                {/* Print area wrapper */}
                <div 
                  id="print-area" 
                  className="bg-white shadow-xs p-8 rounded-xl border border-slate-200/60 max-w-3xl mx-auto space-y-6 font-sans text-slate-800"
                >
                  {/* Style Override for Printer Target */}
                  <style dangerouslySetInnerHTML={{
                    __html: `
                      @media print {
                        body {
                          background: white !important;
                          color: black !important;
                        }
                        #print-backdrop {
                          background: transparent !important;
                          position: static !important;
                          padding: 0 !important;
                          overflow: visible !important;
                        }
                        /* Hide everything outside of print-area */
                        body > * {
                          display: none !important;
                        }
                        #print-area-wrapper-body {
                          display: block !important;
                        }
                        /* Show only our print area */
                        #print-area, #print-area * {
                          visibility: visible !important;
                          display: block !important;
                        }
                        #print-area {
                          position: absolute;
                          left: 0;
                          top: 0;
                          width: 100%;
                          border: none !important;
                          box-shadow: none !important;
                          padding: 0 !important;
                          margin: 0 !important;
                        }
                        .no-print {
                          display: none !important;
                        }
                        table {
                          width: 100% !important;
                          border-collapse: collapse !important;
                        }
                        th, td {
                          border: 1px solid #cbd5e1 !important;
                          padding: 8px !important;
                        }
                      }
                    `
                  }} />

                  {/* KOP LAPORAN */}
                  <div className="text-center space-y-2 border-b-2 border-slate-900 pb-5">
                    <h2 className="text-lg font-black tracking-widest text-slate-900 uppercase">DAFTAR NILAI DAN KETUNTASAN BELAJAR SISWA</h2>
                    <p className="text-2xs text-teal-700 tracking-wider font-bold">SMP AL IRSYAD SURAKARTA</p>
                  </div>

                  {/* METADATA INFORMASI */}
                  {(() => {
                    const asgObj = assignments.find(a => a.id === selectedAsgFilter);
                    const classObj = classes.find(c => c.id === asgObj?.classId);
                    const subObj = subjects.find(s => s.id === asgObj?.subjectId);
                    const teacherObj = teachers.find(t => t.id === asgObj?.teacherId);

                    const classStudents = students.filter(s => s.classId === asgObj?.classId);
                    const sortedClassStudents = [...classStudents].sort((a, b) => (a.nis || '').localeCompare(b.nis || ''));

                    return (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div className="space-y-1.5 text-left">
                            <p>Mata Pelajaran : <b className="text-slate-900">{subObj?.name || '-'}</b></p>
                            <p>Nama Latihan/Tugas : <b className="text-slate-900">{asgObj?.title || '-'}</b></p>
                          </div>
                          <div className="space-y-1.5 text-left md:pl-8">
                            <p>Kelas / Jenjang : <b className="text-slate-900">{classObj?.name || asgObj?.classId || '-'}</b></p>
                            <p>Guru Pengampu : <b className="text-slate-900">{teacherObj?.name || '-'}</b></p>
                          </div>
                        </div>

                        {/* TABEL DAFTAR SISWA */}
                        <div className="overflow-hidden border border-slate-350 rounded-lg">
                          <table className="w-full text-left border-collapse text-xs">
                            <thead>
                              <tr className="bg-slate-100 border-b border-slate-350 text-slate-650 font-extrabold uppercase text-[10px]">
                                <th className="p-3 border-r border-slate-300 w-12 text-center">No</th>
                                <th className="p-3 border-r border-slate-300 w-32 text-center">NIS</th>
                                <th className="p-3 border-r border-slate-300">Nama Lengkap Murid</th>
                                <th className="p-3 border-r border-slate-300 w-36 text-center">Status</th>
                                <th className="p-3 border-r border-slate-300 w-24 text-center">Nilai Angka</th>
                                <th className="p-3">Catatan Kompetensi / Ulasan</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-300 text-slate-700">
                              {sortedClassStudents.length === 0 ? (
                                <tr>
                                  <td colSpan={6} className="p-4 text-center text-slate-400 italic">Tidak ada siswa terdaftar untuk kelas ini.</td>
                                </tr>
                              ) : (
                                sortedClassStudents.map((std, idx) => {
                                  const grd = grades.find(g => g.studentId === std.id && g.assignmentId === selectedAsgFilter);
                                  const hasGrade = grd && grd.grade !== undefined;
                                  
                                  let statusText = "Belum Mengumpul";
                                  if (grd) {
                                    if (grd.status === 'SUBMITTED') statusText = "Diperiksa";
                                    else if (grd.status === 'GRADED') statusText = "Telah Dinilai";
                                    else if (grd.status === 'RESET') statusText = "Minta Ulang";
                                  }

                                  return (
                                    <tr key={std.id} className="hover:bg-slate-50/50">
                                      <td className="p-2.5 border-r border-slate-300 text-center font-mono">{idx + 1}</td>
                                      <td className="p-2.5 border-r border-slate-300 font-mono font-bold text-center">{std.nis || '-'}</td>
                                      <td className="p-2.5 border-r border-slate-300 font-bold text-slate-900">{std.name}</td>
                                      <td className="p-2.5 border-r border-slate-300 text-center font-semibold text-[10px]">
                                        {statusText}
                                      </td>
                                      <td className="p-2.5 border-r border-slate-300 text-center font-mono font-black text-sm text-teal-700">
                                        {hasGrade ? grd.grade : '-'}
                                      </td>
                                      <td className="p-2.5 text-left text-[10.5px] italic text-slate-550">
                                        {grd?.feedback || (hasGrade ? '-' : 'Belum mengumpulkan tugas')}
                                      </td>
                                    </tr>
                                  );
                                })
                              )}
                            </tbody>
                          </table>
                        </div>

                        {/* AREA TANDA TANGAN */}
                        <div className="pt-8 flex justify-end">
                          <div className="text-center space-y-16 text-xs w-52">
                            <div>
                              <p>Mengetahui,</p>
                              <p className="font-semibold">Guru Pengampu</p>
                            </div>
                            <div className="space-y-0.5">
                              <p className="font-bold underline">{teacherObj?.name || '_____________________'}</p>
                              <p className="text-[10px] text-slate-450">NIP/NIK: {teacherObj?.id || '-'}</p>
                            </div>
                          </div>
                        </div>

                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Action Footer */}
              <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
                <button
                  onClick={() => setShowPrintModal(false)}
                  className="px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-xs cursor-pointer hover:bg-slate-50 transition"
                >
                  Tutup
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs cursor-pointer transition shadow-xs hover:shadow-2xs flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" /> Cetak via Browser
                </button>
              </div>

            </motion.div>
          </div>
        )}

        {confirmDialog && confirmDialog.isOpen && (
          <div id="confirm-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 backdrop-blur-xs p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-sm rounded-2xl shadow-xl overflow-hidden border border-slate-100 p-6 space-y-4 text-center text-xs"
            >
              <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto text-xl shadow-xs">
                ⚠️
              </div>
              <div className="space-y-1.5">
                <h4 className="font-extrabold text-slate-900 text-sm tracking-tight">{confirmDialog.title}</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">{confirmDialog.message}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setConfirmDialog(null)}
                  className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 rounded-xl font-bold text-2xs cursor-pointer transition"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    confirmDialog.onConfirm();
                    setConfirmDialog(null);
                  }}
                  className="px-3.5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-2xs cursor-pointer transition shadow-xs hover:shadow-2xs"
                >
                  Ya, Lanjutkan
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
