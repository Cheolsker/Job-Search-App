'use client';

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
  isLoading = false
}: PaginationProps) {
  // 표시할 페이지 버튼 수 계산
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5; // 한 번에 표시할 최대 페이지 버튼 수
    
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
    <div className="flex justify-center items-center space-x-1 my-8">
      {/* 이전 페이지 버튼 */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1 || isLoading}
        className={`px-3 py-1 rounded-md ${
          currentPage === 1 || isLoading
            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
        }`}
        aria-label="이전 페이지"
      >
        &laquo;
      </button>
      
      {/* 첫 페이지 버튼 (현재 페이지가 4 이상일 때만 표시) */}
      {currentPage > 3 && (
        <>
          <button
            onClick={() => onPageChange(1)}
            disabled={isLoading}
            className={`px-3 py-1 rounded-md ${
              isLoading
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
            }`}
          >
            1
          </button>
          {currentPage > 4 && (
            <span className="px-2 py-1 text-gray-500">...</span>
          )}
        </>
      )}
      
      {/* 페이지 번호 버튼 */}
      {getPageNumbers().map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          disabled={isLoading}
          className={`px-3 py-1 rounded-md ${
            page === currentPage
              ? 'bg-blue-600 text-white'
              : isLoading
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
          }`}
        >
          {page}
        </button>
      ))}
      
      {/* 마지막 페이지 버튼 (현재 페이지가 마지막에서 3페이지 이상 떨어져 있을 때만 표시) */}
      {currentPage < totalPages - 2 && (
        <>
          {currentPage < totalPages - 3 && (
            <span className="px-2 py-1 text-gray-500">...</span>
          )}
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={isLoading}
            className={`px-3 py-1 rounded-md ${
              isLoading
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
            }`}
          >
            {totalPages}
          </button>
        </>
      )}
      
      {/* 다음 페이지 버튼 */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages || isLoading}
        className={`px-3 py-1 rounded-md ${
          currentPage === totalPages || isLoading
            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
        }`}
        aria-label="다음 페이지"
      >
        &raquo;
      </button>
    </div>
  );
}
