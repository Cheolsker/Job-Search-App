'use client';

interface PageSizeSelectorProps {
  pageSize: number;
  onPageSizeChange: (size: number) => void;
  options?: number[];
  isLoading?: boolean;
}

export default function PageSizeSelector({
  pageSize,
  onPageSizeChange,
  options = [10, 20, 50],
  isLoading = false
}: PageSizeSelectorProps) {
  return (
    <div className="flex items-center space-x-2 text-sm text-gray-600">
      <span>표시:</span>
      <select
        value={pageSize}
        onChange={(e) => onPageSizeChange(Number(e.target.value))}
        className={`border border-gray-300 rounded-md px-2 py-1 text-sm ${
          isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        }`}
        disabled={isLoading}
      >
        {options.map((size) => (
          <option key={size} value={size}>
            {size}개
          </option>
        ))}
      </select>
    </div>
  );
}
