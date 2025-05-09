
import React from "react";
import { motion } from "framer-motion";

export default function ReviewSection() {
  // Generate random color based on index
  const getRandomColor = (index: number) => {
    const colors = [
      'bg-blue-200', 'bg-green-200', 'bg-purple-200', 
      'bg-pink-200', 'bg-yellow-200', 'bg-indigo-200',
      'bg-red-200', 'bg-orange-200', 'bg-teal-200'
    ];
    return colors[index % colors.length];
  };

  // Generate random masked ID
  const getMaskedId = (index: number) => {
    const letters = 'abcdefghijklmnopqrstuvwxyz';
    const randomLetter = () => letters[Math.floor(Math.random() * letters.length)];
    return `${randomLetter()}${randomLetter()}**${index}**`;
  };

  // Generate random single letter
  const getRandomLetter = () => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    return letters[Math.floor(Math.random() * letters.length)];
  };

  const reviews = [
    {
      content: "스마트스토어를 이제 막 시작하거나, 아직 파워를 못달았거나 파워 3개월 이상 유지 못한 사람들. 키워드 어떻게 찾지? 잘 모르는 사람들.. 상품 제목 어떻게 지어야 할지 잘 모르는 사람들.. 이거 꼭 써.. 아** 유료, m** 다 쓰고 있는데 이게 최고야.. 키워드 분석뿐 아니라 상품 제목 지을때 아주 유용해 6년째 빅파워 달고 있는 나도 요즘 이거 때문에 너무 편하다..!!"
    },
    {
      content: "안녕하세요! 혹시 5번이상 사용하려면 추가금액 얼마정도 내야 하나요?? 너무 잘 쓰고 있습니다!"
    },
    {
      content: "나에게 정말 딱 필요한거예요!!"
    },
    {
      content: "이거 써보니 좋더라구요ㅎ굳이 아이템 스타우트 이런거 안써도 되서 좋더라구요. 감사합니다"
    },
    {
      content: "저 진짜 키워드 때문에 머리 아팠는데ㅠㅠ감사합니다"
    },
    {
      content: "가장 어려운 부분을 찝어서 해결해주는 느낌!"
    },
    {
      content: "너무 좋다! 너무 천재야!"
    }
  ];

  // Double the reviews for seamless scrolling
  const doubledReviews = [...reviews, ...reviews];

  return (
    <section className="py-16 bg-gradient-to-b from-white to-blue-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold mb-4">사용자 반응</h2>
          <p className="text-lg text-slate-600">SNS, 피드백으로 받은 반응입니다. 아이디는 익명 처리했습니다. </p>
        </motion.div>

        <div className="relative">
          <motion.div 
            className="flex whitespace-nowrap"
            animate={{ x: ["0%", "-50%"] }}
            transition={{
              duration: 20,
              ease: "linear",
              repeat: Infinity,
            }}
          >
            {doubledReviews.map((review, index) => (
              <div 
                key={index}
                className="inline-block min-w-[300px] h-fit mx-4 p-6 bg-white rounded-xl shadow-sm border border-slate-200"
              >
                <div className="flex items-center mb-4">
                  <div className={`w-8 h-8 rounded-full ${getRandomColor(index)} flex items-center justify-center`}>
                    <span className="text-sm font-semibold">{getRandomLetter()}</span>
                  </div>
                  <span className="ml-2 text-sm text-gray-600">{getMaskedId(index % reviews.length)}</span>
                </div>
                <p className="text-slate-700 whitespace-pre-line">{review.content}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
