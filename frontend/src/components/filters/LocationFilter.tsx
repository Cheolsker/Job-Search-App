"use client";

import FilterSection from "../FilterSection";
import CheckboxFilter from "./CheckboxFilter";
import { FilterOption } from "@/hooks/useJobFilters";

interface LocationFilterProps {
  options: FilterOption[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
}

export default function LocationFilter({
  options,
  selectedValues,
  onChange,
}: LocationFilterProps) {
  return (
    <FilterSection
      title="근무지역"
      activeCount={selectedValues.length}
      defaultExpanded={true}
    >
      <CheckboxFilter
        options={options}
        selectedValues={selectedValues}
        onChange={onChange}
        maxVisible={8}
      />
    </FilterSection>
  );
}
