"use client";

import FilterSection from "../FilterSection";
import CheckboxFilter from "./CheckboxFilter";
import { FilterOption } from "@/hooks/useJobFilters";

interface CategoryFilterProps {
  options: FilterOption[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
}

export default function CategoryFilter({
  options,
  selectedValues,
  onChange,
}: CategoryFilterProps) {
  return (
    <FilterSection
      title="직무 카테고리"
      activeCount={selectedValues.length}
      defaultExpanded={true}
    >
      <CheckboxFilter
        options={options}
        selectedValues={selectedValues}
        onChange={onChange}
        maxVisible={10}
      />
    </FilterSection>
  );
}
