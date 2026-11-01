import React, { useState } from 'react';
import {
  Package,
  Monitor,
  Smartphone,
  Download,
  Copy,
  Check,
  Terminal,
  ExternalLink,
  Cpu,
  Layers,
  Shield,
  Zap,
  Globe
} from 'lucide-react';

export const MultiplatformHub: React.FC = () => {
  const [platform, setPlatform] = useState<'tauri' | 'capacitor' | 'pwa'>('tauri');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const tauriConfig = `{
  "$schema": "https://schema.tauri.app/config/2",
  "productName": "DataSphereAcademic",
  "version": "1.0.0",
  "identifier": "com.datasphere.academic",
  "build": {
    "beforeDevCommand": "npm run dev",
    "devUrl": "http://localhost:3000",
    "beforeBuildCommand": "npm run build",
    "frontendDist": "../dist"
  },
  "app": {
    "windows": [
      {
        "title": "DataSphere Academic",
        "width": 1280,
        "height": 840,
        "minWidth": 800,
        "minHeight": 600,
        "resizable": true,
        "fullscreen": false
      }
    ],
    "security": {
      "csp": null
    }
  },
  "bundle": {
    "active": true,
    "targets": "all",
    "icon": [
      "icons/32x32.png",
      "icons/128x128.png",
      "icons/icon.icns",
      "icons/icon.ico"
    ]
  }
}`;

  const cargoToml = `[package]
name = "datasphere-academic-desktop"
version = "1.0.0"
description = "DataSphere Academic Desktop Engine"
authors = ["DataSphere Research Team <armazen.nft@gmail.com>"]
edition = "2021"

[build-dependencies]
tauri-build = { version = "2.0.0", features = [] }

[dependencies]
tauri = { version = "2.0.0", features = [] }
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
`;

  const capacitorConfig = `import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.datasphere.academic',
  appName: 'DataSphere Academic',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1800,
      backgroundColor: '#0f172a',
      showSpinner: false
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0f172a'
    }
  }
};

export default config;
`;

  const downloadFile = (filename: string, content: string, contentType: string) => {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 sm:p-6 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-100">
                Empacotamento Multiplataforma (Desktop & Mobile)
              </h2>
              <p className="text-xs text-slate-400">
                Distribua o DataSphere Academic nativamente para Windows, macOS, Linux, Android e iOS.
              </p>
            </div>
          </div>

          {/* Segmented controls */}
          <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800 self-start sm:self-auto text-xs">
            <button
              onClick={() => setPlatform('tauri')}
              className={`px-3 py-1.5 rounded-md font-medium transition cursor-pointer flex items-center gap-1.5 ${
                platform === 'tauri'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Tauri Desktop (Rust)</span>
            </button>
            <button
              onClick={() => setPlatform('capacitor')}
              className={`px-3 py-1.5 rounded-md font-medium transition cursor-pointer flex items-center gap-1.5 ${
                platform === 'capacitor'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Capacitor Mobile</span>
            </button>
            <button
              onClick={() => setPlatform('pwa')}
              className={`px-3 py-1.5 rounded-md font-medium transition cursor-pointer flex items-center gap-1.5 ${
                platform === 'pwa'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>PWA Web</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tauri Section */}
      {platform === 'tauri' && (
        <div className="space-y-6">
          {/* Why Tauri Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm space-y-1.5">
              <div className="flex items-center gap-2 text-indigo-400">
                <Zap className="w-4 h-4" />
                <h4 className="text-xs font-semibold text-slate-200">Consumo de Memória Leve</h4>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Usa webview nativa do SO (WebKit no Mac/Linux, WebView2 no Windows). Consome ~15-25MB de RAM contra ~180MB do Electron.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm space-y-1.5">
              <div className="flex items-center gap-2 text-cyan-400">
                <Shield className="w-4 h-4" />
                <h4 className="text-xs font-semibold text-slate-200">Segurança Rust</h4>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Backend em Rust com sandbox rigoroso, chamadas FFI seguras e isolamento de permissões do sistema de arquivos.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm space-y-1.5">
              <div className="flex items-center gap-2 text-emerald-400">
                <Download className="w-4 h-4" />
                <h4 className="text-xs font-semibold text-slate-200">Binários Compactos</h4>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Tamanho do instalador final inferior a 5MB (.msi, .dmg, .AppImage) facilitando o download e atualização.
              </p>
            </div>
          </div>

          {/* Tauri Config File */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
            <div className="flex items-center justify-between px-4 py-3 bg-slate-950 border-b border-slate-800 text-xs">
              <div className="flex items-center gap-2 text-slate-300 font-mono">
                <span className="text-indigo-400">src-tauri/tauri.conf.json</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyToClipboard(tauriConfig, 'tauri-conf')}
                  className="inline-flex items-center gap-1 text-slate-400 hover:text-slate-200 transition cursor-pointer"
                >
                  {copiedCode === 'tauri-conf' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode === 'tauri-conf' ? 'Copiado!' : 'Copiar'}</span>
                </button>
                <button
                  onClick={() => downloadFile('tauri.conf.json', tauriConfig, 'application/json')}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Baixar Arquivo</span>
                </button>
              </div>
            </div>

            <pre className="p-4 bg-slate-950 text-xs text-slate-300 font-mono overflow-x-auto leading-relaxed select-all">
              {tauriConfig}
            </pre>
          </div>

          {/* Cargo.toml */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
            <div className="flex items-center justify-between px-4 py-3 bg-slate-950 border-b border-slate-800 text-xs">
              <div className="flex items-center gap-2 text-slate-300 font-mono">
                <span className="text-indigo-400">src-tauri/Cargo.toml</span>
              </div>

              <button
                onClick={() => copyToClipboard(cargoToml, 'cargo-toml')}
                className="inline-flex items-center gap-1 text-slate-400 hover:text-slate-200 transition cursor-pointer"
              >
                {copiedCode === 'cargo-toml' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode === 'cargo-toml' ? 'Copiado!' : 'Copiar'}</span>
              </button>
            </div>

            <pre className="p-4 bg-slate-950 text-xs text-slate-300 font-mono overflow-x-auto leading-relaxed select-all">
              {cargoToml}
            </pre>
          </div>

          {/* Execution guide */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span>Passo a Passo de Compilação Desktop (Tauri CLI)</span>
            </h4>
            <div className="space-y-2 text-xs font-mono bg-slate-950 p-4 rounded-lg border border-slate-800 text-emerald-300">
              <p># 1. Instalar a CLI oficial do Tauri</p>
              <p className="text-slate-200">npm install -D @tauri-apps/cli</p>
              <p className="pt-2"># 2. Inicializar o template Rust se necessário</p>
              <p className="text-slate-200">npx tauri init</p>
              <p className="pt-2"># 3. Compilar executável nativo (.exe / .dmg / .deb)</p>
              <p className="text-slate-200">npm run build</p>
              <p className="text-slate-200">npx tauri build</p>
            </div>
          </div>
        </div>
      )}

      {/* Capacitor Section */}
      {platform === 'capacitor' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm space-y-1.5">
              <h4 className="text-xs font-semibold text-slate-200 flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-cyan-400" />
                <span>Google Play Store (Android)</span>
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Gere o projeto Android nativo com Gradle e compile arquivos `.apk` ou pacotes `.aab` para publicação na Google Play.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm space-y-1.5">
              <h4 className="text-xs font-semibold text-slate-200 flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-indigo-400" />
                <span>Apple App Store (iOS)</span>
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Integração com Xcode via CocoaPods para compilar arquivos `.ipa` e distribuir via TestFlight ou App Store.
              </p>
            </div>
          </div>

          {/* Capacitor Config */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
            <div className="flex items-center justify-between px-4 py-3 bg-slate-950 border-b border-slate-800 text-xs">
              <div className="flex items-center gap-2 text-slate-300 font-mono">
                <span className="text-indigo-400">capacitor.config.ts</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyToClipboard(capacitorConfig, 'cap-conf')}
                  className="inline-flex items-center gap-1 text-slate-400 hover:text-slate-200 transition cursor-pointer"
                >
                  {copiedCode === 'cap-conf' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode === 'cap-conf' ? 'Copiado!' : 'Copiar'}</span>
                </button>
                <button
                  onClick={() => downloadFile('capacitor.config.ts', capacitorConfig, 'text/typescript')}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Baixar Arquivo</span>
                </button>
              </div>
            </div>

            <pre className="p-4 bg-slate-950 text-xs text-slate-300 font-mono overflow-x-auto leading-relaxed select-all">
              {capacitorConfig}
            </pre>
          </div>

          {/* Capacitor CLI commands */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span>Comandos do Capacitor para Build Mobile</span>
            </h4>
            <div className="space-y-2 text-xs font-mono bg-slate-950 p-4 rounded-lg border border-slate-800 text-cyan-300">
              <p># 1. Instalar dependências core do Capacitor</p>
              <p className="text-slate-200">npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios</p>
              <p className="pt-2"># 2. Inicializar o projeto Capacitor</p>
              <p className="text-slate-200">npx cap init "DataSphere Academic" com.datasphere.academic --web-dir=dist</p>
              <p className="pt-2"># 3. Adicionar plataformas móveis</p>
              <p className="text-slate-200">npx cap add android</p>
              <p className="text-slate-200">npx cap add ios</p>
              <p className="pt-2"># 4. Sincronizar bundle web compilado</p>
              <p className="text-slate-200">npm run build</p>
              <p className="text-slate-200">npx cap sync</p>
              <p className="pt-2"># 5. Abrir no Android Studio ou Xcode</p>
              <p className="text-slate-200">npx cap open android</p>
            </div>
          </div>
        </div>
      )}

      {/* PWA Section */}
      {platform === 'pwa' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">
                <Globe className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-100">
                  Progressive Web App (PWA) Ativo & Instalável
                </h3>
                <p className="text-xs text-slate-400">
                  Instalação com 1 clique direto pelo navegador (Chrome, Edge, Safari) sem custos de distribuição.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2">
              <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-400 font-medium">Manifest Web</span>
                <p className="text-slate-300">
                  Configurado via <code className="text-indigo-400">vite-plugin-pwa</code> com auto-update e cache de precaching workbox.
                </p>
              </div>
              <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-400 font-medium">Suporte Offline Total</span>
                <p className="text-slate-300">
                  Artigos salvos, notas pessoais e cache de consulta persistem via Service Worker e IndexedDB.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
