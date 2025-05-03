import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useQueryContext } from "@/contexts/QueryContext";
import { Loader2, Trash } from "lucide-react";

interface DeleteQueryModalProps {
  isOpen: boolean;
  onClose: () => void;
  queryId: string;
  queryText: string;
}

export default function DeleteQueryModal({ isOpen, onClose, queryId, queryText }: DeleteQueryModalProps) {
  const { deleteQuery, isLoading } = useQueryContext();

  const handleDelete = async () => {
    await deleteQuery(queryId);
    onClose();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="border-red-100 bg-white">
        <AlertDialogHeader>
          <div className="w-12 h-12 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
            <Trash className="h-6 w-6 text-red-600" />
          </div>
          <AlertDialogTitle className="text-center text-xl font-bold text-red-600">
            상품 삭제 확인
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            정말 <span className="font-medium">"{queryText}"</span> 상품을 삭제하시겠습니까?<br />
            이 작업은 되돌릴 수 없으며, 관련된 모든 분석 데이터가 삭제됩니다.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-center gap-3">
          <AlertDialogCancel 
            disabled={isLoading}
            className="border-gray-200 text-gray-700 hover:bg-gray-50"
          >
            취소
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDelete} 
            disabled={isLoading}
            className="bg-red-600 text-white hover:bg-red-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                삭제 중...
              </>
            ) : (
              <>
                <Trash className="mr-2 h-4 w-4" />
                삭제하기
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
