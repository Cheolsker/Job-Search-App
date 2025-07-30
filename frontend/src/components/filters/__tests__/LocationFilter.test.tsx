import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LocationFilter from "../LocationFilter";
import { FilterOption } from "@/hooks/useJobFilters";

const mockOptions: FilterOption[] = [
  { value: "서울", label: "서울", count: 45 },
  { value: "경기", label: "경기", count: 23 },
  { value: "부산", label: "부산", count: 12 },
];

const mockOnChange = jest.fn();

describe("LocationFilter", () => {
  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it("should render with correct title", () => {
    render(
      <LocationFilter
        options={mockOptions}
        selectedValues={[]}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText("근무지역")).toBeInTheDocument();
  });

  it("should be expanded by default", () => {
    render(
      <LocationFilter
        options={mockOptions}
        selectedValues={[]}
        onChange={mockOnChange}
      />
    );

    const button = screen.getByRole("button", { name: /근무지역/ });
    expect(button).toHaveAttribute("aria-expanded", "true");
  });

  it("should show active count when locations are selected", () => {
    render(
      <LocationFilter
        options={mockOptions}
        selectedValues={["서울", "경기"]}
        onChange={mockOnChange}
      />
    );

    // Look for the active count badge in the filter section header
    const button = screen.getByRole("button", { name: /근무지역/ });
    const badge = button.querySelector("span");
    expect(badge).toHaveTextContent("2");
  });

  it("should render all location options", () => {
    render(
      <LocationFilter
        options={mockOptions}
        selectedValues={[]}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText("서울")).toBeInTheDocument();
    expect(screen.getByText("경기")).toBeInTheDocument();
    expect(screen.getByText("부산")).toBeInTheDocument();
  });

  it("should handle location selection", async () => {
    const user = userEvent.setup();
    render(
      <LocationFilter
        options={mockOptions}
        selectedValues={[]}
        onChange={mockOnChange}
      />
    );

    const seoulCheckbox = screen.getByRole("checkbox", { name: /서울/ });
    await user.click(seoulCheckbox);

    expect(mockOnChange).toHaveBeenCalledWith(["서울"]);
  });

  it("should handle multiple location selections", async () => {
    const user = userEvent.setup();
    render(
      <LocationFilter
        options={mockOptions}
        selectedValues={["서울"]}
        onChange={mockOnChange}
      />
    );

    const gyeonggiCheckbox = screen.getByRole("checkbox", { name: /경기/ });
    await user.click(gyeonggiCheckbox);

    expect(mockOnChange).toHaveBeenCalledWith(["서울", "경기"]);
  });

  it("should show correct selected state", () => {
    render(
      <LocationFilter
        options={mockOptions}
        selectedValues={["서울", "부산"]}
        onChange={mockOnChange}
      />
    );

    const seoulCheckbox = screen.getByRole("checkbox", { name: /서울/ });
    const gyeonggiCheckbox = screen.getByRole("checkbox", { name: /경기/ });
    const busanCheckbox = screen.getByRole("checkbox", { name: /부산/ });

    expect(seoulCheckbox).toBeChecked();
    expect(gyeonggiCheckbox).not.toBeChecked();
    expect(busanCheckbox).toBeChecked();
  });

  it("should handle empty options", () => {
    render(
      <LocationFilter
        options={[]}
        selectedValues={[]}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText("근무지역")).toBeInTheDocument();
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
  });

  it("should show more options when maxVisible is exceeded", () => {
    const manyOptions: FilterOption[] = Array.from({ length: 10 }, (_, i) => ({
      value: `location-${i}`,
      label: `Location ${i}`,
      count: 10 - i,
    }));

    render(
      <LocationFilter
        options={manyOptions}
        selectedValues={[]}
        onChange={mockOnChange}
      />
    );

    // Should show first 8 options (maxVisible=8 for LocationFilter)
    expect(screen.getByText("Location 0")).toBeInTheDocument();
    expect(screen.getByText("Location 7")).toBeInTheDocument();
    expect(screen.queryByText("Location 8")).not.toBeInTheDocument();

    // Should show "더보기" button
    expect(screen.getByText("+2개 더보기")).toBeInTheDocument();
  });

  it("should handle deselection", async () => {
    const user = userEvent.setup();
    render(
      <LocationFilter
        options={mockOptions}
        selectedValues={["서울", "경기"]}
        onChange={mockOnChange}
      />
    );

    const seoulCheckbox = screen.getByRole("checkbox", { name: /서울/ });
    await user.click(seoulCheckbox);

    expect(mockOnChange).toHaveBeenCalledWith(["경기"]);
  });
});
