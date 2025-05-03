import { useState } from "react";
import { useQueries } from "@/hooks/useQueries";
import StatsOverview from "./StatsOverview";
import QueryCard from "./QueryCard";
import EmptyState from "./EmptyState";
import AddQueryModal from "./AddQueryModal";
import DeleteQueryModal from "./DeleteQueryModal";
import { Button } from "@/components/ui/button";
import { useQueryContext } from "@/contexts/QueryContext";
import { AlertTriangle } from "lucide-react";

export default function Dashboard() {
  const { queries, stats, loading } = useQueries();
  const { refreshQuery } = useQueryContext();
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedQuery, setSelectedQuery] = useState<{ id: string; text: string } | null>(null);

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
        <svg className="animate-spin -ml-1 mr-3 h-10 w-10 text-primary mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="mt-4 text-text-secondary">데이터 로딩 중...</p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-semibold text-text-primary">SEO 분석 대시보드</h2>
          <Button onClick={() => setIsAddModalOpen(true)}>
            새 상품 추가
          </Button>
        </div>
        
        <StatsOverview stats={stats} />
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-text-primary mb-2">저장된 상품 분석</h2>
          
          {queries.length === 0 ? (
            <EmptyState onAddQuery={() => setIsAddModalOpen(true)} />
          ) : (
            <div>
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
      
      <AddQueryModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        queriesCount={queries.length}
      />
      
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
