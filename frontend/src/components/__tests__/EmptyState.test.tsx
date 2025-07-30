import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import EmptyState from "../EmptyState";

describe("EmptyState", () => {
  it("should render no-search state correctly", () => {
    render(<EmptyState type="no-search" />);

    expect(screen.getByText("검색어를 입력해주세요")).toBeInTheDocument();
    expect(
      screen.getByText("원하는 직무, 회사, 키워드를 검색해보세요")
    ).toBeInTheDocument();
    expect(screen.getByText("🔍")).toBeInTheDocument();
  });

  it("should render no-results state correctly", () => {
    render(<EmptyState type="no-results" />);

    expect(screen.getByText("검색 결과가 없습니다")).toBeInTheDocument();
    expect(screen.getByText("다른 키워드로 검색해보세요")).toBeInTheDocument();
    expect(screen.getByText("😔")).toBeInTheDocument();
  });

  it("should render no-filter-results state correctly", () => {
    render(<EmptyState type="no-filter-results" />);

    expect(
      screen.getByText("조건에 맞는 채용공고가 없습니다")
    ).toBeInTheDocument();
    expect(screen.getByText("필터 조건을 조정해보세요")).toBeInTheDocument();
    expect(screen.getByText("🔍")).toBeInTheDocument();
  });

  it("should render error state correctly", () => {
    render(<EmptyState type="error" />);

    expect(screen.getByText("오류가 발생했습니다")).toBeInTheDocument();
    expect(screen.getByText("잠시 후 다시 시도해주세요")).toBeInTheDocument();
    expect(screen.getByText("⚠️")).toBeInTheDocument();
  });

  it("should render custom content when provided", () => {
    render(
      <EmptyState
        type="error"
        title="커스텀 제목"
        description="커스텀 설명"
        icon="🎯"
      />
    );

    expect(screen.getByText("커스텀 제목")).toBeInTheDocument();
    expect(screen.getByText("커스텀 설명")).toBeInTheDocument();
    expect(screen.getByText("🎯")).toBeInTheDocument();
  });

  it("should call onReset when reset button is clicked", () => {
    const mockOnReset = jest.fn();

    render(
      <EmptyState type="error" onReset={mockOnReset} resetButtonText="재시도" />
    );

    const resetButton = screen.getByText("재시도");
    fireEvent.click(resetButton);

    expect(mockOnReset).toHaveBeenCalledTimes(1);
  });

  it("should not render reset button when onReset is not provided", () => {
    render(<EmptyState type="error" />);

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
