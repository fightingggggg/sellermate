import { useState } from "react";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { useQueryContext } from "@/contexts/QueryContext";

interface AddQueryModalProps {
  isOpen: boolean;
  onClose: () => void;
  queriesCount: number;
}

export default function AddQueryModal({ isOpen, onClose, queriesCount }: AddQueryModalProps) {
  const [queryText, setQueryText] = useState("");
  const { addQuery, isLoading } = useQueryContext();
  const isLimitReached = queriesCount >= 3;

  const handleSubmit = async () => {
    if (!queryText.trim()) return;
    
    const success = await addQuery(queryText);
    if (success) {
      setQueryText("");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>새 상품 추가</DialogTitle>
          <DialogDescription>
            크롬 확장프로그램을 통해 새로운 상품을 분석하여 추가합니다. 최대 3개까지 저장할 수 있습니다.
          </DialogDescription>
        </DialogHeader>

        {isLimitReached && (
          <Alert className="bg-yellow-50 border border-yellow-200">
            <AlertTriangle className="h-4 w-4 text-yellow-400" />
            <AlertDescription>
              상품 제한에 도달했습니다. 새 상품을 추가하려면 기존 상품을 삭제하세요.
            </AlertDescription>
          </Alert>
        )}
        
        <div className="mb-4">
          <label htmlFor="queryInput" className="block text-sm font-medium text-text-secondary mb-1">상품 검색어</label>
          <Input
            id="queryInput"
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
            placeholder="검색어를 입력하세요"
            disabled={isLimitReached || isLoading}
          />
        </div>
        
        <DialogFooter className="sm:justify-end">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            취소
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!queryText.trim() || isLimitReached || isLoading}
          >
            {isLoading ? "분석 중..." : "검색 및 분석하기"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
