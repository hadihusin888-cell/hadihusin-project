import React from 'react';
import { DbProvider, useDb } from './context/DbContext';
import LandingPage from './components/LandingPage';
import AdminPanel from './components/AdminPanel';
import TeacherPanel from './components/TeacherPanel';
import StudentPanel from './components/StudentPanel';
import { School } from 'lucide-react';

function ActivePortal() {
  const { currentUser, isLoading } = useDb();

  if (isLoading) {
    return (
      <div id="loading-fallback" className="min-h-screen bg-slate-50 flex flex-col items-center justify-center font-sans">
        <div id="loader" className="flex flex-col items-center gap-4 text-slate-800 text-center">
          <div className="bg-white p-4 rounded-3xl shadow-xl border border-slate-100 animate-bounce">
            <img 
              src="https://www.alirsyad.or.id/wp-content/uploads/download/alirsyad-alislamiyyah.png" 
              alt="Logo Al Irsyad Surakarta" 
              className="w-14 h-14 object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <h3 className="font-extrabold text-lg tracking-tight font-serif-heading text-slate-900">SMP Al Irsyad Surakarta</h3>
            <p className="text-[10px] text-slate-400 font-mono tracking-widest mt-1.5 uppercase font-bold">Memuat E-Learning...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <LandingPage />;
  }

  switch (currentUser.role) {
    case 'ADMIN':
      return <AdminPanel />;
    case 'TEACHER':
      return <TeacherPanel />;
    case 'STUDENT':
      return <StudentPanel />;
    default:
      return <LandingPage />;
  }
}

export default function App() {
  return (
    <DbProvider>
      <ActivePortal />
    </DbProvider>
  );
}
