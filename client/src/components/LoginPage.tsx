import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { FaGoogle } from "react-icons/fa";

export default function LoginPage() {
  const { signInWithGoogle, loading } = useAuth();

  const handleLogin = async () => {
    await signInWithGoogle();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">스마트스토어 SEO 대시보드</CardTitle>
          <CardDescription>
            크롬 확장프로그램 데이터를 분석하고 관리하는 대시보드에 로그인하세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            <p className="text-sm text-center text-gray-600 mb-4">
              로그인하여 스마트스토어 쿼리 분석 결과를 확인하고 관리하세요.
            </p>
            <Button 
              onClick={handleLogin} 
              className="w-full flex items-center justify-center"
              disabled={loading}
            >
              <FaGoogle className="mr-2" />
              Google로 로그인
            </Button>
            <p className="text-xs text-center text-gray-500 mt-4">
              로그인하면 크롬 확장프로그램과 연동되어 쿼리 분석 데이터를 확인할 수 있습니다.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
