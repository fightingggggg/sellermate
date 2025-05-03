import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  onAddQuery: () => void;
}

export default function EmptyState({ onAddQuery }: EmptyStateProps) {
  return (
    <div className="bg-surface shadow rounded-lg p-8 text-center">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-secondary mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
      </svg>
      <h3 className="text-lg font-medium text-text-primary mb-1">저장된 상품이 없습니다</h3>
      <p className="text-text-secondary mb-4">크롬 확장프로그램을 사용하여 새로운 상품을 분석하고 저장해보세요.</p>
      <Button onClick={onAddQuery}>
        상품 추가하기
      </Button>
    </div>
  );
}
