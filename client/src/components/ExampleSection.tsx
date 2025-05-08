
import { TrendingUp, ShoppingCart, Search, CheckCircle } from "lucide-react";

const steps = [
  {
    number: 1,
    title: "실제 이용 후\n상위 노출 경험",
    description: "43.8%",
    icon: TrendingUp,
    color: "bg-gradient-to-br from-blue-500 to-blue-600"
  },
  {
    number: 2,
    title: "서비스 이용 후\n매출 증가 경험",
    description: "31.3%",
    icon: ShoppingCart,
    color: "bg-gradient-to-br from-blue-500 to-blue-600"
  },
  {
    number: 3,
    title: "서비스로\n분석한 상품",
    description: "1.3만개",
    icon: Search,
    color: "bg-gradient-to-br from-blue-500 to-blue-600"
  }
];

const ExampleSection = () => {
  return (
    <section className="py-24 bg-white-50">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold">검증된 효과</h2>
        <p className="text-gray-600 mt-2">실제 사용자들의 경험을 바탕으로 한 결과입니다</p>
      </div>
      <div className="flex flex-col md:flex-row gap-12 justify-center max-w-6xl mx-auto px-4">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <div 
              key={index} 
              className="flex-1 bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className={`${step.color} h-2`}></div>
              <div className="p-8 text-center">
                <div className="mb-6">
                  <div className={`w-24 h-24 ${step.color} rounded-full flex items-center justify-center mx-auto shadow-lg`}>
                    <Icon className="text-white" size={40} />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-4 whitespace-pre-line">{step.title}</h3>
                <div className="flex items-center justify-center mt-4 mb-6">
                  <div className="text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-blue-600">
                    {step.description}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="text-center mt-12 text-sm text-gray-500">
        * 2025년 4월 기준, 초기 사용자 설문과 실제 이용 데이터를 기반으로 한 참고용 통계입니다.
      </div>
    </section>
  );
};

export default ExampleSection;
