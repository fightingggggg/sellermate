
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

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
      const userEmail = currentUser.email || '';
      await setDoc(doc(db, "notifications", userEmail), {
        email: userEmail,
        timestamp: new Date().toISOString(),
        isSubscribed: true,
        type: 'tracking'
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>상품 추적 기능 알림 신청</DialogTitle>
          <DialogDescription>
            상품 추적 기능이 출시되면 이메일로 알려드립니다. 신청하시겠습니까?
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center space-x-2 mt-4">
          <Button variant="outline" onClick={onClose}>아니오</Button>
          <Button onClick={handleSubscribe} disabled={isSubmitting}>
            {isSubmitting ? "처리중..." : "예"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
