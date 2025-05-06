import { Button } from "@/components/ui/button";
import { Search, ShoppingBag, TrendingUp } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";

export default function EmptyState() {
  const { currentUser } = useAuth();

  return (
    <Card className="border border-muted bg-gradient-to-b from-white to-blue-50">
      <CardContent className="p-8 text-center">
        {currentUser ? (
          <>
            <div className="w-16 h-16 mx-auto mb-5 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-indigo-100">
              <Search className="h-8 w-8 text-blue-600" />
            </div>
            
            <h3 className="text-xl font-semibold mb-2">저장된 상품이 없습니다</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              크롬 확장프로그램을 사용하여 새로운 상품을 분석하고 저장해보세요.
              상위 노출된 상품 정보와 순위 변화를 추적할 수 있습니다.
            </p>
            
            <div className="inline-block py-2 px-4 text-blue-600 font-medium text-sm bg-blue-50 rounded-md border border-blue-100">
              <ShoppingBag className="inline-block mr-2 h-4 w-4" />
              크롬 확장프로그램을 이용해 상품을 분석하세요
            </div>
            
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
              <div className="p-4 rounded-lg bg-white border border-blue-100">
                <div className="flex items-center text-blue-600 mb-2">
                  <Search className="h-4 w-4 mr-1" />
                  <h4 className="font-medium">상품 검색 분석</h4>
                </div>
                <p className="text-sm text-muted-foreground">상품의 키워드 순위와 검색 결과 추이를 확인하세요</p>
              </div>
              
              <div className="p-4 rounded-lg bg-white border border-blue-100">
                <div className="flex items-center text-blue-600 mb-2">
                  <ShoppingBag className="h-4 w-4 mr-1" />
                  <h4 className="font-medium">상위 노출 상품</h4>
                </div>
                <p className="text-sm text-muted-foreground">어떤 상품이 검색 결과 상위에 노출되고 있는지 분석합니다</p>
              </div>
              
              <div className="p-4 rounded-lg bg-white border border-blue-100">
                <div className="flex items-center text-blue-600 mb-2">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  <h4 className="font-medium">순위 변동 추적</h4>
                </div>
                <p className="text-sm text-muted-foreground">상품의 순위 변화를 시각적으로 추적하고 보고서를 확인하세요</p>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="w-16 h-16 mx-auto mb-5 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-indigo-100">
              <Search className="h-8 w-8 text-blue-600" />
            </div>
            
            <h3 className="text-xl font-semibold mb-2">스마트스토어 SEO 대시보드</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              로그인하여 상품의 검색 순위 및 노출 현황을 분석하세요.
              쉽고 빠르게 상품의 SEO 성과를 확인할 수 있습니다.
            </p>
            
            <a href="/login?tab=register">
              <Button 
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                로그인하고 시작하기
              </Button>
            </a>
            
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
              <div className="p-4 rounded-lg bg-white/80 border border-blue-100">
                <div className="flex items-center text-blue-600 mb-2">
                  <Search className="h-4 w-4 mr-1" />
                  <h4 className="font-medium">상품 검색 분석</h4>
                </div>
                <p className="text-sm text-muted-foreground">상품의 키워드 순위와 검색 결과 추이를 확인하세요</p>
              </div>
              
              <div className="p-4 rounded-lg bg-white/80 border border-blue-100">
                <div className="flex items-center text-blue-600 mb-2">
                  <ShoppingBag className="h-4 w-4 mr-1" />
                  <h4 className="font-medium">상위 노출 상품</h4>
                </div>
                <p className="text-sm text-muted-foreground">어떤 상품이 검색 결과 상위에 노출되고 있는지 분석합니다</p>
              </div>
              
              <div className="p-4 rounded-lg bg-white/80 border border-blue-100">
                <div className="flex items-center text-blue-600 mb-2">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  <h4 className="font-medium">순위 변동 추적</h4>
                </div>
                <p className="text-sm text-muted-foreground">상품의 순위 변화를 시각적으로 추적하고 보고서를 확인하세요</p>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
