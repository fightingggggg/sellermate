import { createContext, useContext, useState } from "react";
import { collection, doc, setDoc, deleteDoc, getDocs, query as firestoreQuery, where, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Query, KeywordItem } from "@/types";
import { useAuth } from "./AuthContext";
import { useToast } from "@/hooks/use-toast";

interface QueryContextProps {
  isLoading: boolean;
  addQuery: (queryText: string) => Promise<boolean>;
  deleteQuery: (queryId: string) => Promise<void>;
  refreshQuery: (queryId: string) => Promise<void>;
  analyzeQuery: (queryText: string) => Promise<{
    keywords: KeywordItem[];
    keywordCounts: KeywordItem[];
    tags: KeywordItem[];
  } | null>;
}

const QueryContext = createContext<QueryContextProps>({
  isLoading: false,
  addQuery: async () => false,
  deleteQuery: async () => {},
  refreshQuery: async () => {},
  analyzeQuery: async () => null
});

export function useQueryContext() {
  return useContext(QueryContext);
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const { currentUser } = useAuth();
  const { toast } = useToast();

  // Function to simulate Chrome extension analysis
  async function analyzeQuery(queryText: string) {
    setIsLoading(true);
    try {
      // In a real app, this would call the Chrome extension API
      // For now, we'll simulate a delay and return data
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate keywords with varying values to show ranking behavior
      const keywords = Array.from({ length: 6 }, (_, i) => {
        const value = Math.floor(Math.random() * 30) + 5;
        return { key: `키워드${i+1}`, value };
      });
      
      const keywordCounts = Array.from({ length: 15 }, (_, i) => {
        const value = Math.floor(Math.random() * 80) + 10;
        return { key: `상품${i+1}`, value };
      });
      
      return {
        keywords,
        keywordCounts,
        tags: [
          { key: "#인기", value: 45 },
          { key: "#할인", value: 32 },
          { key: "#신상", value: 28 },
          { key: "#베스트", value: 24 },
          { key: "#추천", value: 18 },
        ]
      };
    } catch (error) {
      console.error("Error analyzing product:", error);
      toast({
        title: "상품 분석 오류",
        description: "상품을 분석하는 중 오류가 발생했습니다.",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }

  async function addQuery(queryText: string): Promise<boolean> {
    if (!currentUser) {
      toast({
        title: "인증 오류",
        description: "로그인이 필요합니다.",
        variant: "destructive"
      });
      return false;
    }

    setIsLoading(true);
    try {
      // Ensure the user's collection exists
      const userEmail = currentUser.email || '';
      const userQueriesRef = collection(db, "analysisLogs", userEmail, "queries");
      
      // Check if user already has 3 queries
      const userQueriesSnapshot = await getDocs(userQueriesRef);
      
      if (userQueriesSnapshot.size >= 3) {
        toast({
          title: "상품 한도 초과",
          description: "최대 3개의 상품만 저장할 수 있습니다.",
          variant: "destructive"
        });
        return false;
      }

      // Check if query already exists
      const existingQueryQuery = firestoreQuery(userQueriesRef, where("text", "==", queryText));
      const existingQuerySnapshot = await getDocs(existingQueryQuery);
      
      if (!existingQuerySnapshot.empty) {
        toast({
          title: "중복된 상품",
          description: "이미 동일한 상품이 저장되어 있습니다.",
          variant: "destructive"
        });
        return false;
      }

      // Analyze query
      const analysisData = await analyzeQuery(queryText);
      
      if (!analysisData) {
        return false;
      }

      // Create new query document
      const newQueryRef = doc(userQueriesRef);
      const today = new Date().toISOString().split('T')[0];
      
      const newQueryData = {
        text: queryText,
        lastUpdated: today,
        keywords: analysisData.keywords,
        keywordCounts: analysisData.keywordCounts,
        tags: analysisData.tags,
        email: userEmail,
        savedAt: new Date().toISOString()
      };

      // Save to Firestore
      await setDoc(newQueryRef, newQueryData);
      
      toast({
        title: "상품 추가 성공",
        description: "새 상품이 성공적으로 추가되었습니다.",
      });
      
      return true;
    } catch (error) {
      console.error("Error adding product:", error);
      toast({
        title: "상품 추가 오류",
        description: "상품을 추가하는 중 오류가 발생했습니다.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }

  async function deleteQuery(queryId: string): Promise<void> {
    if (!currentUser || !currentUser.email) {
      toast({
        title: "인증 오류",
        description: "로그인이 필요합니다.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Delete from Firestore
      const queryRef = doc(db, "analysisLogs", currentUser.email, "queries", queryId);
      await deleteDoc(queryRef);
      
      toast({
        title: "상품 삭제 성공",
        description: "상품이 성공적으로 삭제되었습니다.",
      });
    } catch (error) {
      console.error("Error deleting product:", error);
      toast({
        title: "상품 삭제 오류",
        description: "상품을 삭제하는 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function refreshQuery(queryId: string): Promise<void> {
    if (!currentUser || !currentUser.email) {
      toast({
        title: "인증 오류",
        description: "로그인이 필요합니다.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Get existing query
      const queryRef = doc(db, "analysisLogs", currentUser.email, "queries", queryId);
      const queryDoc = await getDoc(queryRef);
      
      if (!queryDoc.exists()) {
        toast({
          title: "상품 조회 오류",
          description: "상품을 찾을 수 없습니다.",
          variant: "destructive"
        });
        return;
      }
      
      const existingQuery = queryDoc.data() as Omit<Query, 'id'> & { text: string };
      
      // Re-analyze query
      const newAnalysisData = await analyzeQuery(existingQuery.text);
      
      if (!newAnalysisData) {
        return;
      }

      const today = new Date().toISOString().split('T')[0];
      
      // Compare and mark changes
      const updatedKeywords = compareAndMarkChanges(existingQuery.keywords || [], newAnalysisData.keywords);
      const updatedKeywordCounts = compareAndMarkChanges(existingQuery.keywordCounts || [], newAnalysisData.keywordCounts);
      const updatedTags = compareAndMarkChanges(existingQuery.tags || [], newAnalysisData.tags);

      // Update query
      await setDoc(queryRef, {
        lastUpdated: today,
        keywords: updatedKeywords,
        keywordCounts: updatedKeywordCounts,
        tags: updatedTags,
      }, { merge: true });
      
      toast({
        title: "상품 새로고침 성공",
        description: "상품이 성공적으로 새로고침되었습니다.",
      });
    } catch (error) {
      console.error("Error refreshing product:", error);
      toast({
        title: "상품 새로고침 오류",
        description: "상품을 새로고침하는 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }

  // Helper function to compare and mark changes in keyword items
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

  const value = {
    isLoading,
    addQuery,
    deleteQuery,
    refreshQuery,
    analyzeQuery
  };

  return (
    <QueryContext.Provider value={value}>
      {children}
    </QueryContext.Provider>
  );
}
