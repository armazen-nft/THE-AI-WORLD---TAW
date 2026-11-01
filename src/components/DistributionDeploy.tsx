import React, { useState } from 'react';
import {
  Cloud,
  Server,
  ShieldCheck,
  ExternalLink,
  Copy,
  Check,
  Download,
  Terminal,
  Send,
  Radio,
  FileCode,
  Globe
} from 'lucide-react';

export const DistributionDeploy: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ipfs' | 'docker' | 'edge'>('ipfs');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Pinning form
  const [pinTitle, setPinTitle] = useState('Análise Estrutural de Proteínas com Modelos de Difusão 3D');
  const [pinAuthors, setPinAuthors] = useState('Dra. Amanda Silva, Prof. Marcos Vinicius');
  const [isPinning, setIsPinning] = useState(false);
  const [pinnedResult, setPinnedResult] = useState<any>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handlePinArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPinning(true);
    try {
      const res = await fetch('/api/ipfs/pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: pinTitle,
          authors: pinAuthors.split(',').map((s) => s.trim()),
          doi: `10.1000/182.${Date.now()}`,
          abstract: 'Publicação ancorada em armazenamento descentralizado com integridade verificada.',
          date: new Date().toISOString(),
        }),
      });
      const data = await res.json();
      setPinnedResult(data);
    } catch (err) {
      console.error('Pinning error:', err);
    } finally {
      setIsPinning(false);
    }
  };

  const dockerfileContent = `# Multi-stage Dockerfile for DataSphere Academic
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.ts ./
COPY --from=builder /app/src ./src
COPY --from=builder /app/tsconfig.json ./

EXPOSE 3000
CMD ["npx", "tsx", "server.ts"]`;

  const dockerComposeContent = `version: '3.8'

services:
  datasphere-academic:
    build: .
    container_name: datasphere_app
    ports:
      - "3000:3000"
    environment:
      - PORT=3000
      - NODE_ENV=production
      - GEMINI_API_KEY=\${GEMINI_API_KEY}
    restart: unless-stopped
`;

  const vercelConfig = `{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/server.ts" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}`;

  const flyToml = `app = "datasphere-academic"
primary_region = "gru"

[build]
  dockerfile = "Dockerfile"

[http_service]
  internal_port = 3000
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true
  min_machines_running = 0
`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 sm:p-6 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <Cloud className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-100">
                Deploy, Nuvem & Distribuição Descentralizada (IPFS / DeSci)
              </h2>
              <p className="text-xs text-slate-400">
                Geração de manifestos para Docker, Vercel, Fly.io e ancoragem em rede de armazenamento IPFS.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800 self-start sm:self-auto text-xs">
            <button
              onClick={() => setActiveTab('ipfs')}
              className={`px-3 py-1.5 rounded-md font-medium transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'ipfs'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>IPFS & DeSci</span>
            </button>
            <button
              onClick={() => setActiveTab('docker')}
              className={`px-3 py-1.5 rounded-md font-medium transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'docker'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Server className="w-3.5 h-3.5" />
              <span>Docker & Contêineres</span>
            </button>
            <button
              onClick={() => setActiveTab('edge')}
              className={`px-3 py-1.5 rounded-md font-medium transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'edge'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span>Vercel & Fly.io</span>
            </button>
          </div>
        </div>
      </div>

      {/* IPFS Tab */}
      {activeTab === 'ipfs' && (
        <div className="space-y-6">
          {/* IPFS Explanation */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
            <div className="flex items-center gap-2">
              <Radio className="w-5 h-5 text-cyan-400 animate-pulse" />
              <h3 className="text-sm font-semibold text-slate-100">
                Ancorador de Publicações Científicas no IPFS
              </h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              O IPFS endereça o conteúdo por seu hash criptográfico (CID), tornando artigos e datasets
              resistentes a censura, paywalls e perda de links permanentes.
            </p>

            <form onSubmit={handlePinArticle} className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block mb-1">
                  Título do Artigo / Dataset
                </label>
                <input
                  type="text"
                  value={pinTitle}
                  onChange={(e) => setPinTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-hidden focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block mb-1">
                  Autores
                </label>
                <input
                  type="text"
                  value={pinAuthors}
                  onChange={(e) => setPinAuthors(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-hidden focus:border-cyan-500"
                />
              </div>

              <div className="sm:col-span-2 pt-1">
                <button
                  type="submit"
                  disabled={isPinning}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs transition cursor-pointer disabled:opacity-50 shadow-md"
                >
                  {isPinning ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Calculando Merkle DAG & Pinning...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Ancorar Artigo no Cluster IPFS</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Pinned Result Card */}
          {pinnedResult && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2 text-emerald-400">
                  <Check className="w-4 h-4" />
                  <span className="text-xs font-semibold uppercase tracking-wider">
                    Ancorado com Sucesso ({pinnedResult.pinStatus})
                  </span>
                </div>
                <span className="text-xs text-slate-400">{pinnedResult.consensusNetwork}</span>
              </div>

              <div className="space-y-2">
                <span className="text-xs text-slate-400 font-medium block">IPFS Content Identifier (CIDv1):</span>
                <div className="flex items-center gap-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <code className="text-xs text-cyan-400 font-mono break-all flex-1 select-all">
                    {pinnedResult.cid}
                  </code>
                  <button
                    onClick={() => copyToClipboard(pinnedResult.cid, 'pin-cid')}
                    className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition cursor-pointer"
                  >
                    {copiedId === 'pin-cid' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block mb-0.5">Tamanho Merkle DAG</span>
                  <span className="text-slate-200 font-semibold">{pinnedResult.merkleDagSize}</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block mb-0.5">Nós Replicados</span>
                  <span className="text-emerald-400 font-semibold">{pinnedResult.storageNodes} nós</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 col-span-2 sm:col-span-1">
                  <span className="text-slate-500 block mb-0.5">Protocolo</span>
                  <span className="text-indigo-400 font-semibold">Bitswap + Graphsync</span>
                </div>
              </div>

              <div className="pt-1">
                <a
                  href={pinnedResult.ipfsGatewayUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:underline font-medium"
                >
                  <span>Abrir via Gateway Público ({pinnedResult.ipfsGatewayUrl.slice(0, 40)}...)</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Docker Tab */}
      {activeTab === 'docker' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
            <div className="flex items-center justify-between px-4 py-3 bg-slate-950 border-b border-slate-800 text-xs">
              <span className="font-mono text-indigo-400">Dockerfile</span>
              <button
                onClick={() => copyToClipboard(dockerfileContent, 'dockerfile')}
                className="inline-flex items-center gap-1 text-slate-400 hover:text-slate-200 transition cursor-pointer"
              >
                {copiedId === 'dockerfile' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedId === 'dockerfile' ? 'Copiado!' : 'Copiar'}</span>
              </button>
            </div>
            <pre className="p-4 bg-slate-950 text-xs text-slate-300 font-mono overflow-x-auto leading-relaxed select-all">
              {dockerfileContent}
            </pre>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
            <div className="flex items-center justify-between px-4 py-3 bg-slate-950 border-b border-slate-800 text-xs">
              <span className="font-mono text-indigo-400">docker-compose.yml</span>
              <button
                onClick={() => copyToClipboard(dockerComposeContent, 'docker-compose')}
                className="inline-flex items-center gap-1 text-slate-400 hover:text-slate-200 transition cursor-pointer"
              >
                {copiedId === 'docker-compose' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedId === 'docker-compose' ? 'Copiado!' : 'Copiar'}</span>
              </button>
            </div>
            <pre className="p-4 bg-slate-950 text-xs text-slate-300 font-mono overflow-x-auto leading-relaxed select-all">
              {dockerComposeContent}
            </pre>
          </div>
        </div>
      )}

      {/* Edge / Serverless Tab */}
      {activeTab === 'edge' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
            <div className="flex items-center justify-between px-4 py-3 bg-slate-950 border-b border-slate-800 text-xs">
              <span className="font-mono text-indigo-400">vercel.json</span>
              <button
                onClick={() => copyToClipboard(vercelConfig, 'vercel-json')}
                className="inline-flex items-center gap-1 text-slate-400 hover:text-slate-200 transition cursor-pointer"
              >
                {copiedId === 'vercel-json' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedId === 'vercel-json' ? 'Copiado!' : 'Copiar'}</span>
              </button>
            </div>
            <pre className="p-4 bg-slate-950 text-xs text-slate-300 font-mono overflow-x-auto leading-relaxed select-all">
              {vercelConfig}
            </pre>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
            <div className="flex items-center justify-between px-4 py-3 bg-slate-950 border-b border-slate-800 text-xs">
              <span className="font-mono text-indigo-400">fly.toml</span>
              <button
                onClick={() => copyToClipboard(flyToml, 'fly-toml')}
                className="inline-flex items-center gap-1 text-slate-400 hover:text-slate-200 transition cursor-pointer"
              >
                {copiedId === 'fly-toml' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedId === 'fly-toml' ? 'Copiado!' : 'Copiar'}</span>
              </button>
            </div>
            <pre className="p-4 bg-slate-950 text-xs text-slate-300 font-mono overflow-x-auto leading-relaxed select-all">
              {flyToml}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
