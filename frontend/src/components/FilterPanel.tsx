"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useJobFilters } from "@/hooks/useJobFilters";
import LocationFilter from "./filters/LocationFilter";
import ExperienceFilter from "./filters/ExperienceFilter";
import CategoryFilter from "./filters/CategoryFilter";
import ContractTypeFilter from "./filters/ContractTypeFilter";
import SourceFilter from "./filters/SourceFilter";
import SalaryFilter from "./filters/SalaryFilter";
import ActiveFilters from "./ActiveFilters";
import styles from "./FilterPanel.module.css";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  category: string;
  postedDate: string;
  salary?: string;
  experience?: string;
  source?: string;
  sourceUrl?: string;
  imageUrl?: string;
  contractType?: string;
}

interface FilterPanelProps {
  jobs: Job[];
  onFilteredJobsChange: (filteredJobs: Job[]) => void;
  className?: string;
  isMobile?: boolean;
}

export default function FilterPanel({
  jobs,
  onFilteredJobsChange,
  className = "",
  isMobile = false,
}: FilterPanelProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(isMobile);

  const {
    filters,
    filteredJobs,
    filterOptions,
    hasActiveFilters,
    filterErrors,
    hasFilterValidationErrors,
    updateLocationFilter,
    updateExperienceFilter,
    updateCategoryFilter,
    updateContractTypeFilter,
    updateSourceFilter,
    updateSalaryFilter,
    removeFilter,
    clearAllFilters,
    clearFilterErrors,
  } = useJobFilters(jobs);

  // 화면 크기 감지
  useEffect(() => {
    const checkMobile = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // 필터링된 결과가 변경될 때마다 부모 컴포넌트에 알림 (성능 최적화: debounce 적용)
  React.useEffect(() => {
    // 대량 데이터 처리 시 성능 향상을 위한 debounce
    const timeoutId = setTimeout(() => {
      onFilteredJobsChange(filteredJobs);
    }, 50); // 50ms debounce

    return () => clearTimeout(timeoutId);
  }, [filteredJobs, onFilteredJobsChange]);

  // 모달 외부 클릭 시 닫기
  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isModalOpen) {
        setIsModalOpen(false);
      }
    };

    if (isModalOpen) {
      document.addEventListener("keydown", handleEscKey);
      // 모달이 열릴 때 body 스크롤 방지
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscKey);
      document.body.style.overflow = "unset";
    };
  }, [isModalOpen]);

  // 필터 컨텐츠 컴포넌트
  const FilterContent = () => (
    <div className="space-y-3">
      {/* 필터 에러 표시 */}
      {hasFilterValidationErrors && filterErrors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h4 className="text-sm font-medium text-red-800">
                필터 오류가 발생했습니다
              </h4>
              <div className="mt-1 text-sm text-red-700">
                <ul className="list-disc list-inside space-y-1">
                  {filterErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
              <div className="mt-2">
                <button
                  onClick={clearFilterErrors}
                  className="text-sm text-red-800 hover:text-red-900 underline focus:outline-none"
                >
                  오류 무시하기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 위치 필터 */}
      {filterOptions.locations.length > 0 && (
        <LocationFilter
          options={filterOptions.locations}
          selectedValues={filters.locations}
          onChange={updateLocationFilter}
        />
      )}

      {/* 경력 필터 */}
      {filterOptions.experiences.length > 0 && (
        <ExperienceFilter
          options={filterOptions.experiences}
          selectedValues={filters.experiences}
          onChange={updateExperienceFilter}
        />
      )}

      {/* 카테고리 필터 */}
      {filterOptions.categories.length > 0 && (
        <CategoryFilter
          options={filterOptions.categories}
          selectedValues={filters.categories}
          onChange={updateCategoryFilter}
        />
      )}

      {/* 연봉 필터 */}
      <SalaryFilter
        hasSalary={filters.hasSalary}
        onChange={updateSalaryFilter}
      />

      {/* 계약 형태 필터 */}
      {filterOptions.contractTypes.length > 0 && (
        <ContractTypeFilter
          options={filterOptions.contractTypes}
          selectedValues={filters.contractTypes}
          onChange={updateContractTypeFilter}
        />
      )}

      {/* 출처 필터 */}
      {filterOptions.sources.length > 0 && (
        <SourceFilter
          options={filterOptions.sources}
          selectedValues={filters.sources}
          onChange={updateSourceFilter}
        />
      )}
    </div>
  );

  // 모바일 뷰
  if (isMobileView) {
    return (
      <>
        {/* 모바일 필터 버튼 및 활성 필터 표시 */}
        <div className={`${className}`}>
          <div className="flex items-center justify-between gap-3 mb-4">
            {/* 필터 버튼 */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 active:scale-95"
            >
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z"
                />
              </svg>
              <span className="font-medium text-gray-700">필터</span>
              {hasActiveFilters && (
                <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full min-w-[20px] text-center">
                  {Object.values(filters).flat().filter(Boolean).length}
                </span>
              )}
            </button>

            {/* 결과 수 표시 */}
            <div className="text-sm text-gray-600">
              <span className="font-medium text-blue-600">
                {filteredJobs.length.toLocaleString()}
              </span>
              <span className="text-gray-500">
                /{jobs.length.toLocaleString()}건
              </span>
            </div>
          </div>

          {/* 활성 필터 표시 (모바일용 간소화) */}
          {hasActiveFilters && (
            <div className="mb-4">
              <ActiveFilters
                filters={filters}
                filteredCount={filteredJobs.length}
                totalCount={jobs.length}
                onRemoveFilter={removeFilter}
                onClearAll={clearAllFilters}
              />
            </div>
          )}
        </div>

        {/* 모바일 필터 모달 - 향상된 애니메이션 */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            {/* 배경 오버레이 - 부드러운 페이드인 */}
            <div
              className={`fixed inset-0 bg-black transition-opacity duration-300 ease-out ${styles.modalOverlay}`}
              onClick={handleModalClose}
            />

            {/* 모달 컨텐츠 - 하단에서 슬라이드업 애니메이션 */}
            <div
              className={`fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-2xl shadow-2xl max-h-[85vh] overflow-hidden ${styles.modalContent}`}
            >
              {/* 모달 핸들 바 */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 bg-gray-300 rounded-full"></div>
              </div>

              {/* 모달 헤더 */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
                <h3 className="text-lg font-semibold text-gray-900">필터</h3>
                <button
                  onClick={handleModalClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1"
                  type="button"
                  aria-label="필터 모달 닫기"
                >
                  <svg
                    className="w-6 h-6 text-gray-600"
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

              {/* 스크롤 가능한 필터 컨텐츠 - 부드러운 스크롤 */}
              <div
                className={`overflow-y-auto p-4 pb-20 scroll-smooth ${styles.customScrollbar}`}
              >
                <div className={styles.filterContent}>
                  <FilterContent />
                </div>
              </div>

              {/* 모달 하단 액션 버튼 - 그라데이션 배경 */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-transparent border-t border-gray-200 p-4">
                <div className="flex gap-3">
                  <button
                    onClick={clearAllFilters}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 active:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-200 active:scale-95 font-medium transform hover:scale-[1.02]"
                    type="button"
                  >
                    초기화
                  </button>
                  <button
                    onClick={handleModalClose}
                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 active:scale-95 font-medium transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
                    type="button"
                  >
                    <span className="flex items-center justify-center gap-2">
                      적용하기
                      <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                        {filteredJobs.length.toLocaleString()}건
                      </span>
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // 데스크톱 뷰 (기존 레이아웃)
  return (
    <div className={`space-y-4 ${className}`}>
      {/* 활성 필터 표시 */}
      {hasActiveFilters && (
        <ActiveFilters
          filters={filters}
          filteredCount={filteredJobs.length}
          totalCount={jobs.length}
          onRemoveFilter={removeFilter}
          onClearAll={clearAllFilters}
        />
      )}

      {/* 필터 섹션들 */}
      <FilterContent />

      {/* 필터 요약 정보 */}
      <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
        <div className="flex items-center justify-between">
          <span>전체 채용공고</span>
          <span className="font-medium">{jobs.length.toLocaleString()}건</span>
        </div>
        {hasActiveFilters && (
          <div className="flex items-center justify-between mt-1 pt-1 border-t border-gray-200">
            <span>필터 적용 결과</span>
            <span className="font-medium text-blue-600">
              {filteredJobs.length.toLocaleString()}건
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
