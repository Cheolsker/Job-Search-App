"use client";

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
  isLoading = false,
}: PageSizeSelectorProps) {
  return (
    <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
      <span className="hidden sm:inline">표시:</span>
      <select
        value={pageSize}
        onChange={(e) => onPageSizeChange(Number(e.target.value))}
        className={`border border-gray-300 rounded-lg px-2 sm:px-3 py-1.5 sm:py-1 text-xs sm:text-sm bg-white shadow-sm ${
          isLoading
            ? "opacity-50 cursor-not-allowed"
            : "cursor-pointer hover:border-gray-400"
        } transition-colors`}
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
