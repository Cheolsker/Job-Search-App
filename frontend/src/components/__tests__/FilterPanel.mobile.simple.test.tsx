import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FilterPanel from "../FilterPanel";

// Mock useJobFilters hook
jest.mock("@/hooks/useJobFilters", () => ({
  useJobFilters: () => ({
    filters: {
      locations: [],
      experiences: [],
      categories: [],
      contractTypes: [],
      sources: [],
      hasSalary: null,
    },
    filteredJobs: [],
    filterOptions: {
      locations: [{ value: "서울", label: "서울", count: 10 }],
      experiences: [{ value: "3년 이상", label: "3년 이상", count: 7 }],
      categories: [{ value: "개발", label: "개발", count: 8 }],
      contractTypes: [{ value: "정규직", label: "정규직", count: 12 }],
      sources: [{ value: "wanted", label: "wanted", count: 6 }],
    },
    hasActiveFilters: false,
    filterErrors: [],
    hasFilterValidationErrors: false,
    updateLocationFilter: jest.fn(),
    updateExperienceFilter: jest.fn(),
    updateCategoryFilter: jest.fn(),
    updateContractTypeFilter: jest.fn(),
    updateSourceFilter: jest.fn(),
    updateSalaryFilter: jest.fn(),
    removeFilter: jest.fn(),
    clearAllFilters: jest.fn(),
    clearFilterErrors: jest.fn(),
  }),
}));

// Mock window.innerWidth for mobile detection
const mockInnerWidth = (width: number) => {
  Object.defineProperty(window, "innerWidth", {
    writable: true,
    configurable: true,
    value: width,
  });
  window.dispatchEvent(new Event("resize"));
};

const mockJobs = [
  {
    id: "1",
    title: "프론트엔드 개발자",
    company: "테스트 회사",
    location: "서울",
    category: "개발",
    postedDate: "2025-01-01",
    salary: "4000만원",
    experience: "3년 이상",
    source: "wanted",
    sourceUrl: "https://example.com",
    contractType: "정규직",
  },
];

describe("FilterPanel Mobile Tests", () => {
  const mockOnFilteredJobsChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockInnerWidth(1024); // Start with desktop
  });

  afterEach(() => {
    document.body.style.overflow = "unset";
  });

  it("should show mobile UI on small screens", async () => {
    mockInnerWidth(600);

    render(
      <FilterPanel
        jobs={mockJobs}
        onFilteredJobsChange={mockOnFilteredJobsChange}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("필터")).toBeInTheDocument();
    });

    // Should show mobile filter button
    const filterButton = screen.getByRole("button", { name: /필터/ });
    expect(filterButton).toBeInTheDocument();
  });

  it("should show desktop UI on large screens", () => {
    mockInnerWidth(1024);

    render(
      <FilterPanel
        jobs={mockJobs}
        onFilteredJobsChange={mockOnFilteredJobsChange}
      />
    );

    // Should show desktop filter summary
    expect(screen.getByText("전체 채용공고")).toBeInTheDocument();

    // Should not show mobile filter button
    expect(
      screen.queryByRole("button", { name: /필터/ })
    ).not.toBeInTheDocument();
  });

  it("should open modal when mobile filter button is clicked", async () => {
    mockInnerWidth(600);
    const user = userEvent.setup();

    render(
      <FilterPanel
        jobs={mockJobs}
        onFilteredJobsChange={mockOnFilteredJobsChange}
      />
    );

    await waitFor(() => {
      const filterButton = screen.getByRole("button", { name: /필터/ });
      expect(filterButton).toBeInTheDocument();
    });

    const filterButton = screen.getByRole("button", { name: /필터/ });
    await user.click(filterButton);

    await waitFor(() => {
      expect(screen.getByLabelText("필터 모달 닫기")).toBeInTheDocument();
    });
  });

  it("should close modal when close button is clicked", async () => {
    mockInnerWidth(600);
    const user = userEvent.setup();

    render(
      <FilterPanel
        jobs={mockJobs}
        onFilteredJobsChange={mockOnFilteredJobsChange}
      />
    );

    // Open modal
    const filterButton = screen.getByRole("button", { name: /필터/ });
    await user.click(filterButton);

    await waitFor(() => {
      expect(screen.getByLabelText("필터 모달 닫기")).toBeInTheDocument();
    });

    // Close modal
    const closeButton = screen.getByLabelText("필터 모달 닫기");
    await user.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByLabelText("필터 모달 닫기")).not.toBeInTheDocument();
    });
  });

  it("should close modal with Escape key", async () => {
    mockInnerWidth(600);
    const user = userEvent.setup();

    render(
      <FilterPanel
        jobs={mockJobs}
        onFilteredJobsChange={mockOnFilteredJobsChange}
      />
    );

    // Open modal
    const filterButton = screen.getByRole("button", { name: /필터/ });
    await user.click(filterButton);

    await waitFor(() => {
      expect(screen.getByLabelText("필터 모달 닫기")).toBeInTheDocument();
    });

    // Press Escape
    fireEvent.keyDown(document, { key: "Escape", code: "Escape" });

    await waitFor(() => {
      expect(screen.queryByLabelText("필터 모달 닫기")).not.toBeInTheDocument();
    });
  });

  it("should prevent body scroll when modal is open", async () => {
    mockInnerWidth(600);
    const user = userEvent.setup();

    render(
      <FilterPanel
        jobs={mockJobs}
        onFilteredJobsChange={mockOnFilteredJobsChange}
      />
    );

    // Open modal
    const filterButton = screen.getByRole("button", { name: /필터/ });
    await user.click(filterButton);

    await waitFor(() => {
      expect(document.body.style.overflow).toBe("hidden");
    });
  });

  it("should switch from desktop to mobile UI when screen size changes", async () => {
    const { rerender } = render(
      <FilterPanel
        jobs={mockJobs}
        onFilteredJobsChange={mockOnFilteredJobsChange}
      />
    );

    // Initially desktop
    expect(screen.getByText("전체 채용공고")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /필터/ })
    ).not.toBeInTheDocument();

    // Change to mobile
    mockInnerWidth(600);

    rerender(
      <FilterPanel
        jobs={mockJobs}
        onFilteredJobsChange={mockOnFilteredJobsChange}
      />
    );

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /필터/ })).toBeInTheDocument();
      expect(screen.queryByText("전체 채용공고")).not.toBeInTheDocument();
    });
  });
});
