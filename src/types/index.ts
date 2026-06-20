export type SearchEngine = 'google' | 'bing' | 'duckduckgo';
export type RiskLevel = 'critical' | 'high' | 'medium' | 'low';
export type OperatorCategory = 'layer' | 'meta' | 'boolean' | 'file' | 'scope';

export type SearchGoal =
  | 'surface-mapping'
  | 'admin-login'
  | 'exposed-files'
  | 'config-credential'
  | 'open-directory'
  | 'error-pages'
  | 'api-endpoints'
  | 'source-control'
  | 'cloud-storage'
  | 'credential-hunt'
  | 'vuln-params'
  | 'tech-fingerprint'
  | 'custom';

export interface ExplanationPart {
  operator: string;
  desc: string;
}

export interface BuilderInputs {
  domain: string;
  includeSubdomains: boolean;
  excludeSubdomains: string[];
  titleKeywords: string[];
  urlPattern: string;
  bodyKeywords: string[];
  exactPhrases: string[];
  anchorKeywords: string[];
  excludeKeywords: string[];
  fileTypes: string[];
  technology: string;
  paramNames: string[];
  searchGoal: SearchGoal;
  noiseReduction: string[];
  rangeMin: string;
  rangeMax: string;
  useWildcard: boolean;
  useCache: boolean;
  useInfo: boolean;
  useRelated: boolean;
  searchEngines: SearchEngine[];
}

export interface GeneratedQuery {
  id: string;
  raw: string;
  highlighted: HighlightedToken[];
  score: number;
  explanation: string;
  structuredExplanation: ExplanationPart[];
  intent: string;
  searchUrl: string;
  followUps: FollowUpDork[];
  inputs: BuilderInputs;
  goal: SearchGoal;
  engines: SearchEngine[];
  timestamp: string;
  starred: boolean;
  presetName?: string;
}

export interface HighlightedToken {
  text: string;
  type: 'site' | 'intitle' | 'inurl' | 'intext' | 'filetype' | 'meta' | 'boolean' | 'phrase' | 'exclude' | 'plain';
}

export interface FollowUpDork {
  query: string;
  purpose: string;
  risk: RiskLevel;
}

export interface TemplateDork {
  id: string;
  query: string;
  purpose: string;
  explanation: string;
  risk: RiskLevel;
  operators: string[];
}

export interface TemplateCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  risk: RiskLevel;
  dorks: TemplateDork[];
}

export interface OperatorInfo {
  operator: string;
  category: OperatorCategory;
  color: string;
  scans: string;
  description: string;
  syntax: string;
  example: string;
  allVariant?: string;
  allExample?: string;
  googleSupport: boolean;
  bingSupport: boolean;
  ddgSupport?: boolean;
}

export interface HistoryItem {
  id: string;
  query: string;
  goal: SearchGoal;
  engines: SearchEngine[];
  score: number;
  timestamp: string;
  starred: boolean;
  origin?: 'build' | 'execute' | 'copy';
  presetName?: string;
  explanation: string;
  inputs?: BuilderInputs;
  highlighted?: HighlightedToken[];
  followUps?: FollowUpDork[];
}

export interface ExportOptions {
  format: 'txt' | 'csv' | 'json' | 'md';
  selected: string[];
}

export type ActiveTab =
  | 'home'
  | 'builder'
  | 'templates'
  | 'reference'
  | 'history'
  | 'guide'
  | 'anatomy';
export type SidebarItem = 'builder' | 'templates' | 'history' | 'reference' | 'settings';

export interface CustomTemplate {
  id: string;
  name: string;
  query: string;
  purpose: string;
  risk: RiskLevel;
  timestamp: string;
}
