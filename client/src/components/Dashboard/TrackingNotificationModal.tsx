import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { trackEvent } from "@/lib/analytics";

interface TrackingNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TrackingNotificationModal({ isOpen, onClose }: TrackingNotificationModalProps) {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubscribe = async () => {
    if (!currentUser?.email) return;

    setIsSubmitting(true);
    try {
      if (!currentUser?.email) {
        throw new Error("사용자 이메일이 없습니다.");
      }

      // Check if notification already exists
      const notificationRef = doc(db, "notifications", currentUser.email);
      const notificationDoc = await getDoc(notificationRef);

      if (notificationDoc.exists()) {
        toast({
          title: "알림 이미 설정됨",
          description: "이미 알림이 설정되었습니다. 출시되면 이메일로 알려드리겠습니다.",
        });
        onClose();
        return;
      }

      await setDoc(notificationRef, {
        email: currentUser.email,
        timestamp: new Date().toISOString(),
        isSubscribed: true,
        type: 'tracking',
        userId: currentUser.uid
      });

      toast({
        title: "알림 신청 완료",
        description: "상품 추적 기능이 출시되면 이메일로 알려드리겠습니다.",
      });
      onClose();
    } catch (error) {
      console.error("Error saving notification subscription:", error);
      toast({
        title: "오류 발생",
        description: "알림 신청 중 문제가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
<Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
  <DialogContent className="sm:max-w-md flex flex-col items-center justify-center text-center">
    <DialogHeader className="w-full">
      <DialogTitle className="text-xl font-semibold text-center">
        상품 순위 추적 기능 안내
      </DialogTitle>
      <DialogDescription className="text-gray-900 mt-2 text-center leading-relaxed">
      상품 순위 추적 기능이 곧 출시될 예정이에요.
            <br /> 키워드 추적과 함께 더 풍부한 인사이트를 제공해드릴게요.
        <br />
        출시되면 이메일로 바로 알려드릴게요!
      </DialogDescription>
    </DialogHeader>
    <div className="flex justify-center space-x-2 mt-6">
      <Button variant="outline" onClick={onClose}>아니오, 관심 없어요</Button>
      <Button
        className="bg-gradient-to-r from-blue-600 to-blue-400 text-white hover:opacity-90"
        onClick={() => {
          trackEvent('Dashboard', 'click', 'Register Tracking');
          handleSubscribe();
        }}
        disabled={isSubmitting}
      >
        {isSubmitting ? "처리중..." : "네, 출시되면 알려주세요!"}
      </Button>
    </div>
  </DialogContent>
</Dialog>


  );
}