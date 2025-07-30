import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CategoryFilter from "../CategoryFilter";
import { FilterOption } from "@/hooks/useJobFilters";

const mockOptions: FilterOption[] = [
  { value: "개발", label: "개발", count: 120 },
  { value: "마케팅·광고", label: "마케팅·광고", count: 45 },
  { value: "디자인", label: "디자인", count: 30 },
  { value: "기획·전략", label: "기획·전략", count: 25 },
  { value: "영업", label: "영업", count: 20 },
];

const mockOnChange = jest.fn();

describe("CategoryFilter", () => {
  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it("should render with correct title", () => {
    render(
      <CategoryFilter
        options={mockOptions}
        selectedValues={[]}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText("직무 카테고리")).toBeInTheDocument();
  });

  it("should be expanded by default", () => {
    render(
      <CategoryFilter
        options={mockOptions}
        selectedValues={[]}
        onChange={mockOnChange}
      />
    );

    const button = screen.getByRole("button", { name: /직무 카테고리/ });
    expect(button).toHaveAttribute("aria-expanded", "true");
  });

  it("should show active count when categories are selected", () => {
    render(
      <CategoryFilter
        options={mockOptions}
        selectedValues={["개발", "디자인"]}
        onChange={mockOnChange}
      />
    );

    // Look for the active count badge in the filter section header
    const button = screen.getByRole("button", { name: /직무 카테고리/ });
    const badge = button.querySelector("span");
    expect(badge).toHaveTextContent("2");
  });

  it("should render all category options", () => {
    render(
      <CategoryFilter
        options={mockOptions}
        selectedValues={[]}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText("개발")).toBeInTheDocument();
    expect(screen.getByText("마케팅·광고")).toBeInTheDocument();
    expect(screen.getByText("디자인")).toBeInTheDocument();
    expect(screen.getByText("기획·전략")).toBeInTheDocument();
    expect(screen.getByText("영업")).toBeInTheDocument();
  });

  it("should show correct counts for each category", () => {
    render(
      <CategoryFilter
        options={mockOptions}
        selectedValues={[]}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText("120")).toBeInTheDocument();
    expect(screen.getByText("45")).toBeInTheDocument();
    expect(screen.getByText("30")).toBeInTheDocument();
    expect(screen.getByText("25")).toBeInTheDocument();
    expect(screen.getByText("20")).toBeInTheDocument();
  });

  it("should handle category selection", async () => {
    const user = userEvent.setup();
    render(
      <CategoryFilter
        options={mockOptions}
        selectedValues={[]}
        onChange={mockOnChange}
      />
    );

    const developmentCheckbox = screen.getByRole("checkbox", { name: /개발/ });
    await user.click(developmentCheckbox);

    expect(mockOnChange).toHaveBeenCalledWith(["개발"]);
  });

  it("should handle multiple category selections", async () => {
    const user = userEvent.setup();
    render(
      <CategoryFilter
        options={mockOptions}
        selectedValues={["개발"]}
        onChange={mockOnChange}
      />
    );

    const marketingCheckbox = screen.getByRole("checkbox", {
      name: /마케팅·광고/,
    });
    await user.click(marketingCheckbox);

    expect(mockOnChange).toHaveBeenCalledWith(["개발", "마케팅·광고"]);
  });

  it("should show correct selected state", () => {
    render(
      <CategoryFilter
        options={mockOptions}
        selectedValues={["개발", "디자인"]}
        onChange={mockOnChange}
      />
    );

    const developmentCheckbox = screen.getByRole("checkbox", { name: /개발/ });
    const marketingCheckbox = screen.getByRole("checkbox", {
      name: /마케팅·광고/,
    });
    const designCheckbox = screen.getByRole("checkbox", { name: /디자인/ });

    expect(developmentCheckbox).toBeChecked();
    expect(marketingCheckbox).not.toBeChecked();
    expect(designCheckbox).toBeChecked();
  });

  it("should handle deselection", async () => {
    const user = userEvent.setup();
    render(
      <CategoryFilter
        options={mockOptions}
        selectedValues={["개발", "디자인"]}
        onChange={mockOnChange}
      />
    );

    const developmentCheckbox = screen.getByRole("checkbox", { name: /개발/ });
    await user.click(developmentCheckbox);

    expect(mockOnChange).toHaveBeenCalledWith(["디자인"]);
  });

  it("should handle empty options", () => {
    render(
      <CategoryFilter
        options={[]}
        selectedValues={[]}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText("직무 카테고리")).toBeInTheDocument();
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
  });

  it("should show more options when maxVisible is exceeded", () => {
    const manyOptions: FilterOption[] = Array.from({ length: 12 }, (_, i) => ({
      value: `category-${i}`,
      label: `Category ${i}`,
      count: 50 - i,
    }));

    render(
      <CategoryFilter
        options={manyOptions}
        selectedValues={[]}
        onChange={mockOnChange}
      />
    );

    // Should show first 10 options (maxVisible=10 for CategoryFilter)
    expect(screen.getByText("Category 0")).toBeInTheDocument();
    expect(screen.getByText("Category 9")).toBeInTheDocument();
    expect(screen.queryByText("Category 10")).not.toBeInTheDocument();

    // Should show "더보기" button
    expect(screen.getByText("+2개 더보기")).toBeInTheDocument();
  });

  it("should handle categories with special characters", () => {
    const specialOptions: FilterOption[] = [
      { value: "IT·개발", label: "IT·개발", count: 100 },
      { value: "마케팅·광고·홍보", label: "마케팅·광고·홍보", count: 50 },
      { value: "기획·전략·경영", label: "기획·전략·경영", count: 30 },
    ];

    render(
      <CategoryFilter
        options={specialOptions}
        selectedValues={[]}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText("IT·개발")).toBeInTheDocument();
    expect(screen.getByText("마케팅·광고·홍보")).toBeInTheDocument();
    expect(screen.getByText("기획·전략·경영")).toBeInTheDocument();
  });

  it("should handle select all functionality", async () => {
    const user = userEvent.setup();
    render(
      <CategoryFilter
        options={mockOptions.slice(0, 3)}
        selectedValues={[]}
        onChange={mockOnChange}
      />
    );

    const selectAllButton = screen.getByText("전체 선택");
    await user.click(selectAllButton);

    expect(mockOnChange).toHaveBeenCalledWith([
      "개발",
      "마케팅·광고",
      "디자인",
    ]);
  });

  it("should handle deselect all functionality", async () => {
    const user = userEvent.setup();
    render(
      <CategoryFilter
        options={mockOptions.slice(0, 3)}
        selectedValues={["개발", "마케팅·광고", "디자인"]}
        onChange={mockOnChange}
      />
    );

    const deselectAllButton = screen.getByText("전체 해제");
    await user.click(deselectAllButton);

    expect(mockOnChange).toHaveBeenCalledWith([]);
  });

  it("should maintain order of options as provided", () => {
    const orderedOptions: FilterOption[] = [
      { value: "Z카테고리", label: "Z카테고리", count: 10 },
      { value: "A카테고리", label: "A카테고리", count: 20 },
      { value: "M카테고리", label: "M카테고리", count: 15 },
    ];

    render(
      <CategoryFilter
        options={orderedOptions}
        selectedValues={[]}
        onChange={mockOnChange}
      />
    );

    const checkboxes = screen.getAllByRole("checkbox");
    const labels = checkboxes.map((checkbox) =>
      checkbox.closest("label")?.textContent?.replace(/\d+$/, "").trim()
    );

    // Should maintain the original order
    expect(labels[0]).toBe("Z카테고리");
    expect(labels[1]).toBe("A카테고리");
    expect(labels[2]).toBe("M카테고리");
  });
});
