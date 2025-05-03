import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Query, KeywordItem } from "@/types";
import { RefreshCcw, Trash2 } from "lucide-react";

interface QueryCardProps {
  query: Query;
  onDelete: (queryId: string, queryText: string) => void;
  onRefresh: (queryId: string) => void;
}

export default function QueryCard({ query, onDelete, onRefresh }: QueryCardProps) {
  const [activeTab, setActiveTab] = useState<'keywords' | 'keywordCounts' | 'tags'>('keywords');

  // Helper function to render change indicator
  const renderChangeIndicator = (item: KeywordItem) => {
    if (item.status === 'added') {
      return <span className="change-indicator text-success">+</span>;
    } else if (item.status === 'removed') {
      return <span className="change-indicator text-danger">-</span>;
    } else if (item.status === 'increased') {
      return <span className="change-indicator text-warning">↑</span>;
    } else if (item.status === 'decreased') {
      return <span className="change-indicator text-warning">↓</span>;
    }
    return <span className="change-indicator"></span>;
  };

  // Helper function to render change amount
  const renderChangeAmount = (item: KeywordItem) => {
    if (item.status === 'increased' && item.change) {
      return <span className="ml-1 text-xs text-success">+{item.change}</span>;
    } else if (item.status === 'decreased' && item.change) {
      return <span className="ml-1 text-xs text-danger">-{item.change}</span>;
    }
    return null;
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-medium text-text-primary">{query.text}</h3>
            <p className="text-sm text-text-secondary">마지막 업데이트: {query.lastUpdated}</p>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => onRefresh(query.id)}
              title="쿼리 새로고침"
            >
              <RefreshCcw className="h-5 w-5" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => onDelete(query.id, query.text)}
              className="text-destructive hover:text-destructive"
              title="쿼리 삭제"
            >
              <Trash2 className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        {/* Query Analysis Tabs */}
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
              키워드 빈도
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
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {query.keywords.map((keyword, index) => (
              <div 
                key={index} 
                className={`flex items-center p-3 bg-gray-50 rounded-lg ${
                  keyword.status === 'removed' ? 'text-gray-400' : ''
                }`}
              >
                {renderChangeIndicator(keyword)}
                <span className="text-sm font-medium">{keyword.key}</span>
                <span className={`ml-auto font-semibold ${
                  keyword.status === 'removed' ? 'text-gray-400' : 'text-primary'
                }`}>
                  {keyword.value}
                </span>
                {renderChangeAmount(keyword)}
              </div>
            ))}
          </div>
        )}
        
        {/* Keyword Counts Tab Panel */}
        {activeTab === 'keywordCounts' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {query.keywordCounts.map((count, index) => (
              <div 
                key={index} 
                className={`flex items-center p-3 bg-gray-50 rounded-lg ${
                  count.status === 'removed' ? 'text-gray-400' : ''
                }`}
              >
                {renderChangeIndicator(count)}
                <span className="text-sm font-medium">{count.key}</span>
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
        )}
        
        {/* Tags Tab Panel */}
        {activeTab === 'tags' && (
          <div className="flex flex-wrap gap-2">
            {query.tags.map((tag, index) => (
              <div 
                key={index} 
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  tag.status === 'removed' 
                    ? 'bg-gray-100 text-gray-600' 
                    : 'bg-blue-100 text-blue-800'
                }`}
              >
                {renderChangeIndicator(tag)}
                {tag.key}
                <span className={`ml-1 text-xs ${
                  tag.status === 'removed' ? 'text-gray-500' : 'text-primary'
                }`}>
                  {tag.value}
                </span>
                {renderChangeAmount(tag)}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
