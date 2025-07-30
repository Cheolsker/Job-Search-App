import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ExperienceFilter from "../ExperienceFilter";
import { FilterOption } from "@/hooks/useJobFilters";

const mockOptions: FilterOption[] = [
  { value: "5년 이상", label: "5년 이상", count: 15 },
  { value: "경력 무관", label: "경력 무관", count: 25 },
  { value: "3년 이상", label: "3년 이상", count: 20 },
  { value: "신입", label: "신입", count: 30 },
  { value: "1년 이상", label: "1년 이상", count: 18 },
];

const mockOnChange = jest.fn();

describe("ExperienceFilter", () => {
  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it("should render with correct title", () => {
    render(
      <ExperienceFilter
        options={mockOptions}
        selectedValues={[]}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText("경력")).toBeInTheDocument();
  });

  it("should be expanded by default", () => {
    render(
      <ExperienceFilter
        options={mockOptions}
        selectedValues={[]}
        onChange={mockOnChange}
      />
    );

    const button = screen.getByRole("button", { name: /경력/ });
    expect(button).toHaveAttribute("aria-expanded", "true");
  });

  it("should show active count when experiences are selected", () => {
    render(
      <ExperienceFilter
        options={mockOptions}
        selectedValues={["신입", "3년 이상"]}
        onChange={mockOnChange}
      />
    );

    // Look for the active count badge in the filter section header
    const button = screen.getByRole("button", { name: /경력/ });
    const badge = button.querySelector("span");
    expect(badge).toHaveTextContent("2");
  });

  it("should sort options in correct order", () => {
    render(
      <ExperienceFilter
        options={mockOptions}
        selectedValues={[]}
        onChange={mockOnChange}
      />
    );

    const checkboxes = screen.getAllByRole("checkbox");
    const labels = checkboxes.map((checkbox) =>
      checkbox.closest("label")?.textContent?.replace(/\d+$/, "").trim()
    );

    // Should be sorted: 경력 무관 -> 신입 -> 1년 이상 -> 3년 이상 -> 5년 이상
    expect(labels[0]).toBe("경력 무관");
    expect(labels[1]).toBe("신입");
    expect(labels[2]).toBe("1년 이상");
    expect(labels[3]).toBe("3년 이상");
    expect(labels[4]).toBe("5년 이상");
  });

  it("should handle experience selection", async () => {
    const user = userEvent.setup();
    render(
      <ExperienceFilter
        options={mockOptions}
        selectedValues={[]}
        onChange={mockOnChange}
      />
    );

    const freshGradCheckbox = screen.getByRole("checkbox", { name: /신입/ });
    await user.click(freshGradCheckbox);

    expect(mockOnChange).toHaveBeenCalledWith(["신입"]);
  });

  it("should handle multiple experience selections", async () => {
    const user = userEvent.setup();
    render(
      <ExperienceFilter
        options={mockOptions}
        selectedValues={["신입"]}
        onChange={mockOnChange}
      />
    );

    const experiencedCheckbox = screen.getByRole("checkbox", {
      name: /3년 이상/,
    });
    await user.click(experiencedCheckbox);

    expect(mockOnChange).toHaveBeenCalledWith(["신입", "3년 이상"]);
  });

  it("should show correct selected state", () => {
    render(
      <ExperienceFilter
        options={mockOptions}
        selectedValues={["경력 무관", "5년 이상"]}
        onChange={mockOnChange}
      />
    );

    const anyExperienceCheckbox = screen.getByRole("checkbox", {
      name: /경력 무관/,
    });
    const freshGradCheckbox = screen.getByRole("checkbox", { name: /신입/ });
    const seniorCheckbox = screen.getByRole("checkbox", { name: /5년 이상/ });

    expect(anyExperienceCheckbox).toBeChecked();
    expect(freshGradCheckbox).not.toBeChecked();
    expect(seniorCheckbox).toBeChecked();
  });

  it("should handle deselection", async () => {
    const user = userEvent.setup();
    render(
      <ExperienceFilter
        options={mockOptions}
        selectedValues={["신입", "3년 이상"]}
        onChange={mockOnChange}
      />
    );

    const freshGradCheckbox = screen.getByRole("checkbox", { name: /신입/ });
    await user.click(freshGradCheckbox);

    expect(mockOnChange).toHaveBeenCalledWith(["3년 이상"]);
  });

  it("should handle empty options", () => {
    render(
      <ExperienceFilter
        options={[]}
        selectedValues={[]}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText("경력")).toBeInTheDocument();
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
  });

  it("should show more options when maxVisible is exceeded", () => {
    const manyOptions: FilterOption[] = Array.from({ length: 8 }, (_, i) => ({
      value: `${i + 1}년 이상`,
      label: `${i + 1}년 이상`,
      count: 10 - i,
    }));

    render(
      <ExperienceFilter
        options={manyOptions}
        selectedValues={[]}
        onChange={mockOnChange}
      />
    );

    // Should show first 6 options (maxVisible=6 for ExperienceFilter)
    expect(screen.getByText("1년 이상")).toBeInTheDocument();
    expect(screen.getByText("6년 이상")).toBeInTheDocument();
    expect(screen.queryByText("7년 이상")).not.toBeInTheDocument();

    // Should show "더보기" button
    expect(screen.getByText("+2개 더보기")).toBeInTheDocument();
  });

  it("should handle options without numbers correctly", () => {
    const mixedOptions: FilterOption[] = [
      { value: "경력 무관", label: "경력 무관", count: 25 },
      { value: "신입", label: "신입", count: 30 },
      { value: "시니어", label: "시니어", count: 10 },
      { value: "3년 이상", label: "3년 이상", count: 20 },
    ];

    render(
      <ExperienceFilter
        options={mixedOptions}
        selectedValues={[]}
        onChange={mockOnChange}
      />
    );

    const checkboxes = screen.getAllByRole("checkbox");
    const labels = checkboxes.map((checkbox) =>
      checkbox.closest("label")?.textContent?.replace(/\d+$/, "").trim()
    );

    // Should prioritize 경력 무관 and 신입, then sort others
    expect(labels[0]).toBe("경력 무관");
    expect(labels[1]).toBe("신입");
    expect(labels).toContain("3년 이상");
    expect(labels).toContain("시니어");
  });

  it("should maintain sorting with duplicate numbers", () => {
    const duplicateOptions: FilterOption[] = [
      { value: "3년 이상 (백엔드)", label: "3년 이상 (백엔드)", count: 15 },
      { value: "경력 무관", label: "경력 무관", count: 25 },
      {
        value: "3년 이상 (프론트엔드)",
        label: "3년 이상 (프론트엔드)",
        count: 20,
      },
      { value: "신입", label: "신입", count: 30 },
    ];

    render(
      <ExperienceFilter
        options={duplicateOptions}
        selectedValues={[]}
        onChange={mockOnChange}
      />
    );

    const checkboxes = screen.getAllByRole("checkbox");
    const labels = checkboxes.map((checkbox) =>
      checkbox.closest("label")?.textContent?.replace(/\d+$/, "").trim()
    );

    // Should still prioritize 경력 무관 and 신입
    expect(labels[0]).toBe("경력 무관");
    expect(labels[1]).toBe("신입");
  });
});
