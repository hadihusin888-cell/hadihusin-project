import React, { useState } from 'react';
import { useDb } from '../context/DbContext';
import { Class, Subject, Teacher, Student } from '../types';
import { 
  LayoutDashboard, 
  School, 
  BookOpen, 
  UserCheck, 
  Users, 
  Settings, 
  LogOut, 
  Plus, 
  Edit3, 
  Trash2, 
  Save, 
  X, 
  Shield, 
  Lock,
  CheckCircle2,
  AlertCircle,
  Search,
  Download,
  Upload
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function AdminPanel() {
  const { 
    classes, addClass, editClass, deleteClass,
    subjects, addSubject, editSubject, deleteSubject,
    teachers, addTeacher, editTeacher, deleteTeacher,
    students, addStudent, editStudent, deleteStudent, importStudentsBulk,
    adminPassword, updateAdminPassword,
    logout, currentUser 
  } = useDb();

  const [activeTab, setActiveTab] = useState<'dash' | 'kelas' | 'mapel' | 'guru' | 'siswa' | 'setting'>('dash');

  // Interactive UI Temp States
  const [modalType, setModalType] = useState<'create' | 'edit' | null>(null);
  const [targetEntity, setTargetEntity] = useState<'kelas' | 'mapel' | 'guru' | 'siswa' | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Fields
  const [className, setClassName] = useState('');
  const [subjectName, setSubjectName] = useState('');
  
  // Teacher form
  const [teacherNik, setTeacherNik] = useState('');
  const [teacherName, setTeacherName] = useState('');
  // Track assigned subjects of teacher: array of { subjectId, classIds: [] }
  const [teacherSubjects, setTeacherSubjects] = useState<{subjectId: string, classIds: string[]}[]>([]);
  // Temp select trackers
  const [tempSubjectId, setTempSubjectId] = useState('');
  const [tempClassIds, setTempClassIds] = useState<string[]>([]);

  // Student form
  const [studentNis, setStudentNis] = useState('');
  const [studentName, setStudentName] = useState('');
  const [studentClassId, setStudentClassId] = useState('');
  const [userPassword, setUserPassword] = useState('');

  // Password fields
  const [oldPwd, setOldPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [pwdMsg, setPwdMsg] = useState({ type: '', text: '' });

  // Notifications
  const [toast, setToast] = useState('');
  const [teacherSearch, setTeacherSearch] = useState('');
  const [studentSearch, setStudentSearch] = useState('');
  const [selectedAdminStudentClassFilter, setSelectedAdminStudentClassFilter] = useState('');
  const [selectedAdminGuruClassFilter, setSelectedAdminGuruClassFilter] = useState('');

  // Bulk upload of students
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [bulkStudents, setBulkStudents] = useState<Array<{ nis: string; name: string; classInput: string; password?: string }>>([]);
  const [bulkError, setBulkError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Delete Confirmation State
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    type: 'kelas' | 'mapel' | 'guru' | 'siswa' | null;
    id: string;
    title: string;
  }>({
    isOpen: false,
    type: null,
    id: '',
    title: ''
  });

  const requestDelete = (type: 'kelas' | 'mapel' | 'guru' | 'siswa', id: string, title: string) => {
    setDeleteConfirm({
      isOpen: true,
      type,
      id,
      title
    });
  };

  const executeDelete = () => {
    if (!deleteConfirm.type || !deleteConfirm.id) return;
    
    if (deleteConfirm.type === 'kelas') {
      deleteClass(deleteConfirm.id);
      triggerToast('Kelas berhasil dihapus!');
    } else if (deleteConfirm.type === 'mapel') {
      deleteSubject(deleteConfirm.id);
      triggerToast('Mata Pelajaran berhasil dihapus!');
    } else if (deleteConfirm.type === 'guru') {
      deleteTeacher(deleteConfirm.id);
      triggerToast('Guru berhasil dihapus!');
    } else if (deleteConfirm.type === 'siswa') {
      deleteStudent(deleteConfirm.id);
      triggerToast('Siswa berhasil dihapus!');
    }

    setDeleteConfirm({ isOpen: false, type: null, id: '', title: '' });
  };

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  // Class Actions
  const handleSaveClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!className) return;
    if (modalType === 'create') {
      addClass(className);
      triggerToast('Kelas berhasil ditambahkan!');
    } else if (modalType === 'edit' && editingId) {
      editClass(editingId, className);
      triggerToast('Kelas berhasil diperbarui!');
    }
    closeModal();
  };

  // Subject Actions
  const handleSaveSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectName) return;
    if (modalType === 'create') {
      addSubject(subjectName);
      triggerToast('Mata Pelajaran berhasil ditambahkan!');
    } else if (modalType === 'edit' && editingId) {
      editSubject(editingId, subjectName);
      triggerToast('Mata Pelajaran berhasil diperbarui!');
    }
    closeModal();
  };

  // Temp allocation action
  const addSubjectAllocation = () => {
    if (!tempSubjectId) return;
    // Check if food already in list
    if (teacherSubjects.some(s => s.subjectId === tempSubjectId)) return;
    setTeacherSubjects([...teacherSubjects, { subjectId: tempSubjectId, classIds: [...tempClassIds] }]);
    setTempSubjectId('');
    setTempClassIds([]);
  };

  const removeSubjectAllocation = (subId: string) => {
    setTeacherSubjects(teacherSubjects.filter(s => s.subjectId !== subId));
  };

  // Teacher Action
  const handleSaveTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherNik || !teacherName) return;
    if (modalType === 'create') {
      addTeacher(teacherNik, teacherName, teacherSubjects, userPassword);
      triggerToast('Guru berhasil ditambahkan!');
    } else if (modalType === 'edit' && editingId) {
      editTeacher(editingId, teacherName, teacherSubjects, userPassword);
      triggerToast('Guru berhasil diperbarui!');
    }
    closeModal();
  };

  // Student Action
  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentNis || !studentName || !studentClassId) return;
    if (modalType === 'create') {
      addStudent(studentNis, studentName, studentClassId, userPassword);
      triggerToast('Siswa berhasil ditambahkan!');
    } else if (modalType === 'edit' && editingId) {
      editStudent(editingId, studentName, studentClassId, userPassword);
      triggerToast('Siswa berhasil diperbarui!');
    }
    closeModal();
  };

  const findClassIdByInput = (input: string) => {
    if (!input) return null;
    const normalized = input.trim().toLowerCase();
    
    // 1. Try raw ID match
    let matchedClass = classes.find(c => c.id.toLowerCase() === normalized);
    if (matchedClass) return matchedClass.id;

    // 2. Try Name match
    matchedClass = classes.find(c => c.name.toLowerCase() === normalized);
    if (matchedClass) return matchedClass.id;

    // 3. Try fallback (remove spaces, hyphens, underscores)
    const stripped = normalized.replace(/[^a-z0-9]/g, '');
    matchedClass = classes.find(c => {
      const clsIdSt = c.id.toLowerCase().replace(/[^a-z0-9]/g, '');
      const clsNmSt = c.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      return clsIdSt === stripped || clsNmSt === stripped;
    });
    if (matchedClass) return matchedClass.id;

    return null;
  };

  const downloadTemplate = () => {
    const headers = ["NIS", "Nama", "Kelas_Rompel", "Password_Opsional"];
    const rows = [
      ["10101", "Ahmad Fauzi", "VII_A", "ahmad123"],
      ["10102", "Zahra Aulia", "VII_A", ""],
      ["10103", "M. Yusuf", "VII_B", "yusuf123"]
    ];
    
    // Byte Order Mark (BOM) to force UTF-8 in Excel
    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "template_siswa_al_irsyad.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast('Template Excel berhasil diunduh!');
  };

  const handleCSVUpload = (file: File) => {
    if (!file) return;
    setBulkError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        if (!text) {
          setBulkError('File kosong atau rusak.');
          return;
        }

        const lines = text.split(/\r?\n/);
        if (lines.length <= 1) {
          setBulkError('Data tidak ditemukan dalam file.');
          return;
        }

        // Auto detect delimiter: comma or semicolon or tab
        const firstLine = lines[0];
        let delimiter = ',';
        if (firstLine.includes(';')) {
          delimiter = ';';
        } else if (firstLine.includes('\t')) {
          delimiter = '\t';
        }

        const headers = firstLine.split(delimiter).map(h => h.trim().toLowerCase());
        
        let nisIdx = headers.findIndex(h => h.includes('nis'));
        let nameIdx = headers.findIndex(h => h.includes('nama'));
        let classIdx = headers.findIndex(h => h.includes('kelas') || h.includes('id_kelas') || h.includes('rombel'));
        let pwdIdx = headers.findIndex(h => h.includes('pass') || h.includes('sandi'));

        // Fallbacks
        if (nisIdx === -1) nisIdx = 0;
        if (nameIdx === -1) nameIdx = 1;
        if (classIdx === -1) classIdx = 2;
        if (pwdIdx === -1) pwdIdx = 3;

        const parsed: Array<{ nis: string; name: string; classInput: string; password?: string }> = [];

        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          const cols = line.split(delimiter).map(c => c.trim().replace(/^"|"$/g, ''));
          if (cols.length < 3) continue;

          const nis = cols[nisIdx] || '';
          const name = cols[nameIdx] || '';
          const classInput = cols[classIdx] || '';
          const password = cols[pwdIdx] || '';

          if (nis && name && classInput) {
            parsed.push({ nis, name, classInput, password });
          }
        }

        if (parsed.length === 0) {
          setBulkError('Data tidak cocok dengan format kolom template.');
        } else {
          setBulkStudents(parsed);
        }
      } catch (err) {
        setBulkError('Gagal membaca file CSV.');
      }
    };
    reader.readAsText(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleCSVUpload(e.dataTransfer.files[0]);
    }
  };

  const handleSaveBulkStudents = async () => {
    if (bulkStudents.length === 0) return;

    try {
      const result = await importStudentsBulk(bulkStudents);
      triggerToast(`${result.addedStudents} siswa berhasil diunggah masal! (${result.addedClasses} rombel baru dibuat).`);
    } catch (err) {
      console.error(err);
      triggerToast("Gagal mengimpor data siswa.");
    } finally {
      setIsBulkOpen(false);
      setBulkStudents([]);
      setBulkError(null);
    }
  };

  // Change password admin
  const handleChangePwd = (e: React.FormEvent) => {
    e.preventDefault();
    if (oldPwd !== adminPassword) {
      setPwdMsg({ type: 'error', text: 'Password lama salah!' });
      return;
    }
    if (newPwd.length < 5) {
      setPwdMsg({ type: 'error', text: 'Password baru minimal 5 karakter!' });
      return;
    }
    updateAdminPassword(newPwd);
    setPwdMsg({ type: 'success', text: 'Password admin berhasil diubah!' });
    setOldPwd('');
    setNewPwd('');
  };

  const closeModal = () => {
    setModalType(null);
    setTargetEntity(null);
    setEditingId(null);
    setClassName('');
    setSubjectName('');
    setTeacherNik('');
    setTeacherName('');
    setTeacherSubjects([]);
    setTempSubjectId('');
    setTempClassIds([]);
    setStudentNis('');
    setStudentName('');
    setStudentClassId('');
    setUserPassword('');
  };

  const openEditModal = (entity: 'kelas' | 'mapel' | 'guru' | 'siswa', item: any) => {
    setModalType('edit');
    setTargetEntity(entity);
    setEditingId(item.id);

    if (entity === 'kelas') {
      setClassName(item.name);
    } else if (entity === 'mapel') {
      setSubjectName(item.name);
    } else if (entity === 'guru') {
      setTeacherNik(item.nik);
      setTeacherName(item.name);
      setTeacherSubjects(item.subjectsTaught || []);
      setUserPassword(item.password || item.nik);
    } else if (entity === 'siswa') {
      setStudentNis(item.nis);
      setStudentName(item.name);
      setStudentClassId(item.classId);
      setUserPassword(item.password || item.nis);
    }
  };

  const openCreateModal = (entity: 'kelas' | 'mapel' | 'guru' | 'siswa') => {
    setModalType('create');
    setTargetEntity(entity);
    setUserPassword('');
  };

  return (
    <div id="admin-shell" className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      
      {/* Toast Alert */}
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
      <aside className="hidden md:flex flex-col w-64 bg-slate-100/95 text-slate-700 border-r border-slate-200 p-6 min-h-screen justify-between select-none shadow-xs">
        <div className="space-y-8">
          {/* Logo */}
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
              <h1 className="font-bold text-slate-900 text-sm tracking-tight leading-none mb-1 font-serif-heading">E-Learning Admin</h1>
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
              onClick={() => setActiveTab('kelas')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold tracking-wide transition-all duration-200 cursor-pointer border ${
                activeTab === 'kelas' 
                  ? 'bg-teal-600 border-teal-700 text-white shadow-sm' 
                  : 'bg-transparent border-transparent hover:bg-slate-50 text-slate-600 hover:text-slate-900'
              }`}
            >
              <School className="w-4 h-4" /> Kelola Kelas
            </button>
            <button
              onClick={() => setActiveTab('mapel')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold tracking-wide transition-all duration-200 cursor-pointer border ${
                activeTab === 'mapel' 
                  ? 'bg-teal-600 border-teal-700 text-white shadow-sm' 
                  : 'bg-transparent border-transparent hover:bg-slate-50 text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-4 h-4" /> Kelola Mapel
            </button>
            <button
              onClick={() => setActiveTab('guru')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold tracking-wide transition-all duration-200 cursor-pointer border ${
                activeTab === 'guru' 
                  ? 'bg-teal-600 border-teal-700 text-white shadow-sm' 
                  : 'bg-transparent border-transparent hover:bg-slate-50 text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-4 h-4" /> Kelola Guru
            </button>
            <button
              onClick={() => setActiveTab('siswa')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold tracking-wide transition-all duration-200 cursor-pointer border ${
                activeTab === 'siswa' 
                  ? 'bg-teal-600 border-teal-700 text-white shadow-sm' 
                  : 'bg-transparent border-transparent hover:bg-slate-50 text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-4 h-4" /> Kelola Siswa
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
              A
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 leading-none">Administrator</p>
              <span className="text-[10px] text-slate-400">Super User</span>
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
          <Shield className="w-5 h-5 text-teal-600 animate-pulse" />
          <div className="text-left">
            <h1 className="font-bold text-xs text-slate-900 tracking-tight">Admin SMP Al Irsyad</h1>
            <p className="text-[9px] text-slate-505 uppercase -mt-0.5 font-mono font-bold">Surakarta</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="text-red-650 hover:text-red-700 p-2 rounded-lg bg-red-50 border border-red-100 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </header>

      {/* MAIN VIEW CONTENT CONTAINER */}
      <main className="flex-1 p-4 sm:p-8 lg:p-10 pb-24 md:pb-10 overflow-y-auto">
        
        {/* Dynamic header title based on activeTab */}
        <div className="mb-8 select-none">
          <p className="text-xs text-slate-400 uppercase font-mono tracking-wider">Halaman Admin Portal</p>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            {activeTab === 'dash' && 'Ringkasan Utama Akademis'}
            {activeTab === 'kelas' && 'Kelola Rombongan Kelas'}
            {activeTab === 'mapel' && 'Kelola Mata Pelajaran'}
            {activeTab === 'guru' && 'Kelola Guru Pengampu'}
            {activeTab === 'siswa' && 'Kelola Pembelajaran Siswa'}
            {activeTab === 'setting' && 'Sandi &amp; Keamanan'}
          </h2>
        </div>

        {/* TAB 1: RINGKASAN */}
        {activeTab === 'dash' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-xs flex flex-col justify-between h-32">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Rombel</p>
                <div>
                  <h3 className="text-3xl font-black text-teal-700">{classes.length}</h3>
                  <p className="text-2xs text-slate-400 mt-1">Kelas Aktif SMP</p>
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-xs flex flex-col justify-between h-32">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mata Pelajaran</p>
                <div>
                  <h3 className="text-3xl font-black text-indigo-700">{subjects.length}</h3>
                  <p className="text-2xs text-slate-400 mt-1">Mata Latihan Tersedia</p>
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-xs flex flex-col justify-between h-32">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Asatidzah/Guru</p>
                <div>
                  <h3 className="text-3xl font-black text-violet-700">{teachers.length}</h3>
                  <p className="text-2xs text-slate-400 mt-1">Guru Aktif Pengajar</p>
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-xs flex flex-col justify-between h-32">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Siswa Terdaftar</p>
                <div>
                  <h3 className="text-3xl font-black text-emerald-700">{students.length}</h3>
                  <p className="text-2xs text-slate-400 mt-1">Siswa SMP Terverifikasi</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-xs space-y-4">
              <h4 className="font-bold text-slate-900 border-b border-slate-100 pb-3">Informasi Sistem &amp; Panduan Penggunaan</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Portal E-Learning SMP Al Irsyad Surakarta dirancang untuk mempermudah operasional sekolah daring. Di panel Admin, Anda memiliki otorisasi penuh untuk mengelola struktur data dasar sekolah. Untuk memulai pengisian kurikulum, Anda disarankan mengikuti herarki penambahan berikut:
              </p>
              <ol className="text-xs text-slate-600 list-decimal pl-5 space-y-2 mt-2">
                <li>Daftarkan terlebih dahulu semua rombongan <b>Kelas</b> (contoh: Kelas 7A, Kelas 7B).</li>
                <li>Daftarkan daftar <b>Mata Pelajaran / Mapel</b> kurikulum (contoh: Matematika, Agama PAI).</li>
                <li>Daftarkan data <b>Guru / Asatidzah</b> yang bertugas, sekaligus mengalokasikan Mata Pelajaran dan rumpun Kelas yang akan diampunya secara detail.</li>
                <li>Terakhir, daftarkan data <b>Siswa</b> sesuai penugasan Kelas masing-masing. Password asali guru dan siswa akan diatur otomatis sesuai nomor registrasi identitas (NIK/NIS).</li>
              </ol>
            </div>
          </div>
        )}

        {/* TAB 2: KELOLA KELAS */}
        {activeTab === 'kelas' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200/50">
              <p className="text-xs font-semibold text-slate-500">Jumlah terdaftar: {classes.length} kelas</p>
              <button
                onClick={() => openCreateModal('kelas')}
                className="bg-teal-600 text-white font-bold text-xs inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl hover:bg-teal-700 transition cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" /> Tambah Kelas
              </button>
            </div>

            {classes.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-2xl border text-slate-400 text-xs">Belum ada kelas terdaftar. Klik Tambah Kelas.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {classes.map(c => (
                  <div key={c.id} className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-2xs flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{c.name}</h4>
                      <p className="text-2xs text-slate-400 font-mono text-left mt-0.5">ID: {c.id}</p>
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => openEditModal('kelas', c)}
                        className="text-slate-500 hover:text-teal-600 w-8 h-8 rounded-lg border border-slate-100 flex items-center justify-center bg-slate-50 hover:bg-teal-50 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => requestDelete('kelas', c.id, c.name)}
                        className="text-slate-500 hover:text-red-600 w-8 h-8 rounded-lg border border-slate-100 flex items-center justify-center bg-slate-50 hover:bg-red-50 cursor-pointer"
                        title="Hapus Kelas"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: KELOLA MAPEL */}
        {activeTab === 'mapel' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200/50">
              <p className="text-xs font-semibold text-slate-500">Jumlah terdaftar: {subjects.length} mapel</p>
              <button
                onClick={() => openCreateModal('mapel')}
                className="bg-teal-600 text-white font-bold text-xs inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl hover:bg-teal-700 transition cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" /> Tambah Mata Pelajaran
              </button>
            </div>

            {subjects.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-2xl border text-slate-400 text-xs">Belum ada mapel terdaftar. Klik Tambah Mapel.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {subjects.map(s => (
                  <div key={s.id} className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-2xs flex justify-between items-center">
                    <div className="flex-1 pr-4">
                      <h4 className="font-bold text-slate-900 text-sm leading-tight text-left">{s.name}</h4>
                      <p className="text-2xs text-slate-400 font-mono mt-1 text-left">ID: {s.id}</p>
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => openEditModal('mapel', s)}
                        className="text-slate-500 hover:text-teal-600 w-8 h-8 rounded-lg border border-slate-100 flex items-center justify-center bg-slate-50 hover:bg-teal-50 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => requestDelete('mapel', s.id, s.name)}
                        className="text-slate-500 hover:text-red-600 w-8 h-8 rounded-lg border border-slate-100 flex items-center justify-center bg-slate-50 hover:bg-red-50 cursor-pointer"
                        title="Hapus Mata Pelajaran"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: KELOLA GURU */}
        {activeTab === 'guru' && (() => {
          const filteredTeachers = teachers.filter(t => {
            const matchesSearch = t.name.toLowerCase().includes(teacherSearch.toLowerCase()) || 
                                  t.nik.toLowerCase().includes(teacherSearch.toLowerCase());
            const matchesClass = selectedAdminGuruClassFilter 
              ? t.subjectsTaught?.some(s => s.classIds?.includes(selectedAdminGuruClassFilter)) 
              : true;
            return matchesSearch && matchesClass;
          });
          return (
            <div className="space-y-6">
              {/* Search and Action Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200/50 shadow-sm">
                <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-3">
                  <p className="text-xs font-bold text-slate-500 shrink-0">
                    Jumlah: {filteredTeachers.length} dari {teachers.length} guru
                  </p>
                  
                  {/* Class Filter Selection for Guru */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-2xs font-extrabold text-slate-400 uppercase tracking-wider">Ajar di Kelas:</span>
                    <select
                      className="text-xs font-bold p-2 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-100/50 cursor-pointer"
                      value={selectedAdminGuruClassFilter}
                      onChange={(e) => setSelectedAdminGuruClassFilter(e.target.value)}
                    >
                      <option value="">-- Semua Kelas --</option>
                      {classes.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="relative flex-1 max-w-xs">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Cari guru atau NIK..."
                      value={teacherSearch}
                      onChange={(e) => setTeacherSearch(e.target.value)}
                      className="w-full text-xs font-semibold pl-8.5 pr-3.5 py-2 border border-slate-200 rounded-lg outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-100/50 transition-all font-sans"
                    />
                    {teacherSearch && (
                      <button 
                        type="button"
                        onClick={() => setTeacherSearch('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 font-bold text-sm cursor-pointer"
                      >
                        &times;
                      </button>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => openCreateModal('guru')}
                  className="bg-teal-600 text-white font-bold text-xs inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl hover:bg-teal-700 transition cursor-pointer shadow-xs whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" /> Tambah Data Guru
                </button>
              </div>

              {filteredTeachers.length === 0 ? (
                <div className="bg-white p-12 text-center rounded-2xl border border-slate-200/50 text-slate-450 text-xs text-left font-medium">
                  {teachers.length === 0 ? 'Belum ada guru terdaftar. Klik Tambah Data Guru.' : 'Guru yang Anda cari tidak ditemukan.'}
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
                  {/* Header Row */}
                  <div className="hidden md:grid md:grid-cols-12 gap-4 px-6 py-3 bg-slate-50 border-b border-slate-205 text-[10px] font-black text-slate-400 uppercase tracking-wider select-none text-left">
                    <div className="col-span-1">No</div>
                    <div className="col-span-4">Nama &amp; NIK Guru</div>
                    <div className="col-span-5">Mata Pelajaran &amp; Rombel Ampuan</div>
                    <div className="col-span-2 text-right">Aksi</div>
                  </div>

                  {/* Body rows */}
                  <div className="divide-y divide-slate-150">
                    {filteredTeachers.map((t, index) => (
                      <div 
                        key={t.id} 
                        className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 px-6 py-4 items-center hover:bg-slate-50/50 transition duration-150"
                      >
                        {/* No */}
                        <div className="hidden md:block col-span-1 text-xs font-mono text-slate-400 font-bold">
                          {String(index + 1).padStart(2, '0')}
                        </div>

                        {/* Name & NIK */}
                        <div className="col-span-1 md:col-span-4 flex flex-col items-start">
                          <span className="md:hidden text-[9px] font-black text-slate-400 uppercase tracking-wider mb-0.5">Guru</span>
                          <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm text-left leading-tight">
                            {t.name}
                          </h4>
                          <span className="text-[10px] text-slate-500 font-mono font-bold mt-1 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200/60">
                            NIK: {t.nik}
                          </span>
                        </div>

                        {/* Subjects/Classes */}
                        <div className="col-span-1 md:col-span-5 flex flex-col items-start">
                          <span className="md:hidden text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">Mata Pelajaran &amp; Rombel</span>
                          {t.subjectsTaught?.length === 0 ? (
                            <p className="text-[10px] text-slate-400 italic text-left font-medium">Beban mengajar belum ditentukan</p>
                          ) : (
                            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                              {t.subjectsTaught?.map((alloc, idx) => {
                                const subName = subjects.find(sub => sub.id === alloc.subjectId)?.name || alloc.subjectId;
                                return (
                                  <div key={idx} className="inline-flex flex-wrap items-center gap-1 bg-slate-50 border border-slate-200/50 px-2 py-0.5 rounded-lg text-[10px]">
                                    <span className="font-bold text-slate-700">{subName}</span>
                                    <span className="text-slate-350">|</span>
                                    <div className="flex flex-wrap gap-0.5">
                                      {alloc.classIds?.map(cid => (
                                        <span key={cid} className="bg-blue-50/60 text-blue-700 text-[9px] font-bold px-1.5 py-0.1 rounded border border-blue-100">
                                          {cid}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="col-span-1 md:col-span-2 flex md:justify-end gap-1.5 pt-2 md:pt-0 border-t border-dashed border-slate-100 md:border-t-0">
                          <button
                            onClick={() => openEditModal('guru', t)}
                            className="flex-1 md:flex-none text-slate-500 hover:text-teal-650 p-2 rounded-lg border border-slate-100 flex items-center justify-center gap-1 text-xs font-bold bg-slate-50 hover:bg-teal-50 cursor-pointer transition-colors"
                            title="Ubah Guru"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span className="md:hidden ml-1">Ubah</span>
                          </button>
                          <button
                            onClick={() => requestDelete('guru', t.id, t.name)}
                            className="flex-1 md:flex-none text-slate-500 hover:text-red-650 p-2 rounded-lg border border-slate-100 flex items-center justify-center gap-1 text-xs font-bold bg-slate-50 hover:bg-red-50 cursor-pointer transition-colors"
                            title="Hapus Guru"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span className="md:hidden ml-1">Hapus</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* TAB 5: KELOLA SISWA */}
        {activeTab === 'siswa' && (() => {
          const filteredStudents = students.filter(s => {
            const matchesSearch = s.name.toLowerCase().includes(studentSearch.toLowerCase()) || 
                                  s.nis.toLowerCase().includes(studentSearch.toLowerCase());
            const matchesClass = selectedAdminStudentClassFilter ? s.classId === selectedAdminStudentClassFilter : true;
            return matchesSearch && matchesClass;
          });
          return (
            <div className="space-y-6">
              {/* Filter and Action Bar */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200/50 shadow-sm">
                <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-3">
                  <p className="text-xs font-bold text-slate-500 shrink-0">
                    Jumlah: {filteredStudents.length} dari {students.length} siswa
                  </p>
                  
                  {/* Class Filter Dropdown */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-2xs font-extrabold text-slate-400 uppercase tracking-wider">Saring Rombel:</span>
                    <select
                      className="text-xs font-bold p-2 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-100/50 cursor-pointer"
                      value={selectedAdminStudentClassFilter}
                      onChange={(e) => setSelectedAdminStudentClassFilter(e.target.value)}
                    >
                      <option value="">-- Semua Kelas --</option>
                      {classes.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Search Input */}
                  <div className="relative flex-1 max-w-xs">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Cari nama atau NIS siswa..."
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                      className="w-full text-xs font-semibold pl-8.5 pr-3.5 py-2 border border-slate-200 rounded-lg outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-100/50 transition-all font-sans"
                    />
                    {studentSearch && (
                      <button 
                        type="button"
                        onClick={() => setStudentSearch('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 font-bold text-sm cursor-pointer"
                      >
                        &times;
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center flex-wrap gap-2 self-stretch md:self-auto justify-end">
                  {/* Download Template Button */}
                  <button
                    type="button"
                    onClick={downloadTemplate}
                    title="Unduh Template Excel / CSV"
                    className="bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-bold text-xs inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl transition cursor-pointer shadow-xs whitespace-nowrap"
                  >
                    <Download className="w-4 h-4 text-emerald-600" /> Unduh Template Excel
                  </button>

                  {/* Bulk Upload Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setBulkStudents([]);
                      setBulkError(null);
                      setIsBulkOpen(true);
                    }}
                    title="Upload Siswa Massal dari file Excel / CSV"
                    className="bg-indigo-50 hover:bg-indigo-100 border border-indigo-150 text-indigo-800 font-bold text-xs inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl transition cursor-pointer shadow-xs whitespace-nowrap"
                  >
                    <Upload className="w-4 h-4 text-indigo-600" /> Unggah Masal CSV
                  </button>

                  {/* Add Student Button */}
                  <button
                    type="button"
                    onClick={() => openCreateModal('siswa')}
                    className="bg-teal-600 text-white font-bold text-xs inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl hover:bg-teal-700 transition cursor-pointer shadow-md whitespace-nowrap"
                  >
                    <Plus className="w-4 h-4" /> Tambah Siswa
                  </button>
                </div>
              </div>

              {filteredStudents.length === 0 ? (
                <div className="bg-white p-12 text-center rounded-2xl border border-slate-200/55 text-slate-450 text-xs">
                  {students.length === 0 ? 'Belum ada siswa terdaftar. Klik Tambah Data Siswa.' : 'Siswa yang Anda cari tidak ditemukan.'}
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-xs text-slate-400 font-bold uppercase tracking-wider">
                          <th className="p-4 pl-6 text-left">NIS</th>
                          <th className="p-4 text-left">Nama</th>
                          <th className="p-4 text-left">Rombel Kelas</th>
                          <th className="p-4 pr-6 text-right">Opsi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                        {filteredStudents.map(s => (
                          <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-4 pl-6 font-mono font-medium text-slate-900 text-left">{s.nis}</td>
                            <td className="p-4 font-bold text-slate-950 text-left">{s.name}</td>
                            <td className="p-4 text-left">
                              <span className="bg-slate-100 px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-200 text-slate-700">
                                {classes.find(c => c.id === s.classId)?.name || s.classId}
                              </span>
                            </td>
                            <td className="p-4 pr-6 text-right">
                              <div className="inline-flex gap-1.5">
                                <button
                                  onClick={() => openEditModal('siswa', s)}
                                  className="text-slate-500 hover:text-teal-600 w-8 h-8 rounded-lg border border-slate-100 flex items-center justify-center bg-slate-50 hover:bg-teal-50 cursor-pointer"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => requestDelete('siswa', s.id, s.name)}
                                  className="text-slate-500 hover:text-red-600 w-8 h-8 rounded-lg border border-slate-100 flex items-center justify-center bg-slate-50 hover:bg-red-50 cursor-pointer"
                                  title="Hapus Siswa"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* TAB 6: PENGATURAN */}
        {activeTab === 'setting' && (
          <div className="max-w-md bg-white p-6 rounded-2xl border border-slate-200/60 shadow-xs space-y-6">
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Ubah Password Administrator</h4>
              <p className="text-xs text-slate-500 mt-1">Ubah kata sandi pimpinan atau admin utama demi keamanan data sekolah berkala.</p>
            </div>

            <form onSubmit={handleChangePwd} className="space-y-4">
              {pwdMsg.text && (
                <div className={`p-3 rounded-lg text-xs font-medium border flex items-center gap-1.5 ${
                  pwdMsg.type === 'error' ? 'bg-red-50 border-red-100 text-red-600' : 'bg-green-50 border-green-100 text-green-700'
                }`}>
                  {pwdMsg.type === 'error' ? <AlertCircle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  {pwdMsg.text}
                </div>
              )}

              <div>
                <label className="block text-[9px] font-black text-teal-700 uppercase tracking-widest mb-1.5 text-left">Password Sekarang</label>
                <input
                  type="password"
                  required
                  placeholder="Ketik password lama"
                  className="w-full text-xs font-mono px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-teal-600"
                  value={oldPwd}
                  onChange={(e) => setOldPwd(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[9px] font-black text-teal-700 uppercase tracking-widest mb-1.5 text-left">Password Baru</label>
                <input
                  type="password"
                  required
                  placeholder="Ketik password baru"
                  className="w-full text-xs font-mono px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-teal-600"
                  value={newPwd}
                  onChange={(e) => setNewPwd(e.target.value)}
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

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white text-slate-500 border-t border-slate-200 grid grid-cols-6 h-16 z-40 select-none pb-safe shadow-lg">
        <button
          onClick={() => setActiveTab('dash')}
          className={`flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors ${activeTab === 'dash' ? 'text-teal-600 font-extrabold' : 'hover:text-slate-950'}`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span className="text-[8px] tracking-tight">Mulai</span>
        </button>
        <button
          onClick={() => setActiveTab('kelas')}
          className={`flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors ${activeTab === 'kelas' ? 'text-teal-600 font-extrabold' : 'hover:text-slate-950'}`}
        >
          <School className="w-4 h-4" />
          <span className="text-[8px] tracking-tight">Kelas</span>
        </button>
        <button
          onClick={() => setActiveTab('mapel')}
          className={`flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors ${activeTab === 'mapel' ? 'text-teal-600 font-extrabold' : 'hover:text-slate-950'}`}
        >
          <BookOpen className="w-4 h-4" />
          <span className="text-[8px] tracking-tight">Mapel</span>
        </button>
        <button
          onClick={() => setActiveTab('guru')}
          className={`flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors ${activeTab === 'guru' ? 'text-teal-600 font-extrabold' : 'hover:text-slate-950'}`}
        >
          <UserCheck className="w-4 h-4" />
          <span className="text-[8px] tracking-tight">Guru</span>
        </button>
        <button
          onClick={() => setActiveTab('siswa')}
          className={`flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors ${activeTab === 'siswa' ? 'text-teal-600 font-extrabold' : 'hover:text-slate-950'}`}
        >
          <Users className="w-4 h-4" />
          <span className="text-[8px] tracking-tight">Siswa</span>
        </button>
        <button
          onClick={() => setActiveTab('setting')}
          className={`flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors ${activeTab === 'setting' ? 'text-teal-600 font-extrabold' : 'hover:text-slate-950'}`}
        >
          <Settings className="w-4 h-4" />
          <span className="text-[8px] tracking-tight">Sandi</span>
        </button>
      </nav>

      {/* OVERLAY FORMS MODAL */}
      <AnimatePresence>
        {modalType && targetEntity && (
          <div id="modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden border border-slate-100"
            >
              {/* Modal Head */}
              <div className="bg-slate-50 text-slate-955 px-6 py-5 border-b border-slate-200/80 flex justify-between items-center text-left">
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900 tracking-tight font-serif-heading">
                    {modalType === 'create' ? 'Tambah Data ' : 'Ubah Data '}
                    {targetEntity === 'kelas' && 'Kelas'}
                    {targetEntity === 'mapel' && 'Mata Pelajaran'}
                    {targetEntity === 'guru' && 'Guru'}
                    {targetEntity === 'siswa' && 'Siswa'}
                  </h4>
                  <p className="text-[10px] text-teal-650 font-mono tracking-wider uppercase font-bold mt-1">smp al irsyad surakarta</p>
                </div>
                <button
                  onClick={closeModal}
                  className="text-slate-400 hover:text-slate-700 w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-lg hover:bg-slate-100 cursor-pointer transition-colors"
                >
                  &times;
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                
                {/* FOR KELAS */}
                {targetEntity === 'kelas' && (
                  <form onSubmit={handleSaveClass} className="space-y-4">
                    <div>
                      <label className="block text-[9px] font-black text-teal-700 uppercase tracking-widest mb-1.5 text-left">Nama Kelas</label>
                      <input
                        type="text"
                        required
                        className="w-full text-xs font-semibold px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-teal-600"
                        placeholder="Contoh: Kelas 7A, 8B"
                        value={className}
                        onChange={(e) => setClassName(e.target.value)}
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs py-3 rounded-xl cursor-pointer"
                    >
                      {modalType === 'create' ? 'Mendaftarkan Kelas Baru' : 'Perbarui Deskripsi Kelas'}
                    </button>
                  </form>
                )}

                {/* FOR MAPEL */}
                {targetEntity === 'mapel' && (
                  <form onSubmit={handleSaveSubject} className="space-y-4">
                    <div>
                      <label className="block text-[9px] font-black text-teal-700 uppercase tracking-widest mb-1.5 text-left">Nama Mata Pelajaran</label>
                      <input
                        type="text"
                        required
                        className="w-full text-xs font-semibold px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-teal-600"
                        placeholder="Contoh: Pendidikan Agama Islam, Fisika"
                        value={subjectName}
                        onChange={(e) => setSubjectName(e.target.value)}
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs py-3 rounded-xl cursor-pointer"
                    >
                      {modalType === 'create' ? 'Mendaftarkan Mapel Baru' : 'Perbarui Mapel'}
                    </button>
                  </form>
                )}

                {/* FOR GURU */}
                {targetEntity === 'guru' && (
                  <form onSubmit={handleSaveTeacher} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[9px] font-black text-teal-700 uppercase tracking-widest mb-1.5 text-left">NIK Guru / Nomor Identitas</label>
                        <input
                          type="text"
                          required
                          disabled={modalType === 'edit'}
                          className="w-full text-xs font-mono px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-teal-600 disabled:bg-slate-100 disabled:text-slate-500"
                          placeholder="Masukkan NIK unik"
                          value={teacherNik}
                          onChange={(e) => setTeacherNik(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-black text-teal-700 uppercase tracking-widest mb-1.5 text-left">Nama Lengkap &amp; Gelar</label>
                        <input
                          type="text"
                          required
                          className="w-full text-xs font-semibold px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-teal-600"
                          placeholder="Contoh: Ustadz Amin, S.Si."
                          value={teacherName}
                          onChange={(e) => setTeacherName(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-black text-teal-700 uppercase tracking-widest mb-1.5 text-left">Password Akun {modalType === 'edit' && '(Bisa Diubah)'}</label>
                        <input
                          type="text"
                          required
                          className="w-full text-xs font-mono px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-teal-600"
                          placeholder={modalType === 'create' ? "Default sama dengan NIK" : "Password guru"}
                          value={userPassword}
                          onChange={(e) => setUserPassword(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Manage assignments with mini form */}
                    <div className="border border-slate-100 p-4 rounded-xl bg-slate-50 space-y-3">
                      <p className="text-[9px] font-black text-teal-700 uppercase tracking-widest text-left">Alokasikan Beban Pengajaran</p>
                      
                      <div className="grid grid-cols-1 gap-2">
                        <select
                          className="w-full text-xs bg-white px-3 py-2.5 rounded-xl border border-slate-200"
                          value={tempSubjectId}
                          onChange={(e) => setTempSubjectId(e.target.value)}
                        >
                          <option value="">-- Pilih Mata Pelajaran --</option>
                          {subjects.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                        </select>
                        
                        <div className="space-y-1">
                          <p className="text-[9px] font-black text-teal-700 uppercase tracking-widest text-left">Rombel Kelas yang Diampu:</p>
                          <div className="flex flex-wrap gap-1.5 bg-white p-2 rounded-xl border">
                            {classes.map(c => {
                              const isChecked = tempClassIds.includes(c.id);
                              return (
                                <button
                                  type="button"
                                  key={c.id}
                                  onClick={() => {
                                    if (isChecked) {
                                      setTempClassIds(tempClassIds.filter(id => id !== c.id));
                                    } else {
                                      setTempClassIds([...tempClassIds, c.id]);
                                    }
                                  }}
                                  className={`px-2 py-1 rounded text-2xs font-bold transition ${
                                    isChecked ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                  }`}
                                >
                                  {c.name}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={addSubjectAllocation}
                          className="bg-slate-900 text-white font-bold text-xs py-2 rounded-xl cursor-pointer"
                        >
                          Tambahkan Pengajaran Guru
                        </button>
                      </div>

                      {/* Display table of Allocations */}
                      <div className="max-h-24 overflow-y-auto space-y-1 mt-2">
                        {teacherSubjects.map((alloc, idx) => {
                          const sub = subjects.find(s => s.id === alloc.subjectId);
                          return (
                            <div key={idx} className="bg-white border rounded p-2 flex justify-between items-center text-xs">
                              <div className="text-left">
                                <p className="font-bold text-slate-900">{sub?.name || alloc.subjectId}</p>
                                <p className="text-2xs text-slate-500">Kelas: {alloc.classIds.join(', ') || 'Belum dipilih'}</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeSubjectAllocation(alloc.subjectId)}
                                className="text-red-500 font-bold hover:text-red-700 p-1 font-mono"
                              >
                                Hapus
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs py-3 rounded-xl cursor-pointer"
                    >
                      {modalType === 'create' ? 'Daarkan Guru' : 'Simpan Update Profil Guru'}
                    </button>
                  </form>
                )}

                {/* FOR SISWA */}
                {targetEntity === 'siswa' && (
                  <form onSubmit={handleSaveStudent} className="space-y-4 font-sans">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[9px] font-black text-teal-700 uppercase tracking-widest mb-1.5 text-left">NIS Siswa / Nomor Registrasi</label>
                        <input
                          type="text"
                          required
                          disabled={modalType === 'edit'}
                          className="w-full text-xs font-mono px-4 py-3 pr-10 rounded-xl border border-slate-200 outline-none focus:border-teal-600 disabled:bg-slate-100 disabled:text-slate-500"
                          placeholder="Masukkan NIS murid"
                          value={studentNis}
                          onChange={(e) => setStudentNis(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-black text-teal-700 uppercase tracking-widest mb-1.5 text-left">Nama Siswa Lengkap</label>
                        <input
                          type="text"
                          required
                          className="w-full text-xs font-semibold px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-teal-600"
                          placeholder="Nama lengkap murid"
                          value={studentName}
                          onChange={(e) => setStudentName(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-black text-teal-700 uppercase tracking-widest mb-1.5 text-left">Password Akun {modalType === 'edit' && '(Bisa Diubah)'}</label>
                        <input
                          type="text"
                          required
                          className="w-full text-xs font-mono px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-teal-600"
                          placeholder={modalType === 'create' ? "Default sama dengan NIS" : "Password siswa"}
                          value={userPassword}
                          onChange={(e) => setUserPassword(e.target.value)}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[9px] font-black text-teal-700 uppercase tracking-widest mb-1.5 text-left">Alokasikan Kelas Belajar</label>
                      <select
                        required
                        className="w-full text-xs bg-white px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-teal-600"
                        value={studentClassId}
                        onChange={(e) => setStudentClassId(e.target.value)}
                      >
                        <option value="">-- Pilih Kelas --</option>
                        {classes.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs py-3 rounded-xl cursor-pointer"
                    >
                      {modalType === 'create' ? 'Daftarkan Murid Baru' : 'Simpan Update Profil Siswa'}
                    </button>
                  </form>
                )}

              </div>
            </motion.div>
          </div>
        )}

        {deleteConfirm.isOpen && (
          <div id="delete-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-xs p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-slate-100"
            >
              {/* Head */}
              <div className="bg-red-50 border-b border-red-100 p-5 flex items-start gap-4">
                <div className="bg-red-100 text-red-700 w-10 h-10 rounded-full flex items-center justify-center shrink-0">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <h4 className="font-bold text-red-950 text-base font-sans">Konfirmasi Hapus Data</h4>
                  <p className="text-xs text-red-700 font-medium mt-1 leading-relaxed font-sans">
                    Apakah Anda yakin ingin menghapus data <strong>{deleteConfirm.title}</strong>? Tindakan ini bersifat permanen dan tidak dapat dibatalkan.
                  </p>
                </div>
              </div>

              {/* Info Detail */}
              <div className="p-5 bg-slate-50 border-b border-slate-100 text-left font-mono text-[10px] text-slate-500 space-y-1">
                <div><span className="font-extrabold uppercase text-slate-400 mr-2">Kategori:</span> {deleteConfirm.type?.toUpperCase()}</div>
                <div><span className="font-extrabold uppercase text-slate-400 mr-2">ID Database:</span> {deleteConfirm.id}</div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 bg-white flex justify-end gap-2.5 font-sans">
                <button
                  type="button"
                  onClick={() => setDeleteConfirm({ isOpen: false, type: null, id: '', title: '' })}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-200/40 rounded-xl cursor-pointer transition-all"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={executeDelete}
                  className="px-4 py-2 text-xs font-extrabold text-white bg-red-600 hover:bg-red-700 rounded-xl cursor-pointer shadow-xs hover:shadow-sm transition-all inline-flex items-center gap-1.5"
                >
                  Ya, Hapus Permanen
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {isBulkOpen && (
          <div id="bulk-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 backdrop-blur-xs p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden border border-slate-150 my-8 shadow-2xl"
            >
              {/* Modal Head */}
              <div className="bg-slate-50 text-slate-955 px-6 py-5 border-b border-slate-250 flex justify-between items-center text-left">
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900 tracking-tight font-sans">
                    Unggah Massal Data Siswa
                  </h4>
                  <p className="text-2xs text-slate-500 font-medium mt-0.5">
                    Tambahkan banyak data siswa sekaligus menggunakan spreadsheet Excel atau CSV
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsBulkOpen(false);
                    setBulkStudents([]);
                    setBulkError(null);
                  }}
                  className="text-slate-400 hover:text-slate-705 w-8 h-8 rounded-full hover:bg-slate-200/50 flex items-center justify-center cursor-pointer transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6 text-left max-h-[70vh] overflow-y-auto">
                {/* Instructions */}
                <div className="space-y-4 bg-slate-50/80 p-4 rounded-xl border border-slate-200 text-xs text-slate-600">
                  <h5 className="font-bold text-slate-800 text-2xs uppercase tracking-wider">Petunjuk Penting:</h5>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>Gunakan tombol <strong>Unduh Template Excel</strong> untuk mendapatkan format kolom data yang benar.</li>
                    <li>Pastikan kolom <strong>NIS</strong> tidak ganda atau sudah terdaftar sebelumnya.</li>
                    <li>Jika rombel kelas yang dimasukkan belum terdaftar di aplikasi (misal: kelas baru <code className="bg-slate-200 px-1 py-0.5 rounded font-mono">VII-C</code>), sistem <strong>akan otomatis membuat kelas baru tersebut</strong> agar impor berjalan lancar tanpa terhambat.</li>
                  </ul>
                </div>

                {bulkStudents.length === 0 ? (
                  /* Uploader Area */
                  <div>
                    <label className="block text-2xs font-extrabold text-slate-400 uppercase tracking-wider mb-2">
                      Pilih & Unggah File CSV / Excel hasil edit:
                    </label>
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${
                        isDragging 
                          ? 'border-indigo-600 bg-indigo-50/30' 
                          : 'border-slate-300 hover:border-indigo-400 bg-slate-50/30 text-slate-500'
                      }`}
                      onClick={() => document.getElementById('bulk-csv-input')?.click()}
                    >
                      <input
                        id="bulk-csv-input"
                        type="file"
                        accept=".csv"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleCSVUpload(e.target.files[0]);
                          }
                        }}
                      />
                      <div className="bg-indigo-50 text-indigo-600 w-12 h-12 rounded-full flex items-center justify-center mb-3 shadow-xs">
                        <Upload className="w-6 h-6 animate-pulse" />
                      </div>
                      <p className="text-xs font-bold text-slate-800">
                        Klik untuk memilih file atau seret file ke sini
                      </p>
                      <p className="text-2xs text-slate-400 mt-1">
                        Mendukung file berformat .csv yang disimpan dari Google Sheets atau Microsoft Excel
                      </p>
                    </div>

                    {bulkError && (
                      <div className="mt-3 flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-lg text-xs text-red-700">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span className="font-semibold">{bulkError}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Preview Area */
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="block text-2xs font-extrabold text-slate-400 uppercase tracking-wider">
                        Pratinjau Data yang Terdeteksi ({bulkStudents.length} siswa):
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setBulkStudents([]);
                          setBulkError(null);
                        }}
                        className="text-2xs text-red-600 hover:text-red-800 font-bold cursor-pointer underline decoration-dotted"
                      >
                        Ganti File CSV
                      </button>
                    </div>

                    <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs max-h-[300px] overflow-y-auto">
                      <table className="w-full text-left border-collapse text-2xs font-sans">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-slate-450 font-bold uppercase tracking-wider">
                            <th className="p-3 pl-4">NIS</th>
                            <th className="p-3">Nama Lengkap</th>
                            <th className="p-3">Rombel Kelas</th>
                            <th className="p-3 pr-4">Status Kelas</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700 bg-white">
                          {bulkStudents.map((item, index) => {
                            const exactClassId = findClassIdByInput(item.classInput);
                            return (
                              <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                                <td className="p-3 pl-4 font-mono font-bold text-slate-900">{item.nis}</td>
                                <td className="p-3 font-semibold text-slate-900">{item.name}</td>
                                <td className="p-3">
                                  <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-slate-800 font-bold">
                                    {item.classInput}
                                  </span>
                                </td>
                                <td className="p-3 pr-4">
                                  {exactClassId ? (
                                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> Cocok dengan Rombel Aktif
                                    </span>
                                  ) : (
                                    <span className="text-amber-700 font-bold flex items-center gap-1">
                                      <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 animate-pulse" /> Rombel Baru (Sistem Buat Otomatis)
                                    </span>
                                  )}
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

              {/* Modal Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2.5 font-sans">
                <button
                  type="button"
                  onClick={() => {
                    setIsBulkOpen(false);
                    setBulkStudents([]);
                    setBulkError(null);
                  }}
                  className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-200/40 rounded-xl cursor-pointer transition-all"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={bulkStudents.length === 0}
                  onClick={handleSaveBulkStudents}
                  className={`px-5 py-2.5 text-xs font-extrabold text-white rounded-xl cursor-pointer transition-all inline-flex items-center gap-1.5 shadow-sm ${
                    bulkStudents.length === 0 
                      ? 'bg-slate-350 cursor-not-allowed text-slate-450 shadow-none' 
                      : 'bg-teal-600 hover:bg-teal-700 shadow-md'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" /> Import Sekarang
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
