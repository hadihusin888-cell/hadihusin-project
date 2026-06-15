import React from 'react';
import { useDb } from '../context/DbContext';
import { RefreshCw, CheckCircle2 } from 'lucide-react';

export default function SyncIndicator() {
  const { isSyncing, lastSynced, refreshData } = useDb();

  return (
    <button
      id="manual-sync-btn"
      onClick={() => {
        if (!isSyncing) {
          refreshData();
        }
      }}
      disabled={isSyncing}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all text-2xs font-bold leading-normal cursor-pointer select-none shadow-2xs ${
        isSyncing
          ? 'bg-amber-50 border-amber-200 text-amber-700 animate-pulse cursor-not-allowed'
          : 'bg-white hover:bg-slate-50 border-slate-250/75 hover:border-slate-300 text-slate-700 active:scale-95'
      }`}
      title="Klik untuk menyinkronkan data terbaru dari server seketika"
    >
      <RefreshCw className={`w-3 h-3 text-teal-605 ${isSyncing ? 'animate-spin' : ''}`} />
      <span>
        {isSyncing ? 'Sinkron...' : lastSynced ? `Sinkron: ${lastSynced}` : 'Sinkron: Aktif'}
      </span>
      {!isSyncing && (
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping inline-block" />
      )}
    </button>
  );
}
