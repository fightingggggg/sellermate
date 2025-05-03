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

// 날짜별 분석 결과
export interface DateAnalysis {
  keywords: KeywordItem[];
  keywordCounts: KeywordItem[];
  tags: KeywordItem[];
  lastUpdated: string;
  savedAt: string;
}

// Query type
export interface Query {
  id: string;
  text: string;
  email: string;
  lastUpdated: string;
  // 현재 표시할 분석 결과
  keywords: KeywordItem[];
  keywordCounts: KeywordItem[];
  tags: KeywordItem[];
  // 날짜별 분석 결과 저장
  dates?: Record<string, DateAnalysis>;
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
