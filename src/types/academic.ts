export interface Paper {
  id: string;
  title: string;
  authors: string[];
  abstract: string;
  year: number;
  field: string;
  subfield: string;
  doi: string;
  citationsCount: number;
  openAccess: boolean;
  journalOrConference: string;
  ipfsCid: string;
  pdfUrl?: string;
  keywords: string[];
  embeddingVector: number[]; // 5-dimensional normalized semantic vector for instant local vector search
  citations: string[]; // Paper IDs cited by this paper
  citedBy: string[]; // Paper IDs citing this paper
  reproducibilityScore: number; // 0 - 100
  dataAvailable: boolean;
}

export interface PaperAnalysis {
  summary: string;
  keyFindings: string[];
  methodologyCritique: string;
  futureWork: string[];
  citationImpactScore: number;
  reproducibilityScore: number;
}

export interface CitationNode {
  id: string;
  title: string;
  field: string;
  year: number;
  citationsCount: number;
  x: number;
  y: number;
}

export interface CitationLink {
  source: string;
  target: string;
  type: 'cites' | 'related';
}

export interface DiagnosticCheck {
  name: string;
  status: 'PASS' | 'WARN' | 'INFO';
  detail: string;
}

export interface RepoDiagnostics {
  status: string;
  timestamp: string;
  repository: string;
  engine: string;
  runtime: {
    node: string;
    platform: string;
    arch: string;
    heapUsedMB: number;
    heapTotalMB: number;
  };
  capabilities: {
    geminiActive: boolean;
    pwaReady: boolean;
    vectorEngine: string;
    localDB: string;
    ipfsGateway: string;
    tauriExport: string;
    capacitorExport: string;
  };
  checks: DiagnosticCheck[];
}

export interface UserNote {
  id: string;
  paperId: string;
  content: string;
  createdAt: string;
  highlightText?: string;
}
