import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation } from "wouter";
import { Checkbox } from "@/components/ui/checkbox";

interface LoginPageProps {
  isModal?: boolean;
  onLoginSuccess?: () => void;
}

export default function LoginPage({
  isModal = false,
  onLoginSuccess,
}: LoginPageProps) {
  const { signIn, signUp, loading, error, currentUser, sendPasswordReset } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState(""); // 비밀번호 확인 추가
  const [businessName, setStoreName] = useState("");
  const [businessLink, setStoreUrl] = useState("");
  const [number, setPhoneNumber] = useState("");
  const [tab, setTab] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("tab") || "login";
  });
  const [terms, setTerms] = useState(false);
  const [alertMessage, setAlertMessage] = useState({ message: "", type: "" }); // Alert message state
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

  const isValidURL = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSignUp = async () => {
    if (!email || !password || !businessName || !businessLink || !number)
      return;

    if (!isValidURL(businessLink)) {
      setAlertMessage({
        message:
          "올바른 스마트스토어 URL을 입력해주세요. (예: https://smartstore.naver.com/yourstore)",
        type: "error",
      });
      return;
    }

    if (password !== passwordConfirm) {
      setAlertMessage({
        message: "비밀번호가 일치하지 않습니다. 다시 확인해주세요.",
        type: "error",
      });
      return;
    }

    try {
      await signUp(email, password, businessName, businessLink, number);
      setAlertMessage({
        message:
          "회원가입 성공! 이메일함을 확인하여 이메일 인증을 완료해주세요.",
        type: "success",
      });
      setEmail("");
      setPassword("");
      setStoreName("");
      setStoreUrl("");
      setPhoneNumber("");
      setPasswordConfirm(""); //비밀번호 확인 초기화
      setTerms(false); //동의 초기화
    } catch (error: any) {
      console.error("Signup error:", error);
      if (error.code === "auth/email-already-in-use") {
        setAlertMessage({
          message:
            "이미 가입된 이메일입니다. 로그인 페이지에서 로그인을 진행하시거나 비밀번호 찾기를 이용해주세요.",
          type: "error",
        });
      } else if (error.code === "auth/invalid-email") {
        setAlertMessage({
          message: "올바른 이메일 형식이 아닙니다. 예시: your.name@example.com",
          type: "error",
        });
      } else if (
        error.code === "auth/weak-password" ||
        error.code === "auth/password-does-not-meet-requirements"
      ) {
        setAlertMessage({
          message:
            "비밀번호는 소문자, 특수문자, 숫자 포함 6자 이상이여야 합니다",
          type: "error",
        });
      } else if (error.code === "auth/network-request-failed") {
        setAlertMessage({
          message: "네트워크 연결을 확인해주세요.",
          type: "error",
        });
      } else if (error.code === "auth/too-many-requests") {
        setAlertMessage({
          message: "너무 많은 시도가 있었습니다. 잠시 후 다시 시도해주세요.",
          type: "error",
        });
      } else {
        setAlertMessage({
          message:
            "회원가입 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.",
          type: "error",
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
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
          스마트스토어 SEO 대시보드
        </CardTitle>
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
                  className="transition-all duration-300 focus:ring-2 focus:ring-blue-500 data-[highlight=true]:ring-4 data-[highlight=true]:ring-blue-500 data-[highlight=true]:shadow-lg data-[highlight=true]:shadow-blue-200 data-[highlight=true]:scale-105 data-[highlight=true]:animate-[pulse_1s_ease-in-out_infinite]"
                  data-highlight="false"
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
              <div className="text-center mt-4">
                <button 
                  onClick={async () => {
                    const emailInput = document.getElementById('email');
                    if (!email) {
                      emailInput?.setAttribute('data-highlight', 'true');
                      setTimeout(() => {
                        emailInput?.setAttribute('data-highlight', 'false');
                      }, 2000);
                      toast({
                        title: "이메일 필요",
                        description: "비밀번호를 재설정할 이메일을 입력해주세요.",
                        variant: "destructive"
                      });
                      return;
                    }
                    try {
                      const success = await sendPasswordReset(email);
                      if (success) {
                        toast({
                          title: "이메일 발송 완료",
                          description: "비밀번호 재설정 링크가 이메일로 발송되었습니다."
                        });
                      }
                    } catch (error: any) {
                      toast({
                        title: "발송 실패",
                        description: error.message || "비밀번호 재설정 이메일 발송에 실패했습니다.",
                        variant: "destructive"
                      });
                    }
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                >
                  비밀번호를 잊으셨나요?
                </button>
              </div>
            </div>
          </TabsContent>

          {/* 회원가입 탭 */}
          <TabsContent value="register">
            <div className="space-y-2">
              <p className="text-sm text-center text-gray-600 mb-4">
                회원가입 후 스마트스토어 상품 분석 기능을 이용하세요.
              </p>

              {alertMessage.message && (
                <Alert
                  variant={
                    alertMessage.type === "success" ? "success" : "destructive"
                  }
                >
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

              <div className="flex items-center space-x-2 mt-4">
                <Checkbox
                  id="terms"
                  checked={terms}
                  onCheckedChange={(checked) => setTerms(checked as boolean)}
                />
                <label
                  htmlFor="terms"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  <a
                    href="https://chambray-midnight-e7f.notion.site/SEO-18678708053f806a9955f0f5375cdbdd"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-blue-600 hover:text-blue-800"
                  >
                    이용약관 및 개인정보처리방침
                  </a>
                  에 동의합니다
                </label>
              </div>

              <Button
                onClick={handleSignUp}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 mt-4"
                disabled={
                  loading ||
                  !email ||
                  !password ||
                  !businessName ||
                  !businessLink ||
                  !number ||
                  !terms
                }
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
          로그인하면 크롬 확장프로그램과 연동되어 상품 분석 데이터를 확인할 수
          있습니다.
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
