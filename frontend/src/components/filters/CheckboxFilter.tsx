"use client";

import { FilterOption } from "@/hooks/useJobFilters";
import { useState, useCallback, useMemo } from "react";

interface CheckboxFilterProps {
  options: FilterOption[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  maxVisible?: number;
  showSearch?: boolean;
}

export default function CheckboxFilter({
  options,
  selectedValues,
  onChange,
  maxVisible = 5,
  showSearch = false,
}: CheckboxFilterProps) {
  const [showAll, setShowAll] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // 성능 최적화: 콜백 함수들을 메모이제이션
  const handleCheckboxChange = useCallback(
    (value: string, checked: boolean) => {
      if (checked) {
        onChange([...selectedValues, value]);
      } else {
        onChange(selectedValues.filter((v) => v !== value));
      }
    },
    [selectedValues, onChange]
  );

  const handleSelectAll = useCallback(() => {
    if (selectedValues.length === options.length) {
      onChange([]);
    } else {
      onChange(options.map((opt) => opt.value));
    }
  }, [selectedValues.length, options, onChange]);

  const toggleShowAll = useCallback(() => {
    setShowAll((prev) => !prev);
  }, []);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(e.target.value);
    },
    []
  );

  // 성능 최적화: 필터링된 옵션을 메모이제이션
  const filteredOptions = useMemo(() => {
    if (!showSearch || !searchTerm.trim()) {
      return options;
    }

    const term = searchTerm.toLowerCase();
    return options.filter(
      (option) =>
        option.label.toLowerCase().includes(term) ||
        option.value.toLowerCase().includes(term)
    );
  }, [options, searchTerm, showSearch]);

  // 성능 최적화: 표시할 옵션들을 메모이제이션
  const visibleOptions = useMemo(() => {
    return showAll ? filteredOptions : filteredOptions.slice(0, maxVisible);
  }, [filteredOptions, showAll, maxVisible]);

  const hasMore = filteredOptions.length > maxVisible;
  const isAllSelected = selectedValues.length === options.length;

  return (
    <div className="space-y-3">
      {/* 검색 입력 */}
      {showSearch && options.length > 5 && (
        <div className="relative">
          <input
            type="text"
            placeholder="옵션 검색..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          />
          <svg
            className="absolute right-3 top-2.5 h-4 w-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      )}

      {/* 전체 선택/해제 */}
      {options.length > 1 && (
        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
          <button
            onClick={handleSelectAll}
            className="text-sm text-blue-600 hover:text-blue-700 active:text-blue-800 font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded px-1"
            type="button"
          >
            {isAllSelected ? "전체 해제" : "전체 선택"}
          </button>
          <span className="text-xs text-gray-500 transition-all duration-200">
            <span
              className={`${
                selectedValues.length > 0 ? "text-blue-600 font-medium" : ""
              }`}
            >
              {selectedValues.length}
            </span>
            /{options.length}개 선택
          </span>
        </div>
      )}

      {/* 옵션 목록 */}
      <div className="space-y-1 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        {visibleOptions.map((option, index) => {
          const isSelected = selectedValues.includes(option.value);
          return (
            <label
              key={option.value}
              className="flex items-center gap-3 p-3 md:p-2 rounded-md hover:bg-gray-50 active:bg-gray-100 cursor-pointer transition-all duration-150 ease-out transform hover:scale-[1.01] active:scale-[0.99] touch-manipulation group"
              style={{
                animationDelay: `${index * 20}ms`,
                animation: "fadeInUp 0.3s ease-out forwards",
              }}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={(e) =>
                  handleCheckboxChange(option.value, e.target.checked)
                }
                className="w-5 h-5 md:w-4 md:h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 transition-all duration-150"
              />
              <div className="flex-1 min-w-0">
                <span
                  className={`text-sm md:text-sm truncate block transition-colors duration-150 ${
                    isSelected ? "text-blue-900 font-medium" : "text-gray-900"
                  }`}
                >
                  {option.label}
                </span>
              </div>
              <span
                className={`text-xs px-2 py-1 rounded-full transition-all duration-150 ${
                  isSelected
                    ? "text-blue-700 bg-blue-100"
                    : "text-gray-500 bg-gray-100 group-hover:bg-gray-200"
                }`}
              >
                {option.count.toLocaleString()}
              </span>
            </label>
          );
        })}
      </div>

      {/* 더보기/접기 버튼 */}
      {hasMore && (
        <button
          onClick={toggleShowAll}
          className="w-full text-sm text-blue-600 hover:text-blue-700 active:text-blue-800 py-3 md:py-2 text-center border-t border-gray-100 touch-manipulation transition-all duration-200 ease-out hover:bg-blue-50 active:bg-blue-100 rounded-b-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
          type="button"
        >
          {showAll ? (
            <>
              <svg
                className="inline w-4 h-4 mr-1 transition-transform duration-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 15l7-7 7 7"
                />
              </svg>
              접기
            </>
          ) : (
            <>
              <svg
                className="inline w-4 h-4 mr-1 transition-transform duration-200"
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
              +{filteredOptions.length - maxVisible}개 더보기
            </>
          )}
        </button>
      )}

      {/* 검색 결과가 없을 때 */}
      {showSearch && searchTerm && filteredOptions.length === 0 && (
        <div className="text-center py-4 text-gray-500 text-sm">
          <svg
            className="mx-auto h-8 w-8 text-gray-400 mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          "{searchTerm}"에 대한 결과가 없습니다
        </div>
      )}

      {/* 커스텀 CSS 애니메이션 */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }

        .scrollbar-thumb-gray-300::-webkit-scrollbar-thumb {
          background-color: #d1d5db;
          border-radius: 3px;
        }

        .scrollbar-track-gray-100::-webkit-scrollbar-track {
          background-color: #f3f4f6;
          border-radius: 3px;
        }
      `}</style>
    </div>
  );
}
