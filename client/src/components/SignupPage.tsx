import { useState } from "react";
import { useLocation, Link } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/contexts/AuthContext";

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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

// 회원가입 스키마
const signupSchema = z.object({
  businessName: z.string().min(1, "스마트스토어 상호명을 입력해주세요"),
  businessLink: z.string().url("올바른 URL 형식을 입력해주세요"),
  number: z.string().min(1, "휴대폰 번호를 입력해주세요"),
  email: z.string().email("올바른 이메일 형식을 입력해주세요"),
  password: z.string().min(6, "비밀번호는 최소 6자 이상이어야 합니다"),
  confirmPassword: z.string().min(6, "비밀번호 확인을 입력해주세요"),
  terms: z.literal(true, {
    errorMap: () => ({ message: "이용약관과 개인정보처리방침에 동의해야 합니다" }),
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "비밀번호가 일치하지 않습니다",
  path: ["confirmPassword"],
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const [loading, setLoading] = useState(false);
  const { signUp, sendPasswordReset, error: authError } = useAuth();
  const [, navigate] = useLocation();
  const [alertMessage, setAlertMessage] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      businessName: "",
      businessLink: "",
      number: "",
      email: "",
      password: "",
      confirmPassword: "",
      terms: false as any, // 타입 에러 해결을 위한 임시 처리
    },
  });

  const onSubmit = async (data: SignupFormValues) => {
    setLoading(true);
    try {
      await signUp(
        data.email, 
        data.password, 
        data.businessName,
        data.businessLink,
        data.number
      );
      setAlertMessage({
        message: "회원가입 성공! 이메일 인증을 완료해주세요.",
        type: "success"
      });
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error: any) {
      console.error("Signup error:", error);
      if (error.code === "auth/email-already-exists") {
        setAlertMessage({
          message: "이미 가입된 이메일입니다.",
          type: "error"
        });
      } else if (error.code === "auth/invalid-email") {
        setAlertMessage({
          message: "올바른 이메일 형식을 입력해주세요.",
          type: "error"
        });
      } else if (error.code === "auth/invalid-password") {
        setAlertMessage({
          message: "비밀번호는 소문자와 특수문자를 포함하고 6자 이상이어야 합니다.",
          type: "error"
        });
      } else {
        setAlertMessage({
          message: "회원가입 실패: " + (error.message || "알 수 없는 오류 발생"),
          type: "error"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    const email = prompt('비밀번호를 재설정할 이메일을 입력하세요:');
    if (!email) return;
    
    try {
      const success = await sendPasswordReset(email);
      if (success) {
        alert('비밀번호 재설정 이메일이 발송되었습니다. 이메일을 확인해주세요.');
      }
    } catch (error: any) {
      alert('비밀번호 재설정 요청 실패: ' + error.message);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen py-12 px-4" style={{backgroundColor: '#f4f4f9'}}>
      <div className="w-full max-w-md bg-white p-5 rounded-lg shadow-sm">
        <h1 className="text-2xl font-bold text-center mb-5">회원가입</h1>
        
        {(alertMessage || authError) && (
          <Alert 
            variant={alertMessage?.type === "success" ? "default" : "destructive"} 
            className={`mb-4 ${alertMessage?.type === "success" ? "bg-[#d4edda] text-[#155724] border-[#c3e6cb]" : "bg-[#f8d7da] text-[#721c24] border-[#f5c6cb]"}`}
          >
            <AlertDescription>{alertMessage?.message || authError}</AlertDescription>
          </Alert>
        )}
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="businessName"
              render={({ field }) => (
                <div className="form-group">
                  <FormLabel className="text-[#555] font-bold text-xs block mb-1">스마트스토어 상호</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="상호명을 입력하세요" 
                      className="w-full p-3 border border-[#ccc] rounded-md text-sm focus:border-[#007BFF] focus:outline-none"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-red-500 mt-1" />
                </div>
              )}
            />
            
            <FormField
              control={form.control}
              name="businessLink"
              render={({ field }) => (
                <div className="form-group">
                  <FormLabel className="text-[#555] font-bold text-xs block mb-1">스마트스토어 홈 링크</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="https://smartstore.naver.com/..." 
                      className="w-full p-3 border border-[#ccc] rounded-md text-sm focus:border-[#007BFF] focus:outline-none"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-red-500 mt-1" />
                </div>
              )}
            />
            
            <FormField
              control={form.control}
              name="number"
              render={({ field }) => (
                <div className="form-group">
                  <FormLabel className="text-[#555] font-bold text-xs block mb-1">휴대폰 번호</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="연락 가능한 번호를 입력하세요" 
                      className="w-full p-3 border border-[#ccc] rounded-md text-sm focus:border-[#007BFF] focus:outline-none"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-red-500 mt-1" />
                </div>
              )}
            />
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <div className="form-group">
                  <FormLabel className="text-[#555] font-bold text-xs block mb-1">이메일</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="이메일 주소" 
                      type="email" 
                      className="w-full p-3 border border-[#ccc] rounded-md text-sm focus:border-[#007BFF] focus:outline-none"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-red-500 mt-1" />
                </div>
              )}
            />
            
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <div className="form-group">
                  <FormLabel className="text-[#555] font-bold text-xs block mb-1">비밀번호</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="비밀번호" 
                      type="password"
                      className="w-full p-3 border border-[#ccc] rounded-md text-sm focus:border-[#007BFF] focus:outline-none"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-red-500 mt-1" />
                </div>
              )}
            />
            
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <div className="form-group">
                  <FormLabel className="text-[#555] font-bold text-xs block mb-1">비밀번호 확인</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="비밀번호 확인" 
                      type="password"
                      className="w-full p-3 border border-[#ccc] rounded-md text-sm focus:border-[#007BFF] focus:outline-none"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-red-500 mt-1" />
                </div>
              )}
            />
            
            <FormField
              control={form.control}
              name="terms"
              render={({ field }) => (
                <div className="flex items-center space-x-2 mb-4">
                  <FormControl>
                    <Checkbox 
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-xs">
                      스마트스토어 SEO 최적화 도구 <a href="https://chambray-midnight-e7f.notion.site/18678708053f806a9955f0f5375cdbdd?pvs=4" target="_blank" className="text-[#007BFF] hover:underline">이용약관 및 개인정보처리방침</a>에 동의합니다.
                    </FormLabel>
                    <FormMessage className="text-xs text-red-500" />
                  </div>
                </div>
              )}
            />
            
            <Button 
              type="submit" 
              className="w-full py-3 bg-[#007BFF] hover:bg-[#0056b3] text-white font-bold rounded-md" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="inline-block w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></span> 회원가입 중...
                </>
              ) : (
                "회원가입"
              )}
            </Button>
          </form>
        </Form>
        
        <div className="flex justify-center mt-4">
          <button onClick={handlePasswordReset} className="text-[#007BFF] text-xs hover:underline mt-3">
            비밀번호 찾기
          </button>
        </div>
      </div>
    </div>
  );
}