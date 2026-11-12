export type StrictnessLevel = 'relaxed' | 'standard' | 'strict';
export type LanguageVariant = 'british' | 'american' | 'nigerian';
export type IssueStatus = 'open' | 'accepted' | 'ignored';
export type IssueConfidence = 'high' | 'medium' | 'low';

export type IssueType =
  | 'spelling'
  | 'repeated_word'
  | 'grammar'
  | 'punctuation'
  | 'consistency'
  | 'placeholder'
  | 'cut_off'
  | 'style'
  | 'duplicate'
  | 'brand_inconsistency'
  | 'format_inconsistency'
  | 'capitalization'
  | 'unreadable';

export interface BoundingBox {
  x: number; // 0 to 1
  y: number; // 0 to 1
  w: number; // 0 to 1
  h: number; // 0 to 1
}

export interface UnreadableRegion {
  description: string;
  bbox: [number, number, number, number];
}

export interface SlideIssue {
  id: string;
  slideId: string;
  slidePosition: number;
  type: IssueType;
  original: string;
  suggestion: string;
  reason: string;
  confidence: IssueConfidence;
  bbox?: [number, number, number, number]; // [x, y, w, h] normalized 0..1
  status: IssueStatus;
  scope: 'slide' | 'cross_slide';
}

export interface CrossSlideIssue {
  id: string;
  checkId: string;
  type: IssueType;
  original: string;
  suggestion: string;
  reason: string;
  confidence: IssueConfidence;
  affectedSlidePositions: number[];
  status: IssueStatus;
}

export interface SlideData {
  id: string;
  checkId: string;
  position: number;
  name: string;
  imageUrl: string;
  fileHash?: string;
  status: 'pending' | 'reading' | 'done' | 'failed';
  slideText?: string;
  unreadableRegions: UnreadableRegion[];
  issues: SlideIssue[];
  errorMessage?: string;
}

export interface CheckRecord {
  id: string;
  clientId: string;
  clientName: string;
  title: string;
  strictness: StrictnessLevel;
  languageVariant: LanguageVariant;
  status: 'analyzing' | 'completed' | 'partial' | 'failed';
  slideCount: number;
  issueCount: number;
  resolvedCount: number;
  createdAt: string;
  slides: SlideData[];
  crossSlideIssues: CrossSlideIssue[];
  costEstimate?: string;
}

export interface DictionaryTerm {
  id: string;
  clientId: string;
  term: string;
  note?: string;
  createdAt: string;
}

export interface IgnoreRule {
  id: string;
  clientId: string;
  original: string;
  ruleType: 'exact' | 'case-insensitive';
  createdAt: string;
}

export interface ClientRecord {
  id: string;
  name: string;
  defaultStrictness: StrictnessLevel;
  languageVariant: LanguageVariant;
  toneNote: string;
  retentionDays: number;
  createdAt: string;
  lastCheckDate?: string;
}
