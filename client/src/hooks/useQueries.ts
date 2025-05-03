import { useState, useEffect } from "react";
import { 
  collection, 
  getDocs, 
  onSnapshot, 
  query as firestoreQuery, 
  orderBy, 
  getDoc, 
  doc, 
  setDoc,
  DocumentData,
  QueryDocumentSnapshot 
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Query, DashboardStats, KeywordItem, AnalysisSnapshot } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export function useQueries() {
  const [queries, setQueries] = useState<Query[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    queryCount: 0,
    lastUpdated: "-",
    changesCount: 0
  });
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!currentUser?.email) {
      setQueries([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    
    // Create reference to user's queries collection based on the provided DB structure
    const userEmail = currentUser.email;
    const userQueriesRef = collection(db, "analysisLogs", userEmail, "queries");
    const q = firestoreQuery(userQueriesRef, orderBy("savedAt", "desc"));
    
    // Subscribe to changes
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      try {
        if (snapshot.empty) {
          setQueries([]);
          setStats({
            queryCount: 0,
            lastUpdated: "-",
            changesCount: 0
          });
          setLoading(false);
          return;
        }
        
        const loadedQueries: Query[] = [];
        let latestDate = "";
        let totalChanges = 0;
        
        // Process each document
        for (const docSnapshot of snapshot.docs) {
          try {
            const docData = docSnapshot.data();
            
            // Ensure the document has the required fields
            if (!docData.text) {
              // Use document ID as text if missing
              docData.text = docSnapshot.id;
            }
            
            if (!docData.lastUpdated) {
              // Use current date as lastUpdated if missing
              docData.lastUpdated = new Date().toISOString().split('T')[0];
            }
            
            // 날짜별 데이터 처리
            const dates: Record<string, AnalysisSnapshot> = {};
            let currentSnapshot: AnalysisSnapshot | undefined;
            let previousSnapshot: AnalysisSnapshot | undefined;
            
            // 기존 형식의 데이터인 경우 (하위 호환성 지원)
            if (docData.keywords || docData.keywordCounts || docData.tags) {
              const defaultDate = docData.lastUpdated || new Date().toISOString().split('T')[0];
              dates[defaultDate] = {
                keywords: processKeywordItems(docData.keywords || []),
                keywordCounts: processKeywordItems(docData.keywordCounts || []),
                tags: processKeywordItems(docData.tags || []),
                lastUpdated: defaultDate,
                savedAt: docData.savedAt || new Date().toISOString()
              };
              currentSnapshot = dates[defaultDate];
            } 
            // 새 형식의 날짜별 데이터 처리
            else {
              // 문서의 필드 중 날짜 형식(YYYY-MM-DD)을 가진 필드들을 찾아서 처리
              Object.keys(docData).forEach(key => {
                if (/^\d{4}-\d{2}-\d{2}$/.test(key) && typeof docData[key] === 'object') {
                  const dateData = docData[key];
                  dates[key] = {
                    keywords: processKeywordItems(dateData.keywords || []),
                    keywordCounts: processKeywordItems(dateData.keywordCounts || []),
                    tags: processKeywordItems(dateData.tags || []),
                    lastUpdated: dateData.lastUpdated || key,
                    savedAt: dateData.savedAt || new Date().toISOString()
                  };
                }
              });
            }
            
            // 날짜순으로 정렬하여 최신 데이터와 이전 데이터 결정
            const sortedDates = Object.keys(dates).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
            if (sortedDates.length > 0) {
              currentSnapshot = dates[sortedDates[0]];
              if (sortedDates.length > 1) {
                previousSnapshot = dates[sortedDates[1]];
              }
            }
            
            // 변화 감지 및 표시를 위한 데이터 처리
            let keywords: KeywordItem[] = [];
            let keywordCounts: KeywordItem[] = [];
            let tags: KeywordItem[] = [];
            
            if (currentSnapshot) {
              if (previousSnapshot) {
                // 이전 스냅샷과 현재 스냅샷 비교하여 변화 표시
                keywords = compareAndMarkChanges(previousSnapshot.keywords, currentSnapshot.keywords);
                keywordCounts = compareAndMarkChanges(previousSnapshot.keywordCounts, currentSnapshot.keywordCounts);
                tags = compareAndMarkChanges(previousSnapshot.tags, currentSnapshot.tags);
              } else {
                // 이전 스냅샷이 없으면 현재 스냅샷 그대로 사용
                keywords = currentSnapshot.keywords;
                keywordCounts = currentSnapshot.keywordCounts;
                tags = currentSnapshot.tags;
              }
            }
            
            // Create a properly typed Query object
            const query: Query = {
              id: docSnapshot.id,
              text: docData.text || "",
              lastUpdated: currentSnapshot?.lastUpdated || "-",
              email: docData.email || userEmail,
              dates,
              currentSnapshot,
              previousSnapshot,
              keywords,
              keywordCounts,
              tags
            };
            
            // Count changes in this query
            const changesInQuery = countChanges(query);
            totalChanges += changesInQuery;
            
            // Track latest update date
            if (query.lastUpdated > latestDate) {
              latestDate = query.lastUpdated;
            }
            
            loadedQueries.push(query);
          } catch (docError) {
            console.error(`Error processing document ${docSnapshot.id}:`, docError);
          }
        }
        
        // Update stats
        setStats({
          queryCount: loadedQueries.length,
          lastUpdated: latestDate || "-",
          changesCount: totalChanges
        });
        
        setQueries(loadedQueries);
      } catch (error) {
        console.error("Error processing query snapshot:", error);
        toast({
          title: "데이터 로딩 오류",
          description: "분석 데이터를 불러오는 중 오류가 발생했습니다.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    }, (error: any) => {
      console.error("Error fetching queries:", error);
      
      // Dispatch custom event for Firebase permission errors
      if (error.code === 'permission-denied') {
        const errorEvent = new CustomEvent('firebase-error', { 
          detail: { code: 'permission-denied' } 
        });
        window.dispatchEvent(errorEvent);
      }
      
      toast({
        title: "데이터 로딩 오류",
        description: "분석 데이터를 불러오는 중 오류가 발생했습니다.",
        variant: "destructive"
      });
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [currentUser, toast]);

  // Helper function to process keyword items from Firestore
  function processKeywordItems(items: any[]): KeywordItem[] {
    // If items is null, undefined, or not an array, return empty array
    if (!items || !Array.isArray(items) || items.length === 0) {
      return [];
    }
    
    return items.map(item => {
      if (typeof item === 'object' && item !== null) {
        // Extract key and value, with fallbacks
        const key = typeof item.key === 'string' ? item.key : 
                   (typeof item === 'string' ? item : '');
        
        const value = typeof item.value === 'number' ? item.value : 
                     (typeof item === 'number' ? item : 0);
                     
        // Only return valid items with real data
        if (key) {
          return {
            key: key,
            value: value,
            change: typeof item.change === 'number' ? item.change : undefined,
            status: item.status as KeywordItem['status']
          };
        }
      }
      return null;
    }).filter(item => item !== null) as KeywordItem[];
  }

  // Helper function to compare two sets of keyword items and mark changes
  function compareAndMarkChanges(oldItems: KeywordItem[], newItems: KeywordItem[]): KeywordItem[] {
    // Create maps for efficient lookup
    const oldItemMap = new Map<string, number>();
    oldItems.forEach(item => oldItemMap.set(item.key, item.value));
    
    const newItemMap = new Map<string, number>();
    newItems.forEach(item => newItemMap.set(item.key, item.value));
    
    // Mark added, removed, or changed items
    const result: KeywordItem[] = [];
    
    // Check for new or changed items
    newItemMap.forEach((value, key) => {
      if (!oldItemMap.has(key)) {
        // New item
        result.push({ key, value, status: 'added' });
      } else {
        const oldValue = oldItemMap.get(key)!;
        if (value > oldValue) {
          // Increased
          result.push({ key, value, change: value - oldValue, status: 'increased' });
        } else if (value < oldValue) {
          // Decreased
          result.push({ key, value, change: oldValue - value, status: 'decreased' });
        } else {
          // Unchanged
          result.push({ key, value, status: 'unchanged' });
        }
      }
    });
    
    // Check for removed items
    oldItemMap.forEach((value, key) => {
      if (!newItemMap.has(key)) {
        // Removed item
        result.push({ key, value, status: 'removed' });
      }
    });
    
    // Sort by value (higher first) then by status (added first, removed last)
    result.sort((a, b) => {
      if (a.status === 'removed' && b.status !== 'removed') return 1;
      if (a.status !== 'removed' && b.status === 'removed') return -1;
      return b.value - a.value;
    });
    
    return result;
  }

  // Helper function to count changes in a query
  function countChanges(query: Query): number {
    let count = 0;
    
    // Helper function to safely count changes
    const safeCountChanges = (items: KeywordItem[] = []): number => {
      if (!Array.isArray(items)) return 0;
      
      return items.filter(k => 
        k?.status === 'added' || 
        k?.status === 'removed' || 
        k?.status === 'increased' || 
        k?.status === 'decreased'
      ).length;
    };
    
    // Count changes in keywords
    count += safeCountChanges(query.keywords);
    
    // Count changes in keyword counts
    count += safeCountChanges(query.keywordCounts);
    
    // Count changes in tags
    count += safeCountChanges(query.tags);
    
    return count;
  }

  return { queries, stats, loading };
}
