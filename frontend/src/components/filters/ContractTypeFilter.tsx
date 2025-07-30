"use client";

import FilterSection from "../FilterSection";
import CheckboxFilter from "./CheckboxFilter";
import { FilterOption } from "@/hooks/useJobFilters";

interface ContractTypeFilterProps {
  options: FilterOption[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
}

export default function ContractTypeFilter({
  options,
  selectedValues,
  onChange,
}: ContractTypeFilterProps) {
  // 계약 형태 순서 정렬 (정규직 -> 계약직 -> 인턴 -> 정보 없음)
  const sortedOptions = [...options].sort((a, b) => {
    const order = ["정규직", "계약직", "인턴", "프리랜서", "정보 없음"];
    const aIndex = order.indexOf(a.value);
    const bIndex = order.indexOf(b.value);

    if (aIndex === -1 && bIndex === -1) return a.value.localeCompare(b.value);
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;

    return aIndex - bIndex;
  });

  return (
    <FilterSection
      title="계약 형태"
      activeCount={selectedValues.length}
      defaultExpanded={false}
    >
      <CheckboxFilter
        options={sortedOptions}
        selectedValues={selectedValues}
        onChange={onChange}
        maxVisible={5}
      />
    </FilterSection>
  );
}
