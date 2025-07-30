"use client";

import FilterSection from "../FilterSection";

interface SalaryFilterProps {
  hasSalary: boolean | null;
  onChange: (hasSalary: boolean | null) => void;
}

export default function SalaryFilter({
  hasSalary,
  onChange,
}: SalaryFilterProps) {
  const activeCount = hasSalary !== null ? 1 : 0;

  return (
    <FilterSection
      title="연봉 정보"
      activeCount={activeCount}
      defaultExpanded={false}
    >
      <div className="space-y-2">
        <label className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 cursor-pointer transition-colors">
          <input
            type="radio"
            name="salary-filter"
            checked={hasSalary === null}
            onChange={() => onChange(null)}
            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 focus:ring-2"
          />
          <span className="text-sm text-gray-900">전체</span>
        </label>

        <label className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 cursor-pointer transition-colors">
          <input
            type="radio"
            name="salary-filter"
            checked={hasSalary === true}
            onChange={() => onChange(true)}
            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 focus:ring-2"
          />
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-900">💰 연봉 정보 있음</span>
          </div>
        </label>

        <label className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 cursor-pointer transition-colors">
          <input
            type="radio"
            name="salary-filter"
            checked={hasSalary === false}
            onChange={() => onChange(false)}
            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 focus:ring-2"
          />
          <span className="text-sm text-gray-900">연봉 정보 없음</span>
        </label>
      </div>
    </FilterSection>
  );
}
