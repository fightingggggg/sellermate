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
            if (!docData.text || !docData.lastUpdated) {
              console.warn(`Skipping document ${docSnapshot.id} due to missing required fields`);
              continue;
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
    }, (error) => {
      console.error("Error fetching queries:", error);
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
    if (!Array.isArray(items)) {
      return [];
    }
    
    return items.map(item => {
      if (typeof item === 'object' && item !== null) {
        return {
          key: item.key || '',
          value: typeof item.value === 'number' ? item.value : 0,
          change: typeof item.change === 'number' ? item.change : undefined,
          status: item.status as KeywordItem['status']
        };
      }
      return { key: '', value: 0 };
    }).filter(item => item.key !== '');
  }

  // Helper function to count changes in a query
  function countChanges(query: Query): number {
    let count = 0;
    
    // Count changes in keywords
    count += query.keywords.filter(k => 
      k.status === 'added' || 
      k.status === 'removed' || 
      k.status === 'increased' || 
      k.status === 'decreased'
    ).length;
    
    // Count changes in keyword counts
    count += query.keywordCounts.filter(k => 
      k.status === 'added' || 
      k.status === 'removed' || 
      k.status === 'increased' || 
      k.status === 'decreased'
    ).length;
    
    // Count changes in tags
    count += query.tags.filter(k => 
      k.status === 'added' || 
      k.status === 'removed' || 
      k.status === 'increased' || 
      k.status === 'decreased'
    ).length;
    
    return count;
  }

  return { queries, stats, loading };
}
