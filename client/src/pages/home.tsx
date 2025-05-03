import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowRight, BarChart, Search, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const { currentUser, loading } = useAuth();
  const [, navigate] = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-50 to-indigo-50 pt-16 pb-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center lg:text-left"
            >
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-6">
                스마트스토어 SEO<br />상품 분석 대시보드
              </h1>
              <p className="text-lg text-slate-700 mb-8 max-w-lg mx-auto lg:mx-0">
                크롬 확장프로그램과 연동하여 스마트스토어 검색 결과의 상품 순위와 트렌드를 한눈에 파악하세요.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button 
                  onClick={() => navigate(currentUser ? "/dashboard" : "/login")}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-lg py-6"
                  size="lg"
                >
                  {currentUser ? "대시보드로 이동" : "시작하기"}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => window.open('https://chrome.google.com/webstore', '_blank')}
                  className="border-blue-200 text-blue-700 hover:bg-blue-50 text-lg py-6"
                  size="lg"
                >
                  크롬 확장프로그램 설치
                </Button>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="hidden lg:block relative"
            >
              <div className="relative rounded-lg overflow-hidden shadow-2xl border border-slate-200 bg-white">
                <div className="h-8 bg-slate-100 border-b border-slate-200 flex items-center px-4">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-blue-700">상품 분석 결과</h3>
                      <p className="text-sm text-slate-500">최근 업데이트: 2025년 5월 3일</p>
                    </div>
                    <Button size="sm" className="bg-blue-600">새로고침</Button>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="p-4 border border-slate-200 rounded-md bg-slate-50 flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mr-3">
                          <Search className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium">무선 이어폰</p>
                          <p className="text-xs text-slate-500">저장된 검색어</p>
                        </div>
                      </div>
                      <div className="text-green-600 text-sm font-medium flex items-center">
                        <span className="mr-1">+3</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
                        </svg>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-slate-700">인기 상품 순위</h4>
                      <div className="space-y-2">
                        {[1, 2, 3, 4, 5].map(i => (
                          <div key={i} className="flex items-center p-2 rounded-md hover:bg-slate-100">
                            <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs mr-3">
                              {i}
                            </div>
                            <div className="flex-1 text-sm">
                              <div className="font-medium">샘플 상품 {i}</div>
                              <div className="text-xs text-slate-500 flex items-center">
                                <span className={i % 2 === 0 ? "text-green-600" : (i % 3 === 0 ? "text-red-600" : "text-slate-600")}>
                                  {i % 2 === 0 ? "↑" : (i % 3 === 0 ? "↓" : "=")}
                                </span>
                                <span className="ml-1">변동 감지됨</span>
                              </div>
                            </div>
                            <div className="text-sm font-medium">
                              {Math.floor(100 - i * 8)}%
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Features */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">주요 기능</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              스마트스토어 SEO 대시보드는 상품 검색 결과를 분석하여 다양한 인사이트를 제공합니다.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Search className="h-8 w-8" />} 
              title="상품 검색 분석" 
              description="스마트스토어에서 검색된 상품의 순위와 노출 빈도를 분석합니다."
              color="blue"
            />
            <FeatureCard 
              icon={<BarChart className="h-8 w-8" />} 
              title="순위 변동 추적" 
              description="시간에 따른 상품의 순위 변화를 추적하고 시각화합니다."
              color="green"
            />
            <FeatureCard 
              icon={<ShoppingBag className="h-8 w-8" />} 
              title="상품 트렌드 확인" 
              description="실시간으로 인기 있는 상품과 키워드 트렌드를 확인할 수 있습니다."
              color="indigo"
            />
          </div>
        </div>
      </section>
      
      {/* CTA */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 py-16 px-4 mt-auto">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">
            지금 바로 스마트스토어 SEO 대시보드를 시작하세요
          </h2>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            크롬 확장프로그램과 연동하여 스마트스토어 상품의 검색 성과를 분석하고 개선하세요.
          </p>
          <Button 
            onClick={() => navigate(currentUser ? "/dashboard" : "/login")}
            className="bg-white text-blue-600 hover:bg-blue-50 text-lg"
            size="lg"
          >
            {currentUser ? "대시보드로 이동" : "무료로 시작하기"}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: 'blue' | 'green' | 'indigo';
}

function FeatureCard({ icon, title, description, color }: FeatureCardProps) {
  const colorMap = {
    blue: 'bg-blue-50 border-blue-100 text-blue-600',
    green: 'bg-green-50 border-green-100 text-green-600',
    indigo: 'bg-indigo-50 border-indigo-100 text-indigo-600'
  };
  
  return (
    <div className="border border-slate-200 rounded-lg p-6 bg-white hover:shadow-md transition-shadow">
      <div className={`w-14 h-14 rounded-lg ${colorMap[color]} flex items-center justify-center mb-4`}>
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-slate-600">{description}</p>
    </div>
  );
}
