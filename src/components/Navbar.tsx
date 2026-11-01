import React from 'react';
import { PWAInstallButton } from './PWAInstallButton';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import {
  Compass,
  Network,
  Brain,
  Database,
  Package,
  Cloud,
  Activity,
  Bookmark,
  Wifi,
  WifiOff,
  Plus,
  MessageSquare,
  Dna
} from 'lucide-react';

export type NavTab =
  | 'explorer'
  | 'chat'
  | 'bioscience'
  | 'graph'
  | 'ai'
  | 'database'
  | 'multiplatform'
  | 'deploy'
  | 'diagnostics';

interface NavbarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  savedCount: number;
  onOpenAddPaper: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  savedCount,
  onOpenAddPaper,
}) => {
  const isOnline = useOnlineStatus();

  const navItems: { id: NavTab; label: string; icon: React.ReactNode }[] = [
    { id: 'explorer', label: 'Explorador', icon: <Compass className="w-4 h-4" /> },
    { id: 'chat', label: 'Chatbot IA', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'bioscience', label: '3D Biociência', icon: <Dna className="w-4 h-4" /> },
    { id: 'graph', label: 'Grafo Semântico', icon: <Network className="w-4 h-4" /> },
    { id: 'ai', label: 'Síntese IA', icon: <Brain className="w-4 h-4" /> },
    { id: 'database', label: 'DuckDB & Vetores', icon: <Database className="w-4 h-4" /> },
    { id: 'multiplatform', label: 'Multiplataforma', icon: <Package className="w-4 h-4" /> },
    { id: 'deploy', label: 'Deploy & IPFS', icon: <Cloud className="w-4 h-4" /> },
    { id: 'diagnostics', label: 'Diagnóstico', icon: <Activity className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand Logo & Title */}
          <div
            onClick={() => onSelectTab('explorer')}
            className="flex items-center gap-3 cursor-pointer select-none shrink-0"
          >
            {/* Custom SVG DataSphere Emblem */}
            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-sky-500 p-0.5 shadow-lg shadow-indigo-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center relative overflow-hidden">
                <span className="w-4 h-4 rounded-full bg-gradient-to-r from-sky-400 to-indigo-400 animate-pulse" />
                <div className="absolute inset-0 border border-white/20 rounded-[10px]" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold tracking-tight text-white font-sans">
                  DataSphere
                </span>
                <span className="text-xs font-mono font-medium text-cyan-400">
                  Academic
                </span>
              </div>
              <div className="text-[10px] text-slate-400 -mt-0.5 hidden sm:block">
                Open Science & Research Core v2.4
              </div>
            </div>
          </div>

          {/* Center Navigation Links (Clean typography with active indicator) */}
          <nav className="hidden lg:flex items-center gap-1 overflow-x-auto text-xs">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                    isActive
                      ? 'bg-slate-800 text-slate-100 shadow-xs'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <span className={isActive ? 'text-indigo-400' : 'text-slate-500'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Items */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Agregar Artigo Button */}
            <button
              onClick={onOpenAddPaper}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-medium transition cursor-pointer shadow-sm"
              title="Agregar novo artigo ou dataset científico"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Agregar</span>
            </button>

            {/* PWA Install Button */}
            <PWAInstallButton />

            {/* Online/Offline status pill */}
            <div
              className={`hidden sm:flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-md border ${
                isOnline
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
              }`}
              title={isOnline ? 'Conexão ativa' : 'Modo offline'}
            >
              {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
              <span>{isOnline ? 'Online' : 'Offline'}</span>
            </div>

            {/* Saved items counter */}
            {savedCount > 0 && (
              <button
                onClick={() => onSelectTab('explorer')}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-950/60 border border-indigo-800/60 text-xs text-indigo-300 hover:bg-indigo-900/40 transition cursor-pointer"
                title={`${savedCount} artigos salvos na biblioteca`}
              >
                <Bookmark className="w-3.5 h-3.5 text-indigo-400 fill-indigo-400" />
                <span className="font-semibold">{savedCount}</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation Scrollbar */}
        <div className="flex lg:hidden items-center gap-1 overflow-x-auto py-2 border-t border-slate-900 text-xs no-scrollbar">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md whitespace-nowrap font-medium transition cursor-pointer ${
                  isActive
                    ? 'bg-slate-800 text-slate-100'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
