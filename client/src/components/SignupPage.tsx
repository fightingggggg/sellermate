import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

// UI 컴포넌트 import
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";

// 회원가입 폼 스키마
const signupSchema = z.object({
  businessName: z.string().min(1, "스마트스토어 상호명을 입력해주세요"),
  businessLink: z.string().url("올바른 URL 형식을 입력해주세요"),
  number: z.string().min(1, "휴대폰 번호를 입력해주세요"),
  email: z.string().email("올바른 이메일 형식을 입력해주세요"),
  password: z.string().min(6, "비밀번호는 최소 6자 이상이어야 합니다"),
  confirmPassword: z.string().min(6, "비밀번호 확인을 입력해주세요"),
  terms: z.boolean().refine(val => val === true, {
    message: "이용약관과 개인정보처리방침에 동의해야 합니다",
  })
}).refine((data) => data.password === data.confirmPassword, {
  message: "비밀번호가 일치하지 않습니다",
  path: ["confirmPassword"],
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const { signUp, error: authError } = useAuth();
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // 회원가입 폼
  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      businessName: "",
      businessLink: "",
      number: "",
      email: "",
      password: "",
      confirmPassword: "",
      terms: false,
    },
  });

  // 폼 제출 핸들러
  const onSubmit = async (data: SignupFormValues) => {
    setIsLoading(true);
    try {
      await signUp(
        data.email, 
        data.password,
        data.businessName,
        data.businessLink,
        data.number
      );
      
      toast({
        title: "회원가입 성공",
        description: "이메일 인증을 완료해주세요.",
      });
      
      // 로그인 페이지로 이동
      setLocation("/login");
    } catch (error: any) {
      console.error("Signup error:", error);
      toast({
        title: "회원가입 실패",
        description: error.message || "회원가입 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 비밀번호 찾기 핸들러
  const handlePasswordReset = async () => {
    const email = prompt("비밀번호를 재설정할 이메일을 입력하세요:");
    if (!email) return;

    const { sendPasswordReset } = useAuth();
    try {
      const success = await sendPasswordReset(email);
      if (success) {
        toast({
          title: "비밀번호 재설정 이메일 발송",
          description: "이메일로 비밀번호 재설정 링크가 발송되었습니다.",
        });
      }
    } catch (error) {
      toast({
        title: "이메일 발송 실패",
        description: "비밀번호 재설정 이메일 발송에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">회원가입</CardTitle>
          <CardDescription className="text-center">
            SEO 분석 서비스를 이용하기 위한 계정을 만들어주세요
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {authError && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{authError}</AlertDescription>
            </Alert>
          )}
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="businessName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>스마트스토어 상호</FormLabel>
                    <FormControl>
                      <Input placeholder="상호명을 입력하세요" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="businessLink"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>스마트스토어 홈 링크</FormLabel>
                    <FormControl>
                      <Input placeholder="https://smartstore.naver.com/..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>휴대폰 번호</FormLabel>
                    <FormControl>
                      <Input placeholder="연락 가능한 번호를 입력하세요" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>이메일</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="이메일 주소" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>비밀번호</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="6자 이상 입력해주세요" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>비밀번호 확인</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="비밀번호를 다시 입력해주세요" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="terms"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 py-2">
                    <FormControl>
                      <Checkbox 
                        checked={field.value} 
                        onCheckedChange={field.onChange} 
                        id="terms" 
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel htmlFor="terms" className="text-sm font-normal">
                        스마트스토어 SEO 최적화 도구 <a href="https://chambray-midnight-e7f.notion.site/18678708053f806a9955f0f5375cdbdd?pvs=4" target="_blank" className="text-blue-600 hover:underline">이용약관 및 개인정보처리방침</a>에 동의합니다.
                      </FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 처리 중...
                  </>
                ) : (
                  "회원가입"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center">
            <span className="text-gray-500">이미 계정이 있으신가요?</span>{" "}
            <Link to="/login" className="text-blue-600 hover:underline">
              로그인하기
            </Link>
          </div>
          <div className="text-sm text-center">
            <button 
              type="button" 
              onClick={handlePasswordReset}
              className="text-blue-600 hover:underline"
            >
              비밀번호 찾기
            </button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}