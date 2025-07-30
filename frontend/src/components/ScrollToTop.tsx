"use client";

import { useState, useEffect } from "react";

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  // 스크롤 위치에 따라 버튼 표시/숨김
  useEffect(() => {
    const toggleVisibility = () => {
      // 300px 이상 스크롤했을 때 버튼 표시
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    // 스크롤 이벤트 리스너 추가 (throttling 적용)
    let timeoutId: NodeJS.Timeout;
    const throttledToggleVisibility = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(toggleVisibility, 100);
    };

    window.addEventListener("scroll", throttledToggleVisibility);

    return () => {
      window.removeEventListener("scroll", throttledToggleVisibility);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  // 맨 위로 스크롤하는 함수
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <>
      {isVisible && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:scale-110 active:scale-95 focus:outline-none focus:ring-4 focus:ring-blue-500/50"
          aria-label="맨 위로 이동"
          title="맨 위로 이동"
        >
          <svg
            className="w-6 h-6 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 10l7-7m0 0l7 7m-7-7v18"
            />
          </svg>
        </button>
      )}

      {/* 애니메이션을 위한 CSS */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .fixed.bottom-6.right-6 {
          animation: fadeInUp 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
