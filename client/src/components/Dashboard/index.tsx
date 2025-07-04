import { useState } from "react";
import { useQueries } from "@/hooks/useQueries";
import StatsOverview from "./StatsOverview";
import QueryCard from "./QueryCard";
import EmptyState from "./EmptyState";
import DeleteQueryModal from "./DeleteQueryModal";
import { useQueryContext } from "@/contexts/QueryContext";
import { useAuth } from "@/contexts/AuthContext";
import { AlertTriangle, Loader2 } from "lucide-react";

export default function Dashboard() {
  const { queries, stats, loading } = useQueries();
  const { refreshQuery, error } = useQueryContext();
  const { currentUser } = useAuth();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedQuery, setSelectedQuery] = useState<{ id: string; text: string } | null>(null);
  const [selectedCurrentDate, setSelectedCurrentDate] = useState<string | undefined>(undefined);
  const [selectedCompareDate, setSelectedCompareDate] = useState<string | undefined>(undefined);

  const handleOpenDeleteModal = (queryId: string, queryText: string) => {
    setSelectedQuery({ id: queryId, text: queryText });
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedQuery(null);
  };

  const handleRefreshQuery = async (queryId: string) => {
    await refreshQuery(queryId);
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
        <p className="mt-4 text-muted-foreground">데이터 로딩 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-5 flex items-center justify-center rounded-full bg-red-100">
          <AlertTriangle className="h-8 w-8 text-red-600" />
        </div>
        <h3 className="text-xl font-semibold mb-2 text-red-600">데이터 접근 오류</h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          {error === "permission-denied" 
            ? "Firebase 데이터베이스 접근 권한이 없습니다. Firebase 보안 규칙을 확인해주세요." 
            : "데이터를 불러오는 중 오류가 발생했습니다."}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">키워드 추적</h2>
            <p className="text-muted-foreground mt-1">크롬 확장프로그램으로 키워드를 검색하면 자동으로 추적됩니다. <br></br> 
            추적 키워드는 최대 3개 입니다. 새로운 키워드를 추적하고 싶다면 이전 키워드를 삭제해주세요</p>
          </div>

        </div>

        <StatsOverview 
          stats={stats} 
          // queries={queries}
          // currentDate={selectedCurrentDate} 
          // compareDate={selectedCompareDate}
        />

        <div className="mt-10 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">저장된 키워드 분석</h2>
            {currentUser && queries.length > 0 && (
              <p className="text-sm text-muted-foreground">최대 3개의 키워드를 분석할 수 있습니다</p>
            )}
          </div>

          {queries.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-6">
              {queries.map((query) => (
                <QueryCard
                  key={query.id}
                  query={query}
                  onDelete={handleOpenDeleteModal}
                  onRefresh={handleRefreshQuery}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedQuery && (
        <DeleteQueryModal
          isOpen={isDeleteModalOpen}
          onClose={handleCloseDeleteModal}
          queryId={selectedQuery.id}
          queryText={selectedQuery.text}
        />
      )}
    </>
  );
}