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
export interface AnalysisSnapshot {
  keywords: KeywordItem[];
  keywordCounts: KeywordItem[];
  tags: KeywordItem[];
  lastUpdated: string;
  savedAt: string;
}

export interface Query {
  id: string;
  text: string;
  lastUpdated: string;
  email: string;
  dates: Record<string, AnalysisSnapshot>;
  currentSnapshot?: AnalysisSnapshot;
  previousSnapshot?: AnalysisSnapshot;
  keywords: KeywordItem[]; // 변화가 적용된 키워드 목록
  keywordCounts: KeywordItem[]; // 변화가 적용된 키워드 개수 목록
  tags: KeywordItem[]; // 변화가 적용된 태그 목록
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
