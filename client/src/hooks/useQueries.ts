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
import { Query, DashboardStats, KeywordItem } from "@/types";
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
            
            // Create a properly typed Query object
            const query: Query = {
              id: docSnapshot.id,
              text: docData.text || "",
              lastUpdated: docData.lastUpdated || "-",
              keywords: processKeywordItems(docData.keywords || []),
              keywordCounts: processKeywordItems(docData.keywordCounts || []),
              tags: processKeywordItems(docData.tags || []),
              email: docData.email || userEmail,
              savedAt: docData.savedAt || new Date().toISOString()
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
    // If items is null, undefined, or not an array, return default placeholder data
    if (!items || !Array.isArray(items) || items.length === 0) {
      // Return sample placeholder data for better UI experience
      return [
        { key: '샘플 데이터', value: 10 },
        { key: '임시 항목', value: 8 }
      ];
    }
    
    return items.map(item => {
      if (typeof item === 'object' && item !== null) {
        // Extract key and value, with fallbacks
        const key = typeof item.key === 'string' ? item.key : 
                   (typeof item === 'string' ? item : '기타');
        
        const value = typeof item.value === 'number' ? item.value : 
                     (typeof item === 'number' ? item : 0);
                     
        return {
          key: key || '항목',
          value: value,
          change: typeof item.change === 'number' ? item.change : undefined,
          status: item.status as KeywordItem['status']
        };
      }
      return { key: '항목', value: 0 };
    }).filter(item => item.key !== '');
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
