import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useSearchParams } from "next/navigation";
import SearchPage from "../page";
import { it } from "node:test";
import { it } from "node:test";
import { describe } from "node:test";
import { it } from "node:test";
import { it } from "node:test";
import { describe } from "node:test";
import { it } from "node:test";
import { it } from "node:test";
import { it } from "node:test";
import { it } from "node:test";
import { it } from "node:test";
import { it } from "node:test";
import { it } from "node:test";
import { it } from "node:test";
import { describe } from "node:test";
import { afterEach } from "node:test";
import { beforeEach } from "node:test";
import { describe } from "node:test";

// Mock Next.js navigation
jest.mock("next/navigation", () => ({
  useSearchParams: jest.fn(),
}));

// Mock fetch API
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock window methods for responsive testing
Object.defineProperty(window, "innerWidth", {
  writable: true,
  configurable: true,
  value: 1024,
});

Object.defineProperty(window, "innerHeight", {
  writable: true,
  configurable: true,
  value: 768,
});

// Mock scroll methods
Object.defineProperty(document.documentElement, "scrollTop", {
  writable: true,
  configurable: true,
  value: 0,
});

Object.defineProperty(document.documentElement, "offsetHeight", {
  writable: true,
  configurable: true,
  value: 2000,
});

// Mock requestAnimationFrame
global.requestAnimationFrame = jest.fn((cb) => setTimeout(cb, 0));

// Mock job data
const mockJobsResponse = {
  jobs: [
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
      experience: "3년 이상",
      source: "wanted",
      sourceUrl: "#",
    },
    {
      id: "4",
      title: "신입 개발자",
      company: "스타트업",
      location: "부산",
      category: "개발",
      postedDate: "2025-07-18",
      salary: "3,000만원 ~ 4,000만원",
      source: "jumpit",
      sourceUrl: "#",
      contractType: "계약직",
    },
  ],
  totalCount: 4,
  currentPage: 1,
  totalPages: 1,
};

const mockUseSearchParams = useSearchParams as jest.MockedFunction<
  typeof useSearchParams
>;

describe("SearchPage Integration Tests", () => {
  beforeEach(() => {
    // Reset mocks
    mockFetch.mockClear();
    mockUseSearchParams.mockReturnValue({
      get: jest.fn((key: string) => {
        switch (key) {
          case "keyword":
            return "개발자";
          case "category":
            return "";
          case "location":
            return "";
          default:
            return null;
        }
      }),
    } as any);

    // Mock successful API response
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockJobsResponse,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("SearchPage and Filter Integration", () => {
    it("should render search page with filter panel and job results", async () => {
      render(<SearchPage />);

      // Wait for jobs to load
      await waitFor(() => {
        expect(screen.getByText("검색 결과")).toBeInTheDocument();
      });

      // Check if filter panel is rendered
      expect(screen.getByText("필터")).toBeInTheDocument();

      // Check if job cards are rendered
      expect(screen.getByText("프론트엔드 개발자")).toBeInTheDocument();
      expect(screen.getByText("백엔드 개발자")).toBeInTheDocument();
      expect(screen.getByText("마케팅 매니저")).toBeInTheDocument();
      expect(screen.getByText("신입 개발자")).toBeInTheDocument();
    });

    it("should filter jobs when location filter is applied", async () => {
      const user = userEvent.setup();
      render(<SearchPage />);

      // Wait for jobs to load
      await waitFor(() => {
        expect(screen.getByText("검색 결과")).toBeInTheDocument();
      });

      // Apply location filter for 서울
      const locationCheckbox = screen.getByLabelText("서울");
      await user.click(locationCheckbox);

      // Wait for filter to be applied
      await waitFor(() => {
        // Should show only Seoul jobs
        expect(screen.getByText("프론트엔드 개발자")).toBeInTheDocument();
        expect(screen.getByText("마케팅 매니저")).toBeInTheDocument();
        // Should not show non-Seoul jobs
        expect(screen.queryByText("백엔드 개발자")).not.toBeInTheDocument();
        expect(screen.queryByText("신입 개발자")).not.toBeInTheDocument();
      });

      // Check filter count display
      expect(screen.getByText("(필터 적용: 2건)")).toBeInTheDocument();
    });

    it("should apply multiple filters simultaneously", async () => {
      const user = userEvent.setup();
      render(<SearchPage />);

      // Wait for jobs to load
      await waitFor(() => {
        expect(screen.getByText("검색 결과")).toBeInTheDocument();
      });

      // Apply location filter for 서울
      const locationCheckbox = screen.getByLabelText("서울");
      await user.click(locationCheckbox);

      // Apply category filter for 개발
      const categoryCheckbox = screen.getByLabelText("개발");
      await user.click(categoryCheckbox);

      // Wait for filters to be applied
      await waitFor(() => {
        // Should show only Seoul + 개발 jobs
        expect(screen.getByText("프론트엔드 개발자")).toBeInTheDocument();
        // Should not show other jobs
        expect(screen.queryByText("마케팅 매니저")).not.toBeInTheDocument();
        expect(screen.queryByText("백엔드 개발자")).not.toBeInTheDocument();
        expect(screen.queryByText("신입 개발자")).not.toBeInTheDocument();
      });

      // Check filter count display
      expect(screen.getByText("(필터 적용: 1건)")).toBeInTheDocument();
    });

    it("should show empty state when no jobs match filters", async () => {
      const user = userEvent.setup();
      render(<SearchPage />);

      // Wait for jobs to load
      await waitFor(() => {
        expect(screen.getByText("검색 결과")).toBeInTheDocument();
      });

      // Apply filters that will result in no matches
      const locationCheckbox = screen.getByLabelText("부산");
      await user.click(locationCheckbox);

      const categoryCheckbox = screen.getByLabelText("마케팅·광고");
      await user.click(categoryCheckbox);

      // Wait for filters to be applied
      await waitFor(() => {
        expect(
          screen.getByText("조건에 맞는 결과가 없습니다")
        ).toBeInTheDocument();
      });
    });

    it("should clear all filters when clear button is clicked", async () => {
      const user = userEvent.setup();
      render(<SearchPage />);

      // Wait for jobs to load
      await waitFor(() => {
        expect(screen.getByText("검색 결과")).toBeInTheDocument();
      });

      // Apply some filters
      const locationCheckbox = screen.getByLabelText("서울");
      await user.click(locationCheckbox);

      const categoryCheckbox = screen.getByLabelText("개발");
      await user.click(categoryCheckbox);

      // Wait for filters to be applied
      await waitFor(() => {
        expect(screen.getByText("(필터 적용: 1건)")).toBeInTheDocument();
      });

      // Clear all filters
      const clearButton = screen.getByText("전체 초기화");
      await user.click(clearButton);

      // Wait for filters to be cleared
      await waitFor(() => {
        // All jobs should be visible again
        expect(screen.getByText("프론트엔드 개발자")).toBeInTheDocument();
        expect(screen.getByText("백엔드 개발자")).toBeInTheDocument();
        expect(screen.getByText("마케팅 매니저")).toBeInTheDocument();
        expect(screen.getByText("신입 개발자")).toBeInTheDocument();
        // Filter count should be gone
        expect(screen.queryByText("(필터 적용:")).not.toBeInTheDocument();
      });
    });

    it("should remove individual filters", async () => {
      const user = userEvent.setup();
      render(<SearchPage />);

      // Wait for jobs to load
      await waitFor(() => {
        expect(screen.getByText("검색 결과")).toBeInTheDocument();
      });

      // Apply multiple filters
      const locationCheckbox = screen.getByLabelText("서울");
      await user.click(locationCheckbox);

      const categoryCheckbox = screen.getByLabelText("개발");
      await user.click(categoryCheckbox);

      // Wait for filters to be applied
      await waitFor(() => {
        expect(screen.getByText("(필터 적용: 1건)")).toBeInTheDocument();
      });

      // Remove location filter by clicking the active filter tag
      const activeLocationFilter = screen.getByText("서울").closest("span");
      const removeButton = activeLocationFilter?.querySelector("button");
      if (removeButton) {
        await user.click(removeButton);
      }

      // Wait for filter to be removed
      await waitFor(() => {
        // Should now show all 개발 jobs (not just Seoul ones)
        expect(screen.getByText("프론트엔드 개발자")).toBeInTheDocument();
        expect(screen.getByText("백엔드 개발자")).toBeInTheDocument();
        expect(screen.getByText("신입 개발자")).toBeInTheDocument();
        expect(screen.queryByText("마케팅 매니저")).not.toBeInTheDocument();
      });
    });

    it("should handle API errors gracefully", async () => {
      // Mock API error
      mockFetch.mockRejectedValue(new Error("API Error"));

      render(<SearchPage />);

      // Wait for error state
      await waitFor(() => {
        expect(
          screen.getByText("채용공고를 불러오는데 실패했습니다.")
        ).toBeInTheDocument();
      });

      // Should show retry button
      expect(screen.getByText("다시 시도")).toBeInTheDocument();
    });

    it("should show loading state while fetching jobs", async () => {
      // Mock delayed response
      mockFetch.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: async () => mockJobsResponse,
                }),
              100
            )
          )
      );

      render(<SearchPage />);

      // Should show loading skeleton
      expect(screen.getAllByTestId("skeleton-loader")).toHaveLength(5);

      // Wait for jobs to load
      await waitFor(
        () => {
          expect(screen.getByText("프론트엔드 개발자")).toBeInTheDocument();
        },
        { timeout: 2000 }
      );
    });
  });

  describe("Filter Performance Tests", () => {
    it("should handle large datasets efficiently", async () => {
      // Create large dataset
      const largeJobsResponse = {
        ...mockJobsResponse,
        jobs: Array.from({ length: 1000 }, (_, i) => ({
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
        })),
        totalCount: 1000,
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => largeJobsResponse,
      });

      const user = userEvent.setup();
      render(<SearchPage />);

      // Wait for jobs to load
      await waitFor(() => {
        expect(screen.getByText("검색 결과")).toBeInTheDocument();
      });

      // Apply filter and measure performance
      const startTime = performance.now();
      const locationCheckbox = screen.getByLabelText("서울");
      await user.click(locationCheckbox);

      await waitFor(() => {
        expect(screen.getByText("(필터 적용: 500건)")).toBeInTheDocument();
      });

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should complete within reasonable time (less than 1000ms)
      expect(duration).toBeLessThan(1000);
    });

    it("should debounce filter updates", async () => {
      const user = userEvent.setup();
      render(<SearchPage />);

      // Wait for jobs to load
      await waitFor(() => {
        expect(screen.getByText("검색 결과")).toBeInTheDocument();
      });

      // Rapidly apply multiple filters
      const locationCheckbox = screen.getByLabelText("서울");
      const categoryCheckbox = screen.getByLabelText("개발");

      await user.click(locationCheckbox);
      await user.click(categoryCheckbox);
      await user.click(locationCheckbox); // Uncheck
      await user.click(locationCheckbox); // Check again

      // Should eventually settle on the final state
      await waitFor(() => {
        expect(screen.getByText("(필터 적용: 1건)")).toBeInTheDocument();
      });
    });
  });

  describe("Accessibility Tests", () => {
    it("should have proper ARIA labels and roles", async () => {
      render(<SearchPage />);

      // Wait for jobs to load
      await waitFor(() => {
        expect(screen.getByText("검색 결과")).toBeInTheDocument();
      });

      // Check filter sections have proper ARIA attributes
      const filterSections = screen.getAllByRole("button", { expanded: true });
      filterSections.forEach((section) => {
        expect(section).toHaveAttribute("aria-expanded");
        expect(section).toHaveAttribute("aria-controls");
      });

      // Check checkboxes have proper labels
      const checkboxes = screen.getAllByRole("checkbox");
      checkboxes.forEach((checkbox) => {
        expect(checkbox).toHaveAccessibleName();
      });
    });

    it("should support keyboard navigation", async () => {
      const user = userEvent.setup();
      render(<SearchPage />);

      // Wait for jobs to load
      await waitFor(() => {
        expect(screen.getByText("검색 결과")).toBeInTheDocument();
      });

      // Tab to first filter section
      await user.tab();
      const firstFilterSection = screen.getByRole("button", {
        name: /근무위치/,
      });
      expect(firstFilterSection).toHaveFocus();

      // Press Enter to toggle
      await user.keyboard("{Enter}");
      expect(firstFilterSection).toHaveAttribute("aria-expanded", "false");

      // Press Space to toggle back
      await user.keyboard(" ");
      expect(firstFilterSection).toHaveAttribute("aria-expanded", "true");
    });
  });
});
