
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
      await setDoc(doc(db, "trackingNotifications", currentUser.email), {
        email: currentUser.email,
        createdAt: new Date().toISOString(),
      });
      
      toast({
        title: "알림 신청 완료",
        description: "상품 추적 기능이 출시되면 이메일로 알려드리겠습니다.",
      });
      onClose();
    } catch (error) {
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
        <div className="flex justify-end space-x-2 mt-4">
          <Button variant="outline" onClick={onClose}>아니오</Button>
          <Button onClick={handleSubscribe} disabled={isSubmitting}>
            {isSubmitting ? "처리중..." : "예"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
