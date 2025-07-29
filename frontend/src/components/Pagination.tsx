"use client";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  isLoading = false,
}: PaginationProps) {
  // 모바일과 데스크톱에서 다른 페이지 버튼 수
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = window.innerWidth < 640 ? 3 : 5; // 모바일에서는 3개, 데스크톱에서는 5개

    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = startPage + maxPagesToShow - 1;

    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return pageNumbers;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center gap-1 sm:gap-2 my-6 sm:my-8 px-4">
      {/* 이전 페이지 버튼 */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1 || isLoading}
        className={`px-2 sm:px-3 py-2 sm:py-1 rounded-lg text-sm sm:text-base min-w-[40px] sm:min-w-[auto] ${
          currentPage === 1 || isLoading
            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
            : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300 active:scale-95"
        } transition-all duration-150`}
        aria-label="이전 페이지"
      >
        <span className="sm:hidden">‹</span>
        <span className="hidden sm:inline">&laquo;</span>
      </button>

      {/* 첫 페이지 버튼 (현재 페이지가 4 이상일 때만 표시) */}
      {currentPage > 3 && (
        <>
          <button
            onClick={() => onPageChange(1)}
            disabled={isLoading}
            className={`px-2 sm:px-3 py-2 sm:py-1 rounded-lg text-sm sm:text-base min-w-[40px] sm:min-w-[auto] ${
              isLoading
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300 active:scale-95"
            } transition-all duration-150`}
          >
            1
          </button>
          {currentPage > 4 && (
            <span className="px-1 sm:px-2 py-1 text-gray-500 text-sm">...</span>
          )}
        </>
      )}

      {/* 페이지 번호 버튼 */}
      {getPageNumbers().map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          disabled={isLoading}
          className={`px-2 sm:px-3 py-2 sm:py-1 rounded-lg text-sm sm:text-base min-w-[40px] sm:min-w-[auto] ${
            page === currentPage
              ? "bg-blue-600 text-white shadow-md"
              : isLoading
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300 active:scale-95"
          } transition-all duration-150`}
        >
          {page}
        </button>
      ))}

      {/* 마지막 페이지 버튼 (현재 페이지가 마지막에서 3페이지 이상 떨어져 있을 때만 표시) */}
      {currentPage < totalPages - 2 && (
        <>
          {currentPage < totalPages - 3 && (
            <span className="px-1 sm:px-2 py-1 text-gray-500 text-sm">...</span>
          )}
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={isLoading}
            className={`px-2 sm:px-3 py-2 sm:py-1 rounded-lg text-sm sm:text-base min-w-[40px] sm:min-w-[auto] ${
              isLoading
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300 active:scale-95"
            } transition-all duration-150`}
          >
            {totalPages}
          </button>
        </>
      )}

      {/* 다음 페이지 버튼 */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages || isLoading}
        className={`px-2 sm:px-3 py-2 sm:py-1 rounded-lg text-sm sm:text-base min-w-[40px] sm:min-w-[auto] ${
          currentPage === totalPages || isLoading
            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
            : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300 active:scale-95"
        } transition-all duration-150`}
        aria-label="다음 페이지"
      >
        <span className="sm:hidden">›</span>
        <span className="hidden sm:inline">&raquo;</span>
      </button>
    </div>
  );
}
