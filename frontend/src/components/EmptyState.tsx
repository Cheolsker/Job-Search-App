"use client";

import React from "react";

interface EmptyStateProps {
  type: "no-search" | "no-results" | "no-filter-results" | "error";
  title?: string;
  description?: string;
  icon?: string;
  onReset?: () => void;
  resetButtonText?: string;
}

export default function EmptyState({
  type,
  title,
  description,
  icon,
  onReset,
  resetButtonText = "다시 시도",
}: EmptyStateProps) {
  // 타입별 기본 설정
  const getDefaultContent = () => {
    switch (type) {
      case "no-search":
        return {
          icon: "🔍",
          title: "검색어를 입력해주세요",
          description: "원하는 직무, 회사, 키워드를 검색해보세요",
        };
      case "no-results":
        return {
          icon: "😔",
          title: "검색 결과가 없습니다",
          description: "다른 키워드로 검색해보세요",
        };
      case "no-filter-results":
        return {
          icon: "🔍",
          title: "조건에 맞는 채용공고가 없습니다",
          description: "필터 조건을 조정해보세요",
        };
      case "error":
        return {
          icon: "⚠️",
          title: "오류가 발생했습니다",
          description: "잠시 후 다시 시도해주세요",
        };
      default:
        return {
          icon: "🔍",
          title: "결과가 없습니다",
          description: "다른 조건으로 시도해보세요",
        };
    }
  };

  const defaultContent = getDefaultContent();
  const displayIcon = icon || defaultContent.icon;
  const displayTitle = title || defaultContent.title;
  const displayDescription = description || defaultContent.description;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8 text-center">
      {/* 아이콘 */}
      <div className="text-4xl sm:text-5xl mb-4" role="img" aria-hidden="true">
        {displayIcon}
      </div>

      {/* 제목 */}
      <h3 className="text-gray-600 text-base sm:text-lg font-medium mb-2">
        {displayTitle}
      </h3>

      {/* 설명 */}
      <p className="text-gray-500 text-sm sm:text-base mb-4">
        {displayDescription}
      </p>

      {/* 액션 버튼 (선택적) */}
      {onReset && (
        <button
          onClick={onReset}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 active:scale-95"
        >
          {resetButtonText}
        </button>
      )}
    </div>
  );
}
