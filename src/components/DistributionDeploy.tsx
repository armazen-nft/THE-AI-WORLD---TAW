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
  Globe,
  Rss,
  Zap
} from 'lucide-react';

export const DistributionDeploy: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ipfs' | 'docker' | 'edge' | 'blogger'>('blogger');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [bloggerAppUrl, setBloggerAppUrl] = useState(() => {
    return typeof window !== 'undefined' && window.location.origin
      ? window.location.origin
      : 'https://ais-pre-hpi54m2sjm6qbdunye2ryh-655768412449.us-east1.run.app';
  });
  const [bloggerEmbedType, setBloggerEmbedType] = useState<'rss' | 'full' | 'card' | 'gadget'>('rss');
  const [rssFilterField, setRssFilterField] = useState('all');

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

          <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800 self-start sm:self-auto text-xs overflow-x-auto">
            <button
              onClick={() => setActiveTab('blogger')}
              className={`px-3 py-1.5 rounded-md font-medium transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'blogger'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'text-orange-400 hover:text-orange-300'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Blogger / Blogspot</span>
            </button>
            <button
              onClick={() => setActiveTab('ipfs')}
              className={`px-3 py-1.5 rounded-md font-medium transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
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
              className={`px-3 py-1.5 rounded-md font-medium transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
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
              className={`px-3 py-1.5 rounded-md font-medium transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
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

      {/* Blogger / Blogspot Integration Tab */}
      {activeTab === 'blogger' && (
        <div className="space-y-6">
          {/* Blogger Introduction Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-orange-400" />
              <h3 className="text-sm font-semibold text-slate-100">
                Como Publicar o DataSphere Academic no Blogger (Blogspot)
              </h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              O Blogger suporta inserção de código HTML/JavaScript customizado tanto em postagens comuns quanto em páginas estáticas e gadgets de layout. Escolha o tipo de incorporação abaixo, copie o código e cole diretamente no modo <strong className="text-orange-400">&lt;&gt; Visualização em HTML</strong> do editor do Blogger.
            </p>

            {/* URL customizer */}
            <div className="pt-2">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                URL Base do Aplicativo para Incorporação:
              </label>
              <input
                type="url"
                value={bloggerAppUrl}
                onChange={(e) => setBloggerAppUrl(e.target.value)}
                placeholder="https://..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-cyan-300 font-mono focus:outline-hidden focus:border-orange-500"
              />
            </div>

            {/* Format choice */}
            <div className="pt-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                Escolha o Formato de Integração com o Blogger:
              </span>
              <div className="flex flex-wrap gap-2 text-xs">
                <button
                  onClick={() => setBloggerEmbedType('rss')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer flex items-center gap-1.5 ${
                    bloggerEmbedType === 'rss'
                      ? 'bg-orange-600 text-white shadow-xs'
                      : 'bg-slate-950 text-orange-400 hover:text-orange-300 border border-slate-800'
                  }`}
                >
                  <Rss className="w-3.5 h-3.5" />
                  <span>1. Feed RSS 2.0 Automático (Recomendado)</span>
                </button>
                <button
                  onClick={() => setBloggerEmbedType('full')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                    bloggerEmbedType === 'full'
                      ? 'bg-orange-600 text-white shadow-xs'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  2. Aplicativo Completo (iFrame Responsivo)
                </button>
                <button
                  onClick={() => setBloggerEmbedType('card')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                    bloggerEmbedType === 'card'
                      ? 'bg-orange-600 text-white shadow-xs'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  3. Card de Artigo + Prova IPFS
                </button>
                <button
                  onClick={() => setBloggerEmbedType('gadget')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                    bloggerEmbedType === 'gadget'
                      ? 'bg-orange-600 text-white shadow-xs'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  4. Widget Lateral HTML
                </button>
              </div>
            </div>
          </div>

          {/* RSS Feed Management Suite (when RSS mode is selected) */}
          {bloggerEmbedType === 'rss' && (
            <div className="space-y-5">
              {/* Feed URL Box */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-orange-500/20 text-orange-400">
                      <Rss className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-100">
                        URL do Feed RSS 2.0 Compatível com o Blogger
                      </h4>
                      <p className="text-xs text-slate-400">
                        Gera XML dinâmico com padronização RFC 822, Dublin Core e links diretos para leitura e IPFS.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-medium">Filtrar por Área:</span>
                    <select
                      value={rssFilterField}
                      onChange={(e) => setRssFilterField(e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-xs text-slate-200 focus:outline-hidden focus:border-orange-500 cursor-pointer"
                    >
                      <option value="all">Todas as Áreas</option>
                      <option value="Inteligência Artificial">Inteligência Artificial</option>
                      <option value="Ciência Aberta & DeSci">Ciência Aberta & DeSci</option>
                      <option value="Biotecnologia & Genômica">Biotecnologia & Genômica</option>
                      <option value="Física & Computação Quântica">Computação Quântica</option>
                      <option value="Energia & Sustentabilidade">Energia & Sustentabilidade</option>
                      <option value="Neurociência & BCI">Neurociência & BCI</option>
                    </select>
                  </div>
                </div>

                {/* Feed Link Box */}
                {(() => {
                  const feedUrl = `${bloggerAppUrl.replace(/\/$/, '')}/api/rss.xml${
                    rssFilterField !== 'all' ? `?field=${encodeURIComponent(rssFilterField)}` : ''
                  }`;
                  return (
                    <div className="space-y-3 pt-1">
                      <div className="flex items-center gap-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                        <code className="text-xs text-orange-300 font-mono flex-1 break-all select-all">
                          {feedUrl}
                        </code>

                        <button
                          onClick={() => copyToClipboard(feedUrl, 'rss-url')}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-orange-600 hover:bg-orange-500 text-white font-medium text-xs transition cursor-pointer shrink-0"
                        >
                          {copiedId === 'rss-url' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedId === 'rss-url' ? 'Copiado!' : 'Copiar URL do Feed'}</span>
                        </button>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <a
                          href={feedUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white transition border border-slate-800"
                        >
                          <span>Testar / Abrir XML no Navegador</span>
                          <ExternalLink className="w-3 h-3 text-orange-400" />
                        </a>

                        <button
                          onClick={async () => {
                            try {
                              const res = await fetch(feedUrl);
                              const xml = await res.text();
                              const blob = new Blob([xml], { type: 'application/rss+xml' });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = 'datasphere-academic-feed.xml';
                              a.click();
                            } catch (e) {
                              console.error(e);
                            }
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white transition border border-slate-800 cursor-pointer"
                        >
                          <Download className="w-3 h-3 text-cyan-400" />
                          <span>Baixar feed.xml</span>
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Step-by-Step Blogger RSS Setup Guide */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Method A: Blogger Built-in Feed Gadget */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
                  <div className="flex items-center gap-2 text-orange-400 font-semibold">
                    <Globe className="w-4 h-4" />
                    <h4>Integração Nativa: Gadget "Feed" do Blogger</h4>
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    Exiba automaticamente as últimas publicações científicas da DataSphere na barra lateral ou no rodapé do seu blog sem escrever nenhum código:
                  </p>
                  <ol className="space-y-2 text-slate-300 bg-slate-950/70 p-3.5 rounded-lg border border-slate-800/80 list-decimal list-inside">
                    <li>No painel do Blogger, clique em <strong>Layout</strong>.</li>
                    <li>Na barra lateral ou seção desejada, clique em <strong>"+ Adicionar um Gadget"</strong>.</li>
                    <li>Na lista de gadgets do Google, selecione <strong>"Feed"</strong>.</li>
                    <li>Cole a <strong>URL do Feed RSS</strong> gerada acima.</li>
                    <li>Escolha o título (ex: <em>Novos Artigos Científicos</em>) e quantos itens exibir.</li>
                    <li>Clique em <strong>Salvar</strong>. Pronto! O blog sincronizará sozinho.</li>
                  </ol>
                </div>

                {/* Method B: Auto-Post Automation via IFTTT / Zapier */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
                  <div className="flex items-center gap-2 text-cyan-400 font-semibold">
                    <Zap className="w-4 h-4" />
                    <h4>Automação: Criar Postagens Automáticas no Blogspot</h4>
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    Para que <strong>cada novo artigo ou preprint</strong> adicionado na DataSphere crie uma nova postagem completa no seu blog automaticamente:
                  </p>
                  <ol className="space-y-2 text-slate-300 bg-slate-950/70 p-3.5 rounded-lg border border-slate-800/80 list-decimal list-inside">
                    <li>Crie uma conta gratuita em <a href="https://ifttt.com" target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline">IFTTT</a> ou <a href="https://zapier.com" target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline">Zapier</a>.</li>
                    <li>Crie um Applet: <strong>If This: RSS Feed ("New feed item")</strong>.</li>
                    <li>Cole a URL: <code className="text-orange-300 font-mono text-[11px]">{bloggerAppUrl.replace(/\/$/, '')}/api/rss.xml</code>.</li>
                    <li><strong>Then That: Blogger ("Create a post")</strong>.</li>
                    <li>Conecte sua conta do Blogger e mapeie:
                      <br />• <em>Título da postagem = &#123;&#123;EntryTitle&#125;&#125;</em>
                      <br />• <em>Corpo = &#123;&#123;EntryContent&#125;&#125;</em>
                    </li>
                    <li>Ative o Applet. Qualquer novo artigo indexado virará post no blog!</li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          {/* Generated Code Snippet Box for other modes */}
          {bloggerEmbedType !== 'rss' && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
            <div className="flex items-center justify-between px-4 py-3 bg-slate-950 border-b border-slate-800 text-xs">
              <span className="font-mono text-orange-400">
                {bloggerEmbedType === 'full'
                  ? 'codigo_postagem_blogger_app_completo.html'
                  : bloggerEmbedType === 'card'
                  ? 'codigo_postagem_card_cientifico.html'
                  : 'codigo_gadget_lateral_blogger.html'}
              </span>

              <button
                onClick={() => {
                  let snippet = '';
                  if (bloggerEmbedType === 'full') {
                    snippet = `<!-- INÍCIO: DataSphere Academic no Blogger -->
<div style="position: relative; width: 100%; height: 85vh; min-height: 700px; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5); margin: 20px 0; background: #0f172a;">
  <iframe 
    src="${bloggerAppUrl}" 
    style="width: 100%; height: 100%; border: none; display: block;" 
    allow="clipboard-write; fullscreen; accelerometer; gyroscope" 
    loading="lazy" 
    title="DataSphere Academic App">
  </iframe>
</div>
<!-- FIM: DataSphere Academic no Blogger -->`;
                  } else if (bloggerEmbedType === 'card') {
                    snippet = `<!-- INÍCIO: Card Acadêmico com Prova IPFS -->
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: #f8fafc; border: 1px solid #1e293b; border-radius: 14px; padding: 24px; margin: 25px 0; box-shadow: 0 8px 30px rgba(0,0,0,0.35);">
  <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; font-size: 12px; color: #38bdf8;">
    <span>DataSphere Academic · Ciência Aberta & DeSci</span>
    <span style="color: #10b981;">✓ Acesso Aberto</span>
  </div>
  <h3 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 700; color: #ffffff; line-height: 1.4;">
    Decentralized Science (DeSci): Verifiable Peer-Review on IPFS
  </h3>
  <p style="font-size: 14px; color: #94a3b8; line-height: 1.6; margin-bottom: 18px;">
    Ancoragem descentralizada de artigos científicos com identificador de conteúdo criptográfico (CID) e validação Merkle DAG.
  </p>
  <div style="background: #020617; padding: 12px 16px; border-radius: 8px; border: 1px solid #1e293b; margin-bottom: 18px; font-family: monospace; font-size: 12px; color: #38bdf8; word-break: break-all;">
    CID: bafybeiczss7m23k5s43n7a73f626qhzsm7cvm7c76yv47fqyq5f4o37wfa
  </div>
  <div style="display: flex; flex-wrap: wrap; gap: 12px;">
    <a href="${bloggerAppUrl}" target="_blank" style="display: inline-block; background: #4f46e5; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; font-size: 13px;">
      Abrir no DataSphere Interativo →
    </a>
    <a href="https://ipfs.io/ipfs/bafybeiczss7m23k5s43n7a73f626qhzsm7cvm7c76yv47fqyq5f4o37wfa" target="_blank" style="display: inline-block; background: #1e293b; color: #38bdf8; text-decoration: none; padding: 10px 18px; border-radius: 8px; font-size: 13px;">
      Verificar no Gateway IPFS
    </a>
  </div>
</div>
<!-- FIM: Card Acadêmico -->`;
                  } else {
                    snippet = `<!-- INÍCIO: Widget Lateral DataSphere para Layout do Blogger -->
<div style="font-family: sans-serif; background: #0f172a; color: #fff; padding: 16px; border-radius: 10px; border: 1px solid #334155; text-align: center;">
  <h4 style="margin: 0 0 6px 0; color: #38bdf8; font-size: 15px;">DataSphere Academic</h4>
  <p style="font-size: 12px; color: #94a3b8; margin: 0 0 12px 0;">Pesquisa científica com IA e IPFS</p>
  <a href="${bloggerAppUrl}" target="_blank" style="display: block; background: #4f46e5; color: #fff; text-decoration: none; padding: 8px 12px; border-radius: 6px; font-size: 12px; font-weight: bold;">
    Acessar Aplicativo Web
  </a>
</div>
<!-- FIM: Widget Lateral DataSphere -->`;
                  }
                  copyToClipboard(snippet, 'blogger-code');
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-medium transition cursor-pointer"
              >
                {copiedId === 'blogger-code' ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedId === 'blogger-code' ? 'Código Copiado!' : 'Copiar Código HTML'}</span>
              </button>
            </div>

            <pre className="p-4 bg-slate-950 text-xs text-orange-200/90 font-mono overflow-x-auto leading-relaxed select-all">
              {bloggerEmbedType === 'full'
                ? `<!-- INÍCIO: DataSphere Academic no Blogger -->
<div style="position: relative; width: 100%; height: 85vh; min-height: 700px; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5); margin: 20px 0; background: #0f172a;">
  <iframe 
    src="${bloggerAppUrl}" 
    style="width: 100%; height: 100%; border: none; display: block;" 
    allow="clipboard-write; fullscreen; accelerometer; gyroscope" 
    loading="lazy" 
    title="DataSphere Academic App">
  </iframe>
</div>
<!-- FIM: DataSphere Academic no Blogger -->`
                : bloggerEmbedType === 'card'
                ? `<!-- INÍCIO: Card Acadêmico com Prova IPFS -->
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: #f8fafc; border: 1px solid #1e293b; border-radius: 14px; padding: 24px; margin: 25px 0; box-shadow: 0 8px 30px rgba(0,0,0,0.35);">
  <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; font-size: 12px; color: #38bdf8;">
    <span>DataSphere Academic · Ciência Aberta & DeSci</span>
    <span style="color: #10b981;">✓ Acesso Aberto</span>
  </div>
  <h3 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 700; color: #ffffff; line-height: 1.4;">
    Decentralized Science (DeSci): Verifiable Peer-Review on IPFS
  </h3>
  <p style="font-size: 14px; color: #94a3b8; line-height: 1.6; margin-bottom: 18px;">
    Ancoragem descentralizada de artigos científicos com identificador de conteúdo criptográfico (CID) e validação Merkle DAG.
  </p>
  <div style="background: #020617; padding: 12px 16px; border-radius: 8px; border: 1px solid #1e293b; margin-bottom: 18px; font-family: monospace; font-size: 12px; color: #38bdf8; word-break: break-all;">
    CID: bafybeiczss7m23k5s43n7a73f626qhzsm7cvm7c76yv47fqyq5f4o37wfa
  </div>
  <div style="display: flex; flex-wrap: wrap; gap: 12px;">
    <a href="${bloggerAppUrl}" target="_blank" style="display: inline-block; background: #4f46e5; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; font-size: 13px;">
      Abrir no DataSphere Interativo →
    </a>
    <a href="https://ipfs.io/ipfs/bafybeiczss7m23k5s43n7a73f626qhzsm7cvm7c76yv47fqyq5f4o37wfa" target="_blank" style="display: inline-block; background: #1e293b; color: #38bdf8; text-decoration: none; padding: 10px 18px; border-radius: 8px; font-size: 13px;">
      Verificar no Gateway IPFS
    </a>
  </div>
</div>
<!-- FIM: Card Acadêmico -->`
                : `<!-- INÍCIO: Widget Lateral DataSphere para Layout do Blogger -->
<div style="font-family: sans-serif; background: #0f172a; color: #fff; padding: 16px; border-radius: 10px; border: 1px solid #334155; text-align: center;">
  <h4 style="margin: 0 0 6px 0; color: #38bdf8; font-size: 15px;">DataSphere Academic</h4>
  <p style="font-size: 12px; color: #94a3b8; margin: 0 0 12px 0;">Pesquisa científica com IA e IPFS</p>
  <a href="${bloggerAppUrl}" target="_blank" style="display: block; background: #4f46e5; color: #fff; text-decoration: none; padding: 8px 12px; border-radius: 6px; font-size: 12px; font-weight: bold;">
    Acessar Aplicativo Web
  </a>
</div>
<!-- FIM: Widget Lateral DataSphere -->`}
            </pre>
          </div>
          )}

          {/* Step-by-Step Tutorial Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Passo a Passo Detalhado para o Google Blogger / Blogspot</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="flex items-center gap-2 font-semibold text-orange-400">
                  <span className="w-5 h-5 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center text-[11px]">1</span>
                  <span>Acesse o Painel do Blogger</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Acesse <a href="https://www.blogger.com" target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline">blogger.com</a> e faça login com sua conta Google (<code className="text-slate-400">armazen.nft@gmail.com</code>). Selecione o seu blog.
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="flex items-center gap-2 font-semibold text-orange-400">
                  <span className="w-5 h-5 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center text-[11px]">2</span>
                  <span>Crie uma Postagem ou Página</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Para um post no feed, clique em <strong>"Nova postagem"</strong>. Para criar uma aba permanente (ex: <em>seublog.blogspot.com/p/app.html</em>), clique no menu lateral em <strong>"Páginas" → "Nova página"</strong>.
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="flex items-center gap-2 font-semibold text-orange-400">
                  <span className="w-5 h-5 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center text-[11px]">3</span>
                  <span>Mude para Visualização em HTML (&lt;&gt;)</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  No canto superior esquerdo da barra de ferramentas do editor, clique no ícone do <strong>Lápis</strong> e selecione <strong>"&lt;&gt; Visualização em HTML"</strong>.
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="flex items-center gap-2 font-semibold text-orange-400">
                  <span className="w-5 h-5 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center text-[11px]">4</span>
                  <span>Cole e Publique</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Cole o código HTML copiado acima. Clique em <strong>"Visualizar"</strong> para testar a interatividade ou em <strong>"Publicar"</strong> para colocar no ar!
                </p>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-indigo-950/40 border border-indigo-800/60 text-xs text-indigo-300 flex items-center gap-2">
              <span className="text-cyan-400 font-bold">💡 Dica Pro:</span>
              <span>
                Como o DataSphere Academic possui certificado HTTPS nativo e é responsivo, ele se ajusta perfeitamente tanto na versão desktop quanto no tema mobile do Blogger.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
