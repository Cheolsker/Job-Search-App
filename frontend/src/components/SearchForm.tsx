"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// 직무카테고리와 지역 Select 제거 - 검색어만 사용

export default function SearchForm({
  isLoading = false,
}: {
  isLoading?: boolean;
}) {
  const router = useRouter();
  const [keyword, setKeyword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!keyword.trim()) {
      setError("검색할 키워드를 입력해주세요.");
      // 입력창에 포커스하고 시각적 피드백 제공
      const input = document.getElementById("keyword") as HTMLInputElement;
      if (input) {
        input.focus();
        input.classList.add("border-red-500", "focus:ring-red-500");
        setTimeout(() => {
          input.classList.remove("border-red-500", "focus:ring-red-500");
          setError(null);
        }, 3000);
      }
      return;
    }

    setError(null);

    // URL 쿼리 파라미터 생성 - 검색어만 사용
    const params = new URLSearchParams();
    if (keyword.trim()) params.append("keyword", keyword.trim());

    // 검색 결과 페이지로 이동
    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="w-full bg-white rounded-xl shadow-lg p-4 sm:p-6 backdrop-blur-sm border border-white/20">
      <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4 text-center sm:text-left">
        💼 채용공고 검색
      </h2>

      <form onSubmit={handleSubmit}>
        <div>
          <label
            htmlFor="keyword"
            className="block text-sm font-medium text-gray-700 mb-2 sr-only sm:not-sr-only"
          >
            검색어
          </label>

          {/* 모바일: 통합된 검색바, 데스크톱: 분리된 입력창과 버튼 */}
          <div className="sm:hidden">
            {/* 모바일 통합 검색바 */}
            <div className="relative">
              <input
                type="text"
                id="keyword"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="직무, 회사명, 기술스택 검색..."
                className="w-full pl-12 pr-16 py-4 border-2 border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400 text-base transition-all duration-200 hover:border-gray-300 shadow-sm"
                disabled={isLoading}
              />
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <button
                type="submit"
                className={`absolute inset-y-0 right-0 px-4 flex items-center justify-center bg-blue-600 text-white rounded-r-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 ${
                  isLoading
                    ? "opacity-50 cursor-not-allowed"
                    : "active:scale-95"
                }`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                ) : (
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* 데스크톱 분리된 레이아웃 */}
          <div className="hidden sm:block space-y-4">
            <div className="relative">
              <input
                type="text"
                id="keyword-desktop"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="직무, 회사명, 기술스택 검색..."
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400 text-base transition-all duration-200 hover:border-gray-300 shadow-sm"
                disabled={isLoading}
              />
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>

            <button
              type="submit"
              className={`w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold text-base rounded-xl hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-500/50 focus:ring-offset-2 transition-all duration-200 shadow-lg active:scale-95 ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  검색 중...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  데이터베이스에서 검색하기
                </span>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* 에러 메시지 */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm flex items-center">
            <svg
              className="w-4 h-4 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </p>
        </div>
      )}
    </div>
  );
}
