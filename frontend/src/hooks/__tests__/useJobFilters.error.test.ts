import { renderHook, act } from "@testing-library/react";
import { useJobFilters } from "../useJobFilters";

const mockJobs = [
  {
    id: "1",
    title: "Frontend Developer",
    company: "Tech Corp",
    location: "서울",
    category: "개발",
    postedDate: "2025-01-01",
    salary: "4000만원",
    experience: "3년 이상",
    source: "wanted",
    contractType: "정규직",
  },
  {
    id: "2",
    title: "Backend Developer",
    company: "Software Inc",
    location: "경기",
    category: "개발",
    postedDate: "2025-01-02",
    experience: "5년 이상",
    source: "jumpit",
    contractType: "계약직",
  },
];

describe("useJobFilters - Error Handling", () => {
  it("should initialize with no errors", () => {
    const { result } = renderHook(() => useJobFilters(mockJobs));

    expect(result.current.filterErrors).toEqual([]);
    expect(result.current.hasFilterValidationErrors).toBe(false);
  });

  it("should validate filters and remove invalid options", () => {
    const { result } = renderHook(() => useJobFilters(mockJobs));

    // Apply filters with invalid values
    act(() => {
      result.current.applyFilters({
        locations: ["서울", "부산", "유효하지않은위치"], // '부산'과 '유효하지않은위치'는 유효하지 않음
        experiences: ["3년 이상", "유효하지않은경력"],
        categories: ["개발", "유효하지않은카테고리"],
        contractTypes: ["정규직", "유효하지않은계약형태"],
        sources: ["wanted", "유효하지않은출처"],
        hasSalary: null,
      });
    });

    // 유효하지 않은 필터들이 제거되어야 함
    expect(result.current.filters.locations).toEqual(["서울"]);
    expect(result.current.filters.experiences).toEqual(["3년 이상"]);
    expect(result.current.filters.categories).toEqual(["개발"]);
    expect(result.current.filters.contractTypes).toEqual(["정규직"]);
    expect(result.current.filters.sources).toEqual(["wanted"]);

    // 에러 상태가 설정되어야 함
    expect(result.current.hasFilterValidationErrors).toBe(true);
    expect(result.current.filterErrors.length).toBeGreaterThan(0);
  });

  it("should clear filter errors", () => {
    const { result } = renderHook(() => useJobFilters(mockJobs));

    // Apply invalid filters to generate errors
    act(() => {
      result.current.applyFilters({
        locations: ["유효하지않은위치"],
        experiences: [],
        categories: [],
        contractTypes: [],
        sources: [],
        hasSalary: null,
      });
    });

    // Verify errors exist
    expect(result.current.hasFilterValidationErrors).toBe(true);
    expect(result.current.filterErrors.length).toBeGreaterThan(0);

    // Clear errors
    act(() => {
      result.current.clearFilterErrors();
    });

    // Verify errors are cleared
    expect(result.current.hasFilterValidationErrors).toBe(false);
    expect(result.current.filterErrors).toEqual([]);
  });

  it("should clear errors when clearing all filters", () => {
    const { result } = renderHook(() => useJobFilters(mockJobs));

    // Apply invalid filters to generate errors
    act(() => {
      result.current.applyFilters({
        locations: ["유효하지않은위치"],
        experiences: [],
        categories: [],
        contractTypes: [],
        sources: [],
        hasSalary: null,
      });
    });

    // Verify errors exist
    expect(result.current.hasFilterValidationErrors).toBe(true);

    // Clear all filters
    act(() => {
      result.current.clearAllFilters();
    });

    // Verify errors are cleared along with filters
    expect(result.current.hasFilterValidationErrors).toBe(false);
    expect(result.current.filterErrors).toEqual([]);
    expect(result.current.filters).toEqual({
      locations: [],
      experiences: [],
      categories: [],
      contractTypes: [],
      sources: [],
      hasSalary: null,
    });
  });

  it("should validate hasSalary filter type", () => {
    const { result } = renderHook(() => useJobFilters(mockJobs));

    // Apply invalid hasSalary value
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

    // Should be corrected to null
    expect(result.current.filters.hasSalary).toBe(null);
    expect(result.current.hasFilterValidationErrors).toBe(true);
    expect(
      result.current.filterErrors.some((error) => error.includes("연봉 필터"))
    ).toBe(true);
  });
});
