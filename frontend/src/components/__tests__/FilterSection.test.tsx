import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FilterSection from "../FilterSection";
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
import { describe } from "node:test";

describe("FilterSection", () => {
  it("should render with title and children", () => {
    render(
      <FilterSection title="Test Filter">
        <div>Test Content</div>
      </FilterSection>
    );

    expect(screen.getByText("Test Filter")).toBeInTheDocument();
    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });

  it("should show active count badge when activeCount > 0", () => {
    render(
      <FilterSection title="Test Filter" activeCount={3}>
        <div>Test Content</div>
      </FilterSection>
    );

    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("should not show active count badge when activeCount is 0", () => {
    render(
      <FilterSection title="Test Filter" activeCount={0}>
        <div>Test Content</div>
      </FilterSection>
    );

    expect(screen.queryByText("0")).not.toBeInTheDocument();
  });

  it("should be expanded by default when defaultExpanded is true", () => {
    render(
      <FilterSection title="Test Filter" defaultExpanded={true}>
        <div>Test Content</div>
      </FilterSection>
    );

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Test Content")).toBeVisible();
  });

  it("should be collapsed by default when defaultExpanded is false", () => {
    render(
      <FilterSection title="Test Filter" defaultExpanded={false}>
        <div>Test Content</div>
      </FilterSection>
    );

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-expanded", "false");
  });

  it("should toggle expanded state when header is clicked", async () => {
    const user = userEvent.setup();
    render(
      <FilterSection title="Test Filter" defaultExpanded={true}>
        <div>Test Content</div>
      </FilterSection>
    );

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-expanded", "true");

    await user.click(button);
    expect(button).toHaveAttribute("aria-expanded", "false");

    await user.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");
  });

  it("should have proper ARIA attributes", () => {
    render(
      <FilterSection title="Test Filter">
        <div>Test Content</div>
      </FilterSection>
    );

    const button = screen.getByRole("button");
    // Find the content container that has the id attribute (it's the parent of the content)
    const contentContainer = screen.getByText("Test Content").closest("div")
      ?.parentElement?.parentElement;

    expect(button).toHaveAttribute("aria-expanded");
    expect(button).toHaveAttribute("aria-controls");
    expect(contentContainer).toHaveAttribute("id");
  });

  it("should apply custom className", () => {
    const { container } = render(
      <FilterSection title="Test Filter" className="custom-class">
        <div>Test Content</div>
      </FilterSection>
    );

    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("should handle keyboard navigation", async () => {
    const user = userEvent.setup();
    render(
      <FilterSection title="Test Filter" defaultExpanded={true}>
        <div>Test Content</div>
      </FilterSection>
    );

    const button = screen.getByRole("button");
    button.focus();

    expect(button).toHaveAttribute("aria-expanded", "true");

    // Press Enter to toggle
    await user.keyboard("{Enter}");
    expect(button).toHaveAttribute("aria-expanded", "false");

    // Press Space to toggle
    await user.keyboard(" ");
    expect(button).toHaveAttribute("aria-expanded", "true");
  });

  it("should rotate chevron icon based on expanded state", async () => {
    const user = userEvent.setup();
    render(
      <FilterSection title="Test Filter" defaultExpanded={false}>
        <div>Test Content</div>
      </FilterSection>
    );

    const button = screen.getByRole("button");
    const chevron = button.querySelector("svg");

    // Initially collapsed - should have rotate-0
    expect(chevron).toHaveClass("rotate-0");

    await user.click(button);

    // After expanding - should have rotate-180
    expect(chevron).toHaveClass("rotate-180");
  });

  it("should handle content with dynamic height", async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <FilterSection title="Test Filter" defaultExpanded={true}>
        <div>Short Content</div>
      </FilterSection>
    );

    const button = screen.getByRole("button");

    // Collapse the section
    await user.click(button);
    expect(button).toHaveAttribute("aria-expanded", "false");

    // Change content to longer content
    rerender(
      <FilterSection title="Test Filter" defaultExpanded={false}>
        <div>
          <div>Much longer content</div>
          <div>With multiple lines</div>
          <div>To test height calculation</div>
        </div>
      </FilterSection>
    );

    // Expand again
    await user.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Much longer content")).toBeInTheDocument();
  });

  it("should maintain accessibility during animations", async () => {
    const user = userEvent.setup();
    render(
      <FilterSection title="Test Filter" defaultExpanded={true}>
        <div>Test Content</div>
      </FilterSection>
    );

    const button = screen.getByRole("button");
    // Find the content container with the aria-hidden attribute (it's the parent of the content)
    const contentContainer = screen.getByText("Test Content").closest("div")
      ?.parentElement?.parentElement;

    // Initially expanded, so aria-hidden should be false
    expect(contentContainer).toHaveAttribute("aria-hidden", "false");

    await user.click(button);

    // After collapse, aria-hidden should be true
    expect(contentContainer).toHaveAttribute("aria-hidden", "true");
  });

  it("should generate unique IDs for multiple instances", () => {
    render(
      <div>
        <FilterSection title="First Filter">
          <div>First Content</div>
        </FilterSection>
        <FilterSection title="Second Filter">
          <div>Second Content</div>
        </FilterSection>
      </div>
    );

    const firstButton = screen.getByRole("button", { name: /First Filter/ });
    const secondButton = screen.getByRole("button", { name: /Second Filter/ });

    const firstControlsId = firstButton.getAttribute("aria-controls");
    const secondControlsId = secondButton.getAttribute("aria-controls");

    expect(firstControlsId).not.toBe(secondControlsId);
    expect(firstControlsId).toContain("first-filter");
    expect(secondControlsId).toContain("second-filter");
  });
});
