import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, CheckCircle, X, Share2, PlusSquare } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [justInstalled, setJustInstalled] = useState(false);

  const handleInstallClick = async () => {
    const success = await install();
    if (success) {
      setJustInstalled(true);
      setTimeout(() => setJustInstalled(false), 5000);
    }
  };

  if (isInstalled || justInstalled) {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-medium">
        <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
        <span>PWA Instalado</span>
      </div>
    );
  }

  return (
    <>
      {isInstallable && (
        <button
          onClick={handleInstallClick}
          className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-colors cursor-pointer"
          title="Instalar DataSphere Academic como aplicativo no dispositivo"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Instalar PWA</span>
        </button>
      )}

      {isIOS && !isInstallable && (
        <button
          onClick={() => setShowIOSGuide(true)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-200 transition-colors cursor-pointer"
        >
          <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
          <span>Instalar no iPhone / iPad</span>
        </button>
      )}

      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-xl bg-slate-900 border border-slate-800 p-5 shadow-2xl text-slate-100 relative">
            <button
              onClick={() => setShowIOSGuide(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200"
              aria-label="Fechar"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
                <Smartphone className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white">Instalar DataSphere no iOS</h3>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Instale o aplicativo diretamente sem usar a App Store. Funciona offline com cache inteligente.
            </p>

            <div className="space-y-2.5 text-xs text-slate-300 bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 mb-4">
              <div className="flex items-start gap-2.5">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-800 text-cyan-400 font-bold shrink-0">1</span>
                <span>Toque no botão <strong className="text-white inline-flex items-center gap-1"><Share2 className="w-3 h-3 text-cyan-400" /> Compartilhar</strong> na barra do Safari.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-800 text-cyan-400 font-bold shrink-0">2</span>
                <span>Role para baixo e selecione <strong className="text-white inline-flex items-center gap-1"><PlusSquare className="w-3 h-3 text-emerald-400" /> Adicionar à Tela de Início</strong>.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-800 text-cyan-400 font-bold shrink-0">3</span>
                <span>Confirme em <strong>Adicionar</strong>. O DataSphere funcionará como um app nativo!</span>
              </div>
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full rounded-lg bg-slate-800 hover:bg-slate-700 py-2 text-xs font-medium text-white transition-colors"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
};
