import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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
        { value: "부산", label: "부산", count: 3 },
      ],
      experiences: [
        { value: "신입", label: "신입", count: 3 },
        { value: "3년 이상", label: "3년 이상", count: 7 },
        { value: "5년 이상", label: "5년 이상", count: 4 },
      ],
      categories: [
        { value: "개발", label: "개발", count: 8 },
        { value: "디자인", label: "디자인", count: 4 },
        { value: "마케팅·광고", label: "마케팅·광고", count: 2 },
      ],
      contractTypes: [
        { value: "정규직", label: "정규직", count: 12 },
        { value: "계약직", label: "계약직", count: 3 },
      ],
      sources: [
        { value: "wanted", label: "wanted", count: 6 },
        { value: "jumpit", label: "jumpit", count: 8 },
      ],
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

// Mock window.innerWidth for responsive testing
const mockInnerWidth = (width: number) => {
  Object.defineProperty(window, "innerWidth", {
    writable: true,
    configurable: true,
    value: width,
  });
  window.dispatchEvent(new Event("resize"));
};

// Mock jobs data
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
  {
    id: "2",
    title: "백엔드 개발자",
    company: "테스트 회사2",
    location: "경기",
    category: "개발",
    postedDate: "2025-01-02",
    salary: "5000만원",
    experience: "5년 이상",
    source: "jumpit",
    sourceUrl: "https://example2.com",
    contractType: "정규직",
  },
];

describe("FilterPanel Responsive Tests", () => {
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

  describe("Responsive Breakpoints", () => {
    it("should show desktop layout on large screens (>= 768px)", () => {
      mockInnerWidth(1024);

      render(
        <FilterPanel
          jobs={mockJobs}
          onFilteredJobsChange={mockOnFilteredJobsChange}
        />
      );

      // Should show desktop filter summary
      expect(screen.getByText("전체 채용공고")).toBeInTheDocument();
      expect(screen.getByText("2건")).toBeInTheDocument();

      // Should not show mobile filter button
      expect(
        screen.queryByRole("button", { name: /필터/ })
      ).not.toBeInTheDocument();
    });

    it("should show mobile layout on small screens (< 768px)", async () => {
      mockInnerWidth(600);

      render(
        <FilterPanel
          jobs={mockJobs}
          onFilteredJobsChange={mockOnFilteredJobsChange}
        />
      );

      await waitFor(() => {
        // Should show mobile filter button
        expect(
          screen.getByRole("button", { name: /필터/ })
        ).toBeInTheDocument();

        // Should not show desktop filter summary
        expect(screen.queryByText("전체 채용공고")).not.toBeInTheDocument();
      });
    });

    it("should switch layouts when screen size changes", async () => {
      const { rerender } = render(
        <FilterPanel
          jobs={mockJobs}
          onFilteredJobsChange={mockOnFilteredJobsChange}
        />
      );

      // Initially desktop (1024px)
      expect(screen.getByText("전체 채용공고")).toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: /필터/ })
      ).not.toBeInTheDocument();

      // Change to mobile
      act(() => {
        mockInnerWidth(600);
      });

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

      // Change back to desktop
      act(() => {
        mockInnerWidth(1024);
      });

      rerender(
        <FilterPanel
          jobs={mockJobs}
          onFilteredJobsChange={mockOnFilteredJobsChange}
        />
      );

      await waitFor(() => {
        expect(screen.getByText("전체 채용공고")).toBeInTheDocument();
        expect(
          screen.queryByRole("button", { name: /필터/ })
        ).not.toBeInTheDocument();
      });
    });

    it("should handle tablet breakpoint (768px)", async () => {
      mockInnerWidth(768);

      render(
        <FilterPanel
          jobs={mockJobs}
          onFilteredJobsChange={mockOnFilteredJobsChange}
        />
      );

      await waitFor(() => {
        // At exactly 768px, should show desktop layout
        expect(screen.getByText("전체 채용공고")).toBeInTheDocument();
      });
    });
  });

  describe("Mobile Filter Modal", () => {
    beforeEach(() => {
      mockInnerWidth(600);
    });

    it("should open modal when filter button is clicked", async () => {
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
        // Modal should be visible
        expect(screen.getByText("필터")).toBeInTheDocument(); // Modal header
        expect(screen.getByLabelText("필터 모달 닫기")).toBeInTheDocument();
      });
    });

    it("should close modal with close button", async () => {
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
        expect(
          screen.queryByLabelText("필터 모달 닫기")
        ).not.toBeInTheDocument();
      });
    });

    it("should close modal with Escape key", async () => {
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
        expect(
          screen.queryByLabelText("필터 모달 닫기")
        ).not.toBeInTheDocument();
      });
    });

    it("should prevent body scroll when modal is open", async () => {
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

    it("should restore body scroll when modal is closed", async () => {
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

      // Close modal
      await waitFor(() => {
        const closeButton = screen.getByLabelText("필터 모달 닫기");
        return user.click(closeButton);
      });

      await waitFor(() => {
        expect(document.body.style.overflow).toBe("unset");
      });
    });

    it("should show modal handle bar for mobile gestures", async () => {
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
        const handleBar = document.querySelector(
          ".w-10.h-1.bg-gray-300.rounded-full"
        );
        expect(handleBar).toBeInTheDocument();
      });
    });
  });

  describe("Mobile Filter Actions", () => {
    beforeEach(() => {
      mockInnerWidth(600);
    });

    it("should show action buttons in modal footer", async () => {
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

      // Click reset button
      await waitFor(() => {
        const resetButton = screen.getByText("초기화");
        return user.click(resetButton);
      });

      expect(mockClearAllFilters).toHaveBeenCalled();
    });

    it("should close modal when apply button is clicked", async () => {
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

      // Click apply button
      await waitFor(() => {
        const applyButton = screen.getByText(/적용하기/);
        return user.click(applyButton);
      });

      await waitFor(() => {
        expect(
          screen.queryByLabelText("필터 모달 닫기")
        ).not.toBeInTheDocument();
      });
    });
  });

  describe("Active Filter Display", () => {
    it("should show active filter count badge on mobile", async () => {
      const { useJobFilters } = require("@/hooks/useJobFilters");
      useJobFilters.mockReturnValue({
        ...useJobFilters(),
        hasActiveFilters: true,
        filters: {
          locations: ["서울", "경기"],
          experiences: ["3년 이상"],
          categories: [],
          contractTypes: [],
          sources: [],
          hasSalary: null,
        },
      });

      mockInnerWidth(600);

      render(
        <FilterPanel
          jobs={mockJobs}
          onFilteredJobsChange={mockOnFilteredJobsChange}
        />
      );

      await waitFor(() => {
        // Should show count badge with total active filters
        const badge = screen.getByText("3");
        expect(badge).toBeInTheDocument();
        expect(badge).toHaveClass("bg-blue-600", "text-white", "rounded-full");
      });
    });

    it("should show results count on mobile", async () => {
      const { useJobFilters } = require("@/hooks/useJobFilters");
      useJobFilters.mockReturnValue({
        ...useJobFilters(),
        filteredJobs: mockJobs,
      });

      mockInnerWidth(600);

      render(
        <FilterPanel
          jobs={mockJobs}
          onFilteredJobsChange={mockOnFilteredJobsChange}
        />
      );

      await waitFor(() => {
        expect(screen.getByText("2")).toBeInTheDocument(); // filtered count
        expect(screen.getByText("/2건")).toBeInTheDocument(); // total count
      });
    });
  });

  describe("Touch Optimization", () => {
    beforeEach(() => {
      mockInnerWidth(600);
    });

    it("should have touch-friendly button sizes", async () => {
      render(
        <FilterPanel
          jobs={mockJobs}
          onFilteredJobsChange={mockOnFilteredJobsChange}
        />
      );

      await waitFor(() => {
        const filterButton = screen.getByRole("button", { name: /필터/ });
        expect(filterButton).toHaveClass("px-4", "py-2"); // Adequate touch target
        expect(filterButton).toHaveClass("active:scale-95"); // Touch feedback
      });
    });

    it("should have proper spacing for mobile interactions", async () => {
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
        // Action buttons should have proper spacing
        const resetButton = screen.getByText("초기화");
        const applyButton = screen.getByText(/적용하기/);

        expect(resetButton).toHaveClass("px-4", "py-3");
        expect(applyButton).toHaveClass("px-4", "py-3");
      });
    });
  });

  describe("Animation and Transitions", () => {
    beforeEach(() => {
      mockInnerWidth(600);
    });

    it("should have smooth modal animations", async () => {
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
        // Modal should have animation classes
        const modalContent = document.querySelector(
          ".fixed.inset-x-0.bottom-0"
        );
        expect(modalContent).toBeInTheDocument();

        // Background overlay should have transition
        const overlay = document.querySelector(".fixed.inset-0.bg-black");
        expect(overlay).toHaveClass("transition-opacity", "duration-300");
      });
    });

    it("should have hover effects on interactive elements", async () => {
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
        const applyButton = screen.getByText(/적용하기/);
        expect(applyButton).toHaveClass("hover:bg-blue-700", "transition-all");

        const resetButton = screen.getByText("초기화");
        expect(resetButton).toHaveClass("hover:bg-gray-50", "transition-all");
      });
    });
  });

  describe("Accessibility on Mobile", () => {
    beforeEach(() => {
      mockInnerWidth(600);
    });

    it("should have proper ARIA attributes for modal", async () => {
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
        const closeButton = screen.getByLabelText("필터 모달 닫기");
        expect(closeButton).toHaveAttribute("aria-label", "필터 모달 닫기");
        expect(closeButton).toHaveAttribute("type", "button");
      });
    });

    it("should support keyboard navigation in modal", async () => {
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
        const closeButton = screen.getByLabelText("필터 모달 닫기");
        expect(closeButton).toHaveAttribute("tabindex", "0");
      });

      // Tab navigation should work
      await user.tab();
      const focusedElement = document.activeElement;
      expect(focusedElement).toBeInTheDocument();
    });

    it("should have proper focus management", async () => {
      const user = userEvent.setup();
      render(
        <FilterPanel
          jobs={mockJobs}
          onFilteredJobsChange={mockOnFilteredJobsChange}
        />
      );

      const filterButton = screen.getByRole("button", { name: /필터/ });

      // Focus should return to trigger button after modal closes
      filterButton.focus();
      await user.click(filterButton);

      await waitFor(() => {
        const closeButton = screen.getByLabelText("필터 모달 닫기");
        return user.click(closeButton);
      });

      await waitFor(() => {
        expect(document.activeElement).toBe(filterButton);
      });
    });
  });

  describe("Performance on Mobile", () => {
    beforeEach(() => {
      mockInnerWidth(600);
    });

    it("should handle rapid modal open/close operations", async () => {
      const user = userEvent.setup();
      render(
        <FilterPanel
          jobs={mockJobs}
          onFilteredJobsChange={mockOnFilteredJobsChange}
        />
      );

      const filterButton = screen.getByRole("button", { name: /필터/ });

      // Rapidly open and close modal multiple times
      for (let i = 0; i < 5; i++) {
        await user.click(filterButton);

        await waitFor(() => {
          const closeButton = screen.getByLabelText("필터 모달 닫기");
          return user.click(closeButton);
        });
      }

      // Should still be functional
      await user.click(filterButton);
      await waitFor(() => {
        expect(screen.getByLabelText("필터 모달 닫기")).toBeInTheDocument();
      });
    });

    it("should debounce resize events", async () => {
      const { rerender } = render(
        <FilterPanel
          jobs={mockJobs}
          onFilteredJobsChange={mockOnFilteredJobsChange}
        />
      );

      // Rapidly change screen sizes
      act(() => {
        mockInnerWidth(600);
        mockInnerWidth(800);
        mockInnerWidth(600);
        mockInnerWidth(1024);
      });

      rerender(
        <FilterPanel
          jobs={mockJobs}
          onFilteredJobsChange={mockOnFilteredJobsChange}
        />
      );

      // Should settle on final state (desktop)
      await waitFor(() => {
        expect(screen.getByText("전체 채용공고")).toBeInTheDocument();
      });
    });
  });
});
