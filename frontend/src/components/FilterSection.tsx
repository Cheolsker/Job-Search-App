"use client";

import { useState, ReactNode, useRef, useEffect, useCallback } from "react";

interface FilterSectionProps {
  title: string;
  children: ReactNode;
  activeCount?: number;
  defaultExpanded?: boolean;
  className?: string;
}

export default function FilterSection({
  title,
  children,
  activeCount = 0,
  defaultExpanded = true,
  className = "",
}: FilterSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [height, setHeight] = useState<number | undefined>(
    defaultExpanded ? undefined : 0
  );
  const contentRef = useRef<HTMLDivElement>(null);

  // 성능 최적화: 토글 함수를 useCallback으로 메모이제이션
  const toggleExpanded = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  // 부드러운 애니메이션을 위한 높이 계산
  useEffect(() => {
    if (contentRef.current) {
      if (isExpanded) {
        // 펼칠 때: 실제 콘텐츠 높이로 설정
        const scrollHeight = contentRef.current.scrollHeight;
        setHeight(scrollHeight);

        // 애니메이션 완료 후 auto로 설정하여 동적 콘텐츠 변경에 대응
        const timer = setTimeout(() => {
          setHeight(undefined);
        }, 300); // transition duration과 일치

        return () => clearTimeout(timer);
      } else {
        // 접을 때: 현재 높이에서 0으로 애니메이션
        setHeight(contentRef.current.scrollHeight);
        // 다음 프레임에서 0으로 설정하여 애니메이션 트리거
        requestAnimationFrame(() => {
          setHeight(0);
        });
      }
    }
  }, [isExpanded]);

  const sectionId = `filter-section-${title
    .replace(/\s+/g, "-")
    .toLowerCase()}`;

  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 overflow-hidden ${className}`}
    >
      {/* 헤더 */}
      <button
        onClick={toggleExpanded}
        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 active:bg-gray-100 transition-all duration-150 ease-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
        aria-expanded={isExpanded}
        aria-controls={sectionId}
        type="button"
      >
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-gray-900">{title}</h3>
          {activeCount > 0 && (
            <span
              className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-blue-100 text-blue-800 text-xs font-medium rounded-full transition-all duration-200 ease-out transform"
              style={{
                animation:
                  activeCount > 0 ? "pulse-once 0.3s ease-out" : undefined,
              }}
            >
              {activeCount}
            </span>
          )}
        </div>

        {/* 펼치기/접기 아이콘 - 부드러운 회전 애니메이션 */}
        <svg
          className={`w-5 h-5 text-gray-500 transition-all duration-300 ease-out transform ${
            isExpanded ? "rotate-180" : "rotate-0"
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* 콘텐츠 - 부드러운 높이 애니메이션 */}
      <div
        id={sectionId}
        ref={contentRef}
        className="overflow-hidden transition-all duration-300 ease-out"
        style={{
          height: height !== undefined ? `${height}px` : undefined,
          opacity: isExpanded ? 1 : 0,
        }}
        aria-hidden={!isExpanded}
      >
        <div className="px-4 pb-4 transform transition-transform duration-300 ease-out">
          {children}
        </div>
      </div>

      {/* 커스텀 CSS 애니메이션 */}
      <style jsx>{`
        @keyframes pulse-once {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}
