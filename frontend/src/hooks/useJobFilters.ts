import { useState, useMemo, useCallback } from "react";
import {
  performanceMonitor,
  withPerformanceTracking,
} from "@/utils/performanceMonitor";

// Job interface based on the current implementation
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

// Filter state interface
export interface FilterState {
  locations: string[];
  experiences: string[];
  categories: string[];
  contractTypes: string[];
  sources: string[];
  hasSalary: boolean | null; // true: 연봉정보 있음, false: 없음, null: 전체
}

// Filter option interface
export interface FilterOption {
  value: string;
  label: string;
  count: number;
}

// Filter options collection
export interface FilterOptions {
  locations: FilterOption[];
  experiences: FilterOption[];
  categories: FilterOption[];
  contractTypes: FilterOption[];
  sources: FilterOption[];
}

// Initial filter state
const initialFilterState: FilterState = {
  locations: [],
  experiences: [],
  categories: [],
  contractTypes: [],
  sources: [],
  hasSalary: null,
};

/**
 * 필터 옵션을 자동 생성하는 함수 (성능 최적화)
 * @param jobs - 채용공고 배열
 * @param field - 필터링할 필드명
 * @returns FilterOption 배열
 */
const generateFilterOptions = withPerformanceTracking(
  "generateFilterOptions",
  (jobs: Job[], field: keyof Job): FilterOption[] => {
    // 대량 데이터 처리를 위한 최적화: Map 사용으로 O(n) 시간복잡도 보장
    const counts = new Map<string, number>();

    // 배치 처리로 성능 향상
    const batchSize = 1000;
    for (let i = 0; i < jobs.length; i += batchSize) {
      const batch = jobs.slice(i, i + batchSize);

      batch.forEach((job) => {
        let value = job[field] as string;

        // 빈 값 처리 최적화
        if (!value || value.trim() === "") {
          if (field === "experience") {
            value = "경력 무관";
          } else if (field === "contractType") {
            value = "정보 없음";
          } else {
            return; // 다른 필드는 빈 값 제외
          }
        }

        counts.set(value, (counts.get(value) || 0) + 1);
      });
    }

    // 정렬 최적화: 한 번에 변환하고 정렬 (개수 순, 같으면 이름 순)
    return Array.from(counts.entries())
      .map(([value, count]) => ({ value, label: value, count }))
      .sort((a, b) => {
        if (b.count !== a.count) {
          return b.count - a.count; // 개수 순으로 정렬
        }
        return a.value.localeCompare(b.value); // 같은 개수면 이름 순
      });
  }
);

/**
 * 필터 상태를 검증하는 함수
 * @param filters - 검증할 필터 상태
 * @param availableOptions - 사용 가능한 필터 옵션들
 * @returns 검증된 필터 상태와 검증 결과
 */
const validateFilters = (
  filters: FilterState,
  availableOptions: FilterOptions
): {
  validatedFilters: FilterState;
  hasInvalidFilters: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  let hasInvalidFilters = false;

  // 각 필터 타입별 검증
  const validatedLocations = filters.locations.filter((loc) => {
    const isValid = availableOptions.locations.some((opt) => opt.value === loc);
    if (!isValid) {
      errors.push(`유효하지 않은 위치 필터: ${loc}`);
      hasInvalidFilters = true;
    }
    return isValid;
  });

  const validatedExperiences = filters.experiences.filter((exp) => {
    const isValid = availableOptions.experiences.some(
      (opt) => opt.value === exp
    );
    if (!isValid) {
      errors.push(`유효하지 않은 경력 필터: ${exp}`);
      hasInvalidFilters = true;
    }
    return isValid;
  });

  const validatedCategories = filters.categories.filter((cat) => {
    const isValid = availableOptions.categories.some(
      (opt) => opt.value === cat
    );
    if (!isValid) {
      errors.push(`유효하지 않은 카테고리 필터: ${cat}`);
      hasInvalidFilters = true;
    }
    return isValid;
  });

  const validatedContractTypes = filters.contractTypes.filter((type) => {
    const isValid = availableOptions.contractTypes.some(
      (opt) => opt.value === type
    );
    if (!isValid) {
      errors.push(`유효하지 않은 계약형태 필터: ${type}`);
      hasInvalidFilters = true;
    }
    return isValid;
  });

  const validatedSources = filters.sources.filter((src) => {
    const isValid = availableOptions.sources.some((opt) => opt.value === src);
    if (!isValid) {
      errors.push(`유효하지 않은 출처 필터: ${src}`);
      hasInvalidFilters = true;
    }
    return isValid;
  });

  // 연봉 필터 검증 (boolean 또는 null만 허용)
  let validatedHasSalary = filters.hasSalary;
  if (filters.hasSalary !== null && typeof filters.hasSalary !== "boolean") {
    errors.push(`유효하지 않은 연봉 필터 값: ${filters.hasSalary}`);
    validatedHasSalary = null;
    hasInvalidFilters = true;
  }

  const validatedFilters: FilterState = {
    locations: validatedLocations,
    experiences: validatedExperiences,
    categories: validatedCategories,
    contractTypes: validatedContractTypes,
    sources: validatedSources,
    hasSalary: validatedHasSalary,
  };

  return {
    validatedFilters,
    hasInvalidFilters,
    errors,
  };
};

/**
 * 채용공고 필터링을 위한 커스텀 훅
 * @param jobs - 전체 채용공고 배열
 * @returns 필터 상태, 필터링된 결과, 필터 옵션들, 필터 조작 함수들
 */
export const useJobFilters = (jobs: Job[]) => {
  const [filters, setFilters] = useState<FilterState>(initialFilterState);
  const [filterErrors, setFilterErrors] = useState<string[]>([]);
  const [hasFilterValidationErrors, setHasFilterValidationErrors] =
    useState(false);

  // 필터 옵션들을 메모이제이션하여 성능 최적화
  const filterOptions = useMemo<FilterOptions>(() => {
    return {
      locations: generateFilterOptions(jobs, "location"),
      experiences: generateFilterOptions(jobs, "experience"),
      categories: generateFilterOptions(jobs, "category"),
      contractTypes: generateFilterOptions(jobs, "contractType"),
      sources: generateFilterOptions(jobs, "source"),
    };
  }, [jobs]);

  // 필터링 로직을 메모이제이션하여 성능 최적화 (대량 데이터 처리 개선)
  const filteredJobs = useMemo(() => {
    const endTiming = performanceMonitor.startTiming("filterJobs");

    try {
      // 필터가 없으면 원본 배열 반환 (성능 최적화)
      const hasAnyFilter =
        filters.locations.length > 0 ||
        filters.experiences.length > 0 ||
        filters.categories.length > 0 ||
        filters.contractTypes.length > 0 ||
        filters.sources.length > 0 ||
        filters.hasSalary !== null;

      if (!hasAnyFilter) {
        endTiming(jobs.length);
        return jobs;
      }

      // Set을 사용하여 includes 연산 최적화 (O(1) 조회)
      const locationSet = new Set(filters.locations);
      const experienceSet = new Set(filters.experiences);
      const categorySet = new Set(filters.categories);
      const contractTypeSet = new Set(filters.contractTypes);
      const sourceSet = new Set(filters.sources);

      // 대량 데이터 처리를 위한 배치 필터링
      const batchSize = 1000;
      const result: Job[] = [];

      for (let i = 0; i < jobs.length; i += batchSize) {
        const batch = jobs.slice(i, i + batchSize);

        const filteredBatch = batch.filter((job) => {
          // 위치 필터 (Set 사용으로 O(1) 조회)
          if (locationSet.size > 0 && !locationSet.has(job.location)) {
            return false;
          }

          // 경력 필터
          if (experienceSet.size > 0) {
            const jobExperience = job.experience || "경력 무관";
            if (!experienceSet.has(jobExperience)) {
              return false;
            }
          }

          // 카테고리 필터
          if (categorySet.size > 0 && !categorySet.has(job.category)) {
            return false;
          }

          // 계약 형태 필터
          if (contractTypeSet.size > 0) {
            const jobContractType = job.contractType || "정보 없음";
            if (!contractTypeSet.has(jobContractType)) {
              return false;
            }
          }

          // 출처 필터
          if (sourceSet.size > 0) {
            if (!job.source || !sourceSet.has(job.source)) {
              return false;
            }
          }

          // 연봉 정보 필터
          if (filters.hasSalary !== null) {
            const hasSalaryInfo = Boolean(
              job.salary && job.salary.trim() !== ""
            );
            if (filters.hasSalary !== hasSalaryInfo) {
              return false;
            }
          }

          return true;
        });

        result.push(...filteredBatch);
      }

      endTiming(result.length);
      return result;
    } catch (error) {
      endTiming(0);
      console.error("Error during filtering:", error);
      return jobs; // Fallback to original jobs on error
    }
  }, [jobs, filters]);

  // 필터 적용 함수 (콜백으로 최적화)
  const applyFilters = useCallback(
    (newFilters: FilterState) => {
      try {
        // 필터 상태 검증
        const { validatedFilters, hasInvalidFilters, errors } = validateFilters(
          newFilters,
          filterOptions
        );

        // 검증 결과 상태 업데이트
        setHasFilterValidationErrors(hasInvalidFilters);
        setFilterErrors(errors);

        // 검증된 필터 적용
        setFilters(validatedFilters);

        // 에러가 있으면 콘솔에 경고 출력
        if (hasInvalidFilters) {
          console.warn("Filter validation errors:", errors);
        }
      } catch (error) {
        console.error("Error applying filters:", error);
        setFilterErrors(["필터 적용 중 오류가 발생했습니다."]);
        setHasFilterValidationErrors(true);
      }
    },
    [filterOptions]
  );

  // 개별 필터 업데이트 함수들
  const updateLocationFilter = useCallback((locations: string[]) => {
    setFilters((prev) => ({ ...prev, locations }));
  }, []);

  const updateExperienceFilter = useCallback((experiences: string[]) => {
    setFilters((prev) => ({ ...prev, experiences }));
  }, []);

  const updateCategoryFilter = useCallback((categories: string[]) => {
    setFilters((prev) => ({ ...prev, categories }));
  }, []);

  const updateContractTypeFilter = useCallback((contractTypes: string[]) => {
    setFilters((prev) => ({ ...prev, contractTypes }));
  }, []);

  const updateSourceFilter = useCallback((sources: string[]) => {
    setFilters((prev) => ({ ...prev, sources }));
  }, []);

  const updateSalaryFilter = useCallback((hasSalary: boolean | null) => {
    setFilters((prev) => ({ ...prev, hasSalary }));
  }, []);

  // 개별 필터 제거 함수
  const removeFilter = useCallback(
    (filterType: keyof FilterState, value: string) => {
      setFilters((prev) => {
        const newFilters = { ...prev };

        if (filterType === "hasSalary") {
          newFilters.hasSalary = null;
        } else {
          const currentValues = newFilters[filterType] as string[];
          (newFilters[filterType] as string[]) = currentValues.filter(
            (v) => v !== value
          );
        }

        return newFilters;
      });
    },
    []
  );

  // 전체 필터 초기화 함수
  const clearAllFilters = useCallback(() => {
    setFilters(initialFilterState);
    setFilterErrors([]);
    setHasFilterValidationErrors(false);
  }, []);

  // 필터 에러 초기화 함수
  const clearFilterErrors = useCallback(() => {
    setFilterErrors([]);
    setHasFilterValidationErrors(false);
  }, []);

  // 활성 필터 개수 계산 (필터 타입별로 카운트, 개별 값이 아님)
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.locations.length > 0) count += 1;
    if (filters.experiences.length > 0) count += 1;
    if (filters.categories.length > 0) count += 1;
    if (filters.contractTypes.length > 0) count += 1;
    if (filters.sources.length > 0) count += 1;
    if (filters.hasSalary !== null) count += 1;
    return count;
  }, [filters]);

  // 필터가 적용되었는지 확인
  const hasActiveFilters = useMemo(() => {
    return activeFilterCount > 0;
  }, [activeFilterCount]);

  return {
    // 상태
    filters,
    filteredJobs,
    filterOptions,
    activeFilterCount,
    hasActiveFilters,

    // 에러 상태
    filterErrors,
    hasFilterValidationErrors,

    // 필터 조작 함수들
    applyFilters,
    updateLocationFilter,
    updateExperienceFilter,
    updateCategoryFilter,
    updateContractTypeFilter,
    updateSourceFilter,
    updateSalaryFilter,
    removeFilter,
    clearAllFilters,
    clearFilterErrors,
  };
};
