
import ScrollToLink from "@/components/ui/scroll-to-link";
import { useState } from "react";
import { FeedbackDialog } from "@/components/ui/feedback-dialog";

const FooterSection = () => {
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  return (
    <footer className="bg-[#333333] text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">스마트스토어 상위노출 최적화 도구</h3>
            <p className="text-gray-400">
              네이버 스마트스토어 검색 노출을 최적화하여 매출을 높이는 Chrome 확장 프로그램입니다.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4">바로가기</h3>
            <ul className="space-y-2">
              <li>
                <a href="/" className="text-gray-400 hover:text-white transition-colors">홈</a>
              </li>
              <li>
                <a href="https://chromewebstore.google.com/detail/%EC%8A%A4%EB%A7%88%ED%8A%B8%EC%8A%A4%ED%86%A0%EC%96%B4-%EC%83%81%EC%9C%84%EB%85%B8%EC%B6%9C-%EC%B5%9C%EC%A0%81%ED%99%94-%EB%8F%84%EA%B5%AC/plgdaggkagiakemkoclkpkbdiocllbbi?hl=ko" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                  확장프로그램 설치
                </a>
              </li>
              <li>
                <a href="/dashboard" className="text-gray-400 hover:text-white transition-colors">대시보드</a>
              </li>
              <li>
                <button onClick={() => setIsFeedbackOpen(true)} className="text-gray-400 hover:text-white transition-colors">
                  문의 및 피드백 보내기
                </button>
                <FeedbackDialog isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4">고객지원</h3>
            <ul className="space-y-2">
              <li><p className="text-gray-400 hover:text-white transition-colors">문의: official.sellermate@gmail.com</p></li>
              <li><a href="https://chambray-midnight-e7f.notion.site/SEO-18678708053f806a9955f0f5375cdbdd?pvs=74" className="text-gray-400 hover:text-white transition-colors">개인정보처리방침 및 이용약관</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-gray-700 text-center">
          <p className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} 셀러메이트. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
