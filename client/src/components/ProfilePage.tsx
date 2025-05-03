import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { UserProfile } from "@/types";

// UI 컴포넌트 import
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, CheckCircle2, AlertCircle, UserRound, ShieldAlert } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";

// 프로필 업데이트 스키마
const profileSchema = z.object({
  businessName: z.string().min(1, "스마트스토어 상호명을 입력해주세요"),
  businessLink: z.string().url("올바른 URL 형식을 입력해주세요"),
  number: z.string().min(1, "휴대폰 번호를 입력해주세요"),
});

// 이메일 업데이트 스키마
const emailSchema = z.object({
  email: z.string().email("올바른 이메일 형식을 입력해주세요"),
  password: z.string().min(1, "비밀번호를 입력해주세요"),
});

// 비밀번호 업데이트 스키마
const passwordSchema = z.object({
  currentPassword: z.string().min(1, "현재 비밀번호를 입력해주세요"),
  newPassword: z.string().min(6, "새 비밀번호는 최소 6자 이상이어야 합니다"),
  confirmPassword: z.string().min(6, "비밀번호 확인을 입력해주세요"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "새 비밀번호가 일치하지 않습니다",
  path: ["confirmPassword"],
});

// 회원탈퇴 스키마
const deleteAccountSchema = z.object({
  password: z.string().min(1, "비밀번호를 입력해주세요"),
  confirmation: z.string().min(1, "확인 문구를 입력해주세요").refine(val => val === "탈퇴합니다", {
    message: "확인 문구를 정확히 입력해주세요",
  }),
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type EmailFormValues = z.infer<typeof emailSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;
type DeleteAccountFormValues = z.infer<typeof deleteAccountSchema>;

export default function ProfilePage() {
  const [, navigate] = useLocation();
  const { 
    userProfile, 
    profileLoading, 
    updateUserProfile, 
    updateUserEmail, 
    updateUserPassword, 
    deleteUserAccount, 
    verifyEmail,
    logout,
    error: authError 
  } = useAuth();
  
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [isVerifyEmailLoading, setIsVerifyEmailLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { toast } = useToast();

  // 프로필 폼
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      businessName: userProfile?.businessName || "",
      businessLink: userProfile?.businessLink || "",
      number: userProfile?.number || "",
    },
  });

  // 이메일 폼
  const emailForm = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: userProfile?.email || "",
      password: "",
    },
  });

  // 비밀번호 폼
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // 회원탈퇴 폼
  const deleteAccountForm = useForm<DeleteAccountFormValues>({
    resolver: zodResolver(deleteAccountSchema),
    defaultValues: {
      password: "",
      confirmation: "",
    },
  });

  // 프로필 폼 제출 핸들러
  const onProfileSubmit = async (data: ProfileFormValues) => {
    setIsProfileLoading(true);
    try {
      const success = await updateUserProfile(data as Partial<UserProfile>);
      if (success) {
        toast({
          title: "프로필 업데이트 성공",
          description: "프로필 정보가 성공적으로 업데이트되었습니다.",
        });
      }
    } catch (error: any) {
      toast({
        title: "프로필 업데이트 실패",
        description: error.message || "프로필 업데이트 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsProfileLoading(false);
    }
  };

  // 이메일 폼 제출 핸들러
  const onEmailSubmit = async (data: EmailFormValues) => {
    setIsEmailLoading(true);
    try {
      const success = await updateUserEmail(data.email, data.password);
      if (success) {
        toast({
          title: "이메일 업데이트 성공",
          description: "새로운 이메일 주소로 인증 메일이 발송되었습니다.",
        });
        // 폼 리셋
        emailForm.reset({ email: data.email, password: "" });
      }
    } catch (error: any) {
      toast({
        title: "이메일 업데이트 실패",
        description: error.message || "이메일 업데이트 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsEmailLoading(false);
    }
  };

  // 비밀번호 폼 제출 핸들러
  const onPasswordSubmit = async (data: PasswordFormValues) => {
    setIsPasswordLoading(true);
    try {
      const success = await updateUserPassword(data.currentPassword, data.newPassword);
      if (success) {
        toast({
          title: "비밀번호 변경 성공",
          description: "비밀번호가 성공적으로 변경되었습니다.",
        });
        // 폼 리셋
        passwordForm.reset();
      }
    } catch (error: any) {
      toast({
        title: "비밀번호 변경 실패",
        description: error.message || "비밀번호 변경 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsPasswordLoading(false);
    }
  };

  // 회원탈퇴 폼 제출 핸들러
  const onDeleteSubmit = async (data: DeleteAccountFormValues) => {
    setIsDeleteLoading(true);
    try {
      const success = await deleteUserAccount(data.password);
      if (success) {
        toast({
          title: "회원 탈퇴 완료",
          description: "계정이 성공적으로 삭제되었습니다.",
        });
        setDeleteDialogOpen(false);
        navigate("/");
      }
    } catch (error: any) {
      toast({
        title: "회원 탈퇴 실패",
        description: error.message || "회원 탈퇴 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsDeleteLoading(false);
    }
  };

  // 이메일 인증 핸들러
  const handleVerifyEmail = async () => {
    setIsVerifyEmailLoading(true);
    try {
      const success = await verifyEmail();
      if (success) {
        toast({
          title: "인증 이메일 발송 성공",
          description: "이메일 주소로 인증 메일이 발송되었습니다.",
        });
      }
    } catch (error: any) {
      toast({
        title: "인증 이메일 발송 실패",
        description: error.message || "인증 이메일 발송 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsVerifyEmailLoading(false);
    }
  };

  // 로그아웃 처리
  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error: any) {
      toast({
        title: "로그아웃 실패",
        description: error.message || "로그아웃 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  // 프로필 로딩 시 폼 초기값 업데이트
  useEffect(() => {
    if (userProfile) {
      profileForm.reset({
        businessName: userProfile.businessName || "",
        businessLink: userProfile.businessLink || "",
        number: userProfile.number || "",
      });
      
      emailForm.reset({
        email: userProfile.email || "",
        password: "",
      });
    }
  }, [userProfile]);

  return (
    <div className="container py-10" style={{backgroundColor: '#f4f4f9'}}>
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">내 계정</h1>
          <Button variant="outline" onClick={handleLogout}>로그아웃</Button>
        </div>
        
        {authError && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{authError}</AlertDescription>
          </Alert>
        )}
        
        {profileLoading ? (
          <div className="flex justify-center items-center h-32">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Tabs defaultValue="profile">
            <TabsList className="mb-6 w-full">
              <TabsTrigger value="profile" className="flex-1">
                <UserRound className="h-4 w-4 mr-2" /> 기본 정보
              </TabsTrigger>
              <TabsTrigger value="security" className="flex-1">
                <ShieldAlert className="h-4 w-4 mr-2" /> 보안 설정
              </TabsTrigger>
              <TabsTrigger value="danger" className="flex-1">
                계정 관리
              </TabsTrigger>
            </TabsList>
            
            {/* 기본 정보 탭 */}
            <TabsContent value="profile">
              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle>프로필 정보</CardTitle>
                  <CardDescription>
                    스마트스토어 관련 정보와 연락처를 관리합니다.
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <Form {...profileForm}>
                    <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                      <FormField
                        control={profileForm.control}
                        name="businessName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[#555] font-bold text-sm">스마트스토어 상호</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="상호명을 입력하세요" 
                                className="border border-[#ccc] rounded-md p-3 font-normal focus:border-[#007BFF]"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={profileForm.control}
                        name="businessLink"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[#555] font-bold text-sm">스마트스토어 홈 링크</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="https://smartstore.naver.com/..." 
                                className="border border-[#ccc] rounded-md p-3 font-normal focus:border-[#007BFF]"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={profileForm.control}
                        name="number"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[#555] font-bold text-sm">휴대폰 번호</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="연락 가능한 번호를 입력하세요" 
                                className="border border-[#ccc] rounded-md p-3 font-normal focus:border-[#007BFF]"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="pt-4">
                        <Button 
                          type="submit" 
                          className="py-2 bg-[#007BFF] hover:bg-[#0056b3] text-white font-bold rounded-md" 
                          disabled={isProfileLoading || !profileForm.formState.isDirty}
                        >
                          {isProfileLoading ? (
                            <>
                              <span className="inline-block w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></span> 업데이트 중...
                            </>
                          ) : (
                            "정보 저장"
                          )}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* 보안 설정 탭 */}
            <TabsContent value="security">
              <div className="grid gap-6">
                {/* 이메일 정보 */}
                <Card className="border-none shadow-sm">
                  <CardHeader>
                    <CardTitle>이메일 주소</CardTitle>
                    <CardDescription>
                      계정에 사용되는 이메일 주소를 관리합니다.
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="text-sm font-medium">현재 이메일:</div>
                      <div className="text-sm">{userProfile?.email}</div>
                      
                      {userProfile?.emailVerified ? (
                        <div className="flex items-center text-xs text-green-600">
                          <CheckCircle2 className="h-3 w-3 mr-1" /> 인증됨
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="flex items-center text-xs text-amber-600">
                            <AlertCircle className="h-3 w-3 mr-1" /> 미인증
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={handleVerifyEmail}
                            disabled={isVerifyEmailLoading}
                          >
                            {isVerifyEmailLoading ? (
                              <span className="inline-block w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
                            ) : (
                              "인증 메일 발송"
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                    
                    <Form {...emailForm}>
                      <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
                        <FormField
                          control={emailForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[#555] font-bold text-sm">새 이메일</FormLabel>
                              <FormControl>
                                <Input 
                                  type="email" 
                                  placeholder="새 이메일 주소" 
                                  className="border border-[#ccc] rounded-md p-3 font-normal focus:border-[#007BFF]"
                                  {...field} 
                                />
                              </FormControl>
                              <FormDescription>
                                새 이메일로 변경 시 인증 메일이 발송됩니다.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={emailForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[#555] font-bold text-sm">현재 비밀번호</FormLabel>
                              <FormControl>
                                <Input 
                                  type="password" 
                                  placeholder="보안을 위해 현재 비밀번호를 입력하세요" 
                                  className="border border-[#ccc] rounded-md p-3 font-normal focus:border-[#007BFF]"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <Button 
                          type="submit" 
                          className="py-2 bg-[#007BFF] hover:bg-[#0056b3] text-white font-bold rounded-md"
                          disabled={isEmailLoading}
                        >
                          {isEmailLoading ? (
                            <>
                              <span className="inline-block w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></span> 처리 중...
                            </>
                          ) : (
                            "이메일 변경"
                          )}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
                
                {/* 비밀번호 변경 */}
                <Card className="border-none shadow-sm">
                  <CardHeader>
                    <CardTitle>비밀번호 변경</CardTitle>
                    <CardDescription>
                      계정 비밀번호를 변경합니다.
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <Form {...passwordForm}>
                      <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                        <FormField
                          control={passwordForm.control}
                          name="currentPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[#555] font-bold text-sm">현재 비밀번호</FormLabel>
                              <FormControl>
                                <Input 
                                  type="password" 
                                  placeholder="현재 비밀번호"
                                  className="border border-[#ccc] rounded-md p-3 font-normal focus:border-[#007BFF]"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={passwordForm.control}
                          name="newPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[#555] font-bold text-sm">새 비밀번호</FormLabel>
                              <FormControl>
                                <Input 
                                  type="password" 
                                  placeholder="새 비밀번호"
                                  className="border border-[#ccc] rounded-md p-3 font-normal focus:border-[#007BFF]"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={passwordForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[#555] font-bold text-sm">새 비밀번호 확인</FormLabel>
                              <FormControl>
                                <Input 
                                  type="password" 
                                  placeholder="새 비밀번호 확인"
                                  className="border border-[#ccc] rounded-md p-3 font-normal focus:border-[#007BFF]"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <Button 
                          type="submit" 
                          className="py-2 bg-[#007BFF] hover:bg-[#0056b3] text-white font-bold rounded-md"
                          disabled={isPasswordLoading}
                        >
                          {isPasswordLoading ? (
                            <>
                              <span className="inline-block w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></span> 처리 중...
                            </>
                          ) : (
                            "비밀번호 변경"
                          )}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            {/* 계정 관리 탭 */}
            <TabsContent value="danger">
              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle className="text-red-600">계정 삭제</CardTitle>
                  <CardDescription>
                    계정을 삭제하면 모든 정보가 영구적으로 제거됩니다. 이 작업은 되돌릴 수 없습니다.
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="flex flex-col space-y-4">
                    <p className="text-sm text-muted-foreground">
                      계정을 삭제하기 전에 다른 방법을 고려해보세요. 계정 삭제 시 모든 데이터가 영구적으로 제거됩니다.
                    </p>
                    
                    <div className="pt-4">
                      <Button 
                        variant="destructive" 
                        className="bg-red-500 hover:bg-red-600"
                        onClick={() => setDeleteDialogOpen(true)}
                      >
                        계정 삭제
                      </Button>
                    </div>
                    
                    <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                      <DialogContent className="border-none shadow-md">
                        <DialogHeader>
                          <DialogTitle>계정 삭제 확인</DialogTitle>
                          <DialogDescription>
                            계정을 삭제하시면 모든 데이터가 영구적으로 삭제되며, 이 작업은 되돌릴 수 없습니다.
                          </DialogDescription>
                        </DialogHeader>
                        
                        <Form {...deleteAccountForm}>
                          <form onSubmit={deleteAccountForm.handleSubmit(onDeleteSubmit)} className="space-y-4">
                            <FormField
                              control={deleteAccountForm.control}
                              name="password"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-[#555] font-bold text-sm">비밀번호</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="password" 
                                      placeholder="보안을 위해 현재 비밀번호를 입력하세요" 
                                      className="border border-[#ccc] rounded-md p-3 font-normal focus:border-[#007BFF]"
                                      {...field} 
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={deleteAccountForm.control}
                              name="confirmation"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-[#555] font-bold text-sm">확인</FormLabel>
                                  <FormDescription>
                                    계정 삭제를 확인하려면 아래에 "탈퇴합니다"라고 입력하세요.
                                  </FormDescription>
                                  <FormControl>
                                    <Input 
                                      placeholder="이 곳에 입력하세요" 
                                      className="border border-[#ccc] rounded-md p-3 font-normal focus:border-[#007BFF]"
                                      {...field} 
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <DialogFooter className="gap-2 sm:gap-0">
                              <Button 
                                type="button" 
                                variant="outline" 
                                onClick={() => setDeleteDialogOpen(false)}
                              >
                                취소
                              </Button>
                              <Button 
                                type="submit" 
                                variant="destructive"
                                className="bg-red-500 hover:bg-red-600"
                                disabled={isDeleteLoading}
                              >
                                {isDeleteLoading ? (
                                  <>
                                    <span className="inline-block w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></span> 처리 중...
                                  </>
                                ) : (
                                  "계정 삭제"
                                )}
                              </Button>
                            </DialogFooter>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}