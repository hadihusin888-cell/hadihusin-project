import React, { useState } from 'react';
import { useDb } from '../context/DbContext';
import { School, ArrowRight, User, Shield, GraduationCap, Lock, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function LandingPage() {
  const { login, currentUser } = useDb();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [role, setRole] = useState<'ADMIN' | 'TEACHER' | 'STUDENT'>('STUDENT');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const triggerFill = (user: string, pass: string, targetRole: 'ADMIN' | 'TEACHER' | 'STUDENT') => {
    setRole(targetRole);
    setUsername(user);
    setPassword(pass);
    setErrorMsg('');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setErrorMsg('Semua kolom wajib diisi.');
      return;
    }
    try {
      login(username, password, role);
      setIsLoginOpen(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Login gagal.');
    }
  };

  return (
    <div id="landing-container" className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans transition-colors relative">
      {/* Decorative Top Accent with delicate color gradient */}
      <div className="h-[3.5px] bg-gradient-to-r from-teal-600 via-teal-400 to-emerald-500 w-full animate-pulse" />

      {/* Sticky Header with subtle backdrop blur & border */}
      <header id="main-header" className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/50 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div id="school-branding" className="flex items-center gap-3">
            <img 
              src="https://www.alirsyad.or.id/wp-content/uploads/download/alirsyad-alislamiyyah.png" 
              alt="Logo Al Irsyad" 
              className="w-12 h-12 object-contain"
              referrerPolicy="no-referrer"
            />
            <div>
              <h1 className="font-extrabold text-slate-900 text-base md:text-lg tracking-tight leading-tight">SMP AL ISRYAD</h1>
              <p className="text-[10px] text-slate-400 font-mono tracking-widest mt-0.5 font-semibold">SURAKARTA</p>
            </div>
          </div>

          <button 
            id="login-trigger"
            onClick={() => {
              setIsLoginOpen(true);
              setErrorMsg('');
            }}
            className="bg-teal-600 text-white font-semibold text-xs md:text-sm px-5 py-2.5 rounded-full hover:bg-teal-700 hover:shadow-lg hover:shadow-teal-600/10 transition-all duration-200 cursor-pointer active:scale-95"
          >
            Masuk Portal
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main id="main-hero" className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 py-12 lg:py-20 items-center">
        {/* Left column info */}
        <div id="hero-info" className="lg:col-span-6 space-y-6">
          <span className="bg-teal-50/80 text-teal-700 text-2xs font-mono font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border border-teal-100/80">
            ✦ Sistem E-Learning Resmi
          </span>
          <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-[1.12]">
            Membentuk Generasi Beradab &amp; Unggul
          </h2>
          <p className="text-slate-600 leading-relaxed text-sm sm:text-base max-w-xl">
            Selamat datang di portal pembelajaran digital SMP Al Irsyad Surakarta. Platform e-learning ini dirancang khusus untuk memfasilitasi integrasi pengajaran adab, ilmu pengetahuan, serta pemantauan nilai berkala secara transparan dan responsif.
          </p>

          <div id="stats-grid" className="grid grid-cols-3 gap-4 py-4 max-w-md">
            <div className="bg-white p-4 rounded-2xl border border-slate-200/50 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:-translate-y-0.5 transition-all duration-200">
              <p className="text-2xl font-black text-teal-600">6+</p>
              <p className="text-[11px] text-slate-500 font-semibold mt-0.5">Kelas Aktif</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200/50 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:-translate-y-0.5 transition-all duration-200">
              <p className="text-2xl font-black text-teal-600">300+</p>
              <p className="text-[11px] text-slate-500 font-semibold mt-0.5">Siswa Didik</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200/50 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:-translate-y-0.5 transition-all duration-200">
              <p className="text-2xl font-black text-teal-600">100%</p>
              <p className="text-[11px] text-slate-500 font-semibold mt-0.5">Akademik</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <button 
              id="hero-cta"
              onClick={() => setIsLoginOpen(true)}
              className="bg-gradient-to-r from-teal-600 to-teal-700 text-white font-bold inline-flex items-center gap-2 px-6 py-3 rounded-xl hover:from-teal-700 hover:to-teal-800 transition-all duration-200 cursor-pointer shadow-md shadow-teal-700/10 hover:shadow-lg hover:shadow-teal-700/20 active:scale-98"
            >
              Mulai Belajar Sekarang <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right column: Photo/Illustration */}
        <div id="hero-image-wrapper" className="lg:col-span-6 relative">
          <div className="absolute -inset-2 bg-gradient-to-tr from-teal-500 to-emerald-400 rounded-[2.5rem] blur-xl opacity-20" />
          <div className="relative bg-white p-3 rounded-[2rem] border border-slate-200/80 shadow-[0_20px_50px_rgba(15,118,110,0.06)] overflow-hidden aspect-[4/3] sm:aspect-video lg:aspect-square flex items-center justify-center">
            <img 
              id="landing-hero-pict"
              src="https://lh3.googleusercontent.com/d/1UUu1g44S1cmZcF49ze4CyKL2RUyeeba_" 
              alt="Gedung SMP Al Irsyad Surakarta" 
              className="w-full h-full object-cover rounded-[1.5rem] shadow-inner hover:scale-102 transition-transform duration-300 ease-out"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </main>

      {/* Highlights / Visions */}
      <section id="features-highlights" className="bg-white border-t border-slate-200/50 py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-center font-bold text-xs uppercase tracking-[0.2em] text-slate-400 mb-12">pilar utama pendidikan kami</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-50/70 p-7 rounded-2xl border border-slate-200/40 hover:border-teal-200/60 hover:bg-white hover:shadow-xl hover:shadow-teal-700/[0.02] transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                <School className="w-5.5 h-5.5" />
              </div>
              <h4 className="font-extrabold text-slate-900 mb-2.5">Adab &amp; Akhlak Mulia</h4>
              <p className="text-slate-600 text-sm leading-relaxed">Menanamkan nilai-nilai keislaman, kejujuran, kemandirian serta tata krama luhur dalam keseharian siswa.</p>
            </div>
            <div className="bg-slate-50/70 p-7 rounded-2xl border border-slate-200/40 hover:border-teal-200/60 hover:bg-white hover:shadow-xl hover:shadow-teal-700/[0.02] transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                <GraduationCap className="w-5.5 h-5.5" />
              </div>
              <h4 className="font-extrabold text-slate-900 mb-2.5">Kurikulum Unggulan</h4>
              <p className="text-slate-600 text-sm leading-relaxed">Menggabungkan mata pelajaran akademis nasional dengan penguatan bahasa asing serta kajian keagamaan.</p>
            </div>
            <div className="bg-slate-50/70 p-7 rounded-2xl border border-slate-200/40 hover:border-teal-200/60 hover:bg-white hover:shadow-xl hover:shadow-teal-700/[0.02] transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                <User className="w-5.5 h-5.5" />
              </div>
              <h4 className="font-extrabold text-slate-900 mb-2.5">Pendampingan Individual</h4>
              <p className="text-slate-600 text-sm leading-relaxed">Sistem kelas intensif di mana guru mendampingi perkembangan tugas dan kompetensi pribadi anak secara utuh.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="main-footer" className="bg-slate-900 text-slate-300 py-12 border-t border-slate-950/40">
        <div id="footer-inner" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-xs sm:text-sm">
          <div className="text-center md:text-left space-y-2">
            <div className="flex items-center justify-center md:justify-start gap-2.5">
              <img 
                src="https://www.alirsyad.or.id/wp-content/uploads/download/alirsyad-alislamiyyah.png" 
                alt="Logo Al Irsyad Surakarta" 
                className="w-8 h-8 object-contain bg-white p-1 rounded-lg border border-slate-200"
                referrerPolicy="no-referrer"
              />
              <p className="text-white font-extrabold text-sm tracking-tight font-serif-heading">SMP Al Irsyad Surakarta</p>
            </div>
            <p className="text-slate-350 max-w-md leading-relaxed text-2xs md:text-xs">
              Jl Kapten Mulyadi No 117 Pasar Kliwon Surakarta Jawa Tengah
            </p>
            <p className="text-teal-400 font-bold font-mono text-2xs tracking-wider">
              📞 Hubungi Kami: 0851-3598-1539
            </p>
          </div>
          <p className="text-slate-400 text-center md:text-right text-2xs">
            &copy; 2026 HUMAS SMP AL IRSYAD SURAKARTA
          </p>
        </div>
      </footer>

      {/* Login Portal Drawer/Modal */}
      <AnimatePresence>
        {isLoginOpen && (
          <div id="login-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-[2px] p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              id="login-card"
              className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200/50 overflow-hidden"
            >
              {/* Top Banner on Modal */}
              <div className="bg-slate-50 border-b border-slate-150 text-slate-900 p-7 flex flex-col justify-end relative">
                <button 
                  id="close-login"
                  onClick={() => setIsLoginOpen(false)}
                  className="absolute top-5 right-5 text-slate-450 hover:text-slate-800 transition-colors w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-lg hover:bg-slate-100 cursor-pointer font-extrabold"
                >
                  &times;
                </button>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full bg-teal-600 animate-pulse" />
                  <p className="text-[10px] font-mono tracking-widest uppercase text-teal-750 font-bold">e-learning portal</p>
                </div>
                <h4 className="text-2xl font-extrabold tracking-tight font-serif-heading text-slate-900">Masuk Akademis</h4>
                <p className="text-xs text-slate-500 mt-1">Gunakan akun SMP Al Irsyad Surakarta Anda</p>
              </div>

              <div className="p-6">
                {/* Role Tabs */}
                <div id="login-role-tabs" className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl mb-6">
                  <button
                    onClick={() => { setRole('STUDENT'); setUsername(''); setPassword(''); setErrorMsg(''); }}
                    className={`inline-flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold tracking-tight transition-all cursor-pointer ${
                      role === 'STUDENT' ? 'bg-white shadow-sm text-teal-700' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <GraduationCap className="w-4 h-4" /> Siswa
                  </button>
                  <button
                    onClick={() => { setRole('TEACHER'); setUsername(''); setPassword(''); setErrorMsg(''); }}
                    className={`inline-flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold tracking-tight transition-all cursor-pointer ${
                      role === 'TEACHER' ? 'bg-white shadow-sm text-teal-700' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <User className="w-4 h-4" /> Guru
                  </button>
                  <button
                    onClick={() => { setRole('ADMIN'); setUsername(''); setPassword(''); setErrorMsg(''); }}
                    className={`inline-flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold tracking-tight transition-all cursor-pointer ${
                      role === 'ADMIN' ? 'bg-white shadow-sm text-teal-700' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Shield className="w-4 h-4" /> Admin
                  </button>
                </div>

                {/* Form fields */}
                <form onSubmit={handleLogin} className="space-y-4">
                  {errorMsg && (
                    <div id="login-error" className="bg-rose-50 text-rose-600 text-xs font-bold p-3.5 rounded-xl border border-rose-100">
                      {errorMsg}
                    </div>
                  )}

                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                      {role === 'ADMIN' ? 'Username Admin' : role === 'TEACHER' ? 'NIK Guru' : 'NIS Siswa'}
                    </label>
                    <input
                      id="login-username-input"
                      type="text"
                      className="w-full text-sm font-semibold px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100/50 transition-all font-mono"
                      placeholder={role === 'ADMIN' ? 'Ketik admin' : role === 'TEACHER' ? 'Contoh: 19830512' : 'Contoh: 202401'}
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">Passcode / Kata Sandi</label>
                    <div className="relative">
                      <input
                        id="login-password-input"
                        type={showPassword ? 'text' : 'password'}
                        className="w-full text-sm font-semibold px-4 py-3 pr-10 rounded-xl border border-slate-200 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100/50 transition-all font-mono"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 hover:text-slate-600 w-6 h-6 flex items-center justify-center cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1.5 font-medium">
                      {role === 'ADMIN' ? 'Bawaan: admin123' : `Bawaan: sama dengan ${role === 'TEACHER' ? 'NIK' : 'NIS'}`}
                    </p>
                  </div>

                  <button
                    id="submit-login"
                    type="submit"
                    className="w-full bg-gradient-to-r from-teal-600 to-teal-700 text-white font-bold py-3.5 rounded-xl hover:from-teal-700 hover:to-teal-800 transition-all shadow-sm active:scale-98 mt-2 cursor-pointer inline-flex items-center justify-center gap-1.5"
                  >
                    <Lock className="w-4 h-4" /> Masuk Portal
                  </button>
                </form>

                {/* Demonstration shortcuts */}
                <div id="login-helper" className="border-t border-slate-150 mt-6 pt-5">
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide mb-2.5">Akses Demo / Uji Coba Cepat:</p>
                  <div className="grid grid-cols-1 gap-2">
                    <button
                      type="button"
                      onClick={() => triggerFill('202401', '202401', 'STUDENT')}
                      className="text-left text-xs bg-slate-50 hover:bg-teal-50 border border-slate-100 hover:border-teal-100/80 p-2 text-slate-600 hover:text-teal-700 cursor-pointer transition-all rounded-lg flex items-center justify-between"
                    >
                      <span className="font-semibold">Siswa: <b>Muhammad Ali</b> (7A)</span>
                      <span className="font-mono text-[10px] bg-white border border-slate-200/50 px-1.5 py-0.5 rounded text-slate-500 font-bold">NIS: 202401</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => triggerFill('19830512', '19830512', 'TEACHER')}
                      className="text-left text-xs bg-slate-50 hover:bg-teal-50 border border-slate-100 hover:border-teal-100/80 p-2 text-slate-600 hover:text-teal-700 cursor-pointer transition-all rounded-lg flex items-center justify-between"
                    >
                      <span className="font-semibold">Guru: <b>Ustadzah Fatimah</b></span>
                      <span className="font-mono text-[10px] bg-white border border-slate-200/50 px-1.5 py-0.5 rounded text-slate-500 font-bold">NIK: 19830512</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => triggerFill('admin', 'admin123', 'ADMIN')}
                      className="text-left text-xs bg-slate-50 hover:bg-teal-50 border border-slate-100 hover:border-teal-100/80 p-2 text-slate-600 hover:text-teal-700 cursor-pointer transition-all rounded-lg flex items-center justify-between"
                    >
                      <span className="font-semibold">Admin Utama</span>
                      <span className="font-mono text-[10px] bg-white border border-slate-200/50 px-1.5 py-0.5 rounded text-slate-500 font-bold">admin123</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
