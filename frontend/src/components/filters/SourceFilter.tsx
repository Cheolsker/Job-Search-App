"use client";

import FilterSection from "../FilterSection";
import CheckboxFilter from "./CheckboxFilter";
import { FilterOption } from "@/hooks/useJobFilters";

interface SourceFilterProps {
  options: FilterOption[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
}

export default function SourceFilter({
  options,
  selectedValues,
  onChange,
}: SourceFilterProps) {
  // 출처별 아이콘 매핑
  const getSourceIcon = (source: string) => {
    switch (source.toLowerCase()) {
      case "wanted":
        return "🎯";
      case "jumpit":
        return "🚀";
      case "jobkorea":
        return "💼";
      case "saramin":
        return "📋";
      default:
        return "🔗";
    }
  };

  // 출처명 표시용 매핑
  const getSourceLabel = (source: string) => {
    switch (source.toLowerCase()) {
      case "wanted":
        return "원티드";
      case "jumpit":
        return "점핏";
      case "jobkorea":
        return "잡코리아";
      case "saramin":
        return "사람인";
      default:
        return source;
    }
  };

  // 옵션에 아이콘과 라벨 추가
  const enhancedOptions = options.map((option) => ({
    ...option,
    label: `${getSourceIcon(option.value)} ${getSourceLabel(option.value)}`,
  }));

  return (
    <FilterSection
      title="출처"
      activeCount={selectedValues.length}
      defaultExpanded={false}
    >
      <CheckboxFilter
        options={enhancedOptions}
        selectedValues={selectedValues}
        onChange={onChange}
        maxVisible={5}
      />
    </FilterSection>
  );
}
