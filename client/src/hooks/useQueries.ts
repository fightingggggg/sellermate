import { useState, useEffect } from "react";
import { collection, getDocs, onSnapshot, query, orderBy, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Query, DashboardStats } from "@/types";
import { useAuth } from "@/contexts/AuthContext";

export function useQueries() {
  const [queries, setQueries] = useState<Query[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    queryCount: 0,
    lastUpdated: "-",
    changesCount: 0
  });
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser?.email) {
      setQueries([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    
    // Create reference to user's queries collection
    const userQueriesRef = collection(db, "analysisLogs", currentUser.email, "queries");
    const q = query(userQueriesRef, orderBy("savedAt", "desc"));
    
    // Subscribe to changes
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedQueries: Query[] = [];
      let latestDate = "";
      let totalChanges = 0;
      
      snapshot.forEach((doc) => {
        const data = doc.data() as Omit<Query, "id">;
        const query: Query = { id: doc.id, ...data };
        
        // Count changes
        const changesInQuery = countChanges(query);
        totalChanges += changesInQuery;
        
        // Track latest update date
        if (data.lastUpdated > latestDate) {
          latestDate = data.lastUpdated;
        }
        
        loadedQueries.push(query);
      });
      
      // Update stats
      setStats({
        queryCount: loadedQueries.length,
        lastUpdated: latestDate || "-",
        changesCount: totalChanges
      });
      
      setQueries(loadedQueries);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching queries:", error);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [currentUser]);

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
