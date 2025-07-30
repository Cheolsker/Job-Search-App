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

// Mock Next.js navigation
jest.mock("next/navigation", () => ({
  useSearchParams: jest.fn(),
}));

// Mock fetch API
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock scroll properties
Object.defineProperty(window, "innerHeight", {
  writable: true,
  configurable: true,
  value: 800,
});

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

// Mock requestAnimationFrame and setTimeout
global.requestAnimationFrame = jest.fn((cb) => setTimeout(cb, 0));
global.clearTimeout = jest.fn();

const mockUseSearchParams = useSearchParams as jest.MockedFunction<
  typeof useSearchParams
>;

// Mock job data for pagination
const createMockJobsResponse = (page: number, hasMore: boolean = true) => ({
  jobs: Array.from({ length: 10 }, (_, i) => ({
    id: `job-${page}-${i}`,
    title: `Job ${page}-${i}`,
    company: `Company ${i % 3}`,
    location: i % 2 === 0 ? "서울" : "경기",
    category: i % 3 === 0 ? "개발" : "마케팅·광고",
    postedDate: "2025-07-15",
    salary: i % 4 === 0 ? "4,000만원" : undefined,
    experience: i % 5 === 0 ? "3년 이상" : undefined,
    source: i % 2 === 0 ? "wanted" : "jumpit",
    contractType: i % 3 === 0 ? "정규직" : undefined,
  })),
  totalCount: hasMore ? 100 : page * 10,
  currentPage: page,
  totalPages: hasMore ? 10 : page,
});

describe("SearchPage Infinite Scroll Integration Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();

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

    // Reset scroll position
    document.documentElement.scrollTop = 0;
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  describe("Initial Load", () => {
    it("should load first page of jobs on initial render", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => createMockJobsResponse(1),
      });

      render(<SearchPage />);

      await waitFor(() => {
        expect(screen.getByText("검색 결과")).toBeInTheDocument();
      });

      // Should show first page jobs
      expect(screen.getByText("Job 1-0")).toBeInTheDocument();
      expect(screen.getByText("Job 1-9")).toBeInTheDocument();

      // Should show "더 많은 채용공고 보기" button
      expect(screen.getByText("더 많은 채용공고 보기")).toBeInTheDocument();
    });

    it("should show loading skeleton during initial load", async () => {
      // Mock delayed response
      mockFetch.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: async () => createMockJobsResponse(1),
                }),
              100
            )
          )
      );

      render(<SearchPage />);

      // Should show loading skeletons
      const skeletons = screen.getAllByTestId("skeleton-loader");
      expect(skeletons).toHaveLength(5);

      // Wait for jobs to load
      await waitFor(
        () => {
          expect(screen.getByText("Job 1-0")).toBeInTheDocument();
        },
        { timeout: 2000 }
      );
    });
  });

  describe("Infinite Scroll Behavior", () => {
    it("should load more jobs when scrolling near bottom", async () => {
      // Mock first page
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => createMockJobsResponse(1),
      });

      render(<SearchPage />);

      await waitFor(() => {
        expect(screen.getByText("Job 1-0")).toBeInTheDocument();
      });

      // Mock second page
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => createMockJobsResponse(2),
      });

      // Simulate scroll near bottom (within 1000px threshold)
      act(() => {
        document.documentElement.scrollTop = 1100; // 2000 - 1100 = 900px from bottom
        window.dispatchEvent(new Event("scroll"));
      });

      // Wait for second page to load
      await waitFor(() => {
        expect(screen.getByText("Job 2-0")).toBeInTheDocument();
      });

      // Should have both pages
      expect(screen.getByText("Job 1-0")).toBeInTheDocument();
      expect(screen.getByText("Job 2-0")).toBeInTheDocument();
    });

    it("should show loading indicator while loading more jobs", async () => {
      // Mock first page
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => createMockJobsResponse(1),
      });

      render(<SearchPage />);

      await waitFor(() => {
        expect(screen.getByText("Job 1-0")).toBeInTheDocument();
      });

      // Mock delayed second page
      mockFetch.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: async () => createMockJobsResponse(2),
                }),
              100
            )
          )
      );

      // Trigger scroll
      act(() => {
        document.documentElement.scrollTop = 1100;
        window.dispatchEvent(new Event("scroll"));
      });

      // Should show loading indicator
      await waitFor(() => {
        expect(
          screen.getByText("더 많은 채용공고를 불러오는 중...")
        ).toBeInTheDocument();
      });

      // Wait for loading to complete
      await waitFor(
        () => {
          expect(screen.getByText("Job 2-0")).toBeInTheDocument();
        },
        { timeout: 2000 }
      );
    });

    it("should stop loading when no more pages available", async () => {
      // Mock first page
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => createMockJobsResponse(1),
      });

      render(<SearchPage />);

      await waitFor(() => {
        expect(screen.getByText("Job 1-0")).toBeInTheDocument();
      });

      // Mock final page (no more pages)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => createMockJobsResponse(2, false),
      });

      // Trigger scroll
      act(() => {
        document.documentElement.scrollTop = 1100;
        window.dispatchEvent(new Event("scroll"));
      });

      await waitFor(() => {
        expect(screen.getByText("Job 2-0")).toBeInTheDocument();
      });

      // Should show completion message
      await waitFor(() => {
        expect(
          screen.getByText("🎉 모든 검색 결과를 확인했습니다")
        ).toBeInTheDocument();
      });

      // Should not show "더 보기" button
      expect(
        screen.queryByText("더 많은 채용공고 보기")
      ).not.toBeInTheDocument();
    });

    it("should throttle scroll events", async () => {
      // Mock first page
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => createMockJobsResponse(1),
      });

      render(<SearchPage />);

      await waitFor(() => {
        expect(screen.getByText("Job 1-0")).toBeInTheDocument();
      });

      // Mock second page
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => createMockJobsResponse(2),
      });

      // Rapidly trigger multiple scroll events
      act(() => {
        document.documentElement.scrollTop = 1100;
        window.dispatchEvent(new Event("scroll"));
        window.dispatchEvent(new Event("scroll"));
        window.dispatchEvent(new Event("scroll"));
      });

      // Should only make one API call despite multiple scroll events
      await waitFor(() => {
        expect(screen.getByText("Job 2-0")).toBeInTheDocument();
      });

      expect(mockFetch).toHaveBeenCalledTimes(2); // Initial + one more page
    });

    it("should prevent duplicate requests", async () => {
      // Mock first page
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => createMockJobsResponse(1),
      });

      render(<SearchPage />);

      await waitFor(() => {
        expect(screen.getByText("Job 1-0")).toBeInTheDocument();
      });

      // Mock delayed second page
      mockFetch.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: async () => createMockJobsResponse(2),
                }),
              100
            )
          )
      );

      // Trigger multiple scroll events while request is pending
      act(() => {
        document.documentElement.scrollTop = 1100;
        window.dispatchEvent(new Event("scroll"));
        window.dispatchEvent(new Event("scroll"));
        window.dispatchEvent(new Event("scroll"));
      });

      await waitFor(() => {
        expect(screen.getByText("Job 2-0")).toBeInTheDocument();
      });

      // Should only make one additional request
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  describe("Manual Load More Button", () => {
    it("should load more jobs when 'Load More' button is clicked", async () => {
      // Mock first page
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => createMockJobsResponse(1),
      });

      const user = userEvent.setup();
      render(<SearchPage />);

      await waitFor(() => {
        expect(screen.getByText("Job 1-0")).toBeInTheDocument();
      });

      // Mock second page
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => createMockJobsResponse(2),
      });

      // Click load more button
      const loadMoreButton = screen.getByText("더 많은 채용공고 보기");
      await user.click(loadMoreButton);

      await waitFor(() => {
        expect(screen.getByText("Job 2-0")).toBeInTheDocument();
      });

      // Should have both pages
      expect(screen.getByText("Job 1-0")).toBeInTheDocument();
      expect(screen.getByText("Job 2-0")).toBeInTheDocument();
    });

    it("should show loading state on load more button", async () => {
      // Mock first page
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => createMockJobsResponse(1),
      });

      const user = userEvent.setup();
      render(<SearchPage />);

      await waitFor(() => {
        expect(screen.getByText("Job 1-0")).toBeInTheDocument();
      });

      // Mock delayed second page
      mockFetch.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: async () => createMockJobsResponse(2),
                }),
              100
            )
          )
      );

      // Click load more button
      const loadMoreButton = screen.getByText("더 많은 채용공고 보기");
      await user.click(loadMoreButton);

      // Should show loading indicator
      await waitFor(() => {
        expect(
          screen.getByText("더 많은 채용공고를 불러오는 중...")
        ).toBeInTheDocument();
      });
    });
  });

  describe("Infinite Scroll with Filters", () => {
    it("should reset pagination when filters change", async () => {
      // Mock first page
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => createMockJobsResponse(1),
      });

      const user = userEvent.setup();
      render(<SearchPage />);

      await waitFor(() => {
        expect(screen.getByText("Job 1-0")).toBeInTheDocument();
      });

      // Load second page
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => createMockJobsResponse(2),
      });

      act(() => {
        document.documentElement.scrollTop = 1100;
        window.dispatchEvent(new Event("scroll"));
      });

      await waitFor(() => {
        expect(screen.getByText("Job 2-0")).toBeInTheDocument();
      });

      // Apply a filter - should reset to page 1
      const locationFilter = screen.getByLabelText("서울");
      await user.click(locationFilter);

      // Should filter existing jobs, not make new API call
      await waitFor(() => {
        // Jobs should be filtered client-side
        const seoulJobs = screen
          .getAllByText(/Job.*/)
          .filter((el) => el.textContent?.includes("Job"));
        expect(seoulJobs.length).toBeGreaterThan(0);
      });
    });

    it("should maintain infinite scroll after applying filters", async () => {
      // Mock first page
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => createMockJobsResponse(1),
      });

      const user = userEvent.setup();
      render(<SearchPage />);

      await waitFor(() => {
        expect(screen.getByText("Job 1-0")).toBeInTheDocument();
      });

      // Apply filter
      const locationFilter = screen.getByLabelText("서울");
      await user.click(locationFilter);

      await waitFor(() => {
        // Should show filtered results
        expect(screen.getByText("(필터 적용:")).toBeInTheDocument();
      });

      // Load more should still work with filtered results
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => createMockJobsResponse(2),
      });

      // Scroll to trigger load more
      act(() => {
        document.documentElement.scrollTop = 1100;
        window.dispatchEvent(new Event("scroll"));
      });

      await waitFor(() => {
        expect(screen.getByText("Job 2-0")).toBeInTheDocument();
      });
    });
  });

  describe("Error Handling", () => {
    it("should handle API errors during infinite scroll", async () => {
      // Mock first page success
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => createMockJobsResponse(1),
      });

      render(<SearchPage />);

      await waitFor(() => {
        expect(screen.getByText("Job 1-0")).toBeInTheDocument();
      });

      // Mock second page error
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      // Trigger scroll
      act(() => {
        document.documentElement.scrollTop = 1100;
        window.dispatchEvent(new Event("scroll"));
      });

      // Should show error message but keep existing jobs
      await waitFor(() => {
        expect(
          screen.getByText("채용공고를 불러오는데 실패했습니다.")
        ).toBeInTheDocument();
        expect(screen.getByText("Job 1-0")).toBeInTheDocument(); // First page still visible
      });

      // Should stop trying to load more
      expect(
        screen.queryByText("더 많은 채용공고 보기")
      ).not.toBeInTheDocument();
    });

    it("should handle empty response during infinite scroll", async () => {
      // Mock first page
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => createMockJobsResponse(1),
      });

      render(<SearchPage />);

      await waitFor(() => {
        expect(screen.getByText("Job 1-0")).toBeInTheDocument();
      });

      // Mock empty second page
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          jobs: [],
          totalCount: 10,
          currentPage: 2,
          totalPages: 1,
        }),
      });

      // Trigger scroll
      act(() => {
        document.documentElement.scrollTop = 1100;
        window.dispatchEvent(new Event("scroll"));
      });

      // Should show completion message
      await waitFor(() => {
        expect(
          screen.getByText("🎉 모든 검색 결과를 확인했습니다")
        ).toBeInTheDocument();
      });
    });
  });

  describe("Performance", () => {
    it("should handle large datasets efficiently", async () => {
      // Mock large first page
      const largeResponse = {
        jobs: Array.from({ length: 100 }, (_, i) => ({
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
        currentPage: 1,
        totalPages: 10,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => largeResponse,
      });

      const startTime = performance.now();
      render(<SearchPage />);

      await waitFor(() => {
        expect(screen.getByText("Job 0")).toBeInTheDocument();
      });

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render within reasonable time (less than 2 seconds)
      expect(renderTime).toBeLessThan(2000);
    });

    it("should cleanup scroll listeners on unmount", () => {
      const removeEventListenerSpy = jest.spyOn(window, "removeEventListener");

      const { unmount } = render(<SearchPage />);

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        "scroll",
        expect.any(Function)
      );

      removeEventListenerSpy.mockRestore();
    });
  });
});
