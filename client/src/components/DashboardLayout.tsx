import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { LogOut, Menu, PlusCircle, ShoppingBag, Home } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Link } from "wouter";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { currentUser, logout } = useAuth();
  const [, navigate] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/" className="flex items-center">
                  <ShoppingBag className="h-6 w-6 text-blue-600 mr-2" />
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent hidden md:block">
                    스마트스토어 SEO 대시보드
                  </h1>
                </Link>
              </div>
              
              <div className="hidden sm:ml-6 sm:flex sm:items-center">
                <Link href="/" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-700 flex items-center">
                  <Home className="h-4 w-4 mr-1" />
                  홈
                </Link>
                <Link href="/dashboard" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-700 flex items-center">
                  <ShoppingBag className="h-4 w-4 mr-1" />
                  대시보드
                </Link>
              </div>
            </div>
            
            <div className="flex items-center">
              {currentUser ? (
                <>
                  <Button 
                    onClick={() => navigate("/dashboard")}
                    className="hidden sm:flex mr-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    <PlusCircle className="h-4 w-4 mr-1" />
                    새 상품 추가
                  </Button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild className="cursor-pointer">
                      <div className="flex items-center">
                        <Avatar className="h-8 w-8 border border-slate-200">
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                            {currentUser.email?.charAt(0).toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="ml-2 text-sm font-medium text-slate-700 hidden md:block">
                          {currentUser.email}
                        </span>
                      </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end">
                      <DropdownMenuLabel>내 계정</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate("/dashboard")} className="cursor-pointer">
                        <ShoppingBag className="mr-2 h-4 w-4" />
                        <span>대시보드</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>로그아웃</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <Button 
                  onClick={() => navigate("/login")}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  로그인
                </Button>
              )}
              
              <div className="flex items-center sm:hidden ml-4">
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  <Menu className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>
          
          {/* Mobile menu */}
          {isMobileMenuOpen && (
            <div className="sm:hidden py-2 space-y-1 border-t border-gray-200">
              <Link href="/" className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-700">
                홈
              </Link>
              <Link href="/dashboard" className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-700">
                대시보드
              </Link>
              {currentUser && (
                <a 
                  onClick={() => navigate("/dashboard")}
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-700 cursor-pointer"
                >
                  새 상품 추가
                </a>
              )}
            </div>
          )}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      
      <footer className="bg-white border-t border-gray-200 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-sm text-gray-500">
            <p>© 2025 스마트스토어 SEO 대시보드. 모든 권리 보유.</p>
            <p className="mt-1">
              크롬 확장프로그램 연동으로 스마트스토어 상품 정보를 쉽게 분석하세요.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
