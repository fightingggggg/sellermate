import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { QueryProvider } from "@/contexts/QueryContext";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { currentUser, logout } = useAuth();
  const [, navigate] = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-surface shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-semibold text-primary">스마트스토어 SEO 대시보드</h1>
              </div>
            </div>
            <div className="flex items-center">
              {currentUser && (
                <>
                  <Button 
                    onClick={() => navigate("/dashboard")}
                    className="ml-3"
                  >
                    새 상품 추가
                  </Button>
                  <div className="ml-4 flex items-center">
                    {currentUser.photoURL ? (
                      <img 
                        className="h-8 w-8 rounded-full" 
                        src={currentUser.photoURL} 
                        alt="프로필 이미지"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center">
                        {currentUser.email?.charAt(0).toUpperCase() || "U"}
                      </div>
                    )}
                    <span className="ml-2 text-sm font-medium text-text-primary">
                      {currentUser.email}
                    </span>
                    <button 
                      onClick={handleLogout}
                      className="ml-4 text-sm font-medium text-secondary hover:text-primary"
                    >
                      로그아웃
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <QueryProvider>
          {children}
        </QueryProvider>
      </main>
    </div>
  );
}
