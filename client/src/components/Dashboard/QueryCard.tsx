import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Query, KeywordItem, AnalysisSnapshot } from "@/types";
import { 
  BarChart, ChevronDown, ChevronUp, LineChart, RefreshCcw, Trash2, ArrowUp, ArrowDown, Star, Calendar, Clock, 
  AlertCircle,
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
import React from "react";
import TrackingNotificationModal from "./TrackingNotificationModal";

interface QueryCardProps {
  query: Query;
  onDelete: (queryId: string, queryText: string) => void;
  onRefresh: (queryId: string) => void;
}

export default function QueryCard({ query, onDelete, onRefresh }: QueryCardProps) {
  const [activeTab, setActiveTab] = useState<'keywords' | 'tags' | 'keywordCount' | 'tracking'>('keywords');
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
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

  // Helper function to compare data between two dates
  const compareAnalysisData = (currentDate: string, compareDate: string | null) => {
    if (!query.dates || !currentDate || !query.dates[currentDate]) {
      setComparedData(null);
      return;
    }

    const currentData = query.dates[currentDate];

    // 만약 비교 날짜가 "none"이거나 null이면 비교 안함, 현재 데이터만 표시
    if (!compareDate || compareDate === "none" || !query.dates[compareDate]) {
      setComparedData({
        keywords: currentData?.keywords || [],
        tags: currentData?.tags || [],
        keywordCounts: currentData?.keywordCounts || []

      });
      return;
    }

    const compareData = query.dates[compareDate];
    if (!compareData) {
      setComparedData({
        keywords: currentData.keywords || [],
        tags: currentData.tags || [],
        keywordCounts: currentData.keywordCounts || []

      });
      return;
    }

    // Compare data and mark changes
    const compareAndMarkChanges = (oldItems: KeywordItem[], newItems: KeywordItem[]): KeywordItem[] => {
      // Sort items by value and create maps for efficient lookup
      const sortedOldItems = [...oldItems].sort((a, b) => b.value - a.value);
      const sortedNewItems = [...newItems].sort((a, b) => b.value - a.value);

      // Create maps of old and new items with their values and ranks
      const oldItemMap = new Map<string, {value: number, rank: number}>();
      sortedOldItems.forEach((item, index) => {
        oldItemMap.set(item.key, {value: item.value, rank: index + 1});
      });

      const newItemMap = new Map<string, {value: number, rank: number}>();
      sortedNewItems.forEach((item, index) => {
        newItemMap.set(item.key, {value: item.value, rank: index + 1});
      });

      // Mark added, removed, or changed items
      const result: KeywordItem[] = [];

      // Check for new or changed items
      newItemMap.forEach((newInfo, key) => {
        const { value: newValue, rank: newRank } = newInfo;

        if (!oldItemMap.has(key)) {
          // New item - add with current rank
          result.push({ 
            key, 
            value: newValue, 
            status: 'added', 
            currentRank: newRank,
            previousRank: null
          });
        } else {
          const { value: oldValue, rank: oldRank } = oldItemMap.get(key)!;

          if (newValue > oldValue) {
            // Increased
            result.push({ 
              key, 
              value: newValue, 
              change: newValue - oldValue, 
              status: 'increased',
              currentRank: newRank,
              previousRank: oldRank,
              rankChange: oldRank - newRank // positive if moved up in rank
            });
          } else if (newValue < oldValue) {
            // Decreased
            result.push({ 
              key, 
              value: newValue, 
              change: oldValue - newValue, 
              status: 'decreased',
              currentRank: newRank,
              previousRank: oldRank,
              rankChange: oldRank - newRank // negative if moved down in rank
            });
          } else {
            // Unchanged value, but rank might have changed
            result.push({ 
              key, 
              value: newValue, 
              status: 'unchanged',
              currentRank: newRank,
              previousRank: oldRank,
              rankChange: oldRank - newRank
            });
          }
        }
      });

      // Check for removed items
      oldItemMap.forEach((oldInfo, key) => {
        const { value: oldValue, rank: oldRank } = oldInfo;

        if (!newItemMap.has(key)) {
          // Removed item - keep its old rank
          result.push({ 
            key, 
            value: oldValue, 
            status: 'removed',
            currentRank: null,
            previousRank: oldRank
          });
        }
      });

      // Sort by current rank first, then by status (keeping removed items at the end)
      result.sort((a, b) => {
        // Always put removed items last
        if (a.status === 'removed' && b.status !== 'removed') return 1;
        if (a.status !== 'removed' && b.status === 'removed') return -1;

        // For non-removed items, sort by current rank
        if (a.currentRank && b.currentRank) {
          return a.currentRank - b.currentRank;
        }

        // If we reach here, sort by value as a fallback
        return b.value - a.value;
      });

      return result;
    };

    setComparedData({
      keywords: compareAndMarkChanges(compareData.keywords, currentData.keywords),
      tags: compareAndMarkChanges(compareData.tags, currentData.tags),
      keywordCounts: compareAndMarkChanges(compareData.keywordCounts, currentData.keywordCounts)

    });
  };

  // Initialize with default selection (latest date and previous date)
  useEffect(() => {
    if (availableDates.length > 0) {
      const currentDate = availableDates[0];
      setSelectedCurrentDate(currentDate);

      // Automatically select previous date for comparison if available
      if (availableDates.length > 1) {
        const compareDate = availableDates[1];
        setSelectedCompareDate(compareDate);
        compareAnalysisData(currentDate, compareDate);
      } else {
        // If no previous date available, initialize with no comparison
        compareAnalysisData(currentDate, null);
      }
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
    const badges = [];

    if (item.status === 'added') {
      badges.push(<Badge key="new" className="mr-2 px-1.5 py-0 text-xs bg-blue-100 text-blue-800 border border-blue-200">NEW</Badge>);
    } 

    if (item.status === 'removed') {
      badges.push(<Badge key="out" className="mr-2 px-1.5 py-0 text-xs bg-red-100 text-red-800 border border-red-200">OUT</Badge>);
    }

    if (item.rankChange !== undefined && item.rankChange !== 0) {
      badges.push(
        <Badge 
          key="rank" 
          className={`mr-2 px-1.5 py-0 text-xs ${
            item.rankChange > 0 
            ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
            : 'bg-amber-100 text-amber-800 border-amber-300'
          } border`}
        >
          {Math.abs(item.rankChange)}위 {item.rankChange > 0 ? '상승' : '하락'}
        </Badge>
      );
    }

    return badges.length > 0 ? badges : null;
  };


  // 변화가 있는지 확인하는 함수
  const hasChanges = () => {
    if (!comparedData || !selectedCompareDate || selectedCompareDate === "none") {
      return false;
    }

    const hasKeywordChanges = comparedData.keywords.some(k => 
      k.status === 'added' || k.status === 'removed' || 
      k.status === 'increased' || k.status === 'decreased' ||
      (k.rankChange !== undefined && k.rankChange !== 0)
    );

    const hasTagChanges = comparedData.tags.some(k => 
      k.status === 'added' || k.status === 'removed' || 
      k.status === 'increased' || k.status === 'decreased' ||
      (k.rankChange !== undefined && k.rankChange !== 0)
    );

    const hasKeywordCountChanges = comparedData.keywordCounts.some(k => 
      k.status === 'added' || k.status === 'removed' || 
      k.status === 'increased' || k.status === 'decreased' ||
      (k.rankChange !== undefined && k.rankChange !== 0)
    );

    return hasKeywordChanges || hasTagChanges || hasKeywordCountChanges;
  };

  // Helper function to determine if an item should show dialog
  const shouldShowDialog = (item: KeywordItem) => {
    return selectedCompareDate && selectedCompareDate !== "none";
  };

  // Helper function to wrap content in Dialog if needed
  const wrapInDialog = (content: React.ReactNode, item: KeywordItem) => {
    if (!shouldShowDialog(item)) {
      return content;
    }

    return (
      <Dialog>
        <DialogTrigger asChild>
          {content}
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">
              {item.key} <span className="text-sm text-gray-500">변화</span>
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between mb-4">
                <div>
                  <h5 className="text-sm font-medium text-gray-600 mb-1">이전 값</h5>
                  {item.status === 'added' ? (
                    <span className="text-2xl font-bold text-gray-400">-</span>
                  ) : (
                    <div className="flex items-center">
                      <span className="text-2xl font-bold">
                        {item.status === 'increased' && item.change ? item.value - item.change : 
                         item.status === 'decreased' && item.change ? item.value + item.change : 
                         item.value}
                      </span>
                    </div>
                  )}
                </div>
                <div className="text-center mt-2">
                  <span className="text-4xl">
                    {item.status === 'added' ? (
                      <span className="text-emerald-500">→</span>
                    ) : item.status === 'removed' ? (
                      <span className="text-red-500">→</span>
                    ) : item.status === 'increased' ? (
                      <span className="text-blue-500">↑</span>
                    ) : (
                      <span className="text-amber-500">↓</span>
                    )}
                  </span>
                </div>
                <div className="text-right">
                  <h5 className="text-sm font-medium text-gray-600 mb-1">현재 값</h5>
                  {item.status === 'removed' ? (
                    <span className="text-2xl font-bold text-gray-400">-</span>
                  ) : (
                    <div className="flex items-center justify-end">
                      <span className="text-2xl font-bold">{item.value}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="text-center my-4">
                <span className="text-sm font-medium">
                  {item.status === 'added' ? (
                    `"${item.key}"이(가) 새로 추가되어 ${item.currentRank}위에 올랐습니다.`
                  ) : item.status === 'removed' ? (
                    `"${item.key}"이(가) 순위에서 제외되었습니다.`
                  ) : (item.rankChange !== undefined && item.rankChange !== 0) || 
                   (item.tagChange !== undefined && item.tagChange !== 0) || 
                   (item.keywordCountChange !== undefined && item.keywordCountChange !== 0) ? (
                    <div className="space-y-1">
                      {item.rankChange !== undefined && item.rankChange !== 0 && (
                        `"${item.key}"의 순위가 ${Math.abs(item.rankChange)}단계 ${item.rankChange > 0 ? '상승' : '하락'}했습니다. (${item.previousRank}위 → ${item.currentRank}위)`
                      )}
                      {item.tagChange !== undefined && item.tagChange !== 0 && (
                        `"${item.key}"의 태그 개수가 ${Math.abs(item.tagChange)}개 ${item.tagChange > 0 ? '증가' : '감소'}했습니다.`
                      )}
                      {item.keywordCountChange !== undefined && item.keywordCountChange !== 0 && (
                        `"${item.key}"의 키워드 개수가 ${Math.abs(item.keywordCountChange)}개 ${item.keywordCountChange > 0 ? '증가' : '감소'}했습니다.`
                      )}
                    </div>
                  ) : (
                    `"${item.key}"의 순위가 변경되지 않았습니다.`
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
    );
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

        {/* Date comparison selectors */}
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

            {/* 변화 요약 정보 */}
            {hasChanges() && selectedCompareDate && selectedCompareDate !== "none" && (
              <div className="mt-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="text-sm font-medium text-blue-800 mb-2 flex items-center">
                  <BarChart className="h-4 w-4 mr-1" /> 변화 요약
                </h4>


                {/* 간략한 변화 정보 */}
                <div className="space-y-4">
                  {/* 키워드 섹션 */}
                  {comparedData?.keywords?.some(k => (k.status === 'added' || k.status === 'removed' || k.rankChange !== undefined && k.rankChange !== 0)) && (
                    <div className="bg-white p-3 rounded-lg border border-blue-100 shadow-sm">
                      <h5 className="text-sm font-semibold mb-2 text-blue-700 border-b pb-1 border-blue-100">
                        주요 키워드 변화 <span className="font-normal text-blue-500">({comparedData?.keywords.filter(k => (k.status === 'added' || k.status === 'removed' || k.rankChange !== undefined && k.rankChange !== 0)).length}건)</span>
                      </h5>
                      <ul className="text-sm space-y-2.5">
                        {comparedData?.keywords
                          .filter(k => (k.status === 'added' || k.status === 'removed' || k.rankChange !== undefined && k.rankChange !== 0))
                          .sort((a, b) => {
                            // NEW/OUT 우선
                            if ((a.status === 'added' || a.status === 'removed') && !(b.status === 'added' || b.status === 'removed')) return -1;
                            if (!(a.status === 'added' || a.status === 'removed') && (b.status === 'added' || b.status === 'removed')) return 1;
                            // 순위 변화 크기로 정렬
                            return Math.abs((b.rankChange || 0)) - Math.abs((a.rankChange || 0));
                          })
                          .slice(0, 3)
                          .map((k, idx) => (
                            <li key={idx} className="flex items-start py-1 px-2 rounded-md hover:bg-blue-50">
                              {renderChangeIndicator(k)}
                              <div>
                                <span className="font-medium text-gray-800">"{k.key}"</span>{' '}
                                {k.status === 'added' ? (
                                  <span>새로 추가되어 <span className="font-semibold text-emerald-600">{k.currentRank}위</span>에 진입했습니다.</span>
                                ) : k.status === 'removed' ? (
                                  <span>순위에서 제외되었습니다. (이전 <span className="font-semibold text-red-600">{k.previousRank}위</span>)</span>
                                ) : (k.rankChange !== undefined && k.rankChange !== 0) || 
                                 (k.tagChange !== undefined && k.tagChange !== 0) || 
                                 (k.keywordCountChange !== undefined && k.keywordCountChange !== 0) ? (
                                  <div className="space-y-1">
                                    {k.rankChange !== undefined && k.rankChange !== 0 && (
                                      <span>순위가 <span className="font-semibold">{Math.abs(k.rankChange)}위 {k.rankChange > 0 ? 
                                        <span className="text-emerald-600">상승</span> : 
                                        <span className="text-amber-600">하락</span>}
                                      </span>했습니다. ({k.previousRank}위 → {k.currentRank}위)</span>
                                    )}
                                    {k.tagChange !== undefined && k.tagChange !== 0 && (
                                      <span>태그가 <span className="font-semibold">{Math.abs(k.tagChange)}개 {k.tagChange > 0 ? 
                                        <span className="text-emerald-600">증가</span> : 
                                        <span className="text-amber-600">감소</span>}
                                      </span>했습니다.</span>
                                    )}
                                    {k.keywordCountChange !== undefined && k.keywordCountChange !== 0 && (
                                      <span>키워드가 <span className="font-semibold">{Math.abs(k.keywordCountChange)}개 {k.keywordCountChange > 0 ? 
                                        <span className="text-emerald-600">증가</span> : 
                                        <span className="text-amber-600">감소</span>}
                                      </span>했습니다.</span>
                                    )}
                                  </div>
                                ) : null}
                              </div>
                            </li>
                          ))}
                      </ul>
                    </div>
                  )}

                  {/* 태그 섹션 */}
                  {comparedData?.tags?.some(k => (k.status === 'added' || k.status === 'removed' || k.rankChange !== undefined && k.rankChange !== 0)) && (
                    <div className="bg-white p-3 rounded-lg border border-purple-100 shadow-sm">
                      <h5 className="text-sm font-semibold mb-2 text-purple-700 border-b pb-1 border-purple-100">
                        주요 태그 변화 <span className="font-normal text-purple-500">({comparedData?.tags.filter(k => (k.status === 'added' || k.status === 'removed' || k.rankChange !== undefined && k.rankChange !== 0)).length}건)</span>
                      </h5>
                      <ul className="text-sm space-y-2.5">
                        {comparedData?.tags
                          .filter(k => (k.status === 'added' || k.status === 'removed' || k.rankChange !== undefined && k.rankChange !== 0))
                          .sort((a, b) => {
                            if ((a.status === 'added' || a.status === 'removed') && !(b.status === 'added' || b.status === 'removed')) return -1;
                            if (!(a.status === 'added' || a.status === 'removed') && (b.status === 'added' || b.status === 'removed')) return 1;
                            return Math.abs((b.rankChange || 0)) - Math.abs((a.rankChange || 0));
                          })
                          .slice(0, 3)
                          .map((k, idx) => (
                            <li key={idx} className="flex items-start py-1 px-2 rounded-md hover:bg-purple-50">
                              {renderChangeIndicator(k)}
                              <div>
                                <span className="font-medium text-gray-800">"{k.key}"</span>{' '}
                                {k.status === 'added' ? (
                                  <span>새로 추가되어 <span className="font-semibold text-emerald-600">{k.currentRank}위</span>에 진입했습니다.</span>
                                ) : k.status === 'removed' ? (
                                  <span>순위에서 제외되었습니다. (이전 <span className="font-semibold text-red-600">{k.previousRank}위</span>)</span>
                                ) : (k.rankChange !== undefined && k.rankChange !== 0) || 
                                 (k.tagChange !== undefined && k.tagChange !== 0) || 
                                 (k.keywordCountChange !== undefined && k.keywordCountChange !== 0) ? (
                                  <div className="space-y-1">
                                    {k.rankChange !== undefined && k.rankChange !== 0 && (
                                      <span>순위가 <span className="font-semibold">{Math.abs(k.rankChange)}위 {k.rankChange > 0 ? 
                                        <span className="text-emerald-600">상승</span> : 
                                        <span className="text-amber-600">하락</span>}
                                      </span>했습니다. ({k.previousRank}위 → {k.currentRank}위)</span>
                                    )}
                                    {k.tagChange !== undefined && k.tagChange !== 0 && (
                                      <span>태그가 <span className="font-semibold">{Math.abs(k.tagChange)}개 {k.tagChange > 0 ? 
                                        <span className="text-emerald-600">증가</span> : 
                                        <span className="text-amber-600">감소</span>}
                                      </span>했습니다.</span>
                                    )}
                                    {k.keywordCountChange !== undefined && k.keywordCountChange !== 0 && (
                                      <span>키워드가 <span className="font-semibold">{Math.abs(k.keywordCountChange)}개 {k.keywordCountChange > 0 ? 
                                        <span className="text-emerald-600">증가</span> : 
                                        <span className="text-amber-600">감소</span>}
                                      </span>했습니다.</span>
                                    )}
                                  </div>
                                ) : null}
                              </div>
                            </li>
                          ))}
                      </ul>
                    </div>
                  )}

                  {/* 키워드 개수 섹션 */}
                  {comparedData?.keywordCounts?.some(k => (k.status === 'added' || k.status === 'removed' || k.rankChange !== undefined && k.rankChange !== 0)) && (
                    <div className="bg-white p-3 rounded-lg border border-indigo-100 shadow-sm">
                      <h5 className="text-sm font-semibold mb-2 text-indigo-700 border-b pb-1 border-indigo-100">
                        주요 키워드 개수 변화 <span className="font-normal text-indigo-500">({comparedData?.keywordCounts.filter(k => (k.status === 'added' || k.status === 'removed' || k.rankChange !== undefined && k.rankChange !== 0)).length}건)</span>
                      </h5>
                      <ul className="text-sm space-y-2.5">
                        {comparedData?.keywordCounts
                          .filter(k => (k.status === 'added' || k.status === 'removed' || k.rankChange !== undefined && k.rankChange !== 0))
                          .sort((a, b) => {
                            if ((a.status === 'added' || a.status === 'removed') && !(b.status === 'added' || b.status === 'removed')) return -1;
                            if (!(a.status === 'added' || a.status === 'removed') && (b.status === 'added' || b.status === 'removed')) return 1;
                            return Math.abs((b.rankChange || 0)) - Math.abs((a.rankChange || 0));
                          })
                          .slice(0, 3)
                          .map((k, idx) => (
                            <li key={idx} className="flex items-start py-1 px-2 rounded-md hover:bg-indigo-50">
                              {renderChangeIndicator(k)}
                              <div>
                                <span className="font-medium text-gray-800">"{k.key}"</span>{' '}
                                {k.status === 'added' ? (
                                  <span>새로 추가되어 <span className="font-semibold text-emerald-600">{k.currentRank}위</span>에 진입했습니다.</span>
                                ) : k.status === 'removed' ? (
                                  <span>순위에서 제외되었습니다. (이전 <span className="font-semibold text-red-600">{k.previousRank}위</span>)</span>
                                ) : (k.rankChange !== undefined && k.rankChange !== 0) || 
                                 (k.tagChange !== undefined && k.tagChange !== 0) || 
                                 (k.keywordCountChange !== undefined && k.keywordCountChange !== 0) ? (
                                  <div className="space-y-1">
                                    {k.rankChange !== undefined && k.rankChange !== 0 && (
                                      <span>순위가 <span className="font-semibold">{Math.abs(k.rankChange)}위 {k.rankChange > 0 ? 
                                        <span className="text-emerald-600">상승</span> : 
                                        <span className="text-amber-600">하락</span>}
                                      </span>했습니다. ({k.previousRank}위 → {k.currentRank}위)</span>
                                    )}
                                    {k.tagChange !== undefined && k.tagChange !== 0 && (
                                      <span>태그가 <span className="font-semibold">{Math.abs(k.tagChange)}개 {k.tagChange > 0 ? 
                                        <span className="text-emerald-600">증가</span> : 
                                        <span className="text-amber-600">감소</span>}
                                      </span>했습니다.</span>
                                    )}
                                    {k.keywordCountChange !== undefined && k.keywordCountChange !== 0 && (
                                      <span>키워드가 <span className="font-semibold">{Math.abs(k.keywordCountChange)}개 {k.keywordCountChange > 0 ? 
                                        <span className="text-emerald-600">증가</span> : 
                                        <span className="text-amber-600">감소</span>}
                                      </span>했습니다.</span>
                                    )}
                                  </div>
                                ) : null}
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

        {/* Product Analysis Tabs */}
        <div className="border-b border-gray-200 mb-4">
          <nav className="-mb-px flex space-x-8">
            <button 
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'tracking' 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('tracking')}
            >
              <div className="flex items-center">
                <LineChart className="h-4 w-4 mr-1" />
                상품 순위 추적
              </div>
            </button>
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
                activeTab === 'tags' 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('tags')}
            >
              태그
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
          </nav>
        </div>

{activeTab === 'tracking' && (
  <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
    <div className="text-center space-y-4">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mb-2">
        <LineChart className="h-6 w-6 text-blue-600" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900">상품 순위 자동 추적</h3>
      <p className="text-sm text-gray-600 max-w-md mx-auto">
        상품의 순위 변화를 자동으로 추적하고 중요한 변동사항이 있을 때 이메일로 알림을 받아보세요.
      </p>
      <Button 
        onClick={() => setIsTrackingModalOpen(true)}
        className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6"
      >
        <LineChart className="h-4 w-4 mr-2" />
        순위 추적 등록하기
      </Button>
    </div>
  </div>
)}
        {/* Keywords Tab Panel */}
        {activeTab === 'keywords' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(comparedData ? 
                (Array.isArray(comparedData.keywords) ? [...comparedData.keywords] : []) : 
                (Array.isArray(query.keywords) ? [...query.keywords] : [])
             ).sort((a, b) => b.value - a.value).map((keyword, index) => {
              // 변화가 있는 항목인지 확인
              const hasChanges = keyword.status && keyword.status !== 'unchanged';

              // 키워드 카드 컴포넌트
              const KeywordCard = (
                <div 
                  key={index} 
                  className={`flex items-center p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                    keyword.status === 'removed' ? 'text-gray-400 bg-gray-100' :
                    keyword.status === 'added' ? 'bg-blue-50 border border-blue-200 hover:bg-blue-100' :
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
                    {keyword.status === 'added' ? (
                      <Badge className="ml-2 bg-blue-500 text-white">NEW</Badge>
                    ) : keyword.status === 'removed' ? (
                      <Badge className="ml-2 bg-red-500 text-white">OUT</Badge>
                    ) : (keyword.rankChange !== undefined && keyword.rankChange !== 0) || 
                     (keyword.tagChange !== undefined && keyword.tagChange !== 0) || 
                     (keyword.keywordCountChange !== undefined && keyword.keywordCountChange !== 0) ? (
                      <Badge className={`ml-2 ${
                        keyword.rankChange > 0 
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                        : 'bg-amber-100 text-amber-800 border-amber-300'
                      } hover:bg-blue-200 border`}>
                        {Math.abs(keyword.rankChange)}위 {keyword.rankChange > 0 ? `상승(${keyword.previousRank}위→${keyword.currentRank}위)` : `하락(${keyword.previousRank}위→${keyword.currentRank}위)`}
                      </Badge>
                    ) : null}
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
                      {keyword.status === 'increased' && keyword.change ? (
                        <span className="ml-1 text-sm font-bold text-emerald-500">+{keyword.change}</span>
                      ) : keyword.status === 'decreased' && keyword.change ? (
                        <span className="ml-1 text-sm font-bold text-red-500">-{keyword.change}</span>
                      ) : (
                        <span>&nbsp;&nbsp;&nbsp;&nbsp;</span>
                      )}
                    </span>
                  </div>
                </div>
              );

              // 모든 카드에 대해 Dialog로 감싸서 반환
              return (
                <React.Fragment key={keyword.key || index}>
                  {wrapInDialog(KeywordCard, keyword)}
                </React.Fragment>
              );

             })}
          </div>
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
                  <Dialog key={index}>
                    <DialogTrigger asChild>
                      <div 
                        className={`flex items-center p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                          tag.status === 'removed' ? 'text-gray-400 bg-gray-100' :
                          tag.status === 'added' ? 'bg-blue-50 border border-blue-200' :
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
                          {tag.status === 'added' ? (
                            <Badge className="ml-2 bg-blue-500 text-white">NEW</Badge>
                          ) : tag.status === 'removed' ? (
                            <Badge className="ml-2 bg-red-500 text-white">OUT</Badge>
                          ) : (tag.rankChange !== undefined && tag.rankChange !== 0) || 
                           (tag.tagChange !== undefined && tag.tagChange !== 0) || 
                           (tag.keywordCountChange !== undefined && tag.keywordCountChange !== 0) ? (
                            <Badge className={`ml-2 ${
                              tag.rankChange > 0 
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                              : 'bg-amber-100 text-amber-800 border-amber-300'
                            } hover:bg-blue-200 border`}>
                              {Math.abs(tag.rankChange)}위 {tag.rankChange > 0 ? `상승(${tag.previousRank}위→${tag.currentRank}위)` : `하락(${tag.previousRank}위→${tag.currentRank}위)`}
                            </Badge>
                          ) : null}
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
                            {tag.status === 'increased' && tag.change ? (
                              <span className="ml-1 text-sm font-bold text-emerald-500">+{tag.change}</span>
                            ) : tag.status === 'decreased' && tag.change ? (
                              <span className="ml-1 text-sm font-bold text-red-500">-{tag.change}</span>
                            ) : null}
                          </span>
                        </div>
                      </div>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle className="text-center">
                          {tag.key} <span className="text-sm text-gray-500">변화</span>
                        </DialogTitle>
                      </DialogHeader>
                      <div className="py-4">
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <div className="flex justify-between mb-4">
                            <div>
                              <h5 className="text-sm font-medium text-gray-600 mb-1">이전 값</h5>
                              {tag.status === 'added' ? (
                                <span className="text-2xl font-bold text-gray-400">-</span>
                              ) : (
                                <div className="flex items-center">
                                  <span className="text-2xl font-bold">
                                    {tag.status === 'increased' && tag.change ? tag.value - tag.change : 
                                     tag.status === 'decreased' && tag.change ? tag.value + tag.change : 
                                     tag.value}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="text-center mt-2">
                              <span className="text-4xl">
                                {tag.status === 'added' ? (
                                  <span className="text-emerald-500">→</span>
                                ) : tag.status === 'removed' ? (
                                  <span className="text-red-500">→</span>
                                ) : tag.status === 'increased' ? (
                                  <span className="text-blue-500">↑</span>
                                ) : (
                                  <span className="text-amber-500">↓</span>
                                )}
                              </span>
                            </div>
                            <div className="text-right">
                              <h5 className="text-sm font-medium text-gray-600 mb-1">현재 값</h5>
                              {tag.status === 'removed' ? (
                                <span className="text-2xl font-bold text-gray-400">-</span>
                              ) : (
                                <div className="flex items-center justify-end">
                                  <span className="text-2xl font-bold">{tag.value}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="text-center my-4">
                            <span className="text-sm font-medium">
                              {tag.status === 'added' ? (
                                `"${tag.key}"이(가) 새로 추가되어 ${tag.currentRank}위에 올랐습니다.`
                              ) : tag.status === 'removed' ? (
                                `"${tag.key}"이(가) 순위에서 제외되었습니다.`
                              ) : (tag.rankChange !== undefined && tag.rankChange !== 0) || 
                               (tag.tagChange !== undefined && tag.tagChange !== 0) || 
                               (tag.keywordCountChange !== undefined && tag.keywordCountChange !== 0) ? (
                                <div className="space-y-1">
                                  {tag.rankChange !== undefined && tag.rankChange !== 0 && (
                                    `"${tag.key}"의 순위가 ${Math.abs(tag.rankChange)}단계 ${tag.rankChange > 0 ? '상승' : '하락'}했습니다. (${tag.previousRank}위 → ${tag.currentRank}위)`
                                  )}
                                  {tag.tagChange !== undefined && tag.tagChange !== 0 && (
                                    `"${tag.key}"의 태그 개수가 ${Math.abs(tag.tagChange)}개 ${tag.tagChange > 0 ? '증가' : '감소'}했습니다.`
                                  )}
                                  {tag.keywordCountChange !== undefined && tag.keywordCountChange !== 0 && (
                                    `"${tag.key}"의 키워드 개수가 ${Math.abs(tag.keywordCountChange)}개 ${tag.keywordCountChange > 0 ? '증가' : '감소'}했습니다.`
                                  )}
                                </div>
                              ) : (
                                `"${tag.key}"의 순위가 변경되지 않았습니다.`
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
                ))}
              </div>
            </div>

            <h4 className="text-sm font-medium text-gray-500 mb-2">태그 구름</h4>
            <div className="flex flex-wrap gap-2">
              {(comparedData ? 
                  (Array.isArray(comparedData.tags) ? [...comparedData.tags] : []) : 
                  (Array.isArray(query.tags) ? [...query.tags] : [])
              ).sort((a, b) => b.value - a.value).map((tag, index) => (
                <Dialog key={index}>
                  <DialogTrigger asChild>
                    <div 
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        tag.status === 'removed' ? 'bg-gray-100 text-gray-600' :
                        tag.status === 'added' ? 'bg-blue-100 text-blue-800' :
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
                      {tag.status === 'added' ? (
                        <Badge className="ml-1 px-1 py-0 text-xs bg-blue-100 text-blue-800 border border-blue-200">NEW</Badge>
                      ) : tag.status === 'removed' ? (
                        <Badge className="ml-1 px-1 py-0 text-xs bg-red-100 text-red-800 border border-red-200">OUT</Badge>
                      ) : (tag.rankChange !== undefined && tag.rankChange !== 0) || 
                       (tag.tagChange !== undefined && tag.tagChange !== 0) || 
                       (tag.keywordCountChange !== undefined && tag.keywordCountChange !== 0) ? (
                        <Badge className={`ml-1 px-1 py-0 text-xs ${
                        tag.rankChange > 0 
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                        : 'bg-amber-100 text-amber-800 border-amber-300'
                      } border`}>
                          {Math.abs(tag.rankChange)}위 {tag.rankChange > 0 ? `상승(${tag.previousRank}위→${tag.currentRank}위)` : `하락(${tag.previousRank}위→${tag.currentRank}위)`}
                        </Badge>
                      ) : null}
                    </div>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="text-center">
                        {tag.key} <span className="text-sm text-gray-500">변화</span>
                      </DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex justify-between mb-4">
                          <div>
                            <h5 className="text-sm font-medium text-gray-600 mb-1">이전 값</h5>
                            {tag.status === 'added' ? (
                              <span className="text-2xl font-bold text-gray-400">-</span>
                            ) : (
                              <div className="flex items-center">
                                <span className="text-2xl font-bold">
                                  {tag.status === 'increased' && tag.change ? tag.value - tag.change : 
                                   tag.status === 'decreased' && tag.change ? tag.value + tag.change : 
                                   tag.value}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="text-center mt-2">
                            <span className="text-4xl">
                              {tag.status === 'added' ? (
                                <span className="text-emerald-500">→</span>
                              ) : tag.status === 'removed' ? (
                                <span className="text-red-500">→</span>
                              ) : tag.status === 'increased' ? (
                                <span className="text-blue-500">↑</span>
                              ) : (
                                <span className="text-amber-500">↓</span>
                              )}
                            </span>
                          </div>
                          <div className="text-right">
                            <h5 className="text-sm font-medium text-gray-600 mb-1">현재 값</h5>
                            {tag.status === 'removed' ? (
                              <span className="text-2xl font-bold text-gray-400">-</span>
                            ) : (
                              <div className="flex items-center justify-end">
                                <span className="text-2xl font-bold">{tag.value}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="text-center my-4">
                          <span className="text-sm font-medium">
                            {tag.status === 'added' ? (
                              `"${tag.key}"이(가) 새로 추가되어 ${tag.currentRank}위에 올랐습니다.`
                            ) : tag.status === 'removed' ? (
                              `"${tag.key}"이(가) 순위에서 제외되었습니다.`
                            ) : (tag.rankChange !== undefined && tag.rankChange !== 0) || 
                             (tag.tagChange !== undefined && tag.tagChange !== 0) || 
                             (tag.keywordCountChange !== undefined && tag.keywordCountChange !== 0) ? (
                              <div className="space-y-1">
                                {tag.rankChange !== undefined && tag.rankChange !== 0 && (
                                  `"${tag.key}"의 순위가 ${Math.abs(tag.rankChange)}단계 ${tag.rankChange > 0 ? '상승' : '하락'}했습니다. (${tag.previousRank}위 → ${tag.currentRank}위)`
                                )}
                                {tag.tagChange !== undefined && tag.tagChange !== 0 && (
                                  `"${tag.key}"의 태그 개수가 ${Math.abs(tag.tagChange)}개 ${tag.tagChange > 0 ? '증가' : '감소'}했습니다.`
                                )}
                                {tag.keywordCountChange !== undefined && tag.keywordCountChange !== 0 && (
                                  `"${tag.key}"의 키워드 개수가 ${Math.abs(tag.keywordCountChange)}개 ${tag.keywordCountChange > 0 ? '증가' : '감소'}했습니다.`
                                )}
                              </div>
                            ) : (
                              `"${tag.key}"의 순위가 변경되지 않았습니다.`
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
              ))}
            </div>
          </>
        )}

        {/* Keyword Counts Tab Panel - Ranking by frequency */}
        {activeTab === 'keywordCounts' && (
          <>
            <h4 className="text-sm font-medium text-gray-500 mb-2">키워드 개수</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(comparedData ? 
                  (Array.isArray(comparedData.keywordCounts) ? [...comparedData.keywordCounts] : []) : 
                  (Array.isArray(query.keywordCounts) ? [...query.keywordCounts] : [])
              ).sort((a, b) => b.value - a.value).map((count, index) => (
                <Dialog key={index}>
                  <DialogTrigger asChild>
                    <div 
                      className={`flex items-center p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                        count.status === 'removed' ? 'text-gray-400 bg-gray-100' :
                        count.status === 'added' ? 'bg-blue-50 border border-blue-200' :
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
                        {count.status === 'added' ? (
                          <Badge className="ml-2 bg-blue-500 text-white">NEW</Badge>
                        ) : count.status === 'removed' ? (
                          <Badge className="ml-2 bg-red-500 text-white">OUT</Badge>
                        ) : (count.rankChange !== undefined && count.rankChange !== 0) || 
                         (count.tagChange !== undefined && count.tagChange !== 0) || 
                         (count.keywordCountChange !== undefined && count.keywordCountChange !== 0) ? (
                          <Badge className={`ml-2 ${
                            count.rankChange > 0 
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                            : 'bg-amber-100 text-amber-800 border-amber-300'
                          } hover:bg-blue-200 border`}>
                            {Math.abs(count.rankChange)}위 {count.rankChange > 0 ? `상승(${count.previousRank}위→${count.currentRank}위)` : `하락(${count.previousRank}위→${count.currentRank}위)`}
                          </Badge>
                        ) : null}
                      </div>
                      <div className="ml-auto flex items-center">
                        <div className="w-20 bg-gray-200 rounded-full h-2.5">
                          <div 
                            className={`${count.status === 'removed' ? 'bg-gray-400' : 'bg-primary'} h-2.5 rounded-full`} 
                            style={{ width: `${Math.min(100, count.value * 2)}%` }}
                          ></div>
                        </div>
                        <span className={`ml-2 font-semibold ${
                          count.status === 'removed' ? 'text-gray-400' : 'text-primary'
                        }`}>
                          {count.value}
                          {count.status === 'increased' && count.change ? (
                            <span className="ml-1 text-sm font-bold text-emerald-500">+{count.change}</span>
                          ) : count.status === 'decreased' && count.change ? (
                            <span className="ml-1 text-sm font-bold text-red-500">-{count.change}</span>
                          ) : (
                            <span>&nbsp;&nbsp;&nbsp;&nbsp;</span>
                          )}
                        </span>
                      </div>
                    </div>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="text-center">
                        {count.key} <span className="text-sm text-gray-500">변화</span>
                      </DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex justify-between mb-4">
                          <div>
                            <h5 className="text-sm font-medium text-gray-600 mb-1">이전 값</h5>
                            {count.status === 'added' ? (
                              <span className="text-2xl font-bold text-gray-400">-</span>
                            ) : (
                              <div className="flex items-center">
                                <span className="text-2xl font-bold">
                                  {count.status === 'increased' && count.change ? count.value - count.change : 
                                   count.status === 'decreased' && count.change ? count.value + count.change : 
                                   count.value}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="text-center mt-2">
                            <span className="text-4xl">
                              {count.status === 'added' ? (
                                <span className="text-emerald-500">→</span>
                              ) : count.status === 'removed' ? (
                                <span className="text-red-500">→</span>
                              ) : count.status === 'increased' ? (
                                <span className="text-blue-500">↑</span>
                              ) : (
                                <span className="text-amber-500">↓</span>
                              )}
                            </span>
                          </div>
                          <div className="text-right">
                            <h5 className="text-sm font-medium text-gray-600 mb-1">현재 값</h5>
                            {count.status === 'removed' ? (
                              <span className="text-2xl font-bold text-gray-400">-</span>
                            ) : (
                              <div className="flex items-center justify-end">
                                <span className="text-2xl font-bold">{count.value}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="text-center my-4">
                          <span className="text-sm font-medium">
                            {count.status === 'added' ? (
                              `"${count.key}"이(가) 새로 추가되어 ${count.currentRank}위에 올랐습니다.`
                            ) : count.status === 'removed' ? (
                              `"${count.key}"이(가) 순위에서 제외되었습니다.`
                            ) : (count.rankChange !== undefined && count.rankChange !== 0) || 
                             (count.tagChange !== undefined && count.tagChange !== 0) || 
                             (count.keywordCountChange !== undefined && count.keywordCountChange !== 0) ? (
                              <div className="space-y-1">
                                {count.rankChange !== undefined && count.rankChange !== 0 && (
                                  `"${count.key}"의 순위가 ${Math.abs(count.rankChange)}단계 ${count.rankChange > 0 ? '상승' : '하락'}했습니다. (${count.previousRank}위 → ${count.currentRank}위)`
                                )}
                                {count.tagChange !== undefined && count.tagChange !== 0 && (
                                  `"${count.key}"의 태그 개수가 ${Math.abs(count.tagChange)}개 ${count.tagChange > 0 ? '증가' : '감소'}했습니다.`
                                )}
                                {count.keywordCountChange !== undefined && count.keywordCountChange !== 0 && (
                                  `"${count.key}"의 키워드 개수가 ${Math.abs(count.keywordCountChange)}개 ${count.keywordCountChange > 0 ? '증가' : '감소'}했습니다.`
                                )}
                              </div>
                            ) : (
                              `"${count.key}"의 순위가 변경되지 않았습니다.`
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
              ))}
            </div>
          </>
        )}
  <TrackingNotificationModal
    isOpen={isTrackingModalOpen}
    onClose={() => setIsTrackingModalOpen(false)}
  />
      </CardContent>
    </Card>
  );
}