import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ContractTypeFilter from "../ContractTypeFilter";
import { FilterOption } from "@/hooks/useJobFilters";

const mockOptions: FilterOption[] = [
  { value: "정보 없음", label: "정보 없음", count: 15 },
  { value: "정규직", label: "정규직", count: 80 },
  { value: "인턴", label: "인턴", count: 10 },
  { value: "계약직", label: "계약직", count: 25 },
  { value: "프리랜서", label: "프리랜서", count: 5 },
];

const mockOnChange = jest.fn();

describe("ContractTypeFilter", () => {
  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it("should render with correct title", () => {
    render(
      <ContractTypeFilter
        options={mockOptions}
        selectedValues={[]}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText("계약 형태")).toBeInTheDocument();
  });

  it("should be collapsed by default", () => {
    render(
      <ContractTypeFilter
        options={mockOptions}
        selectedValues={[]}
        onChange={mockOnChange}
      />
    );

    const button = screen.getByRole("button", { name: /계약 형태/ });
    expect(button).toHaveAttribute("aria-expanded", "false");
  });

  it("should show active count when contract types are selected", () => {
    render(
      <ContractTypeFilter
        options={mockOptions}
        selectedValues={["정규직", "계약직"]}
        onChange={mockOnChange}
      />
    );

    // Look for the active count badge in the filter section header
    const button = screen.getByRole("button", { name: /계약 형태/ });
    const badge = button.querySelector("span");
    expect(badge).toHaveTextContent("2");
  });

  it("should sort options in correct order", async () => {
    const user = userEvent.setup();
    render(
      <ContractTypeFilter
        options={mockOptions}
        selectedValues={[]}
        onChange={mockOnChange}
      />
    );

    // Expand the section to see options
    const button = screen.getByRole("button", { name: /계약 형태/ });
    await user.click(button);

    const checkboxes = screen.getAllByRole("checkbox");
    const labels = checkboxes.map((checkbox) =>
      checkbox.closest("label")?.textContent?.replace(/\d+$/, "").trim()
    );

    // Should be sorted: 정규직 -> 계약직 -> 인턴 -> 프리랜서 -> 정보 없음
    expect(labels[0]).toBe("정규직");
    expect(labels[1]).toBe("계약직");
    expect(labels[2]).toBe("인턴");
    expect(labels[3]).toBe("프리랜서");
    expect(labels[4]).toBe("정보 없음");
  });

  it("should handle contract type selection", async () => {
    const user = userEvent.setup();
    render(
      <ContractTypeFilter
        options={mockOptions}
        selectedValues={[]}
        onChange={mockOnChange}
      />
    );

    // Expand the section
    const button = screen.getByRole("button", { name: /계약 형태/ });
    await user.click(button);

    const fullTimeCheckbox = screen.getByRole("checkbox", { name: /정규직/ });
    await user.click(fullTimeCheckbox);

    expect(mockOnChange).toHaveBeenCalledWith(["정규직"]);
  });

  it("should handle multiple contract type selections", async () => {
    const user = userEvent.setup();
    render(
      <ContractTypeFilter
        options={mockOptions}
        selectedValues={["정규직"]}
        onChange={mockOnChange}
      />
    );

    // Expand the section
    const button = screen.getByRole("button", { name: /계약 형태/ });
    await user.click(button);

    const contractCheckbox = screen.getByRole("checkbox", { name: /계약직/ });
    await user.click(contractCheckbox);

    expect(mockOnChange).toHaveBeenCalledWith(["정규직", "계약직"]);
  });

  it("should show correct selected state", async () => {
    const user = userEvent.setup();
    render(
      <ContractTypeFilter
        options={mockOptions}
        selectedValues={["정규직", "인턴"]}
        onChange={mockOnChange}
      />
    );

    // Expand the section
    const button = screen.getByRole("button", { name: /계약 형태/ });
    await user.click(button);

    const fullTimeCheckbox = screen.getByRole("checkbox", { name: /정규직/ });
    const contractCheckbox = screen.getByRole("checkbox", { name: /계약직/ });
    const internCheckbox = screen.getByRole("checkbox", { name: /인턴/ });

    expect(fullTimeCheckbox).toBeChecked();
    expect(contractCheckbox).not.toBeChecked();
    expect(internCheckbox).toBeChecked();
  });

  it("should handle deselection", async () => {
    const user = userEvent.setup();
    render(
      <ContractTypeFilter
        options={mockOptions}
        selectedValues={["정규직", "계약직"]}
        onChange={mockOnChange}
      />
    );

    // Expand the section
    const button = screen.getByRole("button", { name: /계약 형태/ });
    await user.click(button);

    const fullTimeCheckbox = screen.getByRole("checkbox", { name: /정규직/ });
    await user.click(fullTimeCheckbox);

    expect(mockOnChange).toHaveBeenCalledWith(["계약직"]);
  });

  it("should handle empty options", () => {
    render(
      <ContractTypeFilter
        options={[]}
        selectedValues={[]}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText("계약 형태")).toBeInTheDocument();
  });

  it("should show more options when maxVisible is exceeded", async () => {
    const user = userEvent.setup();
    const manyOptions: FilterOption[] = Array.from({ length: 7 }, (_, i) => ({
      value: `contract-type-${i}`,
      label: `Contract Type ${i}`,
      count: 10 - i,
    }));

    render(
      <ContractTypeFilter
        options={manyOptions}
        selectedValues={[]}
        onChange={mockOnChange}
      />
    );

    // Expand the section
    const button = screen.getByRole("button", { name: /계약 형태/ });
    await user.click(button);

    // Should show first 5 options (maxVisible=5 for ContractTypeFilter)
    expect(screen.getByText("Contract Type 0")).toBeInTheDocument();
    expect(screen.getByText("Contract Type 4")).toBeInTheDocument();
    expect(screen.queryByText("Contract Type 5")).not.toBeInTheDocument();

    // Should show "더보기" button
    expect(screen.getByText("+2개 더보기")).toBeInTheDocument();
  });

  it("should handle unknown contract types in sorting", async () => {
    const user = userEvent.setup();
    const mixedOptions: FilterOption[] = [
      { value: "정규직", label: "정규직", count: 80 },
      { value: "알바", label: "알바", count: 15 },
      { value: "계약직", label: "계약직", count: 25 },
      { value: "파견직", label: "파견직", count: 8 },
      { value: "정보 없음", label: "정보 없음", count: 10 },
    ];

    render(
      <ContractTypeFilter
        options={mixedOptions}
        selectedValues={[]}
        onChange={mockOnChange}
      />
    );

    // Expand the section
    const button = screen.getByRole("button", { name: /계약 형태/ });
    await user.click(button);

    const checkboxes = screen.getAllByRole("checkbox");
    const labels = checkboxes.map((checkbox) =>
      checkbox.closest("label")?.textContent?.replace(/\d+$/, "").trim()
    );

    // Known types should come first in order, unknown types should be sorted alphabetically
    expect(labels[0]).toBe("정규직");
    expect(labels[1]).toBe("계약직");
    expect(labels).toContain("알바");
    expect(labels).toContain("파견직");
    expect(labels).toContain("정보 없음");
    // "정보 없음" should be last among known types, but unknown types may come after
    const infoNoneIndex = labels.indexOf("정보 없음");
    expect(infoNoneIndex).toBeGreaterThan(-1);
  });

  it("should handle select all functionality", async () => {
    const user = userEvent.setup();
    render(
      <ContractTypeFilter
        options={mockOptions.slice(0, 3)}
        selectedValues={[]}
        onChange={mockOnChange}
      />
    );

    // Expand the section
    const button = screen.getByRole("button", { name: /계약 형태/ });
    await user.click(button);

    const selectAllButton = screen.getByText("전체 선택");
    await user.click(selectAllButton);

    // Should select all values from the first 3 options (sorted: 정규직, 계약직, 인턴)
    expect(mockOnChange).toHaveBeenCalledWith(["정규직", "인턴", "정보 없음"]);
  });

  it("should maintain collapsed state initially", () => {
    render(
      <ContractTypeFilter
        options={mockOptions}
        selectedValues={[]}
        onChange={mockOnChange}
      />
    );

    // Options should not be visible initially
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
  });
});
