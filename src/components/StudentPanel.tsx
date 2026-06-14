import React, { useState } from 'react';
import { useDb } from '../context/DbContext';
import { Material, Assignment, Grade } from '../types';
import { 
  LayoutDashboard, 
  BookOpen, 
  FileText, 
  Award, 
  Settings, 
  ExternalLink, 
  Clock, 
  X,
  CheckCircle2,
  AlertCircle,
  Hash,
  User,
  Send,
  LogOut,
  Info,
  Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function StudentPanel() {
  const {
    students,
    classes,
    subjects,
    teachers,
    materials,
    assignments,
    grades, submitAssignment,
    currentUser, logout, updateStudentPassword
  } = useDb();

  const [activeTab, setActiveTab] = useState<'dash' | 'materi' | 'tugas' | 'nilai' | 'setting'>('dash');

  // Identify Student profile
  const currentStudent = students.find(s => s.id === currentUser?.id);
  const studentClassId = currentStudent?.classId || '';
  const classNameStr = classes.find(c => c.id === studentClassId)?.name || studentClassId;

  // State
  const [selectedMapelFilter, setSelectedMapelFilter] = useState<string>('');
  const [selectedGradeMapelFilter, setSelectedGradeMapelFilter] = useState<string>('');
  const [activeAsgDetail, setActiveAsgDetail] = useState<Assignment | null>(null);
  const [activeMaterialDetail, setActiveMaterialDetail] = useState<Material | null>(null);
  const [submissionUrl, setSubmissionUrl] = useState('');
  const [subMsg, setSubMsg] = useState('');

  // Password fields
  const [oldPwd, setOldPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [pwdMsg, setPwdMsg] = useState({ type: '', text: '' });

  // Notifications
  const [toast, setToast] = useState('');

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  // Live Running Study Clock (Waktu Belajar)
  const [liveTime, setLiveTime] = useState(new Date());
  React.useEffect(() => {
    const intervalId = setInterval(() => setLiveTime(new Date()), 1000);
    return () => clearInterval(intervalId);
  }, []);

  const formattedDay = liveTime.toLocaleDateString('id-ID', { weekday: 'long' });
  const formattedDate = liveTime.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  const formattedTime = liveTime.toLocaleTimeString('id-id', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB';

  // Password change for student
  const handleUpdatePwd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentStudent) return;
    if (oldPwd !== currentStudent.password) {
      setPwdMsg({ type: 'error', text: 'Password lama salah!' });
      return;
    }
    if (newPwd.length < 5) {
      setPwdMsg({ type: 'error', text: 'Password baru minimal 5 karakter!' });
      return;
    }
    updateStudentPassword(currentStudent.nis, newPwd);
    setPwdMsg({ type: 'success', text: 'Sandi murid berhasil diperbarui!' });
    setOldPwd('');
    setNewPwd('');
  };

  // Submit Answer Action
  const handleSubmitWork = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAsgDetail || !currentStudent) return;
    if (activeAsgDetail.formEnabled && !submissionUrl) {
      setSubMsg('Masukkan link pengerjaan tugas terlebih dahulu.');
      return;
    }

    try {
      submitAssignment(
        currentStudent.id,
        activeAsgDetail.id,
        activeAsgDetail.formEnabled ? submissionUrl : 'Form submission not required',
        activeAsgDetail.subjectId,
        studentClassId
      );
      triggerToast('Tugas berhasil dikirimkan ke guru pengampu!');
      setSubmissionUrl('');
      setActiveAsgDetail(null);
    } catch (err: any) {
      setSubMsg('Gagal mengumpulkan tugas.');
    }
  };

  // Filter content matching Student's Class
  const studentMaterials = materials.filter(m => m.classId === studentClassId);
  const studentAssignments = assignments.filter(a => a.classId === studentClassId);
  
  // Dynamic filter for Grades Tab
  const filteredGradeAssignments = selectedGradeMapelFilter
    ? studentAssignments.filter(a => a.subjectId === selectedGradeMapelFilter)
    : studentAssignments;

  // Dynamic filter for Materials Belajar
  const filteredMaterials = selectedMapelFilter 
    ? studentMaterials.filter(m => m.subjectId === selectedMapelFilter)
    : studentMaterials;

  // Tasks pending list (Tasks that have no completed submission)
  const incompleteAssignments = studentAssignments.filter(a => {
    const grd = grades.find(g => g.studentId === currentUser?.id && g.assignmentId === a.id);
    return !grd || grd.status === 'NOT_SUBMITTED' || grd.status === 'RESET';
  });

  // Helper to parse different types of links for previewing
  const getEmbeddableUrl = (url: string): string | null => {
    if (!url) return null;
    
    // YouTube
    const ytMatch = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/);
    if (ytMatch && ytMatch[2].length === 11) {
      return `https://www.youtube.com/embed/${ytMatch[2]}`;
    }
    
    // Google Drive File
    const driveMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (driveMatch) {
      return `https://drive.google.com/file/d/${driveMatch[1]}/preview`;
    }

    // Google Slides
    const slidesMatch = url.match(/docs\.google\.com\/presentation\/d\/([a-zA-Z0-9_-]+)/);
    if (slidesMatch) {
      return `https://docs.google.com/presentation/d/${slidesMatch[1]}/embed`;
    }

    // Google Docs
    const docsMatch = url.match(/docs\.google\.com\/document\/d\/([a-zA-Z0-9_-]+)/);
    if (docsMatch) {
      return `https://docs.google.com/document/d/${docsMatch[1]}/preview`;
    }

    // Google Forms
    const formsMatch = url.match(/docs\.google\.com\/forms\/d\/e\/([a-zA-Z0-9_-]+)/);
    if (formsMatch) {
      return `https://docs.google.com/forms/d/e/${formsMatch[1]}/viewform?embedded=true`;
    }

    return null;
  };

  const isImageLink = (url: string): boolean => {
    if (!url) return false;
    return /\.(jpg|jpeg|png|gif|webp|svg)($|\?)/i.test(url);
  };

  return (
    <div id="student-shell" className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Toast banner */}
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
          {/* Brand Logo */}
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
              <h1 className="font-bold text-slate-900 text-sm tracking-tight leading-none mb-1 font-serif-heading">E-Learning Siswa</h1>
              <span className="text-[10px] font-mono tracking-wider text-teal-605 uppercase font-extrabold">SMP Al Irsyad</span>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="space-y-1.5">
            <button
              onClick={() => setActiveTab('dash')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold tracking-wide transition-all border cursor-pointer ${
                activeTab === 'dash' 
                  ? 'bg-teal-600 border-teal-700 text-white shadow-sm' 
                  : 'bg-transparent border-transparent hover:bg-slate-50 text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" /> Ringkasan
            </button>
            <button
              onClick={() => setActiveTab('materi')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold tracking-wide transition-all border cursor-pointer ${
                activeTab === 'materi' 
                  ? 'bg-teal-600 border-teal-700 text-white shadow-sm' 
                  : 'bg-transparent border-transparent hover:bg-slate-50 text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-4 h-4" /> Materi Belajar
            </button>
            <button
              onClick={() => setActiveTab('tugas')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold tracking-wide transition-all border cursor-pointer ${
                activeTab === 'tugas' 
                  ? 'bg-teal-600 border-teal-700 text-white shadow-sm' 
                  : 'bg-transparent border-transparent hover:bg-slate-50 text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-4 h-4" /> Tugas Saya {incompleteAssignments.length > 0 && <span className="bg-emerald-500 text-teal-950 text-[9px] px-1.5 py-0.5 rounded-full font-bold ml-auto">{incompleteAssignments.length}</span>}
            </button>
            <button
              onClick={() => setActiveTab('nilai')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold tracking-wide transition-all border cursor-pointer ${
                activeTab === 'nilai' 
                  ? 'bg-teal-600 border-teal-700 text-white shadow-sm' 
                  : 'bg-transparent border-transparent hover:bg-slate-50 text-slate-600 hover:text-slate-900'
              }`}
            >
              <Award className="w-4 h-4" /> Nilai Saya
            </button>
            <button
              onClick={() => setActiveTab('setting')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold tracking-wide transition-all border cursor-pointer ${
                activeTab === 'setting' 
                  ? 'bg-teal-600 border-teal-700 text-white shadow-sm' 
                  : 'bg-transparent border-transparent hover:bg-slate-50 text-slate-600 hover:text-slate-900'
              }`}
            >
              <Settings className="w-4 h-4" /> Pengaturan
            </button>
          </nav>
        </div>

        {/* Sidebar Foot-profile */}
        <div className="border-t border-slate-150 pt-5 space-y-4">
          <div className="flex items-center gap-2">
            <div className="bg-teal-50 border border-teal-150 w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-teal-850">
              {currentStudent?.name?.substring(0, 1) || 'S'}
            </div>
            <div className="max-w-[150px] overflow-hidden">
              <p className="text-xs font-bold text-slate-800 leading-none truncate">{currentStudent?.name}</p>
              <span className="text-[10px] text-slate-400 font-mono">NIS: {currentStudent?.nis} • {classNameStr}</span>
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
      <header className="md:hidden bg-slate-100 text-slate-800 border-b border-slate-200 px-4 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-teal-600 animate-pulse" />
          <div className="text-left">
            <h1 className="font-bold text-xs text-slate-900 tracking-tight truncate max-w-[150px]">{currentStudent?.name}</h1>
            <p className="text-[9px] text-slate-500 font-mono uppercase -mt-0.5">{classNameStr}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="text-red-650 hover:text-red-700 p-2 rounded-lg bg-red-50 border border-red-100 cursor-pointer text-xs"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </header>

      {/* MOBILE COMPLIANT MAIN CONTENT ZONE */}
      <main id="student-main-layout" className="flex-1 p-4 sm:p-8 lg:p-10 pb-24 md:pb-10 overflow-y-auto font-sans text-left">
        {/* Page title */}
        <div className="mb-8 select-none">
          <p className="text-xs text-slate-400 uppercase font-mono tracking-wider">PORTAL BELAJAR SISWA</p>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">
            {activeTab === 'dash' && `Assalamu'alaikum, ${currentStudent?.name?.split(' ')[0]}`}
            {activeTab === 'materi' && 'Katalog Materi Belajar'}
            {activeTab === 'tugas' && `Lembar Tugas ${classNameStr}`}
            {activeTab === 'nilai' && 'Daftar Nilai dan Hasil Belajar'}
            {activeTab === 'setting' && 'Identitas dan Pengaturan Sandi'}
          </h2>
        </div>

        {/* TAB 1: RINGKASAN */}
        {activeTab === 'dash' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Box Info Kelas */}
              <div className="bg-gradient-to-br from-teal-850 via-teal-900 to-indigo-950 text-white p-6 sm:p-8 rounded-2xl lg:col-span-12 shadow-xl border border-teal-700/20 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-8 space-y-3">
                  <span className="text-[10px] font-mono tracking-widest text-teal-300 bg-teal-800/50 border border-teal-700/60 px-2.5 py-1 rounded-full uppercase font-bold">
                    ✦ SMP AL IRSYAD SURAKARTA
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">Kondisi Belajar Anda Saat Ini</h3>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-xl">
                    Anda terdaftar di rombongan belajar <b className="text-teal-300 bg-teal-950/40 px-2 py-0.5 rounded border border-teal-850">{classNameStr}</b>. Pastikan untuk mengecek rilis materi terbaru dari ustadz/ustadzah setiap hari, dan kumpulkan tugas latihan sebelum batas tenggat berakhir.
                  </p>
                </div>
                <div className="md:col-span-4 bg-white/10 backdrop-blur-md rounded-xl p-5 border border-white/15 flex flex-col items-start text-left shadow-inner">
                  <div className="flex items-center gap-1.5 text-xs font-black text-teal-300 uppercase tracking-wider">
                    <User className="w-4 h-4 text-teal-300" /> Ahlan wa Sahlan
                  </div>
                  <h4 className="text-base sm:text-lg font-black text-white leading-tight mt-2">
                    Selamat Belajar,<br />
                    <span className="text-teal-300">{currentUser?.name || 'Siswa'}</span>! 👋
                  </h4>
                  <p className="text-[11px] text-slate-200 font-medium leading-normal mt-1.5 opacity-90">
                    Semoga hari ini penuh berkah dan dimudahkan dalam menuntut ilmu bermanfaat.
                  </p>
                </div>
              </div>

              {/* Unggah Baru Section */}
              <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200/60 shadow-xs space-y-4">
                <h4 className="font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
                  <span>Materi Pembelajaran Baru</span>
                  <span className="text-2xs bg-teal-50 border border-teal-100 text-teal-700 px-2 py-0.5 rounded-full font-bold">Terbaru</span>
                </h4>

                {studentMaterials.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-6 text-center">Belum ada materi dipublikasikan kelas Anda.</p>
                ) : (
                  <div className="divide-y divide-slate-100 max-h-56 overflow-y-auto">
                    {studentMaterials.slice(-4).reverse().map(m => {
                      const teacherName = teachers.find(t => t.id === m.teacherId)?.name || 'Guru Pengampu';
                      return (
                        <div key={m.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                          <div>
                            <p className="font-bold text-slate-900 truncate max-w-[200px]">{m.title}</p>
                            <p className="text-[10px] text-slate-400">{teacherName}</p>
                          </div>
                          <button
                            onClick={() => { setActiveTab('materi'); setSelectedMapelFilter(m.subjectId); }}
                            className="text-teal-600 font-bold hover:underline"
                          >
                            Buka
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Tugas Belum Dikerjakan Section */}
              <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200/60 shadow-xs space-y-4">
                <h4 className="font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
                  <span>Tugas Menunggu Anda</span>
                  <span className="text-2xs bg-amber-50 border border-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">Harus Dikerjakan</span>
                </h4>

                {incompleteAssignments.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-6 text-center">Alhamdulillah! Semua tugas Anda telah dikerjakan.</p>
                ) : (
                  <div className="divide-y divide-slate-100 max-h-56 overflow-y-auto">
                    {incompleteAssignments.map(a => {
                      const mapelName = subjects.find(s => s.id === a.subjectId)?.name || a.subjectId;
                      return (
                        <div key={a.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                          <div>
                            <p className="font-bold text-slate-900 truncate max-w-[200px]">{a.title}</p>
                            <p className="text-[10px] text-slate-400">Mapel: {mapelName}</p>
                          </div>
                          <button
                            onClick={() => { setActiveTab('tugas'); setActiveAsgDetail(a); }}
                            className="bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg transition"
                          >
                            Kerjakan
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

        {/* TAB 2: MATERI BELAJAR */}
        {activeTab === 'materi' && (
          <div className="space-y-6">
            {/* Filter Mapel */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between bg-white p-4 rounded-xl border border-slate-200/50">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">Saring berdasarkan Mapel:</span>
                <select
                  className="text-xs font-bold p-2 border rounded-lg bg-slate-50 focus:outline-none"
                  value={selectedMapelFilter}
                  onChange={(e) => setSelectedMapelFilter(e.target.value)}
                >
                  <option value="">-- Semua Mata Pelajaran --</option>
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <p className="text-xs text-slate-400 font-semibold self-end sm:self-center">
                Materi ditemukan: <b>{filteredMaterials.length}</b> dokumen
              </p>
            </div>

            {filteredMaterials.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-2xl border text-slate-400 text-xs">Belum ada materi pembelajaran untuk mata pelajaran ini.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMaterials.map(m => {
                  const teacherObj = teachers.find(t => t.id === m.teacherId);
                  const subObj = subjects.find(s => s.id === m.subjectId);
                  return (
                    <div key={m.id} className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-200/40 transition-all duration-350 space-y-4 flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                          <span className="text-[10px] font-black text-teal-800 bg-teal-50 border border-teal-150 px-2.5 py-1 rounded-lg uppercase tracking-wider font-sans">
                            {subObj?.name || m.subjectId}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono font-bold tracking-tight inline-flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-300" /> {new Date(m.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                        <h4 className="font-serif-heading font-extrabold text-slate-900 text-sm tracking-tight leading-snug text-left">{m.title}</h4>
                        <p className="text-xs text-slate-600 font-medium leading-relaxed text-left line-clamp-3">{m.description || 'Pelajari materi lengkap pada link di bawah ini.'}</p>
                      </div>

                      <div className="border-t border-slate-100 pt-3.5 flex items-center justify-between text-xs">
                        <span className="text-slate-700 font-black truncate max-w-[150px] inline-flex items-center gap-1 text-2xs md:text-xs">
                          <span className="text-[9px] text-teal-700 font-black uppercase tracking-wider bg-teal-50 px-2 py-0.5 rounded-md border border-teal-100">Oleh:</span>
                          {teacherObj?.name || 'Ustadz Pengampu'}
                        </span>
                        {m.link && (
                          <button
                            type="button"
                            onClick={() => setActiveMaterialDetail(m)}
                            className="bg-teal-600 hover:bg-teal-700 text-white font-extrabold px-3.5 py-2 rounded-xl inline-flex items-center gap-1.5 cursor-pointer text-2xs shadow-sm hover:shadow-md transition-all select-none"
                          >
                            Buka Materi <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: TUGAS SAYA */}
        {activeTab === 'tugas' && (
          <div className="space-y-6">
            <p className="text-xs font-semibold text-slate-500 bg-white p-3.5 rounded-xl border">
              Ketuk untuk membuka lembar informasi kuis, link eksternal (Quizizz/GForms), dan formulir pengisian tugas.
            </p>

            {studentAssignments.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-2xl border text-slate-400 text-xs">Pujian bagi Allah! Tidak ada tugas latihan terdaftar untuk kelas Anda saat ini.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {studentAssignments.map(a => {
                  const subObj = subjects.find(s => s.id === a.subjectId);
                  const teacherObj = teachers.find(t => t.id === a.teacherId);
                  const grd = grades.find(g => g.studentId === currentUser?.id && g.assignmentId === a.id);
                  const isSubmitted = grd && (grd.status === 'SUBMITTED' || grd.status === 'GRADED');

                  return (
                    <div key={a.id} className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-200/40 transition-all duration-350 space-y-4 flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                          <span className="text-[10px] font-bold text-teal-700 bg-teal-50 border border-teal-100 px-2.5 py-1 rounded-lg uppercase tracking-wide truncate max-w-[140px]">{subObj?.name}</span>
                          <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg border ${
                            isSubmitted ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'
                          }`}>
                            {isSubmitted ? '✔ Sudah dikerjakan' : '❌ Belum dikerjakan'}
                          </span>
                        </div>
                        <h4 className="font-serif-heading font-extrabold text-slate-900 text-sm tracking-tight leading-snug text-left">{a.title}</h4>
                        <p className="text-xs text-slate-600 font-medium line-clamp-3 text-left leading-relaxed">{a.description}</p>
                        
                        <div className="pt-2 text-[10px] uppercase font-black tracking-widest text-slate-400 text-left border-t border-dashed border-slate-100 mt-2 flex items-center justify-between">
                          <span>Batas Pengumpulan:</span>
                          <b className="text-slate-700 font-mono inline-flex items-center gap-1 text-xs">
                            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {a.dueDate}
                          </b>
                        </div>
                      </div>

                      <div className="border-t border-slate-100 pt-3.5 flex items-center justify-between text-xs">
                        <span className="text-slate-400 font-bold truncate max-w-[130px]">{teacherObj?.name}</span>
                        <button
                          onClick={() => { setActiveAsgDetail(a); setSubmissionUrl(''); setSubMsg(''); }}
                          className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-[10px] px-4 py-2.5 rounded-xl cursor-pointer transition select-none shadow-xs"
                        >
                          Buka Tugas
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: NILAI SAYA */}
        {activeTab === 'nilai' && (
          <div className="space-y-4">
            {studentAssignments.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-2xl border text-slate-400 text-xs">Belum ada riwayat beban tugas terdaftar kelas Anda.</div>
            ) : (
              <div className="space-y-4">
                {/* Filter Mapel */}
                <div className="flex flex-col sm:flex-row gap-4 justify-between bg-white p-4 rounded-xl border border-slate-200/50">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-500">Saring berdasarkan Mapel:</span>
                    <select
                      className="text-xs font-bold p-2 border rounded-lg bg-slate-50 focus:outline-none"
                      value={selectedGradeMapelFilter}
                      onChange={(e) => setSelectedGradeMapelFilter(e.target.value)}
                    >
                      <option value="">-- Semua Mata Pelajaran --</option>
                      {subjects.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  <p className="text-xs text-slate-400 font-semibold self-end sm:self-center">
                    Tugas ditemukan: <b>{filteredGradeAssignments.length}</b> latihan
                  </p>
                </div>

                {filteredGradeAssignments.length === 0 ? (
                  <div className="bg-white p-12 text-center rounded-2xl border text-slate-400 text-xs">Belum ada tugas atau latihan atau nilai untuk mata pelajaran ini.</div>
                ) : (
                  <div className="space-y-3">
                    {/* Header list header for desktop */}
                    <div className="hidden md:flex items-center justify-between px-6 py-3 text-2xs font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-150">
                      <div className="flex-1">Detail Tugas dan Mata Pelajaran</div>
                      <div className="w-40 text-center">Status</div>
                      <div className="w-36 text-right">Nilai / Ulasan</div>
                    </div>

                    {filteredGradeAssignments.map(a => {
                      const subObj = subjects.find(s => s.id === a.subjectId);
                      const teacherObj = teachers.find(t => t.id === a.teacherId);
                      const grd = grades.find(g => g.studentId === currentUser?.id && g.assignmentId === a.id);
                      const hasGrade = grd && grd.grade !== undefined;

                      return (
                        <div 
                          key={a.id} 
                          className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-xs hover:border-slate-300 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 text-left"
                        >
                          {/* Left: Task & Subject Info */}
                          <div className="flex-1 min-w-0 space-y-1.5">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-[10px] font-black text-teal-800 bg-teal-50 border border-teal-100 px-2 py-0.5 rounded-md uppercase tracking-wider">
                                {subObj?.name || 'Mata Pelajaran'}
                              </span>
                              <span className="text-2xs text-slate-400 font-medium">
                                Oleh: <b className="text-slate-600 font-semibold">{teacherObj?.name || 'Guru'}</b>
                              </span>
                            </div>
                            
                            <h4 className="font-extrabold text-slate-900 text-sm md:text-base tracking-tight leading-tight">
                              {a.title}
                            </h4>

                            {/* Inline Feedback / Ulasan Guru info */}
                            {grd && grd.feedback && (
                              <div className="mt-2 bg-slate-50 p-3 rounded-xl border border-slate-100 text-[11px] text-slate-600 leading-relaxed font-sans">
                                <span className="font-bold text-slate-400 text-[9px] uppercase block tracking-wider mb-1">Feedback/Ulasan Guru:</span>
                                "{grd.feedback}"
                              </div>
                            )}
                            {!grd?.feedback && grd?.status === 'GRADED' && (
                              <p className="text-[10px] text-slate-400 italic">Guru tidak menyertakan ulasan tertulis.</p>
                            )}
                          </div>

                          {/* Middle: Status Badge */}
                          <div className="flex md:block items-center justify-between border-t md:border-t-0 border-slate-100 pt-3 md:pt-0 md:w-40 text-center">
                            <span className="text-2xs text-slate-400 font-bold uppercase md:hidden">Status</span>
                            <span className={`text-[10px] font-extrabold px-3 py-1.5 rounded-xl ${
                              !grd || grd.status === 'NOT_SUBMITTED' ? 'bg-slate-100 text-slate-600 border border-slate-200/40' :
                              grd.status === 'SUBMITTED' ? 'bg-amber-50 text-amber-700 border border-amber-200/60' :
                              grd.status === 'GRADED' ? 'bg-green-50 text-green-700 border border-green-200/60 font-black' : 'bg-red-50 text-red-600 border border-red-200/60'
                            }`}>
                              {!grd || grd.status === 'NOT_SUBMITTED' ? 'Belum Dikumpul' :
                               grd.status === 'SUBMITTED' ? 'Pending (Diperiksa)' :
                               grd.status === 'GRADED' ? 'Sudah Dinilai' : 'Minta Ulang (Form Ulang)'}
                            </span>
                          </div>

                          {/* Right: Score Display */}
                          <div className="flex md:block items-center justify-between border-t md:border-t-0 border-slate-150 pt-3 md:pt-0 md:w-36 md:text-right">
                            <span className="text-2xs text-slate-400 font-bold uppercase md:hidden font-sans">Nilai Angka</span>
                            <div>
                              {hasGrade ? (
                                <div className="flex items-baseline md:justify-end gap-1">
                                  <span className="text-2xl font-black text-teal-700 font-mono tracking-tight">{grd.grade}</span>
                                  <span className="text-2xs text-slate-400 font-bold font-mono">/100</span>
                                </div>
                              ) : (
                                <span className="text-xs text-slate-400 font-semibold italic">Menunggu Dinilai</span>
                              )}
                            </div>
                          </div>

                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: PENGATURAN */}
        {activeTab === 'setting' && (
          <div className="max-w-md bg-white p-6 rounded-2xl border border-slate-200/60 shadow-xs space-y-6 text-slate-700 font-sans">
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Ubah Sandi Akun Siswa</h4>
              <p className="text-xs text-slate-500 mt-1">Sesuai peraturan sekolah, murid dilarang keras memodifikasi NIS dan Nama Lengkap sendiri. Anda hanya mendapat otorisasi untuk mengubah kata sandi.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-2xs font-bold text-slate-400 uppercase tracking-widest mb-1 text-left flex items-center gap-1.5 leading-none">
                  <Hash className="w-3.5 h-3.5 text-slate-400" /> NIS Siswa (Kunci Baku)
                </label>
                <input
                  type="text"
                  disabled
                  className="w-full text-xs font-mono px-4 py-3 bg-slate-100 text-slate-500 border rounded-xl"
                  value={currentStudent?.nis || ''}
                />
              </div>

              <div>
                <label className="block text-2xs font-bold text-slate-400 uppercase tracking-widest mb-1 text-left flex items-center gap-1.5 leading-none">
                  <User className="w-3.5 h-3.5 text-slate-400" /> Nama Lengkap Siswa
                </label>
                <input
                  type="text"
                  disabled
                  className="w-full text-xs font-semibold px-4 py-3 bg-slate-100 text-slate-500 border rounded-xl"
                  value={currentStudent?.name || ''}
                />
              </div>

              <div className="h-px bg-slate-100 my-6" />

              <form onSubmit={handleUpdatePwd} className="space-y-4">
                {pwdMsg.text && (
                  <div className={`p-3 rounded-lg text-xs font-medium border flex items-center gap-1.5 ${
                    pwdMsg.type === 'error' ? 'bg-red-50 border-red-100 text-red-600' : 'bg-green-50 border-green-100 text-green-700'
                  }`}>
                    {pwdMsg.type === 'error' ? <AlertCircle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                    {pwdMsg.text}
                  </div>
                )}

                <div>
                  <label className="block text-2xs font-bold text-slate-400 uppercase tracking-widest mb-1 text-left">Password Sekarang</label>
                  <input
                    type="password"
                    required
                    placeholder="Masukkan sandi lama"
                    className="w-full text-xs font-mono px-4 py-3 border rounded-xl outline-none focus:border-teal-600 bg-white"
                    value={oldPwd}
                    onChange={(e) => setOldPwd(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-2xs font-bold text-slate-400 uppercase tracking-widest mb-1 text-left">Password Baru</label>
                  <input
                    type="password"
                    required
                    placeholder="Masukkan sandi baru"
                    className="w-full text-xs font-mono px-4 py-3 border rounded-xl outline-none focus:border-teal-600 bg-white"
                    value={newPwd}
                    onChange={(e) => setNewPwd(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs py-3 rounded-xl transition cursor-pointer"
                >
                  Ganti Password Akun
                </button>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* MOBILE BOTTOM NAVIGATION BAR FOR STUDENTS */}
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
          <div className="relative">
            <FileText className="w-4 h-4" />
            {incompleteAssignments.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-550 text-white text-[7px] w-3 h-3 rounded-full flex items-center justify-center font-black">
                {incompleteAssignments.length}
              </span>
            )}
          </div>
          <span className="text-[8px] tracking-tight">Tugas</span>
        </button>
        <button
          onClick={() => setActiveTab('nilai')}
          className={`flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors ${activeTab === 'nilai' ? 'text-teal-600 font-extrabold' : 'hover:text-slate-950'}`}
        >
          <Award className="w-4 h-4" />
          <span className="text-[8px] tracking-tight">Nilai Saya</span>
        </button>
        <button
          onClick={() => setActiveTab('setting')}
          className={`flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors ${activeTab === 'setting' ? 'text-teal-600 font-extrabold' : 'hover:text-slate-950'}`}
        >
          <Settings className="w-4 h-4" />
          <span className="text-[8px] tracking-tight">Profil</span>
        </button>
      </nav>

      {/* COMPACT MODAL POPUP FOR DETAILED ACTIVE TUGAS */}
      <AnimatePresence>
        {activeAsgDetail && (
          <div id="student-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]"
            >
              {/* Modal Head */}
              <div className="bg-slate-50 text-slate-950 px-6 py-5 border-b border-slate-200 flex justify-between items-center text-left shrink-0">
                <div>
                  <h4 className="font-extrabold text-sm md:text-sm text-slate-900 tracking-tight font-serif-heading">{activeAsgDetail.title}</h4>
                  <p className="text-[10px] text-teal-650 font-mono tracking-wider uppercase font-bold mt-1">
                    Mapel: {subjects.find(s => s.id === activeAsgDetail.subjectId)?.name || activeAsgDetail.subjectId}
                  </p>
                </div>
                <button
                  onClick={() => setActiveAsgDetail(null)}
                  className="text-slate-400 hover:text-slate-700 w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-lg hover:bg-slate-100 cursor-pointer transition"
                >
                  &times;
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 text-slate-700 text-xs text-left space-y-4 overflow-y-auto flex-1">
                {subMsg && (
                  <div className="bg-red-50 text-red-600 font-medium p-3 rounded-xl border border-red-100">
                    {subMsg}
                  </div>
                )}

                <div>
                  <label className="block text-[9px] font-black text-teal-700 uppercase tracking-widest mb-1">Instruksi Pengerjaan:</label>
                  <p className="bg-teal-50/50 p-3.5 rounded-xl border border-teal-100 leading-relaxed text-[11px] text-slate-900 font-semibold">
                    {activeAsgDetail.description}
                  </p>
                </div>

                <div className="flex items-center justify-between text-2xs text-slate-400">
                  <span>Diposting oleh: <b>{teachers.find(t => t.id === activeAsgDetail.teacherId)?.name || 'Guru'}</b></span>
                  <span>Batas Akhir: <b className="text-red-600">{activeAsgDetail.dueDate}</b></span>
                </div>

                {/* Live Preview Area for Assignments */}
                {activeAsgDetail.link && (() => {
                  const embedUrl = getEmbeddableUrl(activeAsgDetail.link);
                  const isImg = isImageLink(activeAsgDetail.link);
                  const previewAvailable = activeAsgDetail.previewEnabled !== false;

                  if (!previewAvailable) {
                    return (
                      <div className="space-y-3 pt-4 border-t border-slate-100/80">
                        <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="text-left">
                            <span className="font-extrabold text-slate-800 text-xs block">Tautan Tugas / Latihan Aktif</span>
                            <span className="text-[10px] text-slate-500">Pratinjau langsung dinonaktifkan oleh guru. Silakan gunakan tombol berikut untuk membuka tugas:</span>
                          </div>
                          <a
                            href={activeAsgDetail.link}
                            target="_blank"
                            rel="noreferrer"
                            className="bg-teal-600 hover:bg-teal-700 text-white font-extrabold px-4 py-2.5 rounded-xl inline-flex items-center justify-center gap-1.5 text-xs shadow-xs hover:shadow-2xs transition-all shrink-0 cursor-pointer"
                          >
                            Buka Lembar Latihan <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-3 pt-2 border-t border-slate-100">
                      <div className="flex justify-between items-center">
                        <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                          Pratinjau Media Tugas / Latihan
                        </h5>
                        <a
                          href={activeAsgDetail.link}
                          target="_blank"
                          rel="noreferrer"
                          className="bg-teal-50 hover:bg-teal-100 text-teal-700 font-bold px-3 py-1.5 rounded-lg border border-teal-200/60 inline-flex items-center gap-1.5 text-2xs hover:shadow-2xs transition"
                        >
                          Buka di Tab Baru <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>

                      {embedUrl ? (
                        <div className="relative w-full aspect-video md:h-[350px] rounded-xl overflow-hidden border border-slate-200/80 bg-slate-100 shadow-sm">
                          <iframe
                            src={embedUrl}
                            className="absolute inset-0 w-full h-full border-0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                            title={activeAsgDetail.title}
                          />
                        </div>
                      ) : isImg ? (
                        <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center p-3 max-h-[350px]">
                          <img
                            src={activeAsgDetail.link}
                            alt={activeAsgDetail.title}
                            className="max-w-full max-h-[320px] object-contain rounded-lg"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="bg-amber-50/80 border border-amber-200/60 text-amber-900 p-3 rounded-xl text-[11px] leading-relaxed font-medium">
                            <span className="font-extrabold flex items-center gap-1 text-amber-850">💡 Tips Akses Link Latihan</span>
                            Beberapa link eksternal (terutama Quizizz, Google Forms tertentu, rujukan situs luar) memiliki protokol keamanan ketat browser (X-Frame-Options) dan tidak mengizinkan pratinjau langsung di dalam aplikasi. Jika frame di bawah ini kosong atau tidak bisa diketik, silakan langsung gunakan tombol <strong>Buka di Tab Baru</strong> di atas untuk kenyamanan terbaik.
                          </div>
                          <div className="relative w-full h-[320px] rounded-xl overflow-hidden border border-slate-200/80 bg-slate-50 shadow-inner">
                            <iframe
                              src={activeAsgDetail.link}
                              className="absolute inset-0 w-full h-full border-0"
                              title={activeAsgDetail.title}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Form enabled submission link */}
                {activeAsgDetail.formEnabled ? (
                  <form onSubmit={handleSubmitWork} className="border-t border-slate-100 pt-4 space-y-3">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1.5 text-left relative">
                        <label className="block text-2xs font-bold text-slate-400 uppercase tracking-widest">
                          Kumpulkan Tautan Laporan Tugas (Filebin, Google Drive, Canva dll)
                        </label>
                        <div className="relative group inline-flex items-center">
                          <Info className="w-3.5 h-3.5 text-slate-400 hover:text-teal-600 transition-colors cursor-pointer" />
                          
                          {/* Beautiful Interactive Tooltip Popover */}
                          <div className="absolute left-1/2 -translate-x-1/2 md:left-auto md:right-0 md:translate-x-0 bottom-full mb-2.5 hidden group-hover:block w-72 bg-slate-900 border border-slate-800 text-white text-xs rounded-xl p-3.5 shadow-xl z-50 leading-relaxed font-sans normal-case tracking-normal">
                            <div className="font-bold text-teal-400 mb-1.5 flex items-center gap-1 text-[11px]">
                              <span>💡 Cara Upload Berkas di Filebin:</span>
                            </div>
                            <ol className="list-decimal list-inside space-y-1.5 text-slate-200 text-[10.5px]">
                              <li>Buka situs <a href="https://filebin.net/" target="_blank" rel="noopener noreferrer" className="text-teal-300 underline font-black hover:text-teal-200">filebin.net</a></li>
                              <li>Klik tombol upload atau langsung seret berkas tugas Anda ke area unggah.</li>
                              <li>Tunggu progres unggahan selesai (100%).</li>
                              <li>Salin (copy) tautan/URL halaman dari address bar browser Anda.</li>
                              <li>Tempelkan (paste) tautan tersebut ke kolom input di bawah ini.</li>
                            </ol>
                            <div className="absolute top-full left-1/2 -translate-x-1/2 md:left-auto md:right-2 md:translate-x-0 w-2 h-2 bg-slate-900 border-r border-b border-slate-800 transform rotate-45 -mt-[4px]"></div>
                          </div>
                        </div>
                      </div>
                      <input
                        type="url"
                        required
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-teal-600 bg-white font-mono"
                        placeholder="https://drive.google.com/file/d/..."
                        value={submissionUrl}
                        onChange={(e) => setSubmissionUrl(e.target.value)}
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" /> Kirim Jawaban Sekarang
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleSubmitWork} className="border-t border-slate-100 pt-4">
                    <p className="text-[10px] text-amber-600 bg-amber-50 rounded-lg p-2.5 border border-amber-100 leading-relaxed font-semibold">
                      ※ Tugas ini tidak memerlukan pengiriman berkas di sistem. Anda dapat langsung merampungkan latihan pada link platform di atas. Namun, harap klik tombol konfirmasi selesai di bawah agar ustadz/ustadzah tahu Anda telah merampungkannya.
                    </p>
                    <button
                      type="submit"
                      className="w-full bg-teal-600 hover:bg-teal-750 text-white font-bold py-3 rounded-xl mt-3 cursor-pointer"
                    >
                      Konfirmasi Selesai Mengerjakan
                    </button>
                  </form>
                )}

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* COMPACT MODAL POPUP FOR DETAILED ACTIVE MATERI & PREVIEW */}
      <AnimatePresence>
        {activeMaterialDetail && (
          <div id="material-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]"
            >
              {/* Modal Head */}
              <div className="bg-slate-50 text-slate-950 px-6 py-5 border-b border-slate-200 flex justify-between items-center text-left shrink-0">
                <div>
                  <h4 className="font-extrabold text-sm md:text-sm text-slate-900 tracking-tight font-serif-heading">{activeMaterialDetail.title}</h4>
                  <p className="text-[10px] text-teal-650 font-mono tracking-wider uppercase font-bold mt-1">
                    Mapel: {subjects.find(s => s.id === activeMaterialDetail.subjectId)?.name || activeMaterialDetail.subjectId}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveMaterialDetail(null)}
                  className="text-slate-400 hover:text-slate-700 w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-lg hover:bg-slate-100 cursor-pointer transition"
                >
                  &times;
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 text-slate-700 text-xs text-left space-y-4 overflow-y-auto flex-1">
                <div>
                  <h5 className="text-[9px] font-black text-teal-800 uppercase tracking-widest mb-1">Deskripsi dan Petunjuk Belajar</h5>
                  <p className="bg-teal-50/50 p-4 rounded-xl border border-teal-150 leading-relaxed text-[11px] text-slate-900 font-semibold font-sans">
                    {activeMaterialDetail.description || 'Silakan pelajari materi berikut ini.'}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 justify-between items-center bg-slate-100/50 p-3 rounded-xl border border-slate-200/50 text-[11px] font-semibold text-slate-500">
                  <span>Ust. Pengampu: <b className="text-slate-800">{teachers.find(t => t.id === activeMaterialDetail.teacherId)?.name || 'Ustadz Pengampu'}</b></span>
                  <span>Tanggal Rilis: <b className="text-slate-800">{new Date(activeMaterialDetail.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</b></span>
                </div>

                {/* Live Preview Area */}
                {activeMaterialDetail.link && (() => {
                  const embedUrl = getEmbeddableUrl(activeMaterialDetail.link);
                  const isImg = isImageLink(activeMaterialDetail.link);

                  return (
                    <div className="space-y-3 pt-2">
                      <div className="flex justify-between items-center">
                        <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                          Pratinjau Media Belajar
                        </h5>
                        <a
                          href={activeMaterialDetail.link}
                          target="_blank"
                          rel="noreferrer"
                          className="bg-teal-50 hover:bg-teal-100 text-teal-700 font-bold px-3 py-1.5 rounded-lg border border-teal-200/60 inline-flex items-center gap-1.5 text-2xs hover:shadow-2xs transition"
                        >
                          Buka di Tab Baru <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>

                      {embedUrl ? (
                        <div className="relative w-full aspect-video md:h-[350px] rounded-xl overflow-hidden border border-slate-200/80 bg-slate-100 shadow-sm">
                          <iframe
                            src={embedUrl}
                            className="absolute inset-0 w-full h-full border-0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                            title={activeMaterialDetail.title}
                          />
                        </div>
                      ) : isImg ? (
                        <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center p-3 max-h-[350px]">
                          <img
                            src={activeMaterialDetail.link}
                            alt={activeMaterialDetail.title}
                            className="max-w-full max-h-[320px] object-contain rounded-lg"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="bg-amber-50/80 border border-amber-200/60 text-amber-900 p-3 rounded-xl text-[11px] leading-relaxed font-medium">
                            <span className="font-extrabold flex items-center gap-1 text-amber-850">💡 Tips Akses Materi</span>
                            Beberapa link materi eksternal (misal: slide presentasi / file website) dilindungi kebijakan keamanan browser (X-Frame-Options) dan tidak dapat langsung dimuat di dalam aplikasi. Jika pratinjau di bawah ini kosong atau bermasalah, silakan klik tombol <strong>Buka di Tab Baru</strong> di atas untuk membaca dokumen dengan nyaman.
                          </div>
                          <div className="relative w-full h-[320px] rounded-xl overflow-hidden border border-slate-200/80 bg-slate-50 shadow-inner">
                            <iframe
                              src={activeMaterialDetail.link}
                              className="absolute inset-0 w-full h-full border-0"
                              title={activeMaterialDetail.title}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
