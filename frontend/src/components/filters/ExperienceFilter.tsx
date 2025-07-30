"use client";

import FilterSection from "../FilterSection";
import CheckboxFilter from "./CheckboxFilter";
import { FilterOption } from "@/hooks/useJobFilters";

interface ExperienceFilterProps {
  options: FilterOption[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
}

export default function ExperienceFilter({
  options,
  selectedValues,
  onChange,
}: ExperienceFilterProps) {
  // 경력 순서 정렬 (경력 무관 -> 신입 -> 1년 이상 -> 2년 이상 ...)
  const sortedOptions = [...options].sort((a, b) => {
    if (a.value === "경력 무관") return -1;
    if (b.value === "경력 무관") return 1;
    if (a.value === "신입") return -1;
    if (b.value === "신입") return 1;

    // 숫자 추출하여 정렬
    const aNum = parseInt(a.value.match(/\d+/)?.[0] || "0");
    const bNum = parseInt(b.value.match(/\d+/)?.[0] || "0");
    return aNum - bNum;
  });

  return (
    <FilterSection
      title="경력"
      activeCount={selectedValues.length}
      defaultExpanded={true}
    >
      <CheckboxFilter
        options={sortedOptions}
        selectedValues={selectedValues}
        onChange={onChange}
        maxVisible={6}
      />
    </FilterSection>
  );
}
