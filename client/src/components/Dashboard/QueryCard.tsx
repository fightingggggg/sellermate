import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Query, KeywordItem } from "@/types";
import { 
  RefreshCcw, Trash2, Calendar, Clock, 
  AlertCircle, ChevronDown, ChevronUp, BarChart
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";

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

  const availableDates = Object.keys(query.dates || {}).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  // Helper function to compare data between two dates
  const compareAnalysisData = (currentDate: string, compareDate: string | null) => {
    if (!query.dates || !currentDate || !query.dates[currentDate]) {
      setComparedData(null);
      return;
    }

    const currentData = query.dates[currentDate];

    if (!compareDate || compareDate === "none" || !query.dates[compareDate]) {
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
      const sortedOldItems = [...oldItems].sort((a, b) => b.value - a.value);
      const sortedNewItems = [...newItems].sort((a, b) => b.value - a.value);

      const oldItemMap = new Map<string, {value: number, rank: number}>();
      sortedOldItems.forEach((item, index) => {
        oldItemMap.set(item.key, {value: item.value, rank: index + 1});
      });

      const newItemMap = new Map<string, {value: number, rank: number}>();
      sortedNewItems.forEach((item, index) => {
        newItemMap.set(item.key, {value: item.value, rank: index + 1});
      });

      const result: KeywordItem[] = [];

      newItemMap.forEach((newInfo, key) => {
        const { value: newValue, rank: newRank } = newInfo;

        if (!oldItemMap.has(key)) {
          result.push({ 
            key, 
            value: newValue, 
            status: 'added', 
            currentRank: newRank,
            previousRank: null
          });
        } else {
          const { value: oldValue, rank: oldRank } = oldItemMap.get(key)!;
          const rankChange = oldRank - newRank;

          result.push({ 
            key, 
            value: newValue, 
            change: newValue - oldValue,
            status: newValue !== oldValue ? (newValue > oldValue ? 'increased' : 'decreased') : 'unchanged',
            currentRank: newRank,
            previousRank: oldRank,
            rankChange
          });
        }
      });

      oldItemMap.forEach((oldInfo, key) => {
        if (!newItemMap.has(key)) {
          result.push({ 
            key, 
            value: oldInfo.value, 
            status: 'removed',
            currentRank: null,
            previousRank: oldInfo.rank
          });
        }
      });

      return result.sort((a, b) => {
        if (a.status === 'removed' && b.status !== 'removed') return 1;
        if (a.status !== 'removed' && b.status === 'removed') return -1;
        if (a.currentRank && b.currentRank) return a.currentRank - b.currentRank;
        return b.value - a.value;
      });
    };

    setComparedData({
      keywords: compareAndMarkChanges(compareData.keywords, currentData.keywords),
      keywordCounts: compareAndMarkChanges(compareData.keywordCounts, currentData.keywordCounts),
      tags: compareAndMarkChanges(compareData.tags, currentData.tags)
    });
  };

  useEffect(() => {
    if (availableDates.length > 0) {
      const currentDate = availableDates[0];
      setSelectedCurrentDate(currentDate);
      if (availableDates.length > 1) {
        setSelectedCompareDate(availableDates[1]);
        compareAnalysisData(currentDate, availableDates[1]);
      } else {
        compareAnalysisData(currentDate, null);
      }
    }
  }, []);

  useEffect(() => {
    if (selectedCurrentDate) {
      compareAnalysisData(selectedCurrentDate, selectedCompareDate);
    }
  }, [selectedCurrentDate, selectedCompareDate]);

  const renderChangeIndicator = (item: KeywordItem) => {
    if (!item.status || item.status === 'unchanged') return null;

    if (item.status === 'added') {
      return (
        <Badge 
          className="mr-2 px-2 py-0.5 text-xs bg-blue-500 text-white border-blue-600"
          style={{ backgroundColor: '#3b82f6' }}
        >
          NEW
        </Badge>
      );
    }

    if (item.status === 'removed') {
      return <Badge className="mr-2 px-2 py-0.5 text-xs bg-red-500 text-white border-red-600">OUT</Badge>;
    }

    if (item.rankChange && item.rankChange !== 0) {
      return (
        <Badge className={`mr-2 px-2 py-0.5 text-xs ${
          item.rankChange > 0 
          ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
          : 'bg-amber-100 text-amber-800 border-amber-300'
        } border`}>
          {Math.abs(item.rankChange)}위 {item.rankChange > 0 
            ? `상승(${item.previousRank}위→${item.currentRank}위)` 
            : `하락(${item.previousRank}위→${item.currentRank}위)`}
        </Badge>
      );
    }

    return null;
  };

  const renderChangeAmount = (item: KeywordItem) => {
    if (item.status === 'increased' && item.change) {
      return <span className="ml-2 text-sm font-bold text-emerald-500">+{item.change}</span>;
    } else if (item.status === 'decreased' && item.change) {
      return <span className="ml-2 text-sm font-bold text-red-500">-{item.change}</span>;
    }
    return null;
  };

  const hasChanges = () => {
    if (!comparedData || !selectedCompareDate || selectedCompareDate === "none") {
      return false;
    }

    const hasRelevantChanges = (items: KeywordItem[]) => {
      return items.some(k => 
        k.status === 'added' || 
        k.status === 'removed' || 
        (k.rankChange !== undefined && k.rankChange !== 0)
      );
    };

    return hasRelevantChanges(comparedData.keywords) || 
           hasRelevantChanges(comparedData.keywordCounts) || 
           hasRelevantChanges(comparedData.tags);
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center">
              <h3 className="text-lg font-medium text-text-primary">{query.text}</h3>
              {hasChanges() && (
                <Badge className="ml-2 bg-blue-100 text-blue-800 hover:bg-blue-200 border border-blue-300">
                  <AlertCircle className="w-3 h-3 mr-1" /> 변화 있음
                </Badge>
              )}
            </div>
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

        {availableDates.length >= 2 && (
          <div className="mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
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
                  value={selectedCompareDate || "none"}
                  onValueChange={(value) => setSelectedCompareDate(value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="이전 날짜 선택 (선택 사항)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">선택 안함</SelectItem>
                    {availableDates.filter(d => d !== selectedCurrentDate).map(date => (
                      <SelectItem key={date} value={date}>
                        {format(new Date(date), 'yyyy년 MM월 dd일')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {hasChanges() && selectedCompareDate && selectedCompareDate !== "none" && (
              <div className="mt-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="text-sm font-medium text-blue-800 mb-2 flex items-center">
                  <BarChart className="h-4 w-4 mr-1" /> 변화 요약
                </h4>

                <div className="space-y-4">
                  {comparedData?.keywords?.some(k => k.status !== 'unchanged') && (
                    <div className="bg-white p-3 rounded-lg border border-blue-100 shadow-sm">
                      <h5 className="text-sm font-semibold mb-2 text-blue-700 border-b pb-1 border-blue-100">
                        주요 키워드 변화 <span className="font-normal text-blue-500">({comparedData?.keywords.filter(k => k.status !== 'unchanged').length}건)</span>
                      </h5>
                      <ul className="text-sm space-y-2.5">
                        {comparedData?.keywords
                          .filter(k => k.status === 'added' || k.status === 'removed' || k.rankChange !== 0)
                          .map((k, idx) => (
                            <li key={idx} className="flex items-start py-1 px-2 rounded-md hover:bg-blue-50">
                              {renderChangeIndicator(k)}
                              <div>
                                <span className="font-medium text-gray-800">"{k.key}"</span>{' '}
                                {k.status === 'added' ? (
                                  <span>새로 추가되어 <span className="font-semibold text-emerald-600">{k.currentRank}위</span>에 진입했습니다.</span>
                                ) : k.status === 'removed' ? (
                                  <span>순위에서 제외되었습니다. (이전 <span className="font-semibold text-red-600">{k.previousRank}위</span>)</span>
                                ) : (
                                  <span>순위가 <span className="font-semibold">{Math.abs(k.rankChange)}위 {k.rankChange > 0 ? 
                                    <span className="text-emerald-600">상승</span> : 
                                    <span className="text-amber-600">하락</span>}
                                  </span>했습니다. ({k.previousRank}위 → {k.currentRank}위)</span>
                                )}
                              </div>
                            </li>
                          ))}
                      </ul>
                    </div>
                  )}

                  {comparedData?.keywordCounts?.some(k => k.status !== 'unchanged') && (
                    <div className="bg-white p-3 rounded-lg border border-indigo-100 shadow-sm">
                      <h5 className="text-sm font-semibold mb-2 text-indigo-700 border-b pb-1 border-indigo-100">
                        키워드 개수 변화 <span className="font-normal text-indigo-500">({comparedData?.keywordCounts.filter(k => k.status !== 'unchanged').length}건)</span>
                      </h5>
                      <ul className="text-sm space-y-2.5">
                        {comparedData?.keywordCounts
                          .filter(k => k.status === 'added' || k.status === 'removed' || k.rankChange !== 0)
                          .map((k, idx) => (
                            <li key={idx} className="flex items-start py-1 px-2 rounded-md hover:bg-indigo-50">
                              {renderChangeIndicator(k)}
                              <div>
                                <span className="font-medium text-gray-800">"{k.key}"</span>{' '}
                                {k.status === 'added' ? (
                                  <span>새로 추가되어 <span className="font-semibold text-emerald-600">{k.currentRank}위</span>에 진입했습니다.</span>
                                ) : k.status === 'removed' ? (
                                  <span>순위에서 제외되었습니다. (이전 <span className="font-semibold text-red-600">{k.previousRank}위</span>)</span>
                                ) : (
                                  <span>순위가 <span className="font-semibold">{Math.abs(k.rankChange)}위 {k.rankChange > 0 ? 
                                    <span className="text-emerald-600">상승</span> : 
                                    <span className="text-amber-600">하락</span>}
                                  </span>했습니다. ({k.previousRank}위 → {k.currentRank}위)</span>
                                )}
                              </div>
                            </li>
                          ))}
                      </ul>
                    </div>
                  )}

                  {comparedData?.tags?.some(k => k.status !== 'unchanged') && (
                    <div className="bg-white p-3 rounded-lg border border-purple-100 shadow-sm">
                      <h5 className="text-sm font-semibold mb-2 text-purple-700 border-b pb-1 border-purple-100">
                        태그 변화 <span className="font-normal text-purple-500">({comparedData?.tags.filter(k => k.status !== 'unchanged').length}건)</span>
                      </h5>
                      <ul className="text-sm space-y-2.5">
                        {comparedData?.tags
                          .filter(k => k.status === 'added' || k.status === 'removed' || k.rankChange !== 0)
                          .map((k, idx) => (
                            <li key={idx} className="flex items-start py-1 px-2 rounded-md hover:bg-purple-50">
                              {renderChangeIndicator(k)}
                              <div>
                                <span className="font-medium text-gray-800">"{k.key}"</span>{' '}
                                {k.status === 'added' ? (
                                  <span>새로 추가되어 <span className="font-semibold text-emerald-600">{k.currentRank}위</span>에 진입했습니다.</span>
                                ) : k.status === 'removed' ? (
                                  <span>순위에서 제외되었습니다. (이전 <span className="font-semibold text-red-600">{k.previousRank}위</span>)</span>
                                ) : (
                                  <span>순위가 <span className="font-semibold">{Math.abs(k.rankChange)}위 {k.rankChange > 0 ? 
                                    <span className="text-emerald-600">상승</span> : 
                                    <span className="text-amber-600">하락</span>}
                                  </span>했습니다. ({k.previousRank}위 → {k.currentRank}위)</span>
                                )}
                              </div>
                            </li>
                          ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

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

        {activeTab === 'keywords' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(comparedData ? 
                (Array.isArray(comparedData.keywords) ? [...comparedData.keywords] : []) : 
                (Array.isArray(query.keywords) ? [...query.keywords] : [])
             ).sort((a, b) => b.value - a.value).map((keyword, index) => {
              const KeywordCard = (
                <div 
                  key={index} 
                  className={`flex items-center p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                    keyword.status === 'removed' ? 'text-gray-400 bg-gray-100' :
                    keyword.status === 'added' ? 'bg-emerald-50 border border-emerald-200 hover:bg-emerald-100' :
                    keyword.rankChange !== undefined && keyword.rankChange !== 0 ? 
                      (keyword.rankChange > 0 ? 'bg-green-50 border border-green-200 hover:bg-green-100' : 
                      'bg-amber-50 border border-amber-200 hover:bg-amber-100') :
                    'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs mr-2">
                      {keyword.status === 'removed' ? 
                        (keyword.previousRank || index + 1) : 
                        (keyword.currentRank || index + 1)}
                    </div>
                    <span className="text-sm font-medium">{keyword.key}</span>
                    {renderChangeIndicator(keyword)}
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
                      {renderChangeAmount(keyword)}
                    </span>
                  </div>
                </div>
              );

              return (keyword.status === 'added' || keyword.status === 'removed' || keyword.rankChange !== 0) ? (
                <Dialog key={index}>
                  <DialogTrigger asChild>
                    {KeywordCard}
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="text-center">
                        {keyword.key} <span className="text-sm text-gray-500">키워드 변화</span>
                      </DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex justify-between mb-4">
                          <div>
                            <h5 className="text-sm font-medium text-gray-600 mb-1">이전 값</h5>
                            {keyword.status === 'added' ? (
                              <span className="text-2xl font-bold text-gray-400">-</span>
                            ) : (
                              <div className="flex items-center">
                                <span className="text-2xl font-bold">
                                  {keyword.status === 'increased' && keyword.change ? keyword.value - keyword.change : 
                                   keyword.status === 'decreased' && keyword.change ? keyword.value + keyword.change : 
                                   keyword.value}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="text-center mt-2">
                            <span className="text-4xl">
                              {keyword.status === 'added' ? (
                                <span className="text-emerald-500">→</span>
                              ) : keyword.status === 'removed' ? (
                                <span className="text-red-500">→</span>
                              ) : keyword.status === 'increased' ? (
                                <span className="text-blue-500">↑</span>
                              ) : (
                                <span className="text-amber-500">↓</span>
                              )}
                            </span>
                          </div>
                          <div className="text-right">
                            <h5 className="text-sm font-medium text-gray-600 mb-1">현재 값</h5>
                            {keyword.status === 'removed' ? (
                              <span className="text-2xl font-bold text-gray-400">-</span>
                            ) : (
                              <div className="flex items-center justify-end">
                                <span className="text-2xl font-bold">{keyword.value}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="text-center my-4">
                          <span className="text-sm font-medium">
                            {keyword.status === 'added' ? (
                              `"${keyword.key}, ${keyword.value}"이(가) 새로 추가되어 ${index + 1}위에 올랐습니다.`
                            ) : keyword.status === 'removed' ? (
                              `"${keyword.key}, ${keyword.value}"이(가) 순위에서 제외되었습니다.`
                            ) : keyword.status === 'increased' ? (
                              `"${keyword.key}"의 값이 ${keyword.value - (keyword.change || 0)}에서 ${keyword.value}(으)로 변경되었습니다.`
                            ) : (
                              `"${keyword.key}"의 값이 ${keyword.value + (keyword.change || 0)}에서 ${keyword.value}(으)로 변경되었습니다.`
                            )}
                          </span>
                        </div>

                        <div className="mt-4 text-sm text-gray-500">
                          <p>
                            {selectedCurrentDate && format(new Date(selectedCurrentDate), 'yyyy년 MM월 dd일')}과(와) 
                            {selectedCompareDate && selectedCompareDate !== "none" && format(new Date(selectedCompareDate), 'yyyy년 MM월 dd일')} 사이의 
                            변화입니다.
                          </p>
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              ) : KeywordCard;
             })}
          </div>
        )}

        {activeTab === 'keywordCounts' && (
          <>
            <h4 className="text-sm font-medium text-gray-500 mb-2">키워드 개수</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(comparedData ? 
                  (Array.isArray(comparedData.keywordCounts) ? [...comparedData.keywordCounts] : []) : 
                  (Array.isArray(query.keywordCounts) ? [...query.keywordCounts] : [])
              ).sort((a, b) => b.value - a.value).map((count, index) => (
                <div 
                  key={index} 
                  className={`flex items-center p-3 rounded-lg ${
                    count.status === 'removed' ? 'text-gray-400 bg-gray-100' :
                    count.status === 'added' ? 'bg-emerald-50 border border-emerald-200' :
                    count.rankChange !== undefined && count.rankChange !== 0 ? 
                      (count.rankChange > 0 ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200') :
                    'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs mr-2">
                      {count.status === 'removed' ? 
                        (count.previousRank || index + 1) : 
                        (count.currentRank || index + 1)}
                    </div>
                    <span className="text-sm font-medium">{count.key}</span>
                    {renderChangeIndicator(count)}
                  </div>
                  <div className="ml-auto flex items-center">
                    <div className="w-24 bg-gray-200 rounded-full h-2.5">
                      <div 
                        className={`${count.status === 'removed' ? 'bg-gray-400' : 'bg-primary'} h-2.5 rounded-full`} 
                        style={{ width: `${Math.min(100, count.value * 2)}%` }}
                      ></div>
                    </div>
                    <span className={`ml-2 font-semibold ${
                      count.status === 'removed' ? 'text-gray-400' : 'text-primary'
                    }`}>
                      {count.value}
                      {renderChangeAmount(count)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

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
                    className={`flex items-center p-3 rounded-lg ${
                      tag.status === 'removed' ? 'text-gray-400 bg-gray-100' :
                      tag.status === 'added' ? 'bg-emerald-50 border border-emerald-200' :
                      tag.rankChange !== undefined && tag.rankChange !== 0 ? 
                        (tag.rankChange > 0 ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200') :
                      'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs mr-2">
                        {tag.status === 'removed' ? 
                          (tag.previousRank || index + 1) : 
                          (tag.currentRank || index + 1)}
                      </div>
                      <span className="text-sm font-medium">{tag.key}</span>
                      {renderChangeIndicator(tag)}
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
                        {renderChangeAmount(tag)}
                      </span>
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
                  keyindex} 
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    tag.status === 'removed' ? 'bg-gray-100 text-gray-600' :
                    tag.status === 'added' ? 'bg-emerald-100 text-emerald-800' :
                    tag.rankChange !== undefined && tag.rankChange !== 0 ? 
                      (tag.rankChange > 0 ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800') :
                    'bg-blue-100 text-blue-800'
                  }`}
                  style={{ 
                    fontSize: `${Math.max(0.8, Math.min(1.3, tag.value / 20))}rem`
                  }}
                >
                  {tag.key}
                  <span className={`ml-1 text-xs ${
                    tag.status === 'removed' ? 'text-gray-500' : 'text-blue-800'
                  }`}>
                    {tag.value}
                  </span>
                  {renderChangeIndicator(tag)}
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