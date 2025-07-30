import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SearchPage from "../page";

// Mock Next.js navigation
jest.mock("next/navigation", () => ({
  useSearchParams: () => ({
    get: (key: string) => {
      if (key === "keyword") return "개발자";
      return "";
    },
  }),
}));

// Mock fetch API
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () =>
      Promise.resolve({
        jobs: [
          {
            id: "1",
            title: "프론트엔드 개발자",
            company: "테크 스타트업",
            location: "서울",
            category: "개발",
            postedDate: "2025-07-15",
            salary: "4,000만원",
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
            salary: "5,000만원",
            experience: "5년 이상",
            source: "jumpit",
            sourceUrl: "#",
            contractType: "정규직",
          },
        ],
        totalCount: 2,
        currentPage: 1,
        totalPages: 1,
      }),
  })
) as jest.Mock;

describe("SearchPage Integration Tests", () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  it("should render search page with jobs and filters", async () => {
    render(<SearchPage />);

    // Wait for jobs to load
    await waitFor(() => {
      expect(screen.getByText("검색 결과")).toBeInTheDocument();
    });

    // Check if jobs are rendered
    expect(screen.getByText("프론트엔드 개발자")).toBeInTheDocument();
    expect(screen.getByText("백엔드 개발자")).toBeInTheDocument();

    // Check if filter panel is rendered
    expect(screen.getByText("필터")).toBeInTheDocument();
  });

  it("should filter jobs by location", async () => {
    const user = userEvent.setup();
    render(<SearchPage />);

    // Wait for jobs to load
    await waitFor(() => {
      expect(screen.getByText("검색 결과")).toBeInTheDocument();
    });

    // Apply location filter
    const locationCheckbox = screen.getByLabelText("서울");
    await user.click(locationCheckbox);

    // Wait for filter to be applied
    await waitFor(() => {
      // Should show only Seoul job
      expect(screen.getByText("프론트엔드 개발자")).toBeInTheDocument();
      // Should not show non-Seoul job
      expect(screen.queryByText("백엔드 개발자")).not.toBeInTheDocument();
    });
  });

  it("should clear filters when clear button is clicked", async () => {
    const user = userEvent.setup();
    render(<SearchPage />);

    // Wait for jobs to load
    await waitFor(() => {
      expect(screen.getByText("검색 결과")).toBeInTheDocument();
    });

    // Apply filter
    const locationCheckbox = screen.getByLabelText("서울");
    await user.click(locationCheckbox);

    // Clear filters
    const clearButton = screen.getByText("전체 초기화");
    await user.click(clearButton);

    // Wait for filters to be cleared
    await waitFor(() => {
      // All jobs should be visible again
      expect(screen.getByText("프론트엔드 개발자")).toBeInTheDocument();
      expect(screen.getByText("백엔드 개발자")).toBeInTheDocument();
    });
  });
});
