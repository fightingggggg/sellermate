import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Query, KeywordItem, DateAnalysis } from "@/types";
import { RefreshCcw, Trash2, ArrowUp, ArrowDown, Star, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useQueryContext } from "@/contexts/QueryContext";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface QueryCardProps {
  query: Query;
  onDelete: (queryId: string, queryText: string) => void;
  onRefresh: (queryId: string) => void;
}

export default function QueryCard({ query, onDelete, onRefresh }: QueryCardProps) {
  const [activeTab, setActiveTab] = useState<'keywords' | 'keywordCounts' | 'tags'>('keywords');
  const [compareMode, setCompareMode] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [comparedData, setComparedData] = useState<{
    keywords: KeywordItem[];
    keywordCounts: KeywordItem[];
    tags: KeywordItem[];
  }>({
    keywords: query.keywords,
    keywordCounts: query.keywordCounts,
    tags: query.tags
  });
  
  const { compareAndMarkChanges } = useQueryContext();

  // Helper function to render change indicator
  const renderChangeIndicator = (item: KeywordItem) => {
    if (item.status === 'added') {
      return <span className="change-indicator text-emerald-500">+</span>;
    } else if (item.status === 'removed') {
      return <span className="change-indicator text-red-500">-</span>;
    } else if (item.status === 'increased') {
      return <span className="change-indicator text-blue-500">↑</span>;
    } else if (item.status === 'decreased') {
      return <span className="change-indicator text-amber-500">↓</span>;
    }
    return <span className="change-indicator"></span>;
  };

  // Helper function to render change amount
  const renderChangeAmount = (item: KeywordItem) => {
    if (item.status === 'increased' && item.change) {
      return <span className="ml-1 text-xs text-emerald-500">+{item.change}</span>;
    } else if (item.status === 'decreased' && item.change) {
      return <span className="ml-1 text-xs text-red-500">-{item.change}</span>;
    }
    return null;
  };
  
  // Calculate frequency-based rank for each keyword
  const sortedByFrequency = [...query.keywordCounts]
    .sort((a, b) => b.value - a.value)
    .slice(0, 12); // Get top 12 items
  
  // Check if a keyword is newly ranked in top 12
  const isNewlyRanked = (item: KeywordItem, index: number) => {
    return item.status === 'added' || 
           (item.status === 'increased' && item.change && item.change > 5);
  };

  // 날짜별 데이터 비교를 위한 useEffect
  useEffect(() => {
    if (!query?.dates) return;
    
    // 사용 가능한 날짜 목록 추출
    const dateKeys = Object.keys(query.dates).sort().reverse();
    setAvailableDates(dateKeys);
    
    // 현재 날짜가 없으면 가장 최근 날짜 선택
    if (dateKeys.length > 0 && !selectedDate) {
      setSelectedDate(dateKeys[0]);
    }
  }, [query.dates]);
  
  // 선택한 날짜가 변경될 때 데이터 비교
  useEffect(() => {
    if (!compareMode || !selectedDate || !query?.dates) return;
    
    const currentData = {
      keywords: query.keywords,
      keywordCounts: query.keywordCounts,
      tags: query.tags
    };
    
    // 선택한 날짜의 데이터가 있는지 확인
    const selectedDateData = query.dates[selectedDate];
    if (!selectedDateData) {
      setComparedData(currentData);
      return;
    }
    
    // 현재 데이터와 과거 데이터 비교
    setComparedData({
      keywords: compareAndMarkChanges(selectedDateData.keywords, query.keywords),
      keywordCounts: compareAndMarkChanges(selectedDateData.keywordCounts, query.keywordCounts),
      tags: compareAndMarkChanges(selectedDateData.tags, query.tags)
    });
  }, [compareMode, selectedDate, query.dates, compareAndMarkChanges]);

  // 표시할 데이터 결정
  const displayData = compareMode ? comparedData : {
    keywords: query.keywords,
    keywordCounts: query.keywordCounts,
    tags: query.tags
  };
  
  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-medium text-text-primary">{query.text}</h3>
            <p className="text-sm text-text-secondary">마지막 업데이트: {query.lastUpdated}</p>
            
            {/* 날짜별 비교 UI */}
            {query.dates && Object.keys(query.dates).length > 1 && (
              <div className="mt-2 flex items-center space-x-2">
                <Button 
                  variant={compareMode ? "secondary" : "outline"} 
                  size="sm"
                  onClick={() => setCompareMode(!compareMode)}
                  className="text-xs h-8"
                >
                  <Calendar className="h-3.5 w-3.5 mr-1" />
                  {compareMode ? "비교 중지" : "날짜별 비교"}
                </Button>
                
                {compareMode && (
                  <Select
                    value={selectedDate}
                    onValueChange={(value) => setSelectedDate(value)}
                  >
                    <SelectTrigger className="w-[180px] h-8 text-xs">
                      <SelectValue placeholder="날짜 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableDates.map((date) => (
                        <SelectItem key={date} value={date}>
                          {date} 데이터와 비교
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            )}
          </div>
          <div>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => onDelete(query.id, query.text)}
              className="text-destructive hover:text-destructive"
              title="상품 삭제"
            >
              <Trash2 className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        {/* Product Analysis Tabs */}
        <div className="border-b border-gray-200 mb-4">
          <nav className="-mb-px flex space-x-8">
            <button 
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'keywords' 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('keywords')}
            >
              키워드
            </button>
            <button 
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'keywordCounts' 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('keywordCounts')}
            >
              키워드 개수
            </button>
            <button 
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'tags' 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('tags')}
            >
              태그
            </button>
          </nav>
        </div>
        
        {/* Keywords Tab Panel */}
        {activeTab === 'keywords' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[...displayData.keywords].sort((a, b) => b.value - a.value).map((keyword, index) => (
              <div 
                key={index} 
                className={`flex items-center p-3 bg-gray-50 rounded-lg ${
                  keyword.status === 'removed' ? 'text-gray-400' : ''
                }`}
              >
                <div className="flex items-center">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs mr-2">
                    {index + 1}
                  </div>
                  {renderChangeIndicator(keyword)}
                  <span className="text-sm font-medium">{keyword.key}</span>
                </div>
                <div className="ml-auto flex items-center">
                  <div className="w-20 bg-gray-200 rounded-full h-2.5">
                    <div 
                      className={`${keyword.status === 'removed' ? 'bg-gray-400' : 'bg-blue-600'} h-2.5 rounded-full`} 
                      style={{ width: `${Math.min(100, keyword.value * 3)}%` }}
                    ></div>
                  </div>
                  <span className={`ml-2 font-semibold ${
                    keyword.status === 'removed' ? 'text-gray-400' : 'text-blue-600'
                  }`}>
                    {keyword.value}
                  </span>
                  {renderChangeAmount(keyword)}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Keyword Counts Tab Panel - Ranking by frequency */}
        {activeTab === 'keywordCounts' && (
          <>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">키워드 개수 순위</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {sortedByFrequency.map((count, index) => (
                  <div 
                    key={index} 
                    className={`flex items-center p-3 ${
                      isNewlyRanked(count, index) 
                        ? 'bg-emerald-50 border border-emerald-200' 
                        : 'bg-gray-50'
                    } rounded-lg ${
                      count.status === 'removed' ? 'text-gray-400' : ''
                    }`}
                  >
                    <div className="flex items-center">
                      <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs mr-2">
                        {index + 1}
                      </div>
                      {renderChangeIndicator(count)}
                      <span className="text-sm font-medium">{count.key}</span>
                      {isNewlyRanked(count, index) && (
                        <Badge className="ml-2 bg-emerald-500 text-white">NEW</Badge>
                      )}
                    </div>
                    <div className="ml-auto flex items-center">
                      <div className="w-24 bg-gray-200 rounded-full h-2.5">
                        <div 
                          className={`${count.status === 'removed' ? 'bg-gray-400' : 'bg-primary'} h-2.5 rounded-full`} 
                          style={{ width: `${Math.min(100, count.value)}%` }}
                        ></div>
                      </div>
                      <span className={`ml-2 font-semibold ${
                        count.status === 'removed' ? 'text-gray-400' : 'text-primary'
                      }`}>
                        {count.value}
                      </span>
                      {renderChangeAmount(count)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
        
        {/* Tags Tab Panel */}
        {activeTab === 'tags' && (
          <>
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-500 mb-2">태그</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                {[...query.tags].sort((a, b) => b.value - a.value).map((tag, index) => (
                  <div 
                    key={index} 
                    className={`flex items-center p-3 bg-gray-50 rounded-lg ${
                      tag.status === 'removed' ? 'text-gray-400' : ''
                    }`}
                  >
                    <div className="flex items-center">
                      <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs mr-2">
                        {index + 1}
                      </div>
                      {renderChangeIndicator(tag)}
                      <span className="text-sm font-medium">{tag.key}</span>
                    </div>
                    <div className="ml-auto flex items-center">
                      <div className="w-20 bg-gray-200 rounded-full h-2.5">
                        <div 
                          className={`${tag.status === 'removed' ? 'bg-gray-400' : 'bg-purple-600'} h-2.5 rounded-full`} 
                          style={{ width: `${Math.min(100, tag.value)}%` }}
                        ></div>
                      </div>
                      <span className={`ml-2 font-semibold ${
                        tag.status === 'removed' ? 'text-gray-400' : 'text-purple-600'
                      }`}>
                        {tag.value}
                      </span>
                      {renderChangeAmount(tag)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <h4 className="text-sm font-medium text-gray-500 mb-2">태그 구름</h4>
            <div className="flex flex-wrap gap-2">
              {[...query.tags].sort((a, b) => b.value - a.value).map((tag, index) => (
                <div 
                  key={index} 
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    tag.status === 'removed' 
                      ? 'bg-gray-100 text-gray-600' 
                      : 'bg-blue-100 text-blue-800'
                  }`}
                  style={{ 
                    fontSize: `${Math.max(0.8, Math.min(1.3, tag.value / 20))}rem`
                  }}
                >
                  {renderChangeIndicator(tag)}
                  {tag.key}
                  <span className={`ml-1 text-xs ${
                    tag.status === 'removed' ? 'text-gray-500' : 'text-blue-800'
                  }`}>
                    {tag.value}
                  </span>
                  {renderChangeAmount(tag)}
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
