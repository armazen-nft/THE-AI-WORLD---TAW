import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff, Database } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-lg bg-amber-600/90 backdrop-blur-md px-3.5 py-2 text-xs font-medium text-white shadow-xl border border-amber-500/30 animate-in slide-in-from-bottom duration-300">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-200 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-100"></span>
      </span>
      <WifiOff className="w-3.5 h-3.5 text-amber-100" />
      <span>Modo Offline Ativo — Consultando acervo em cache local (IndexedDB)</span>
    </div>
  );
};
