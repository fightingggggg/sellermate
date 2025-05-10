import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { FeedbackDialog } from "./ui/feedback-dialog";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { LogOut, Menu, PlusCircle, ShoppingBag, Home, User, UserPlus, MessageSquare } from "lucide-react";
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

// Google Analytics event tracking function
const trackEvent = (category: string, action: string, label: string) => {
  if (typeof window !== 'undefined' && 'gtag' in window) {
    window.gtag('event', action, {
      'event_category': category,
      'event_label': label
    });
  } else {
    console.warn('Google Analytics is not properly initialized. Gtag function is missing.');
  }
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { currentUser, logout } = useAuth();
  const [, navigate] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  // Track dashboard page view
  useEffect(() => {
    trackEvent('PageView', 'view', 'Dashboard');

    let startTime = new Date().getTime();

    const handleBeforeUnload = () => {
      let endTime = new Date().getTime();
      let timeSpent = (endTime - startTime) / 1000;  // seconds
      trackEvent('TimeSpent', 'Dashboard', `Time spent on dashboard: ${timeSpent} seconds`);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      handleBeforeUnload(); // Ensure time spent is tracked even on component unmount
    };

  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/" className="flex items-center" onClick={() => trackEvent('Navigation', 'click', 'Home Logo')}>
                <img
    src="/icon.png" // public 디렉토리에 이미지 파일이 있어야 함
    alt="로고"
    className="h-6 w-6 mr-2"
  />
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent hidden md:block">
                    스마트스토어 상위노출 최적화 도구
                  </h1>
                </Link>
              </div>

              <div className="hidden sm:ml-6 sm:flex sm:items-center">
                <Link href="/" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-700 flex items-center"
                 onClick={() => trackEvent('Navigation', 'click', 'Home')}>
                  <Home className="h-4 w-4 mr-1" />
                  홈
                </Link>
                <button
                  onClick={() => {
                    trackEvent('ExternalLink', 'click', 'ExtensionInstall');
                    window.open("https://chromewebstore.google.com/detail/%EC%8A%A4%EB%A7%88%ED%8A%B8%EC%8A%A4%ED%86%A0%EC%96%B4-%EC%83%81%EC%9C%84%EB%85%B8%EC%B6%9C-%EC%B5%9C%EC%A0%81%ED%99%94-%EB%8F%84%EA%B5%AC/plgdaggkagiakemkoclkpkbdiocllbbi?hl=ko", "_blank")
                  }}
                  className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-700 flex items-center"
                >
                  <PlusCircle className="h-4 w-4 mr-1" />
                  확장프로그램 설치
                </button>
                <Link href="/dashboard" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-700 flex items-center"
                  onClick={() => trackEvent('Navigation', 'click', 'Dashboard')}>
                  <ShoppingBag className="h-4 w-4 mr-1" />
                  대시보드
                </Link>
                <button 
                  onClick={() => {
                    trackEvent('Interaction', 'click', 'Feedback');
                    setIsFeedbackOpen(true);
                  }}
                  className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-700 flex items-center"
                >
                  <MessageSquare className="h-4 w-4 mr-1" />
                  문의 및 피드백
                </button>
              </div>
            </div>

            <div className="flex items-center">
              {currentUser ? (
                <>
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
                      <DropdownMenuItem onClick={() => {
                        trackEvent('Navigation', 'click', 'DashboardDropdown');
                        navigate("/dashboard")
                        }} className="cursor-pointer">
                        <ShoppingBag className="mr-2 h-4 w-4" />
                        <span>대시보드</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {
                        trackEvent('Navigation', 'click', 'ProfileDropdown');
                        navigate("/profile");
                      }} className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        <span>내 프로필</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => {
                         trackEvent('Authentication', 'click', 'LogoutDropdown');
                         handleLogout();
                      }} className="cursor-pointer text-red-600 focus:text-red-600">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>로그아웃</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link href="/login?tab=register">
                    <Button 
                      variant="outline"
                      className="border-blue-500 text-blue-600 hover:bg-blue-50"
                      onClick={() => trackEvent('Authentication', 'click', 'RegisterButton')}
                    >
                      <UserPlus className="mr-2 h-4 w-4" />
                    3초! 회원가입
                    </Button>
                  </Link>
                  <Button 
                    onClick={() => {
                      trackEvent('Authentication', 'click', 'LoginButton');
                      navigate("/login");
                    }}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    로그인
                  </Button>
                </div>
              )}

              <div className="flex items-center sm:hidden ml-4">
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="text-gray-500 hover:text-gray-700 focus:outline-none"
                  aria-label="메뉴 열기"
                >
                  <Menu className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>

          {/* Mobile menu */}
          {isMobileMenuOpen && (
            <div className="sm:hidden py-2 space-y-1 border-t border-gray-200">
              <Link href="/" className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-700"
              onClick={() => trackEvent('Navigation', 'click', 'MobileHome')}>
                홈
              </Link>
              <button
                onClick={() => {
                  trackEvent('ExternalLink', 'click', 'MobileExtensionInstall');
                  window.open("https://chromewebstore.google.com/detail/%EC%8A%A4%EB%A7%88%ED%8A%B8%EC%8A%A4%ED%86%A0%EC%96%B4-%EC%83%81%EC%9C%84%EB%85%B8%EC%B6%9C-%EC%B5%9C%EC%A0%81%ED%99%94-%EB%8F%84%EA%B5%AC/plgdaggkagiakemkoclkpkbdiocllbbi?hl=ko", "_blank")
                }}
                className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-700"
              >
                확장프로그램 설치
              </button>
              <Link href="/dashboard" className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-700"
               onClick={() => trackEvent('Navigation', 'click', 'MobileDashboard')}>
                대시보드
              </Link>
              {currentUser && (
                <>

                  <Link href="/profile" className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-700"
                   onClick={() => trackEvent('Navigation', 'click', 'MobileProfile')}>
                    내 프로필
                  </Link>
                </>
              )}
              <button 
                onClick={() =>  {
                  trackEvent('Interaction', 'click', 'MobileFeedback');
                  setIsFeedbackOpen(true);
                }}
                className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-700"
              >
                피드백 및 문의 보내기
              </button>
              {currentUser && (
                <button 
                  onClick={() => {
                    trackEvent('Authentication', 'click', 'MobileLogout');
                    handleLogout();
                  }}
                  className="block w-full text-left px-3 py-2 text-base font-medium text-red-600 hover:bg-gray-50 hover:text-red-700"
                >
                  로그아웃
                </button>
              )}
            </div>
          )}
        </div>
      </nav>

      <main className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      <FeedbackDialog 
        isOpen={isFeedbackOpen} 
        onClose={() => setIsFeedbackOpen(false)} 
      />
    </div>
  );
}