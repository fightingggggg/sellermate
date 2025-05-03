import { createContext, useContext, useState, useEffect } from "react";
import { collection, doc, setDoc, deleteDoc, getDocs, query as firestoreQuery, where, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Query, KeywordItem } from "@/types";
import { useAuth } from "./AuthContext";
import { useToast } from "@/hooks/use-toast";

interface QueryContextProps {
  isLoading: boolean;
  error: string | null;
  addQuery: (queryText: string) => Promise<boolean>;
  deleteQuery: (queryId: string) => Promise<void>;
  refreshQuery: (queryId: string) => Promise<void>;
  analyzeQuery: (queryText: string) => Promise<{
    keywords: KeywordItem[];
    keywordCounts: KeywordItem[];
    tags: KeywordItem[];
  } | null>;
  compareAndMarkChanges: (oldItems: KeywordItem[], newItems: KeywordItem[]) => KeywordItem[];
}

const QueryContext = createContext<QueryContextProps>({
  isLoading: false,
  error: null,
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
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();
  const { toast } = useToast();

  // Function to analyze query from external data source (ex: Chrome extension)
  async function analyzeQuery(queryText: string) {
    setIsLoading(true);
    try {
      if (!queryText) {
        throw new Error("검색어가 없습니다");
      }
      
      if (!currentUser) {
        throw new Error("로그인이 필요합니다");
      }
      
      // 이 함수는 원래 Chrome 확장 프로그램을 통해 외부 데이터를 가져오는 로직입니다
      // 여기서는 Firebase에 저장된 실제 데이터만 사용합니다
      
      // Firebase에서 기존 데이터를 찾아보기
      const userEmail = currentUser.email || '';
      const userQueriesRef = collection(db, "analysisLogs", userEmail, "queries");
      const existingQueryQuery = firestoreQuery(userQueriesRef, where("text", "==", queryText));
      const existingQuerySnapshot = await getDocs(existingQueryQuery);
      
      // 기존 데이터가 있으면 그 데이터를 반환
      if (!existingQuerySnapshot.empty) {
        const docData = existingQuerySnapshot.docs[0].data();
        return {
          keywords: docData.keywords || [],
          keywordCounts: docData.keywordCounts || [],
          tags: docData.tags || []
        };
      }
      
      // 새 분석 데이터 생성 로직은 Chrome 확장프로그램에서 처리됩니다.
      // 이 웹 앱에서는 빈 데이터 반환
      return {
        keywords: [],
        keywordCounts: [],
        tags: []
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

      // 이 웹 앱에서는 Chrome 확장프로그램을 통해서만 데이터 추가 가능
      // Firebase의 실제 데이터만 표시하고, 예시 데이터는 생성하지 않습니다.
      toast({
        title: "기능 제한",
        description: "이 기능은 Chrome 확장프로그램에서만 사용 가능합니다.",
        variant: "destructive"
      });
      return false;
    } catch (error: any) {
      console.error("Error adding product:", error);
      
      if (error.code === 'permission-denied') {
        setError('permission-denied');
      }
      
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
    } catch (error: any) {
      console.error("Error deleting product:", error);
      
      if (error.code === 'permission-denied') {
        setError('permission-denied');
      }
      
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
      
      // 이 기능도 Chrome 확장프로그램에서만 가능하도록 제한
      toast({
        title: "기능 제한",
        description: "이 기능은 Chrome 확장프로그램에서만 사용 가능합니다.",
        variant: "destructive"
      });
      return;
    } catch (error: any) {
      console.error("Error refreshing product:", error);
      
      if (error.code === 'permission-denied') {
        setError('permission-denied');
      }
      
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

  // Listen for permission-denied errors from useQueries hook
  useEffect(() => {
    function handleFirebaseError(event: Event) {
      const customEvent = event as CustomEvent<{code: string}>;
      if (customEvent.detail?.code === 'permission-denied') {
        setError('permission-denied');
      }
    }
    
    // Add event listener
    window.addEventListener('firebase-error', handleFirebaseError);
    
    // Clean up event listener
    return () => {
      window.removeEventListener('firebase-error', handleFirebaseError);
    };
  }, []);

  const value = {
    isLoading,
    error,
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