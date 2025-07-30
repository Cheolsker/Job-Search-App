import { renderHook, act } from "@testing-library/react";
import { useJobFilters } from "../useJobFilters";
import { it } from "node:test";
import { it } from "node:test";
import { it } from "node:test";
import { it } from "node:test";
import { it } from "node:test";
import { it } from "node:test";
import { it } from "node:test";
import { it } from "node:test";
import { it } from "node:test";
import { it } from "node:test";
import { it } from "node:test";
import { it } from "node:test";
import { it } from "node:test";
import { it } from "node:test";
import { it } from "node:test";
import { it } from "node:test";
import { it } from "node:test";
import { it } from "node:test";
import { it } from "node:test";
import { it } from "node:test";
import { describe } from "node:test";

// Mock job data for testing
const mockJobs = [
  {
    id: "1",
    title: "프론트엔드 개발자",
    company: "테크 스타트업",
    location: "서울",
    category: "개발",
    postedDate: "2025-07-15",
    salary: "4,000만원 ~ 6,000만원",
    experience: "3년 이상",
    source: "wanted",
    sourceUrl: "#",
    contractType: "정규직",
  },
  {
    id: "2",
    title: "백엔드 개발자",
    company: "소프트웨어 회사",
    location: "경기",
    category: "개발",
    postedDate: "2025-07-16",
    salary: "4,500만원 ~ 7,000만원",
    experience: "5년 이상",
    source: "jumpit",
    sourceUrl: "#",
    contractType: "정규직",
  },
  {
    id: "3",
    title: "마케팅 매니저",
    company: "이커머스 기업",
    location: "서울",
    category: "마케팅·광고",
    postedDate: "2025-07-17",
    // salary 없음
    experience: "3년 이상",
    source: "wanted",
    sourceUrl: "#",
    // contractType 없음
  },
  {
    id: "4",
    title: "신입 개발자",
    company: "스타트업",
    location: "부산",
    category: "개발",
    postedDate: "2025-07-18",
    salary: "3,000만원 ~ 4,000만원",
    // experience 없음 (경력 무관으로 처리)
    source: "jumpit",
    sourceUrl: "#",
    contractType: "계약직",
  },
];

describe("useJobFilters", () => {
  it("should initialize with empty filters and return all jobs", () => {
    const { result } = renderHook(() => useJobFilters(mockJobs));

    expect(result.current.filters).toEqual({
      locations: [],
      experiences: [],
      categories: [],
      contractTypes: [],
      sources: [],
      hasSalary: null,
    });
    expect(result.current.filteredJobs).toHaveLength(4);
    expect(result.current.hasActiveFilters).toBe(false);
    expect(result.current.activeFilterCount).toBe(0);
  });

  it("should generate correct filter options", () => {
    const { result } = renderHook(() => useJobFilters(mockJobs));

    // 위치 옵션 확인 (서울이 2개로 가장 많음)
    expect(result.current.filterOptions.locations).toEqual([
      { value: "서울", label: "서울", count: 2 },
      { value: "경기", label: "경기", count: 1 },
      { value: "부산", label: "부산", count: 1 },
    ]);

    // 경력 옵션 확인 (경력 무관 포함)
    expect(result.current.filterOptions.experiences).toEqual([
      { value: "3년 이상", label: "3년 이상", count: 2 },
      { value: "5년 이상", label: "5년 이상", count: 1 },
      { value: "경력 무관", label: "경력 무관", count: 1 },
    ]);

    // 카테고리 옵션 확인
    expect(result.current.filterOptions.categories).toEqual([
      { value: "개발", label: "개발", count: 3 },
      { value: "마케팅·광고", label: "마케팅·광고", count: 1 },
    ]);

    // 계약 형태 옵션 확인 (정보 없음 포함)
    expect(result.current.filterOptions.contractTypes).toEqual([
      { value: "정규직", label: "정규직", count: 2 },
      { value: "계약직", label: "계약직", count: 1 },
      { value: "정보 없음", label: "정보 없음", count: 1 },
    ]);

    // 출처 옵션 확인 (같은 개수일 때는 알파벳 순)
    expect(result.current.filterOptions.sources).toEqual([
      { value: "jumpit", label: "jumpit", count: 2 },
      { value: "wanted", label: "wanted", count: 2 },
    ]);
  });

  it("should filter jobs by location", () => {
    const { result } = renderHook(() => useJobFilters(mockJobs));

    act(() => {
      result.current.updateLocationFilter(["서울"]);
    });

    expect(result.current.filteredJobs).toHaveLength(2);
    expect(
      result.current.filteredJobs.every((job) => job.location === "서울")
    ).toBe(true);
    expect(result.current.hasActiveFilters).toBe(true);
    expect(result.current.activeFilterCount).toBe(1);
  });

  it("should filter jobs by multiple locations", () => {
    const { result } = renderHook(() => useJobFilters(mockJobs));

    act(() => {
      result.current.updateLocationFilter(["서울", "경기"]);
    });

    expect(result.current.filteredJobs).toHaveLength(3);
    expect(
      result.current.filteredJobs.every(
        (job) => job.location === "서울" || job.location === "경기"
      )
    ).toBe(true);
  });

  it("should filter jobs by experience", () => {
    const { result } = renderHook(() => useJobFilters(mockJobs));

    act(() => {
      result.current.updateExperienceFilter(["경력 무관"]);
    });

    expect(result.current.filteredJobs).toHaveLength(1);
    expect(result.current.filteredJobs[0].id).toBe("4");
  });

  it("should filter jobs by salary availability", () => {
    const { result } = renderHook(() => useJobFilters(mockJobs));

    // 연봉 정보 있는 것만
    act(() => {
      result.current.updateSalaryFilter(true);
    });

    expect(result.current.filteredJobs).toHaveLength(3);
    expect(result.current.filteredJobs.every((job) => job.salary)).toBe(true);

    // 연봉 정보 없는 것만
    act(() => {
      result.current.updateSalaryFilter(false);
    });

    expect(result.current.filteredJobs).toHaveLength(1);
    expect(result.current.filteredJobs[0].id).toBe("3");
  });

  it("should apply multiple filters simultaneously", () => {
    const { result } = renderHook(() => useJobFilters(mockJobs));

    act(() => {
      result.current.updateLocationFilter(["서울"]);
      result.current.updateCategoryFilter(["개발"]);
      result.current.updateSalaryFilter(true);
    });

    expect(result.current.filteredJobs).toHaveLength(1);
    expect(result.current.filteredJobs[0].id).toBe("1");
    expect(result.current.activeFilterCount).toBe(3);
  });

  it("should remove individual filters", () => {
    const { result } = renderHook(() => useJobFilters(mockJobs));

    // 필터 적용
    act(() => {
      result.current.updateLocationFilter(["서울", "경기"]);
      result.current.updateCategoryFilter(["개발"]);
    });

    expect(result.current.activeFilterCount).toBe(2);

    // 개별 필터 제거
    act(() => {
      result.current.removeFilter("locations", "서울");
    });

    expect(result.current.filters.locations).toEqual(["경기"]);
    expect(result.current.activeFilterCount).toBe(2); // 여전히 경기와 개발 필터 활성
  });

  it("should clear all filters", () => {
    const { result } = renderHook(() => useJobFilters(mockJobs));

    // 여러 필터 적용
    act(() => {
      result.current.updateLocationFilter(["서울"]);
      result.current.updateCategoryFilter(["개발"]);
      result.current.updateSalaryFilter(true);
    });

    expect(result.current.activeFilterCount).toBe(3);

    // 전체 초기화
    act(() => {
      result.current.clearAllFilters();
    });

    expect(result.current.filters).toEqual({
      locations: [],
      experiences: [],
      categories: [],
      contractTypes: [],
      sources: [],
      hasSalary: null,
    });
    expect(result.current.filteredJobs).toHaveLength(4);
    expect(result.current.hasActiveFilters).toBe(false);
    expect(result.current.activeFilterCount).toBe(0);
  });

  it("should handle empty job array", () => {
    const { result } = renderHook(() => useJobFilters([]));

    expect(result.current.filteredJobs).toHaveLength(0);
    expect(result.current.filterOptions.locations).toHaveLength(0);
    expect(result.current.filterOptions.experiences).toHaveLength(0);
    expect(result.current.filterOptions.categories).toHaveLength(0);
    expect(result.current.filterOptions.contractTypes).toHaveLength(0);
    expect(result.current.filterOptions.sources).toHaveLength(0);
  });

  it("should handle jobs with missing optional fields", () => {
    const jobsWithMissingFields = [
      {
        id: "1",
        title: "개발자",
        company: "회사",
        location: "서울",
        category: "개발",
        postedDate: "2025-07-15",
        // salary, experience, source, contractType 모두 없음
      },
    ];

    const { result } = renderHook(() => useJobFilters(jobsWithMissingFields));

    // 경력 무관과 정보 없음으로 처리되어야 함
    expect(result.current.filterOptions.experiences).toEqual([
      { value: "경력 무관", label: "경력 무관", count: 1 },
    ]);
    expect(result.current.filterOptions.contractTypes).toEqual([
      { value: "정보 없음", label: "정보 없음", count: 1 },
    ]);
    expect(result.current.filterOptions.sources).toHaveLength(0); // source가 없으면 제외
  });

  // Additional tests for filter validation and error handling
  it("should validate filters and handle invalid filter values", () => {
    const { result } = renderHook(() => useJobFilters(mockJobs));

    // Apply invalid filters using applyFilters
    act(() => {
      result.current.applyFilters({
        locations: ["서울", "invalid-location"],
        experiences: ["3년 이상", "invalid-experience"],
        categories: ["개발"],
        contractTypes: [],
        sources: [],
        hasSalary: null,
      });
    });

    // Should filter out invalid values
    expect(result.current.filters.locations).toEqual(["서울"]);
    expect(result.current.filters.experiences).toEqual(["3년 이상"]);
    expect(result.current.hasFilterValidationErrors).toBe(true);
    expect(result.current.filterErrors).toContain(
      "유효하지 않은 위치 필터: invalid-location"
    );
    expect(result.current.filterErrors).toContain(
      "유효하지 않은 경력 필터: invalid-experience"
    );
  });

  it("should handle filter validation errors gracefully", () => {
    const { result } = renderHook(() => useJobFilters(mockJobs));

    // Apply filters with invalid salary value
    act(() => {
      result.current.applyFilters({
        locations: [],
        experiences: [],
        categories: [],
        contractTypes: [],
        sources: [],
        hasSalary: "invalid" as any, // Invalid type
      });
    });

    expect(result.current.filters.hasSalary).toBe(null);
    expect(result.current.hasFilterValidationErrors).toBe(true);
  });

  it("should clear filter errors", () => {
    const { result } = renderHook(() => useJobFilters(mockJobs));

    // Create some errors first
    act(() => {
      result.current.applyFilters({
        locations: ["invalid-location"],
        experiences: [],
        categories: [],
        contractTypes: [],
        sources: [],
        hasSalary: null,
      });
    });

    expect(result.current.hasFilterValidationErrors).toBe(true);

    // Clear errors
    act(() => {
      result.current.clearFilterErrors();
    });

    expect(result.current.hasFilterValidationErrors).toBe(false);
    expect(result.current.filterErrors).toHaveLength(0);
  });

  it("should handle contract type filter correctly", () => {
    const { result } = renderHook(() => useJobFilters(mockJobs));

    act(() => {
      result.current.updateContractTypeFilter(["정보 없음"]);
    });

    expect(result.current.filteredJobs).toHaveLength(1);
    expect(result.current.filteredJobs[0].id).toBe("3"); // Job without contractType
  });

  it("should handle source filter correctly", () => {
    const { result } = renderHook(() => useJobFilters(mockJobs));

    act(() => {
      result.current.updateSourceFilter(["wanted"]);
    });

    expect(result.current.filteredJobs).toHaveLength(2);
    expect(
      result.current.filteredJobs.every((job) => job.source === "wanted")
    ).toBe(true);
  });

  it("should handle category filter correctly", () => {
    const { result } = renderHook(() => useJobFilters(mockJobs));

    act(() => {
      result.current.updateCategoryFilter(["마케팅·광고"]);
    });

    expect(result.current.filteredJobs).toHaveLength(1);
    expect(result.current.filteredJobs[0].category).toBe("마케팅·광고");
  });

  it("should handle salary filter removal correctly", () => {
    const { result } = renderHook(() => useJobFilters(mockJobs));

    // Apply salary filter
    act(() => {
      result.current.updateSalaryFilter(true);
    });

    expect(result.current.activeFilterCount).toBe(1);

    // Remove salary filter
    act(() => {
      result.current.removeFilter("hasSalary", "");
    });

    expect(result.current.filters.hasSalary).toBe(null);
    expect(result.current.activeFilterCount).toBe(0);
  });

  it("should handle large datasets efficiently", () => {
    // Create a large dataset
    const largeJobSet = Array.from({ length: 1000 }, (_, i) => ({
      id: `job-${i}`,
      title: `Job ${i}`,
      company: `Company ${i % 10}`,
      location: i % 2 === 0 ? "서울" : "경기",
      category: i % 3 === 0 ? "개발" : "마케팅·광고",
      postedDate: "2025-07-15",
      salary: i % 4 === 0 ? "4,000만원" : undefined,
      experience: i % 5 === 0 ? "3년 이상" : undefined,
      source: i % 2 === 0 ? "wanted" : "jumpit",
      contractType: i % 3 === 0 ? "정규직" : undefined,
    }));

    const { result } = renderHook(() => useJobFilters(largeJobSet));

    // Apply multiple filters
    const startTime = performance.now();
    act(() => {
      result.current.updateLocationFilter(["서울"]);
      result.current.updateCategoryFilter(["개발"]);
    });
    const endTime = performance.now();

    // Should complete within reasonable time (less than 100ms)
    expect(endTime - startTime).toBeLessThan(100);
    expect(result.current.filteredJobs.length).toBeGreaterThan(0);
  });

  it("should maintain filter state consistency", () => {
    const { result } = renderHook(() => useJobFilters(mockJobs));

    // Apply filters in sequence
    act(() => {
      result.current.updateLocationFilter(["서울"]);
    });

    act(() => {
      result.current.updateCategoryFilter(["개발"]);
    });

    act(() => {
      result.current.updateExperienceFilter(["3년 이상"]);
    });

    // Check that all filters are maintained
    expect(result.current.filters.locations).toEqual(["서울"]);
    expect(result.current.filters.categories).toEqual(["개발"]);
    expect(result.current.filters.experiences).toEqual(["3년 이상"]);
    expect(result.current.activeFilterCount).toBe(3);
  });
});
