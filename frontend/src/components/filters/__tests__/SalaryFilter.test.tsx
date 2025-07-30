import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SalaryFilter from "../SalaryFilter";

const mockOnChange = jest.fn();

describe("SalaryFilter", () => {
  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it("should render with correct title", () => {
    render(<SalaryFilter hasSalary={null} onChange={mockOnChange} />);

    expect(screen.getByText("연봉 정보")).toBeInTheDocument();
  });

  it("should be collapsed by default", () => {
    render(<SalaryFilter hasSalary={null} onChange={mockOnChange} />);

    const button = screen.getByRole("button", { name: /연봉 정보/ });
    expect(button).toHaveAttribute("aria-expanded", "false");
  });

  it("should show no active count when hasSalary is null", () => {
    render(<SalaryFilter hasSalary={null} onChange={mockOnChange} />);

    expect(screen.queryByText("1")).not.toBeInTheDocument();
  });

  it("should show active count when hasSalary is not null", () => {
    render(<SalaryFilter hasSalary={true} onChange={mockOnChange} />);

    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("should render all radio options", async () => {
    const user = userEvent.setup();
    render(<SalaryFilter hasSalary={null} onChange={mockOnChange} />);

    // Expand the section first
    const button = screen.getByRole("button", { name: /연봉 정보/ });
    await user.click(button);

    expect(screen.getByText("전체")).toBeInTheDocument();
    expect(screen.getByText("💰 연봉 정보 있음")).toBeInTheDocument();
    expect(screen.getByText("연봉 정보 없음")).toBeInTheDocument();
  });

  it("should show correct selected state for null (전체)", async () => {
    const user = userEvent.setup();
    render(<SalaryFilter hasSalary={null} onChange={mockOnChange} />);

    // Expand the section
    const button = screen.getByRole("button", { name: /연봉 정보/ });
    await user.click(button);

    const allRadio = screen.getByRole("radio", { name: /전체/ });
    const hasSalaryRadio = screen.getByRole("radio", {
      name: /연봉 정보 있음/,
    });
    const noSalaryRadio = screen.getByRole("radio", { name: /연봉 정보 없음/ });

    expect(allRadio).toBeChecked();
    expect(hasSalaryRadio).not.toBeChecked();
    expect(noSalaryRadio).not.toBeChecked();
  });

  it("should show correct selected state for true (연봉 정보 있음)", async () => {
    const user = userEvent.setup();
    render(<SalaryFilter hasSalary={true} onChange={mockOnChange} />);

    // Expand the section
    const button = screen.getByRole("button", { name: /연봉 정보/ });
    await user.click(button);

    const allRadio = screen.getByRole("radio", { name: /전체/ });
    const hasSalaryRadio = screen.getByRole("radio", {
      name: /연봉 정보 있음/,
    });
    const noSalaryRadio = screen.getByRole("radio", { name: /연봉 정보 없음/ });

    expect(allRadio).not.toBeChecked();
    expect(hasSalaryRadio).toBeChecked();
    expect(noSalaryRadio).not.toBeChecked();
  });

  it("should show correct selected state for false (연봉 정보 없음)", async () => {
    const user = userEvent.setup();
    render(<SalaryFilter hasSalary={false} onChange={mockOnChange} />);

    // Expand the section
    const button = screen.getByRole("button", { name: /연봉 정보/ });
    await user.click(button);

    const allRadio = screen.getByRole("radio", { name: /전체/ });
    const hasSalaryRadio = screen.getByRole("radio", {
      name: /연봉 정보 있음/,
    });
    const noSalaryRadio = screen.getByRole("radio", { name: /연봉 정보 없음/ });

    expect(allRadio).not.toBeChecked();
    expect(hasSalaryRadio).not.toBeChecked();
    expect(noSalaryRadio).toBeChecked();
  });

  it("should handle selection of 전체 option", async () => {
    const user = userEvent.setup();
    render(<SalaryFilter hasSalary={true} onChange={mockOnChange} />);

    // Expand the section
    const button = screen.getByRole("button", { name: /연봉 정보/ });
    await user.click(button);

    const allRadio = screen.getByRole("radio", { name: /전체/ });
    await user.click(allRadio);

    expect(mockOnChange).toHaveBeenCalledWith(null);
  });

  it("should handle selection of 연봉 정보 있음 option", async () => {
    const user = userEvent.setup();
    render(<SalaryFilter hasSalary={null} onChange={mockOnChange} />);

    // Expand the section
    const button = screen.getByRole("button", { name: /연봉 정보/ });
    await user.click(button);

    const hasSalaryRadio = screen.getByRole("radio", {
      name: /연봉 정보 있음/,
    });
    await user.click(hasSalaryRadio);

    expect(mockOnChange).toHaveBeenCalledWith(true);
  });

  it("should handle selection of 연봉 정보 없음 option", async () => {
    const user = userEvent.setup();
    render(<SalaryFilter hasSalary={null} onChange={mockOnChange} />);

    // Expand the section
    const button = screen.getByRole("button", { name: /연봉 정보/ });
    await user.click(button);

    const noSalaryRadio = screen.getByRole("radio", { name: /연봉 정보 없음/ });
    await user.click(noSalaryRadio);

    expect(mockOnChange).toHaveBeenCalledWith(false);
  });

  it("should handle keyboard navigation", async () => {
    const user = userEvent.setup();
    render(<SalaryFilter hasSalary={null} onChange={mockOnChange} />);

    // Expand the section
    const button = screen.getByRole("button", { name: /연봉 정보/ });
    await user.click(button);

    const hasSalaryRadio = screen.getByRole("radio", {
      name: /연봉 정보 있음/,
    });
    hasSalaryRadio.focus();

    await user.keyboard(" ");
    expect(mockOnChange).toHaveBeenCalledWith(true);
  });

  it("should maintain radio group behavior", async () => {
    const user = userEvent.setup();
    render(<SalaryFilter hasSalary={null} onChange={mockOnChange} />);

    // Expand the section
    const button = screen.getByRole("button", { name: /연봉 정보/ });
    await user.click(button);

    const allRadio = screen.getByRole("radio", { name: /전체/ });
    const hasSalaryRadio = screen.getByRole("radio", {
      name: /연봉 정보 있음/,
    });
    const noSalaryRadio = screen.getByRole("radio", { name: /연봉 정보 없음/ });

    // All radios should have the same name attribute
    expect(allRadio).toHaveAttribute("name", "salary-filter");
    expect(hasSalaryRadio).toHaveAttribute("name", "salary-filter");
    expect(noSalaryRadio).toHaveAttribute("name", "salary-filter");
  });

  it("should update active count when selection changes", async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <SalaryFilter hasSalary={null} onChange={mockOnChange} />
    );

    // Initially no active count
    expect(screen.queryByText("1")).not.toBeInTheDocument();

    // Rerender with active filter
    rerender(<SalaryFilter hasSalary={true} onChange={mockOnChange} />);
    expect(screen.getByText("1")).toBeInTheDocument();

    // Rerender back to null
    rerender(<SalaryFilter hasSalary={null} onChange={mockOnChange} />);
    expect(screen.queryByText("1")).not.toBeInTheDocument();
  });
});
