import { Card, CardContent } from "@/components/ui/card";
import { DashboardStats } from "@/types";
import { BarChart2, Calendar, ShoppingBag } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface StatsOverviewProps {
  stats: DashboardStats;
  queries: Query[];
  currentDate?: string;
  compareDate?: string;
}

export default function StatsOverview({ stats, queries, currentDate, compareDate }: StatsOverviewProps) {
  const { currentUser } = useAuth();

  // Calculate changes between comparison dates
  const countChangesBetweenDates = () => {
    if (!currentDate || !compareDate) return 0;
    let totalChanges = 0;

    queries.forEach(query => {
      if (!query.dates || !query.dates[currentDate] || !query.dates[compareDate]) return;

      const currentData = query.dates[currentDate];
      const compareData = query.dates[compareDate];

      // 키워드 변화 카운트 - 비교 날짜 기준
      if (currentData.keywords && compareData.keywords) {
        // 비교 날짜에서의 순위와 현재 순위를 비교
        const compareRanks = new Map(compareData.keywords.map((k, i) => [k.key, i + 1]));
        
        totalChanges += compareData.keywords.filter(k => {
          const currentKeyword = currentData.keywords.find(ck => ck.key === k.key);
          if (!currentKeyword) return true; // 제거된 경우
          const prevRank = compareRanks.get(k.key) || 0;
          const currentRank = currentData.keywords.findIndex(ck => ck.key === k.key) + 1;
          return prevRank !== currentRank; // 순위 변화가 있는 경우
        }).length;

        // 새로 추가된 키워드도 카운트
        totalChanges += currentData.keywords.filter(k => 
          !compareData.keywords.some(ck => ck.key === k.key)
        ).length;
      }

      // 키워드 개수 변화 카운트 - 비교 날짜 기준
      if (currentData.keywordCounts && compareData.keywordCounts) {
        const compareRanks = new Map(compareData.keywordCounts.map((k, i) => [k.key, i + 1]));
        
        totalChanges += compareData.keywordCounts.filter(k => {
          const currentKeyword = currentData.keywordCounts.find(ck => ck.key === k.key);
          if (!currentKeyword) return true; // 제거된 경우
          const prevRank = compareRanks.get(k.key) || 0;
          const currentRank = currentData.keywordCounts.findIndex(ck => ck.key === k.key) + 1;
          return prevRank !== currentRank; // 순위 변화가 있는 경우
        }).length;

        // 새로 추가된 키워드도 카운트 
        totalChanges += currentData.keywordCounts.filter(k =>
          !compareData.keywordCounts.some(ck => ck.key === k.key)
        ).length;
      }

      // Count changes in tags
      if (currentData.tags && compareData.tags) {
        totalChanges += currentData.tags.filter(k => 
          k.status === 'added' || k.status === 'removed' || 
          k.status === 'increased' || k.status === 'decreased' ||
          (k.rankChange !== undefined && k.rankChange !== 0)
        ).length;
      }
    });
    return totalChanges;
  };

  const changesCount = countChangesBetweenDates();

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4">분석 개요</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard 
          title="저장된 상품" 
          value={stats.queryCount.toString()} 
          description="최대 3개 저장 가능" 
          icon={<ShoppingBag />}
          color="blue"
          isActive={!!currentUser}
        />

        <StatCard 
          title="마지막 업데이트" 
          value={stats.lastUpdated} 
          description="가장 최근 분석 날짜" 
          icon={<Calendar />}
          color="green"
          isActive={!!currentUser}
        />

        <StatCard 
          title="변경된 데이터" 
          value={changesCount.toString()} 
          description="비교 날짜 기준 변경 항목 개수" 
          icon={<BarChart2 />}
          color="indigo"
          isActive={!!currentUser}
        />
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'indigo';
  isActive: boolean;
}

function StatCard({ title, value, description, icon, color, isActive }: StatCardProps) {
  const colorMap = {
    blue: {
      bg: isActive ? 'bg-blue-50' : 'bg-gray-50/80',
      border: isActive ? 'border-blue-100' : 'border-gray-200',
      text: isActive ? 'text-blue-600' : 'text-gray-400',
      valueText: isActive ? 'text-blue-700' : 'text-gray-500'
    },
    green: {
      bg: isActive ? 'bg-green-50' : 'bg-gray-50/80',
      border: isActive ? 'border-green-100' : 'border-gray-200',
      text: isActive ? 'text-green-600' : 'text-gray-400',
      valueText: isActive ? 'text-green-700' : 'text-gray-500'
    },
    indigo: {
      bg: isActive ? 'bg-indigo-50' : 'bg-gray-50/80',
      border: isActive ? 'border-indigo-100' : 'border-gray-200',
      text: isActive ? 'text-indigo-600' : 'text-gray-400',
      valueText: isActive ? 'text-indigo-700' : 'text-gray-500'
    }
  };

  const colors = colorMap[color];

  return (
    <Card className={`border ${colors.border} ${colors.bg} shadow-sm overflow-hidden`}>
      <CardContent className="p-6">
        <div className="flex justify-between">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">{title}</h3>
            <p className={`text-2xl font-bold ${colors.valueText}`}>
              {isActive ? value : '-'}
            </p>
          </div>
          <div className={`w-10 h-10 rounded-full ${colors.bg} border ${colors.border} flex items-center justify-center shrink-0 ${colors.text}`}>
            {icon}
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2">{description}</p>
      </CardContent>
    </Card>
  );
}

interface Query {
  dates: { [date: string]: { [key: string]: any } };
}