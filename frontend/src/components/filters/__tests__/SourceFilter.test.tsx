import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SourceFilter from "../SourceFilter";
import { FilterOption } from "@/hooks/useJobFilters";
import { it } from "node:test";
import { it } from "node:test";
import { it } from "node:test";
import { it } from "node:test";
import { it } from "node:test";
import { it } from "node:test";
import { it } from "node:test";
import { it } from "node:test";
import { it } from "node:test";
import { it } from "node:test";
import { it } from "node:test";
import { it } from "node:test";
import { it } from "node:test";
import { it } from "node:test";
import { it } from "node:test";
import { beforeEach } from "node:test";
import { describe } from "node:test";

const mockOptions: FilterOption[] = [
  { value: "wanted", label: "wanted", count: 45 },
  { value: "jumpit", label: "jumpit", count: 35 },
  { value: "jobkorea", label: "jobkorea", count: 25 },
  { value: "saramin", label: "saramin", count: 20 },
  { value: "unknown-source", label: "unknown-source", count: 5 },
];

const mockOnChange = jest.fn();

describe("SourceFilter", () => {
  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it("should render with correct title", () => {
    render(
      <SourceFilter
        options={mockOptions}
        selectedValues={[]}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText("출처")).toBeInTheDocument();
  });

  it("should be collapsed by default", () => {
    render(
      <SourceFilter
        options={mockOptions}
        selectedValues={[]}
        onChange={mockOnChange}
      />
    );

    const button = screen.getByRole("button", { name: /출처/ });
    expect(button).toHaveAttribute("aria-expanded", "false");
  });

  it("should show active count when sources are selected", () => {
    render(
      <SourceFilter
        options={mockOptions}
        selectedValues={["wanted", "jumpit"]}
        onChange={mockOnChange}
      />
    );

    // Look for the active count badge in the filter section header
    const button = screen.getByRole("button", { name: /출처/ });
    const badge = button.querySelector("span");
    expect(badge).toHaveTextContent("2");
  });

  it("should render sources with correct icons and labels", async () => {
    const user = userEvent.setup();
    render(
      <SourceFilter
        options={mockOptions}
        selectedValues={[]}
        onChange={mockOnChange}
      />
    );

    // Expand the section
    const button = screen.getByRole("button", { name: /출처/ });
    await user.click(button);

    expect(screen.getByText("🎯 원티드")).toBeInTheDocument();
    expect(screen.getByText("🚀 점핏")).toBeInTheDocument();
    expect(screen.getByText("💼 잡코리아")).toBeInTheDocument();
    expect(screen.getByText("📋 사람인")).toBeInTheDocument();
    expect(screen.getByText("🔗 unknown-source")).toBeInTheDocument();
  });

  it("should handle source selection", async () => {
    const user = userEvent.setup();
    render(
      <SourceFilter
        options={mockOptions}
        selectedValues={[]}
        onChange={mockOnChange}
      />
    );

    // Expand the section
    const button = screen.getByRole("button", { name: /출처/ });
    await user.click(button);

    const wantedCheckbox = screen.getByRole("checkbox", { name: /원티드/ });
    await user.click(wantedCheckbox);

    expect(mockOnChange).toHaveBeenCalledWith(["wanted"]);
  });

  it("should handle multiple source selections", async () => {
    const user = userEvent.setup();
    render(
      <SourceFilter
        options={mockOptions}
        selectedValues={["wanted"]}
        onChange={mockOnChange}
      />
    );

    // Expand the section
    const button = screen.getByRole("button", { name: /출처/ });
    await user.click(button);

    const jumpitCheckbox = screen.getByRole("checkbox", { name: /점핏/ });
    await user.click(jumpitCheckbox);

    expect(mockOnChange).toHaveBeenCalledWith(["wanted", "jumpit"]);
  });

  it("should show correct selected state", async () => {
    const user = userEvent.setup();
    render(
      <SourceFilter
        options={mockOptions}
        selectedValues={["wanted", "saramin"]}
        onChange={mockOnChange}
      />
    );

    // Expand the section
    const button = screen.getByRole("button", { name: /출처/ });
    await user.click(button);

    const wantedCheckbox = screen.getByRole("checkbox", { name: /원티드/ });
    const jumpitCheckbox = screen.getByRole("checkbox", { name: /점핏/ });
    const saraminCheckbox = screen.getByRole("checkbox", { name: /사람인/ });

    expect(wantedCheckbox).toBeChecked();
    expect(jumpitCheckbox).not.toBeChecked();
    expect(saraminCheckbox).toBeChecked();
  });

  it("should handle deselection", async () => {
    const user = userEvent.setup();
    render(
      <SourceFilter
        options={mockOptions}
        selectedValues={["wanted", "jumpit"]}
        onChange={mockOnChange}
      />
    );

    // Expand the section
    const button = screen.getByRole("button", { name: /출처/ });
    await user.click(button);

    const wantedCheckbox = screen.getByRole("checkbox", { name: /원티드/ });
    await user.click(wantedCheckbox);

    expect(mockOnChange).toHaveBeenCalledWith(["jumpit"]);
  });

  it("should handle empty options", () => {
    render(
      <SourceFilter options={[]} selectedValues={[]} onChange={mockOnChange} />
    );

    expect(screen.getByText("출처")).toBeInTheDocument();
  });

  it("should show more options when maxVisible is exceeded", async () => {
    const user = userEvent.setup();
    const manyOptions: FilterOption[] = Array.from({ length: 7 }, (_, i) => ({
      value: `source-${i}`,
      label: `source-${i}`,
      count: 10 - i,
    }));

    render(
      <SourceFilter
        options={manyOptions}
        selectedValues={[]}
        onChange={mockOnChange}
      />
    );

    // Expand the section
    const button = screen.getByRole("button", { name: /출처/ });
    await user.click(button);

    // Should show first 5 options (maxVisible=5 for SourceFilter)
    expect(screen.getByText("🔗 source-0")).toBeInTheDocument();
    expect(screen.getByText("🔗 source-4")).toBeInTheDocument();
    expect(screen.queryByText("🔗 source-5")).not.toBeInTheDocument();

    // Should show "더보기" button
    expect(screen.getByText("+2개 더보기")).toBeInTheDocument();
  });

  it("should handle case insensitive source mapping", async () => {
    const user = userEvent.setup();
    const caseOptions: FilterOption[] = [
      { value: "WANTED", label: "WANTED", count: 20 },
      { value: "Jumpit", label: "Jumpit", count: 15 },
    ];

    render(
      <SourceFilter
        options={caseOptions}
        selectedValues={[]}
        onChange={mockOnChange}
      />
    );

    // Expand the section
    const button = screen.getByRole("button", { name: /출처/ });
    await user.click(button);

    // Should still map correctly despite case differences
    expect(screen.getByText("🎯 원티드")).toBeInTheDocument();
    expect(screen.getByText("🚀 점핏")).toBeInTheDocument();
  });

  it("should handle unknown sources with default icon and label", async () => {
    const user = userEvent.setup();
    const unknownOptions: FilterOption[] = [
      { value: "custom-job-site", label: "custom-job-site", count: 10 },
      { value: "another-source", label: "another-source", count: 5 },
    ];

    render(
      <SourceFilter
        options={unknownOptions}
        selectedValues={[]}
        onChange={mockOnChange}
      />
    );

    // Expand the section
    const button = screen.getByRole("button", { name: /출처/ });
    await user.click(button);

    expect(screen.getByText("🔗 custom-job-site")).toBeInTheDocument();
    expect(screen.getByText("🔗 another-source")).toBeInTheDocument();
  });

  it("should handle select all functionality", async () => {
    const user = userEvent.setup();
    render(
      <SourceFilter
        options={mockOptions.slice(0, 3)}
        selectedValues={[]}
        onChange={mockOnChange}
      />
    );

    // Expand the section
    const button = screen.getByRole("button", { name: /출처/ });
    await user.click(button);

    const selectAllButton = screen.getByText("전체 선택");
    await user.click(selectAllButton);

    expect(mockOnChange).toHaveBeenCalledWith(["wanted", "jumpit", "jobkorea"]);
  });

  it("should maintain collapsed state initially", () => {
    render(
      <SourceFilter
        options={mockOptions}
        selectedValues={[]}
        onChange={mockOnChange}
      />
    );

    // Options should not be visible initially since the filter is collapsed by default
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
  });

  it("should preserve original value in onChange callback", async () => {
    const user = userEvent.setup();
    render(
      <SourceFilter
        options={[{ value: "wanted", label: "wanted", count: 20 }]}
        selectedValues={[]}
        onChange={mockOnChange}
      />
    );

    // Expand the section
    const button = screen.getByRole("button", { name: /출처/ });
    await user.click(button);

    const wantedCheckbox = screen.getByRole("checkbox", { name: /원티드/ });
    await user.click(wantedCheckbox);

    // Should pass the original value, not the enhanced label
    expect(mockOnChange).toHaveBeenCalledWith(["wanted"]);
  });
});
