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
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>쿼리 삭제 확인</AlertDialogTitle>
          <AlertDialogDescription>
            정말 "{queryText}" 쿼리를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>취소</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDelete} 
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading ? "삭제 중..." : "삭제하기"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
