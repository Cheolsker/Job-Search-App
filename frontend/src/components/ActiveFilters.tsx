"use client";

import { FilterState } from "@/hooks/useJobFilters";

interface ActiveFiltersProps {
  filters: FilterState;
  filteredCount: number;
  totalCount: number;
  onRemoveFilter: (filterType: keyof FilterState, value: string) => void;
  onClearAll: () => void;
}

export default function ActiveFilters({
  filters,
  filteredCount,
  totalCount,
  onRemoveFilter,
  onClearAll,
}: ActiveFiltersProps) {
  // 활성 필터 태그들을 생성
  const getActiveFilterTags = () => {
    const tags: Array<{
      type: keyof FilterState;
      value: string;
      label: string;
      displayValue: string;
    }> = [];

    // 위치 필터
    filters.locations.forEach((location) => {
      tags.push({
        type: "locations",
        value: location,
        label: "위치",
        displayValue: location,
      });
    });

    // 경력 필터
    filters.experiences.forEach((experience) => {
      tags.push({
        type: "experiences",
        value: experience,
        label: "경력",
        displayValue: experience,
      });
    });

    // 카테고리 필터
    filters.categories.forEach((category) => {
      tags.push({
        type: "categories",
        value: category,
        label: "직무",
        displayValue: category,
      });
    });

    // 계약 형태 필터
    filters.contractTypes.forEach((contractType) => {
      tags.push({
        type: "contractTypes",
        value: contractType,
        label: "계약형태",
        displayValue: contractType,
      });
    });

    // 출처 필터
    filters.sources.forEach((source) => {
      const sourceLabel = getSourceLabel(source);
      tags.push({
        type: "sources",
        value: source,
        label: "출처",
        displayValue: sourceLabel,
      });
    });

    // 연봉 필터
    if (filters.hasSalary !== null) {
      tags.push({
        type: "hasSalary",
        value: filters.hasSalary.toString(),
        label: "연봉정보",
        displayValue: filters.hasSalary ? "연봉정보 있음" : "연봉정보 없음",
      });
    }

    return tags;
  };

  // 출처명 변환
  const getSourceLabel = (source: string) => {
    switch (source.toLowerCase()) {
      case "wanted":
        return "원티드";
      case "jumpit":
        return "점핏";
      case "jobkorea":
        return "잡코리아";
      case "saramin":
        return "사람인";
      default:
        return source;
    }
  };

  // 필터 타입별 색상 매핑
  const getFilterColor = (type: keyof FilterState) => {
    switch (type) {
      case "locations":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "experiences":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "categories":
        return "bg-green-100 text-green-800 border-green-200";
      case "contractTypes":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "sources":
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "hasSalary":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const activeFilterTags = getActiveFilterTags();
  const hasActiveFilters = activeFilterTags.length > 0;

  if (!hasActiveFilters) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-gray-900">적용된 필터</h3>
          <span className="text-sm text-gray-600">
            ({filteredCount.toLocaleString()}/{totalCount.toLocaleString()}건)
          </span>
        </div>

        <button
          onClick={onClearAll}
          className="text-sm text-red-600 hover:text-red-700 active:text-red-800 font-medium transition-colors touch-manipulation px-2 py-1 rounded"
        >
          전체 해제
        </button>
      </div>

      {/* 필터 태그들 */}
      <div className="flex flex-wrap gap-2">
        {activeFilterTags.map((tag, index) => (
          <div
            key={`${tag.type}-${tag.value}-${index}`}
            className={`inline-flex items-center gap-1.5 px-3 py-2 md:py-1.5 rounded-full text-xs font-medium border ${getFilterColor(
              tag.type
            )} transition-all duration-200`}
          >
            <span className="text-xs text-gray-500 font-normal">
              {tag.label}:
            </span>
            <span>{tag.displayValue}</span>
            <button
              onClick={() => onRemoveFilter(tag.type, tag.value)}
              className="ml-1 hover:bg-black/10 active:bg-black/20 rounded-full p-1 md:p-0.5 transition-colors touch-manipulation"
              aria-label={`${tag.displayValue} 필터 제거`}
            >
              <svg
                className="w-4 h-4 md:w-3 md:h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        ))}
      </div>

      {/* 결과 요약 */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            {activeFilterTags.length}개 필터 적용 중
          </span>
          <span className="font-medium text-gray-900">
            {filteredCount.toLocaleString()}건의 채용공고
          </span>
        </div>
      </div>
    </div>
  );
}
