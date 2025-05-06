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
  const [alertMessage, setAlertMessage] = useState({ message: '', type: '' }); // Alert message state
  const [, navigate] = useLocation();

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
    if (!email || !password || !businessName || !businessLink || !number) return;
    
    if (password !== passwordConfirm) {
      setAlertMessage({
        message: "비밀번호가 일치하지 않습니다. 다시 확인해주세요.",
        type: "error"
      });
      return;
    }
    
    try {
      await signUp(email, password, businessName, businessLink, number);
      setAlertMessage({
        message: "회원가입이 완료되었습니다! 이메일로 발송된 인증 링크를 확인해주세요. 인증 완료 후 로그인이 가능합니다.",
        type: "success"
      });
      setTimeout(() => {
        setTab("login");
      }, 3000);
    } catch (error: any) {
      console.error("Signup error:", error);
      if (error.code === "auth/email-already-in-use") {
        setAlertMessage({
          message: "이미 가입된 이메일입니다. 로그인 페이지에서 로그인을 진행하시거나 비밀번호 찾기를 이용해주세요.",
          type: "error"
        });
      } else if (error.code === "auth/invalid-email") {
        setAlertMessage({
          message: "올바른 이메일 형식이 아닙니다. 예시: your.name@example.com",
          type: "error"
        });
      } else if (error.code === "auth/weak-password") {
        setAlertMessage({
          message: "보안을 위해 다음 조건을 만족하는 비밀번호를 설정해주세요:\n- 최소 6자 이상\n- 영문 대/소문자\n- 숫자\n- 특수문자(!@#$%^&* 등)",
          type: "error"
        });
      } else if (error.code === "auth/network-request-failed") {
        setAlertMessage({
          message: "네트워크 연결을 확인해주세요.",
          type: "error"
        });
      } else if (error.code === "auth/too-many-requests") {
        setAlertMessage({
          message: "너무 많은 시도가 있었습니다. 잠시 후 다시 시도해주세요.",
          type: "error"
        });
      } else {
        setAlertMessage({
          message: "회원가입 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.",
          type: "error"
        });
      }
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

              {alertMessage.message && (
                <Alert variant={alertMessage.type === 'success' ? 'success' : 'destructive'}>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{alertMessage.message}</AlertDescription>
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
                disabled={loading || !email || !password || !businessName || !businessLink || !number}
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