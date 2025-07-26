'use client';

import { useState } from 'react';

interface SearchFiltersProps {
  onFilterChange: (filters: FilterOptions) => void;
  initialFilters?: FilterOptions;
  isLoading?: boolean;
}

export interface FilterOptions {
  experience?: string[];
  salary?: string[];
  companySize?: string[];
  workType?: string[];
  sortBy?: string;
}

export default function SearchFilters({ 
  onFilterChange, 
  initialFilters = {},
  isLoading = false 
}: SearchFiltersProps) {
  const [filters, setFilters] = useState<FilterOptions>(initialFilters);

  const handleCheckboxChange = (category: keyof FilterOptions, value: string) => {
    setFilters((prev) => {
      const currentValues = prev[category] as string[] || [];
      let newValues: string[];
      
      if (currentValues.includes(value)) {
        newValues = currentValues.filter((v) => v !== value);
      } else {
        newValues = [...currentValues, value];
      }
      
      const newFilters = { ...prev, [category]: newValues };
      onFilterChange(newFilters);
      return newFilters;
    });
  };

  const handleSortChange = (value: string) => {
    const newFilters = { ...filters, sortBy: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
      <h3 className="text-lg font-medium text-gray-900 mb-4">검색 필터</h3>
      
      {/* 경력 필터 */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-800 mb-2">경력</h4>
        <div className="space-y-2">
          {['신입', '1년 이상', '3년 이상', '5년 이상', '10년 이상'].map((exp) => (
            <div key={exp} className="flex items-center">
              <input
                type="checkbox"
                id={`exp-${exp}`}
                checked={(filters.experience || []).includes(exp)}
                onChange={() => handleCheckboxChange('experience', exp)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                disabled={isLoading}
              />
              <label htmlFor={`exp-${exp}`} className="ml-2 text-sm text-gray-800">
                {exp}
              </label>
            </div>
          ))}
        </div>
      </div>
      
      {/* 연봉 필터 */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-800 mb-2">연봉</h4>
        <div className="space-y-2">
          {['2,000만원 이상', '3,000만원 이상', '4,000만원 이상', '5,000만원 이상', '6,000만원 이상'].map((salary) => (
            <div key={salary} className="flex items-center">
              <input
                type="checkbox"
                id={`salary-${salary}`}
                checked={(filters.salary || []).includes(salary)}
                onChange={() => handleCheckboxChange('salary', salary)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                disabled={isLoading}
              />
              <label htmlFor={`salary-${salary}`} className="ml-2 text-sm text-gray-800">
                {salary}
              </label>
            </div>
          ))}
        </div>
      </div>
      
      {/* 회사 규모 필터 */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-800 mb-2">회사 규모</h4>
        <div className="space-y-2">
          {['스타트업', '중소기업', '중견기업', '대기업'].map((size) => (
            <div key={size} className="flex items-center">
              <input
                type="checkbox"
                id={`size-${size}`}
                checked={(filters.companySize || []).includes(size)}
                onChange={() => handleCheckboxChange('companySize', size)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                disabled={isLoading}
              />
              <label htmlFor={`size-${size}`} className="ml-2 text-sm text-gray-800">
                {size}
              </label>
            </div>
          ))}
        </div>
      </div>
      
      {/* 근무 형태 필터 */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-800 mb-2">근무 형태</h4>
        <div className="space-y-2">
          {['정규직', '계약직', '인턴', '파견직', '재택근무'].map((type) => (
            <div key={type} className="flex items-center">
              <input
                type="checkbox"
                id={`type-${type}`}
                checked={(filters.workType || []).includes(type)}
                onChange={() => handleCheckboxChange('workType', type)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                disabled={isLoading}
              />
              <label htmlFor={`type-${type}`} className="ml-2 text-sm text-gray-800">
                {type}
              </label>
            </div>
          ))}
        </div>
      </div>
      
      {/* 정렬 옵션 */}
      <div>
        <h4 className="text-sm font-medium text-gray-800 mb-2">정렬</h4>
        <select
          value={filters.sortBy || '최신순'}
          onChange={(e) => handleSortChange(e.target.value)}
          className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md text-gray-900 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={isLoading}
        >
          <option value="최신순">최신순</option>
          <option value="마감임박순">마감임박순</option>
          <option value="연봉높은순">연봉높은순</option>
          <option value="인기순">인기순</option>
        </select>
      </div>
    </div>
  );
}
