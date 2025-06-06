import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowRight, BarChart, Search, ShoppingBag, Lock, Wand2, FileText, CheckSquare, LineChart, Star, Download } from "lucide-react";
import { motion } from "framer-motion";
import ExampleSection from "../components/ExampleSection";
import TextFeaturesSection from "../components/TextFeaturesSection";
import CtaSection from "../components/CtaSection";
import FooterSection from "../components/FooterSection";
import FaqSection from "../components/FaqSection";
import DashboardLayout from "@/components/DashboardLayout";
import ReviewSection from "../components/ReviewSection";

import { trackEvent, trackTimeSpent } from "@/lib/analytics";
import { useEffect } from "react";

export default function Home() {
  const { currentUser, loading } = useAuth();
  const [, navigate] = useLocation();

  // useEffect(() => {
  //   const cleanupHero = trackTimeSpent('Hero Section');
  //   const cleanupExample = trackTimeSpent('Example Section');
  //   const cleanupTextfeature = trackTimeSpent('Textfeature Section');
  //   const cleanupReview = trackTimeSpent('Review Section');
  //   const cleanupFeatures = trackTimeSpent('Features Section');
  //   const cleanupFaq = trackTimeSpent('FAQ Section');

  //   return () => {
  //     cleanupHero();
  //     cleanupExample();
  //     cleanupTextfeature();
  //     cleanupFeatures();
  //     cleanupReview();
  //     cleanupFaq();
  //   };
  // }, []);

  useEffect(() => {
    const cleanupHome = trackTimeSpent('Home');
  

    return () => {
      cleanupHome();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen flex flex-col">
      <section id="hero" className="pt-32 pb-20 bg-gradient-to-br from-[#F8F9FA] to-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center justify-between">
            <div className="lg:w-1/2 mb-12 lg:mb-0">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                <div className="mb-4">네이버 스마트스토어</div>
                <div className="mb-4 text-[#1a73e8]">상위노출 최적화를 위한</div>
                <div>완벽한 솔루션</div>
              </h2>
              <p className="text-xl mb-8 text-gray-600">
                스마트스토어 상위 노출을 위한 키워드,<br />
                최적의 상품명, 카테고리, 태그 제안
              </p>

              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Button 
                  size="lg" 
                  className="bg-[#1a73e8] hover:bg-[#1a73e8]/90 text-white font-semibold py-3 px-6 shadow-lg transition-all transform hover:scale-105 w-full sm:w-auto"
                  onClick={() => 
                    {trackEvent('Home', 'click', 'install');
                    window.open("https://chromewebstore.google.com/detail/%EC%8A%A4%EB%A7%88%ED%8A%B8%EC%8A%A4%ED%86%A0%EC%96%B4-%EC%83%81%EC%9C%84%EB%85%B8%EC%B6%9C-%EC%B5%9C%EC%A0%81%ED%99%94-%EB%8F%84%EA%B5%AC/plgdaggkagiakemkoclkpkbdiocllbbi?hl=ko")}}
                >
                  <Download className="w-4 h-4 mr-2" />지금 바로 무료로 최적화하기
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-[#1A73E8] text-[#1A73E8] hover:bg-[#1A73E8] hover:text-white py-3 px-6 w-full sm:w-auto"
                  onClick={() => 
                    {trackEvent('Home', 'click', 'Dashboard')
                    navigate("/dashboard")}}
                >
                  대시보드 바로가기
                </Button>
              </div>
              <div className="flex items-center mt-8">
                <div className="flex -space-x-2">
                  <div className="w-10 h-10 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center">
                    <span className="text-xs font-bold">KH</span>
                  </div>
                  <div className="w-10 h-10 rounded-full border-2 border-white bg-gray-300 flex items-center justify-center">
                    <span className="text-xs font-bold">SJ</span>
                  </div>
                  <div className="w-10 h-10 rounded-full border-2 border-white bg-gray-400 flex items-center justify-center">
                    <span className="text-xs font-bold">YM</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">이미 <span className="font-bold text-[#1a73e8]">800+</span>명의 셀러가 사용 중</p>
                </div>
              </div>
            </div>
            <div className="lg:w-1/2 relative">
              <div className="bg-white rounded-xl shadow-2xl p-4 max-w-lg mx-auto">
                <div className="bg-[#F8F9FA] rounded-lg p-1 flex mb-4">
                  <div className="flex space-x-1.5 items-center px-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="bg-white rounded flex-1 flex items-center px-4 py-1">
                    <Lock size={16} className="text-gray-400 mr-2" />
                    <span className="text-gray-500 text-sm truncate">store.naver.com</span>
                  </div>
                </div>
                <div className="rounded-lg shadow-md w-full h-[300px] overflow-hidden">
                  <iframe
                    className="w-full h-full"
                    src="https://www.youtube.com/embed/QuMxvmBvQ4c?autoplay=1&mute=1&playsinline=1&controls=0&showinfo=0&modestbranding=1&rel=0&loop=1&playlist=QuMxvmBvQ4c"
                    title="스마트스토어 SEO 최적화 소개 영상"
                    frameBorder="0"
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                  />
                </div>
                <div className="mt-4 bg-[#F8F9FA] rounded-lg p-3">
                  <div className="flex items-start">
                    <div className="bg-[#1a73e8] h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z" fill="currentColor"/>
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium">상품 최적화 완료</p>
                      <p className="text-xs text-gray-500">상위 노출 상품명 키워드, 카테고리, 태그 최적화 완료</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <TextFeaturesSection />
      </motion.div>
{/* Feature Section 1 */}
<motion.section
  className="py-16 px-4 bg-gradient-to-r from-blue-50 to-indigo-50"
  initial={{ opacity: 0, y: 50 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.6 }}
>
  <div className="max-w-7xl mx-auto">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      {/* Text Content */}
      <motion.div 
        className="space-y-6"
        initial={{ opacity: 0, x: -50 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        viewport={{ once: true }}
      >
        <div className="space-y-4">
          <div className="inline-block px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
            상위노출 최적화
          </div>
          <h3 className="text-2xl font-bold text-gray-900 leading-tight">
             <span className="font-bold text-blue-600">광고 없이도 상위 노출</span>을 이끄는<br />
            원클릭 키워드, 검색 태그, 상품명
          </h3>
          <p className="text-lg text-gray-600 leading-relaxed">
            실제 상위 상품명 키워드, 태그를 분석하고 <br/> <span className="font-bold text-blue-600"> 네이버 SEO 가이드를 준수한 AI 상품명</span>을 생성합니다. 

          </p>
          <p className="text-lg text-gray-600 leading-relaxed">
          <span className="font-bold text-blue-600">실제 상위 노출의 키워드와 태그</span>를 확인하고,<br/> 바로 내 상품에 적용해보세요!
          </p>
        </div>
      </motion.div>

      {/* Screenshot */}
      <motion.div 
        className="relative"
        initial={{ opacity: 0, x: 50 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        viewport={{ once: true }}
      >
        <img
          src="/image1.jpg"
          alt="키워드 분석 화면"
          className="w-full rounded-2xl shadow-2xl"
        />
      </motion.div>
    </div>
  </div>
</motion.section>

{/* Feature Section 2 */}
<motion.section
  className="py-16 px-4 bg-gradient-to-r from-blue-50 to-indigo-50"
  initial={{ opacity: 0, y: 50 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.6 }}
>
  <div className="max-w-7xl mx-auto">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      {/* Text Content */}
      <motion.div 
        className="space-y-6"
        initial={{ opacity: 0, x: -50 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        viewport={{ once: true }}
      >
        <div className="space-y-4">
          <div className="inline-block px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
            상품 등록 최적화
          </div>
          <h3 className="text-2xl font-bold text-gray-900 leading-tight">
상품 등록에 드는 시간과 노력,<br />
이제 <span className="text-blue-600"> 단 10분의 1로</span>


          </h3>
          <p className="text-lg text-gray-600 leading-relaxed">
            상위노출을 위한 핵심 키워드, 태그, 상품명을 저장해 <br/><span className="font-bold text-blue-600">스마트스토어 상품 등록 페이지에서 바로 확인</span> 할 수 있어요.
           
          </p>
          <p className="text-lg text-gray-600 leading-relaxed">
             매번 검색하고 복사하던 번거로움은 끝! <br/> <span className="font-bold text-blue-600">나만의 컨닝 페이퍼</span>처럼 활용해 보세요.
          </p>
        </div>
      </motion.div>

      {/* Screenshot */}
      <motion.div 
        className="relative"
        initial={{ opacity: 0, x: 50 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        viewport={{ once: true }}
      >
        <img
          src="/image2.jpg"
          alt="상품 등록 최적화 화면"
          className="w-full rounded-2xl shadow-2xl"
        />
      </motion.div>
    </div>
  </div>
</motion.section>


      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <ExampleSection />
      </motion.div>


      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <ReviewSection />
      </motion.div>

     

      <motion.section
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
      <FaqSection />
      </motion.section>
      
      <CtaSection />
      <FooterSection />
      </div>
    </DashboardLayout>
  );
}


