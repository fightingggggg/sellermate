import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation } from "wouter";

interface LoginPageProps {
  isModal?: boolean;
  onLoginSuccess?: () => void;
}

export default function LoginPage({ isModal = false, onLoginSuccess }: LoginPageProps) {
  const { signIn, signUp, loading, error, currentUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");  // 비밀번호 확인 추가
  const [businessName, setStoreName] = useState("");
  const [businessLink, setStoreUrl] = useState("");
  const [number, setPhoneNumber] = useState("");
  const [tab, setTab] = useState("login");
  const [, navigate] = useLocation();
  const [signupStatus, setSignupStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null); // 회원가입 상태 추가

  useEffect(() => {
    if (currentUser && !isModal) {
      navigate("/dashboard");
    }
    if (currentUser && isModal && onLoginSuccess) {
      onLoginSuccess();
    }
  }, [currentUser, isModal, navigate, onLoginSuccess]);

  const handleLogin = async () => {
    if (!email || !password) return;
    const success = await signIn(email, password);
    if (success && onLoginSuccess) {
      onLoginSuccess();
    }
  };

  const handleSignUp = async () => {
    if (!email || !password || password !== passwordConfirm || !businessName || !businessLink || !number) return;
    try {
      await signUp(email, password, businessName, businessLink, number);
      setSignupStatus({ type: 'success', message: '회원가입이 완료되었습니다. 인증 메일을 확인해주세요.' });
      setTab("login");
    } catch (err: any) {
      setSignupStatus({ type: 'error', message: err.message });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (tab === "login") {
        handleLogin();
      } else {
        handleSignUp();
      }
    }
  };

  const content = (
    <Card className={`w-full max-w-md ${isModal ? "shadow-xl" : ""}`}>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">스마트스토어 SEO 대시보드</CardTitle>
        <CardDescription>
          상품 데이터를 분석하고 관리하는 대시보드에 로그인하세요
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="login" value={tab} onValueChange={setTab}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="login">로그인</TabsTrigger>
            <TabsTrigger value="register">회원가입</TabsTrigger>
          </TabsList>

          {/* 로그인 탭 */}
          <TabsContent value="login">
            <div className="space-y-4">
              <p className="text-sm text-center text-gray-600 mb-4">
                로그인하여 스마트스토어 상품 분석 결과를 확인하고 관리하세요.
              </p>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {error.includes('auth/invalid-email') && '올바른 이메일 형식을 입력해주세요.'}
                    {error.includes('auth/invalid-login-credentials') && '이메일 또는 비밀번호가 올바르지 않습니다.'}
                    {error.includes('auth/user-not-found') && '등록되지 않은 이메일입니다.'}
                    {error.includes('auth/wrong-password') && '비밀번호가 올바르지 않습니다.'}
                    {error.includes('auth/too-many-requests') && '로그인 시도가 너무 많습니다. 잠시 후 다시 시도해주세요.'}
                    {!error.includes('auth/') && error}
                  </AlertDescription>
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
                  onKeyPress={handleKeyPress}
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
                  onKeyPress={handleKeyPress}
                />
              </div>

              <Button 
                onClick={handleLogin} 
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                disabled={loading || !email || !password}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    로그인 중...
                  </>
                ) : (
                  "로그인"
                )}
              </Button>
            </div>
          </TabsContent>

          {/* 회원가입 탭 */}
          <TabsContent value="register">
            <div className="space-y-4">
              <p className="text-sm text-center text-gray-600 mb-4">
                회원가입 후 스마트스토어 상품 분석 기능을 이용하세요.
              </p>

              {(error || signupStatus) && (
                <Alert 
                  variant={signupStatus?.type === "success" ? "default" : "destructive"}
                  className={signupStatus?.type === "success" ? "bg-green-50 text-green-800 border-green-200" : ""}
                >
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{signupStatus?.message || error}</AlertDescription>
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
                  onKeyPress={handleKeyPress}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-password">비밀번호</Label>
                <Input 
                  id="register-password" 
                  type="password" 
                  placeholder="비밀번호를 입력하세요 (6자 이상)" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-password-confirm">비밀번호 확인</Label>
                <Input
                  id="register-password-confirm"
                  type="password"
                  placeholder="비밀번호를 한 번 더 입력하세요"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessName">스마트스토어 상호</Label>
                <Input
                  id="businessName"
                  placeholder="스마트스토어 상호를 입력하세요"
                  value={businessName}
                  onChange={(e) => setStoreName(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessLink">스마트스토어 링크</Label>
                <Input
                  id="businessLink"
                  placeholder="https://smartstore.naver.com/..."
                  value={businessLink}
                  onChange={(e) => setStoreUrl(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="number">핸드폰 번호</Label>
                <Input
                  id="number"
                  placeholder=""
                  value={number}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
              </div>

              <Button 
                onClick={handleSignUp} 
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                disabled={loading || !email || !password || password !== passwordConfirm || !businessName || !businessLink || !number}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    회원가입 중...
                  </>
                ) : (
                  "회원가입"
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <p className="text-xs text-center text-gray-500 mt-4">
          로그인하면 크롬 확장프로그램과 연동되어 상품 분석 데이터를 확인할 수 있습니다.
        </p>
      </CardContent>
    </Card>
  );

  if (isModal) {
    return content;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-indigo-50 p-4">
      {content}
    </div>
  );
}