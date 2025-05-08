
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger 
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "이 확장 프로그램은 무료인가요?",
    answer: "네, 현재는 베타 버전으로 무료로 제공됩니다. 다만 안정적인 사용을 위해 하루 이용 횟수를 잠시 제한하고 있어요. 더 나은 서비스를 위해 개선 중이니 조금만 기다려 주세요."
  },
  {
    question: "네이버 정책에 위반되지 않나요?",
    answer: "아니요, 본 확장 프로그램은 네이버 스마트스토어 정책을 준수합니다. 검색 알고리즘을 해킹하거나 조작하지 않고, 네이버 SEO 가이드에 따른 최적화만을 지원합니다."
  },
  {
    question: "다른 브라우저에서도 사용할 수 있나요?",
    answer: "현재는 Chrome 브라우저만 지원합니다. 다른 브라우저 버전은 향후 출시 예정입니다."
  },
  {
    question: "정말 상위 노출에 효과가 있나요?",
    answer: "네. 해당 솔루션은 복잡한 키워드 분석 툴 없이도 효과적인 결과를 기대할 수 있도록 설계되었습니다. 상위 노출 상품명 작성 관련 콘텐츠, 네이버 SEO 가이드, 실제 노출된 상품 데이터를 기반으로 최적화된 상품명을 생성합니다. 다만, 네이버의 노출 기준은 인기도, 적합도, 신뢰도로 구성되어 있으며, 본 솔루션은 이 중 적합도와 신뢰도 개선에 중점을 둡니다. 따라서 인기도와 같은 외부 요인에 따라 실제 노출 효과는 달라질 수 있습니다."
  },
  {
    question: "개인정보는 어떻게 보호되나요?",
    answer: "수집된 개인정보는 Google의 보안 서버에 암호화되어 저장됩니다. 이름, 주민등록번호 등 민감한 개인정보는 수집하지 않으며, 최소한의 정보만 사용합니다. 모든 정보는 사용자 동의를 바탕으로 안전하게 처리됩니다."
  },
  {
    question: "기술 지원은 어떻게 받을 수 있나요?",
    answer: "official.sellermate@gmail.com으로 문의하시거나, 확장 프로그램 내 '문의 및 피드백 보내기' 메뉴를 통해 1:1 문의를 보내실 수 있습니다."
  }
];

const FaqSection = () => {
  return (
    <section id="faq" className="py-24 bg-white">
      <div className="w-full px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">자주 묻는 질문</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            네이버 스마트스토어 상위노출 최적화 도구에 대한 자주 묻는 질문들을 모았습니다.
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-6">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="bg-[#F8F9FA] rounded-xl overflow-hidden mb-4 border-none">
                <AccordionTrigger className="px-5 py-4 font-bold text-lg hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="px-5 pb-5 text-gray-600">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FaqSection;
