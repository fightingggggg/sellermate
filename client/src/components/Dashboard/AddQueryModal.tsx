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
import { AlertTriangle, Loader2, Search, ShoppingBag } from "lucide-react";
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
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && queryText.trim() && !isLimitReached && !isLoading) {
      handleSubmit();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-gradient-to-b from-white to-blue-50 border-blue-100">
        <DialogHeader>
          <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-indigo-100">
            <ShoppingBag className="h-6 w-6 text-blue-600" />
          </div>
          <DialogTitle className="text-center text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            새 상품 분석 추가
          </DialogTitle>
          <DialogDescription className="text-center px-4">
            크롬 확장프로그램을 통해 새로운 상품을 분석하여 추가합니다. 최대 3개까지 저장할 수 있습니다.
          </DialogDescription>
        </DialogHeader>

        {isLimitReached && (
          <Alert className="border border-yellow-200 bg-yellow-50/80">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            <AlertDescription className="text-yellow-700">
              상품 제한에 도달했습니다. 새 상품을 추가하려면 기존 상품을 삭제하세요.
            </AlertDescription>
          </Alert>
        )}
        
        <div className="mb-4">
          <label htmlFor="queryInput" className="block text-sm font-medium mb-2">
            분석할 상품 검색어
          </label>
          <div className="relative">
            <Input
              id="queryInput"
              value={queryText}
              onChange={(e) => setQueryText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="예: 애플 에어팟, 삼성 무선이어폰, 갤럭시북"
              className="pl-10 h-11 border-blue-200 focus:border-blue-400 bg-white"
              disabled={isLimitReached || isLoading}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-500" />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            정확한 검색어를 입력할수록 더 정확한 분석 결과를 얻을 수 있습니다.
          </p>
        </div>
        
        <DialogFooter className="sm:justify-end gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="border-blue-200 text-blue-700 hover:bg-blue-50"
          >
            취소
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!queryText.trim() || isLimitReached || isLoading}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                분석 중...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                검색 및 분석하기
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
