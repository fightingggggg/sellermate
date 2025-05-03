import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Query, KeywordItem, AnalysisSnapshot } from "@/types";
import { RefreshCcw, Trash2, ArrowUp, ArrowDown, Star, Calendar, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";

interface QueryCardProps {
  query: Query;
  onDelete: (queryId: string, queryText: string) => void;
  onRefresh: (queryId: string) => void;
}

export default function QueryCard({ query, onDelete, onRefresh }: QueryCardProps) {
  const [activeTab, setActiveTab] = useState<'keywords' | 'keywordCounts' | 'tags'>('keywords');
  const [selectedCurrentDate, setSelectedCurrentDate] = useState<string | null>(null);
  const [selectedCompareDate, setSelectedCompareDate] = useState<string | null>(null);
  const [comparedData, setComparedData] = useState<{
    keywords: KeywordItem[];
    keywordCounts: KeywordItem[];
    tags: KeywordItem[];
  } | null>(null);
  
  // Sort dates for the selectors
  const availableDates = Object.keys(query.dates || {}).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );
  
  // 디버깅 출력
  console.log("쿼리 데이터:", query);
  console.log("날짜 정보:", query.dates);
  console.log("사용 가능한 날짜:", availableDates);
  
  // Helper function to compare data between two dates
  const compareAnalysisData = (currentDate: string, compareDate: string | null) => {
    const currentData = query.dates[currentDate];
    
    // If no comparison date or current data doesn't exist, just use the current data
    if (!compareDate || !currentData) {
      setComparedData({
        keywords: currentData?.keywords || [],
        keywordCounts: currentData?.keywordCounts || [],
        tags: currentData?.tags || []
      });
      return;
    }
    
    const compareData = query.dates[compareDate];
    if (!compareData) {
      setComparedData({
        keywords: currentData.keywords || [],
        keywordCounts: currentData.keywordCounts || [],
        tags: currentData.tags || []
      });
      return;
    }
    
    // Compare data and mark changes
    const compareAndMarkChanges = (oldItems: KeywordItem[], newItems: KeywordItem[]): KeywordItem[] => {
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
    };
    
    setComparedData({
      keywords: compareAndMarkChanges(compareData.keywords, currentData.keywords),
      keywordCounts: compareAndMarkChanges(compareData.keywordCounts, currentData.keywordCounts),
      tags: compareAndMarkChanges(compareData.tags, currentData.tags)
    });
  };
  
  // Initialize with default selection (latest date)
  useEffect(() => {
    if (availableDates.length > 0) {
      const currentDate = availableDates[0];
      setSelectedCurrentDate(currentDate);
      // Initialize with no comparison
      compareAnalysisData(currentDate, null);
    }
  }, []);
  
  // Update compared data when dates change
  useEffect(() => {
    if (selectedCurrentDate) {
      compareAnalysisData(selectedCurrentDate, selectedCompareDate);
    }
  }, [selectedCurrentDate, selectedCompareDate]);

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
  const getKeywordData = () => {
    return comparedData ? comparedData.keywordCounts : query.keywordCounts;
  };
  
  // Check if a keyword is newly ranked in top 12
  const isNewlyRanked = (item: KeywordItem, index: number) => {
    return item.status === 'added' || 
           (item.status === 'increased' && item.change && item.change > 5);
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-medium text-text-primary">{query.text}</h3>
            <p className="text-sm text-text-secondary">마지막 업데이트: {query.lastUpdated}</p>
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
        
        {/* Date comparison selectors */}
        {availableDates.length >= 2 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 bg-slate-50 rounded-lg">
            <div>
              <label className="flex items-center mb-2 text-sm font-medium text-gray-700">
                <Calendar className="w-4 h-4 mr-1" />
                현재 날짜
              </label>
              <Select 
                defaultValue={availableDates[0]} 
                onValueChange={(value) => setSelectedCurrentDate(value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="날짜 선택" />
                </SelectTrigger>
                <SelectContent>
                  {availableDates.map(date => (
                    <SelectItem key={date} value={date}>
                      {format(new Date(date), 'yyyy년 MM월 dd일')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="flex items-center mb-2 text-sm font-medium text-gray-700">
                <Clock className="w-4 h-4 mr-1" />
                비교 날짜
              </label>
              <Select 
                onValueChange={(value) => setSelectedCompareDate(value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="이전 날짜 선택 (선택 사항)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">선택 안함</SelectItem>
                  {availableDates.filter(d => d !== selectedCurrentDate).map(date => (
                    <SelectItem key={date} value={date}>
                      {format(new Date(date), 'yyyy년 MM월 dd일')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
        
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
            {(comparedData ? 
                (Array.isArray(comparedData.keywords) ? [...comparedData.keywords] : []) : 
                (Array.isArray(query.keywords) ? [...query.keywords] : [])
             ).sort((a, b) => b.value - a.value).map((keyword, index) => (
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
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-500 mb-2">키워드 개수 순위 (상위 12개)</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(comparedData ? 
                    (Array.isArray(comparedData.keywordCounts) ? [...comparedData.keywordCounts] : []) : 
                    (Array.isArray(query.keywordCounts) ? [...query.keywordCounts] : [])
                  ).sort((a, b) => b.value - a.value)
                  .slice(0, 12)
                  .map((count, index) => (
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
                          style={{ width: `${count.value}%` }}
                        ></div>
                      </div>
                      <span className={`ml-2 font-semibold ${
                        count.status === 'removed' ? 'text-gray-400' : 'text-primary'
                      }`}>
                        {count.value}%
                      </span>
                      {renderChangeAmount(count)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <h4 className="text-sm font-medium text-gray-500 mb-2">모든 키워드 개수</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(comparedData ? 
                  (Array.isArray(comparedData.keywordCounts) ? [...comparedData.keywordCounts] : []) : 
                  (Array.isArray(query.keywordCounts) ? [...query.keywordCounts] : [])
              ).sort((a, b) => b.value - a.value).map((count, index) => (
                <div 
                  key={index} 
                  className={`flex items-center p-3 bg-gray-50 rounded-lg ${
                    count.status === 'removed' ? 'text-gray-400' : ''
                  }`}
                >
                  <div className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs mr-2">
                      {index + 1}
                    </div>
                    {renderChangeIndicator(count)}
                    <span className="text-sm font-medium">{count.key}</span>
                  </div>
                  <div className="ml-auto flex items-center">
                    <div className="w-24 bg-gray-200 rounded-full h-2.5">
                      <div 
                        className={`${count.status === 'removed' ? 'bg-gray-400' : 'bg-indigo-600'} h-2.5 rounded-full`} 
                        style={{ width: `${Math.min(100, count.value * 2)}%` }}
                      ></div>
                    </div>
                    <span className={`ml-2 font-semibold ${
                      count.status === 'removed' ? 'text-gray-400' : 'text-indigo-600'
                    }`}>
                      {count.value}
                    </span>
                    {renderChangeAmount(count)}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
        
        {/* Tags Tab Panel */}
        {activeTab === 'tags' && (
          <>
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-500 mb-2">태그 순위</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                {(comparedData ? 
                    (Array.isArray(comparedData.tags) ? [...comparedData.tags] : []) : 
                    (Array.isArray(query.tags) ? [...query.tags] : [])
                ).sort((a, b) => b.value - a.value).map((tag, index) => (
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
                          style={{ width: `${Math.min(100, tag.value * 2)}%` }}
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
              {(comparedData ? 
                  (Array.isArray(comparedData.tags) ? [...comparedData.tags] : []) : 
                  (Array.isArray(query.tags) ? [...query.tags] : [])
              ).sort((a, b) => b.value - a.value).map((tag, index) => (
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
