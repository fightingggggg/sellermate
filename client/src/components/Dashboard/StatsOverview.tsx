import { Card, CardContent } from "@/components/ui/card";
import { DashboardStats } from "@/types";

interface StatsOverviewProps {
  stats: DashboardStats;
}

export default function StatsOverview({ stats }: StatsOverviewProps) {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-text-primary mb-2">분석 개요</h2>
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-secondary mb-1">저장된 쿼리</h3>
              <p className="text-2xl font-semibold text-primary">{stats.queryCount}</p>
              <p className="text-sm text-text-secondary mt-1">최대 3개 저장 가능</p>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-secondary mb-1">마지막 업데이트</h3>
              <p className="text-2xl font-semibold text-success">{stats.lastUpdated}</p>
              <p className="text-sm text-text-secondary mt-1">가장 최근 분석 날짜</p>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-secondary mb-1">변경된 데이터</h3>
              <p className="text-2xl font-semibold text-purple-600">{stats.changesCount}</p>
              <p className="text-sm text-text-secondary mt-1">전체 변경 항목 개수</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
