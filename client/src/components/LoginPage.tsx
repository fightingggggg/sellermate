import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function LoginPage() {
  const { signIn, signUp, loading, error } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tab, setTab] = useState("login");

  const handleLogin = async () => {
    if (!email || !password) return;
    await signIn(email, password);
  };
  
  const handleSignUp = async () => {
    if (!email || !password) return;
    await signUp(email, password);
    setTab("login");
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
          <Tabs defaultValue="login" value={tab} onValueChange={setTab}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">로그인</TabsTrigger>
              <TabsTrigger value="register">회원가입</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <div className="space-y-4">
                <p className="text-sm text-center text-gray-600 mb-4">
                  로그인하여 스마트스토어 상품 분석 결과를 확인하고 관리하세요.
                </p>
                
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">이메일</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="이메일을 입력하세요" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">비밀번호</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="비밀번호를 입력하세요" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <Button 
                  onClick={handleLogin} 
                  className="w-full"
                  disabled={loading || !email || !password}
                >
                  로그인
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="register">
              <div className="space-y-4">
                <p className="text-sm text-center text-gray-600 mb-4">
                  회원가입 후 스마트스토어 상품 분석 기능을 이용하세요.
                </p>
                
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="register-email">이메일</Label>
                  <Input 
                    id="register-email" 
                    type="email" 
                    placeholder="이메일을 입력하세요" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-password">비밀번호</Label>
                  <Input 
                    id="register-password" 
                    type="password" 
                    placeholder="비밀번호를 입력하세요" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <Button 
                  onClick={handleSignUp} 
                  className="w-full"
                  disabled={loading || !email || !password}
                >
                  회원가입
                </Button>
              </div>
            </TabsContent>
          </Tabs>
          
          <p className="text-xs text-center text-gray-500 mt-4">
            로그인하면 크롬 확장프로그램과 연동되어 상품 분석 데이터를 확인할 수 있습니다.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
