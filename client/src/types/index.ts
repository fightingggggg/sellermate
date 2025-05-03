// Analysis types
export interface KeywordItem {
  key: string;
  value: number;
  change?: number;
  status?: 'added' | 'removed' | 'increased' | 'decreased' | 'unchanged';
}

export interface AnalysisData {
  lastUpdated: string;
  keywords: KeywordItem[];
  keywordCounts: KeywordItem[];
  tags: KeywordItem[];
  savedAt: string;
}

// Query type
export interface Query {
  id: string;
  text: string;
  lastUpdated: string;
  keywords: KeywordItem[];
  keywordCounts: KeywordItem[];
  tags: KeywordItem[];
  email: string;
  savedAt: string;
}

// User type
export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

// Stats type
export interface DashboardStats {
  queryCount: number;
  lastUpdated: string;
  changesCount: number;
}
