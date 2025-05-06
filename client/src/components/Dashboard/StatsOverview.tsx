
import { Card, CardContent } from "@/components/ui/card";
import { DashboardStats, Query, KeywordItem } from "@/types";
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

  // 변경된 데이터 카운트 함수
  const countChanges = () => {
    let totalChanges = 0;
    
    queries.forEach(query => {
      const dates = Object.keys(query.dates || {}).sort((a, b) => 
        new Date(b).getTime() - new Date(a).getTime()
      );
      
      if (dates.length < 2) return; // 비교할 데이터가 없으면 건너뛰기
      
      const latestDate = dates[0];
      const previousDate = dates[1];
      const currentData = query.dates[latestDate];
      const compareData = query.dates[previousDate];
      
      if (!currentData || !compareData) return;
      
      // 변화가 있는 항목 카운트
      const countChangesInCategory = (items: KeywordItem[] = []) => 
        items.filter(k => 
          k.status === 'added' || 
          k.status === 'removed' || 
          k.status === 'increased' || 
          k.status === 'decreased' ||
          (k.rankChange !== undefined && k.rankChange !== 0)
        ).length;
      
      totalChanges += countChangesInCategory(compareData.keywords);
      totalChanges += countChangesInCategory(compareData.keywordCounts);
      totalChanges += countChangesInCategory(compareData.tags);
    });
    
    return totalChanges;
  };

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
          value={countChanges().toString()} 
          description="비교 날짜 기준 변경 항목 수" 
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
