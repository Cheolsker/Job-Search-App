import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import FilterPanel from "../FilterPanel";

// Mock useJobFilters hook
jest.mock("@/hooks/useJobFilters", () => ({
  useJobFilters: jest.fn(() => ({
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
      locations: [
        { value: "서울", label: "서울", count: 10 },
        { value: "경기", label: "경기", count: 5 },
      ],
      experiences: [
        { value: "신입", label: "신입", count: 3 },
        { value: "3년 이상", label: "3년 이상", count: 7 },
      ],
      categories: [
        { value: "개발", label: "개발", count: 8 },
        { value: "디자인", label: "디자인", count: 4 },
      ],
      contractTypes: [{ value: "정규직", label: "정규직", count: 12 }],
      sources: [{ value: "wanted", label: "원티드", count: 6 }],
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
  })),
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
  },
];

describe("FilterPanel Mobile UI", () => {
  const mockOnFilteredJobsChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset to desktop width initially
    mockInnerWidth(1024);
  });

  afterEach(() => {
    // Clean up any modal state
    document.body.style.overflow = "unset";
  });

  describe("Mobile Detection", () => {
    it("should detect mobile screen size and show mobile UI", async () => {
      // Set mobile width
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
      expect(filterButton).toHaveClass("active:scale-95"); // Mobile touch optimization
    });

    it("should show desktop UI on larger screens", () => {
      // Keep desktop width
      mockInnerWidth(1024);

      render(
        <FilterPanel
          jobs={mockJobs}
          onFilteredJobsChange={mockOnFilteredJobsChange}
        />
      );

      // Should not show mobile filter button
      expect(
        screen.queryByRole("button", { name: /필터/ })
      ).not.toBeInTheDocument();

      // Should show desktop filter summary
      expect(screen.getByText("전체 채용공고")).toBeInTheDocument();
    });
  });

  describe("Mobile Filter Button", () => {
    beforeEach(() => {
      mockInnerWidth(600);
    });

    it("should display filter button with correct styling", async () => {
      render(
        <FilterPanel
          jobs={mockJobs}
          onFilteredJobsChange={mockOnFilteredJobsChange}
        />
      );

      await waitFor(() => {
        const filterButton = screen.getByRole("button", { name: /필터/ });
        expect(filterButton).toBeInTheDocument();
        expect(filterButton).toHaveClass(
          "px-4",
          "py-2",
          "bg-white",
          "border",
          "rounded-lg"
        );
      });
    });

    it("should show results count next to filter button", async () => {
      render(
        <FilterPanel
          jobs={mockJobs}
          onFilteredJobsChange={mockOnFilteredJobsChange}
        />
      );

      await waitFor(() => {
        expect(screen.getByText("0/1건")).toBeInTheDocument();
      });
    });

    it("should show active filter count badge when filters are applied", async () => {
      const { useJobFilters } = require("@/hooks/useJobFilters");
      useJobFilters.mockReturnValue({
        ...useJobFilters(),
        hasActiveFilters: true,
        filters: {
          locations: ["서울"],
          experiences: [],
          categories: [],
          contractTypes: [],
          sources: [],
          hasSalary: null,
        },
      });

      render(
        <FilterPanel
          jobs={mockJobs}
          onFilteredJobsChange={mockOnFilteredJobsChange}
        />
      );

      await waitFor(() => {
        const badge = screen.getByText("1");
        expect(badge).toBeInTheDocument();
        expect(badge).toHaveClass("bg-blue-600", "text-white", "rounded-full");
      });
    });
  });

  describe("Mobile Filter Modal", () => {
    beforeEach(() => {
      mockInnerWidth(600);
    });

    it("should open modal when filter button is clicked", async () => {
      render(
        <FilterPanel
          jobs={mockJobs}
          onFilteredJobsChange={mockOnFilteredJobsChange}
        />
      );

      await waitFor(() => {
        const filterButton = screen.getByRole("button", { name: /필터/ });
        fireEvent.click(filterButton);
      });

      await waitFor(() => {
        expect(
          screen.getByRole("dialog", { hidden: true })
        ).toBeInTheDocument();
        expect(screen.getByText("필터")).toBeInTheDocument(); // Modal header
      });
    });

    it("should close modal when close button is clicked", async () => {
      render(
        <FilterPanel
          jobs={mockJobs}
          onFilteredJobsChange={mockOnFilteredJobsChange}
        />
      );

      // Open modal
      await waitFor(() => {
        const filterButton = screen.getByRole("button", { name: /필터/ });
        fireEvent.click(filterButton);
      });

      // Close modal
      await waitFor(() => {
        const closeButton = screen.getByLabelText("필터 모달 닫기");
        fireEvent.click(closeButton);
      });

      await waitFor(() => {
        expect(
          screen.queryByRole("dialog", { hidden: true })
        ).not.toBeInTheDocument();
      });
    });

    it("should close modal when background overlay is clicked", async () => {
      render(
        <FilterPanel
          jobs={mockJobs}
          onFilteredJobsChange={mockOnFilteredJobsChange}
        />
      );

      // Open modal
      await waitFor(() => {
        const filterButton = screen.getByRole("button", { name: /필터/ });
        fireEvent.click(filterButton);
      });

      // Click background overlay
      await waitFor(() => {
        const overlay = document.querySelector(".fixed.inset-0.bg-black");
        if (overlay) {
          fireEvent.click(overlay);
        }
      });

      await waitFor(() => {
        expect(
          screen.queryByRole("dialog", { hidden: true })
        ).not.toBeInTheDocument();
      });
    });

    it("should close modal when Escape key is pressed", async () => {
      render(
        <FilterPanel
          jobs={mockJobs}
          onFilteredJobsChange={mockOnFilteredJobsChange}
        />
      );

      // Open modal
      await waitFor(() => {
        const filterButton = screen.getByRole("button", { name: /필터/ });
        fireEvent.click(filterButton);
      });

      // Press Escape key
      fireEvent.keyDown(document, { key: "Escape", code: "Escape" });

      await waitFor(() => {
        expect(
          screen.queryByRole("dialog", { hidden: true })
        ).not.toBeInTheDocument();
      });
    });

    it("should prevent body scroll when modal is open", async () => {
      render(
        <FilterPanel
          jobs={mockJobs}
          onFilteredJobsChange={mockOnFilteredJobsChange}
        />
      );

      // Open modal
      await waitFor(() => {
        const filterButton = screen.getByRole("button", { name: /필터/ });
        fireEvent.click(filterButton);
      });

      await waitFor(() => {
        expect(document.body.style.overflow).toBe("hidden");
      });
    });

    it("should restore body scroll when modal is closed", async () => {
      render(
        <FilterPanel
          jobs={mockJobs}
          onFilteredJobsChange={mockOnFilteredJobsChange}
        />
      );

      // Open modal
      await waitFor(() => {
        const filterButton = screen.getByRole("button", { name: /필터/ });
        fireEvent.click(filterButton);
      });

      // Close modal
      await waitFor(() => {
        const closeButton = screen.getByLabelText("필터 모달 닫기");
        fireEvent.click(closeButton);
      });

      await waitFor(() => {
        expect(document.body.style.overflow).toBe("unset");
      });
    });
  });

  describe("Mobile Filter Modal Actions", () => {
    beforeEach(() => {
      mockInnerWidth(600);
    });

    it("should show action buttons in modal footer", async () => {
      render(
        <FilterPanel
          jobs={mockJobs}
          onFilteredJobsChange={mockOnFilteredJobsChange}
        />
      );

      // Open modal
      await waitFor(() => {
        const filterButton = screen.getByRole("button", { name: /필터/ });
        fireEvent.click(filterButton);
      });

      await waitFor(() => {
        expect(screen.getByText("초기화")).toBeInTheDocument();
        expect(screen.getByText(/적용하기/)).toBeInTheDocument();
      });
    });

    it("should call clearAllFilters when reset button is clicked", async () => {
      const { useJobFilters } = require("@/hooks/useJobFilters");
      const mockClearAllFilters = jest.fn();
      useJobFilters.mockReturnValue({
        ...useJobFilters(),
        clearAllFilters: mockClearAllFilters,
      });

      render(
        <FilterPanel
          jobs={mockJobs}
          onFilteredJobsChange={mockOnFilteredJobsChange}
        />
      );

      // Open modal
      await waitFor(() => {
        const filterButton = screen.getByRole("button", { name: /필터/ });
        fireEvent.click(filterButton);
      });

      // Click reset button
      await waitFor(() => {
        const resetButton = screen.getByText("초기화");
        fireEvent.click(resetButton);
      });

      expect(mockClearAllFilters).toHaveBeenCalled();
    });

    it("should close modal when apply button is clicked", async () => {
      render(
        <FilterPanel
          jobs={mockJobs}
          onFilteredJobsChange={mockOnFilteredJobsChange}
        />
      );

      // Open modal
      await waitFor(() => {
        const filterButton = screen.getByRole("button", { name: /필터/ });
        fireEvent.click(filterButton);
      });

      // Click apply button
      await waitFor(() => {
        const applyButton = screen.getByText(/적용하기/);
        fireEvent.click(applyButton);
      });

      await waitFor(() => {
        expect(
          screen.queryByRole("dialog", { hidden: true })
        ).not.toBeInTheDocument();
      });
    });

    it("should show filtered count in apply button", async () => {
      const { useJobFilters } = require("@/hooks/useJobFilters");
      useJobFilters.mockReturnValue({
        ...useJobFilters(),
        filteredJobs: mockJobs,
      });

      render(
        <FilterPanel
          jobs={mockJobs}
          onFilteredJobsChange={mockOnFilteredJobsChange}
        />
      );

      // Open modal
      await waitFor(() => {
        const filterButton = screen.getByRole("button", { name: /필터/ });
        fireEvent.click(filterButton);
      });

      await waitFor(() => {
        expect(screen.getByText("1건")).toBeInTheDocument();
      });
    });
  });

  describe("Touch Optimization", () => {
    beforeEach(() => {
      mockInnerWidth(600);
    });

    it("should have touch-friendly button sizes and spacing", async () => {
      render(
        <FilterPanel
          jobs={mockJobs}
          onFilteredJobsChange={mockOnFilteredJobsChange}
        />
      );

      await waitFor(() => {
        const filterButton = screen.getByRole("button", { name: /필터/ });
        expect(filterButton).toHaveClass("px-4", "py-2"); // Adequate touch target size
        expect(filterButton).toHaveClass("active:scale-95"); // Touch feedback
      });
    });

    it("should have proper modal handle bar for mobile gesture", async () => {
      render(
        <FilterPanel
          jobs={mockJobs}
          onFilteredJobsChange={mockOnFilteredJobsChange}
        />
      );

      // Open modal
      await waitFor(() => {
        const filterButton = screen.getByRole("button", { name: /필터/ });
        fireEvent.click(filterButton);
      });

      await waitFor(() => {
        const handleBar = document.querySelector(
          ".w-10.h-1.bg-gray-300.rounded-full"
        );
        expect(handleBar).toBeInTheDocument();
      });
    });
  });

  describe("Responsive Behavior", () => {
    it("should switch from desktop to mobile UI when screen size changes", async () => {
      const { rerender } = render(
        <FilterPanel
          jobs={mockJobs}
          onFilteredJobsChange={mockOnFilteredJobsChange}
        />
      );

      // Initially desktop
      expect(
        screen.queryByRole("button", { name: /필터/ })
      ).not.toBeInTheDocument();
      expect(screen.getByText("전체 채용공고")).toBeInTheDocument();

      // Change to mobile
      mockInnerWidth(600);

      rerender(
        <FilterPanel
          jobs={mockJobs}
          onFilteredJobsChange={mockOnFilteredJobsChange}
        />
      );

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /필터/ })
        ).toBeInTheDocument();
        expect(screen.queryByText("전체 채용공고")).not.toBeInTheDocument();
      });
    });
  });
});
