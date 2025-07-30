import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CheckboxFilter from "../CheckboxFilter";
import { FilterOption } from "@/hooks/useJobFilters";

const mockOptions: FilterOption[] = [
  { value: "서울", label: "서울", count: 45 },
  { value: "경기", label: "경기", count: 23 },
  { value: "부산", label: "부산", count: 12 },
  { value: "대구", label: "대구", count: 8 },
  { value: "인천", label: "인천", count: 6 },
  { value: "광주", label: "광주", count: 4 },
  { value: "대전", label: "대전", count: 3 },
];

const mockOnChange = jest.fn();

describe("CheckboxFilter", () => {
  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it("should render all options with correct labels and counts", () => {
    render(
      <CheckboxFilter
        options={mockOptions.slice(0, 3)}
        selectedValues={[]}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText("서울")).toBeInTheDocument();
    expect(screen.getByText("45")).toBeInTheDocument();
    expect(screen.getByText("경기")).toBeInTheDocument();
    expect(screen.getByText("23")).toBeInTheDocument();
    expect(screen.getByText("부산")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
  });

  it("should show selected state correctly", () => {
    render(
      <CheckboxFilter
        options={mockOptions.slice(0, 3)}
        selectedValues={["서울", "경기"]}
        onChange={mockOnChange}
      />
    );

    const seoulCheckbox = screen.getByRole("checkbox", { name: /서울/ });
    const gyeonggiCheckbox = screen.getByRole("checkbox", { name: /경기/ });
    const busanCheckbox = screen.getByRole("checkbox", { name: /부산/ });

    expect(seoulCheckbox).toBeChecked();
    expect(gyeonggiCheckbox).toBeChecked();
    expect(busanCheckbox).not.toBeChecked();
  });

  it("should call onChange when checkbox is clicked", async () => {
    const user = userEvent.setup();
    render(
      <CheckboxFilter
        options={mockOptions.slice(0, 3)}
        selectedValues={[]}
        onChange={mockOnChange}
      />
    );

    const seoulCheckbox = screen.getByRole("checkbox", { name: /서울/ });
    await user.click(seoulCheckbox);

    expect(mockOnChange).toHaveBeenCalledWith(["서울"]);
  });

  it("should handle unchecking selected items", async () => {
    const user = userEvent.setup();
    render(
      <CheckboxFilter
        options={mockOptions.slice(0, 3)}
        selectedValues={["서울", "경기"]}
        onChange={mockOnChange}
      />
    );

    const seoulCheckbox = screen.getByRole("checkbox", { name: /서울/ });
    await user.click(seoulCheckbox);

    expect(mockOnChange).toHaveBeenCalledWith(["경기"]);
  });

  it("should show select all/deselect all functionality", () => {
    render(
      <CheckboxFilter
        options={mockOptions.slice(0, 3)}
        selectedValues={[]}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText("전체 선택")).toBeInTheDocument();
    expect(
      screen.getByText((content, element) => {
        return element?.textContent === "0/3개 선택";
      })
    ).toBeInTheDocument();
  });

  it("should handle select all functionality", async () => {
    const user = userEvent.setup();
    render(
      <CheckboxFilter
        options={mockOptions.slice(0, 3)}
        selectedValues={[]}
        onChange={mockOnChange}
      />
    );

    const selectAllButton = screen.getByText("전체 선택");
    await user.click(selectAllButton);

    expect(mockOnChange).toHaveBeenCalledWith(["서울", "경기", "부산"]);
  });

  it("should handle deselect all functionality", async () => {
    const user = userEvent.setup();
    render(
      <CheckboxFilter
        options={mockOptions.slice(0, 3)}
        selectedValues={["서울", "경기", "부산"]}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText("전체 해제")).toBeInTheDocument();
    expect(
      screen.getByText((content, element) => {
        return element?.textContent === "3/3개 선택";
      })
    ).toBeInTheDocument();

    const deselectAllButton = screen.getByText("전체 해제");
    await user.click(deselectAllButton);

    expect(mockOnChange).toHaveBeenCalledWith([]);
  });

  it("should show more/less functionality when maxVisible is exceeded", () => {
    render(
      <CheckboxFilter
        options={mockOptions}
        selectedValues={[]}
        onChange={mockOnChange}
        maxVisible={3}
      />
    );

    // Should show only first 3 options initially
    expect(screen.getByText("서울")).toBeInTheDocument();
    expect(screen.getByText("경기")).toBeInTheDocument();
    expect(screen.getByText("부산")).toBeInTheDocument();
    expect(screen.queryByText("대구")).not.toBeInTheDocument();

    // Should show "더보기" button
    expect(screen.getByText("+4개 더보기")).toBeInTheDocument();
  });

  it("should expand to show all options when 더보기 is clicked", async () => {
    const user = userEvent.setup();
    render(
      <CheckboxFilter
        options={mockOptions}
        selectedValues={[]}
        onChange={mockOnChange}
        maxVisible={3}
      />
    );

    const showMoreButton = screen.getByText("+4개 더보기");
    await user.click(showMoreButton);

    // Should now show all options
    expect(screen.getByText("대구")).toBeInTheDocument();
    expect(screen.getByText("인천")).toBeInTheDocument();
    expect(screen.getByText("광주")).toBeInTheDocument();
    expect(screen.getByText("대전")).toBeInTheDocument();

    // Button should change to "접기"
    expect(screen.getByText("접기")).toBeInTheDocument();
  });

  it("should show search input when showSearch is true and options > 5", () => {
    render(
      <CheckboxFilter
        options={mockOptions}
        selectedValues={[]}
        onChange={mockOnChange}
        showSearch={true}
      />
    );

    expect(screen.getByPlaceholderText("옵션 검색...")).toBeInTheDocument();
  });

  it("should filter options based on search term", async () => {
    const user = userEvent.setup();
    render(
      <CheckboxFilter
        options={mockOptions}
        selectedValues={[]}
        onChange={mockOnChange}
        showSearch={true}
      />
    );

    const searchInput = screen.getByPlaceholderText("옵션 검색...");
    await user.type(searchInput, "서울");

    // Should only show Seoul option
    expect(screen.getByText("서울")).toBeInTheDocument();
    expect(screen.queryByText("경기")).not.toBeInTheDocument();
    expect(screen.queryByText("부산")).not.toBeInTheDocument();
  });

  it("should show no results message when search has no matches", async () => {
    const user = userEvent.setup();
    render(
      <CheckboxFilter
        options={mockOptions}
        selectedValues={[]}
        onChange={mockOnChange}
        showSearch={true}
      />
    );

    const searchInput = screen.getByPlaceholderText("옵션 검색...");
    await user.type(searchInput, "존재하지않는도시");

    expect(
      screen.getByText('"존재하지않는도시"에 대한 결과가 없습니다')
    ).toBeInTheDocument();
  });

  it("should not show select all button when only one option", () => {
    render(
      <CheckboxFilter
        options={[mockOptions[0]]}
        selectedValues={[]}
        onChange={mockOnChange}
      />
    );

    expect(screen.queryByText("전체 선택")).not.toBeInTheDocument();
  });

  it("should handle empty options array", () => {
    render(
      <CheckboxFilter
        options={[]}
        selectedValues={[]}
        onChange={mockOnChange}
      />
    );

    expect(screen.queryByText("전체 선택")).not.toBeInTheDocument();
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
  });

  it("should maintain search functionality with show more/less", async () => {
    const user = userEvent.setup();
    render(
      <CheckboxFilter
        options={mockOptions}
        selectedValues={[]}
        onChange={mockOnChange}
        maxVisible={3}
        showSearch={true}
      />
    );

    // Search for options that would be hidden by maxVisible
    const searchInput = screen.getByPlaceholderText("옵션 검색...");
    await user.type(searchInput, "대");

    // Should show both 대구 and 대전 even though they're beyond maxVisible
    expect(screen.getByText("대구")).toBeInTheDocument();
    expect(screen.getByText("대전")).toBeInTheDocument();
    expect(screen.queryByText("서울")).not.toBeInTheDocument();
  });

  it("should handle keyboard navigation", async () => {
    const user = userEvent.setup();
    render(
      <CheckboxFilter
        options={mockOptions.slice(0, 3)}
        selectedValues={[]}
        onChange={mockOnChange}
      />
    );

    const seoulCheckbox = screen.getByRole("checkbox", { name: /서울/ });

    // Focus and press space to toggle
    seoulCheckbox.focus();
    await user.keyboard(" ");

    expect(mockOnChange).toHaveBeenCalledWith(["서울"]);
  });
});
