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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // URL 쿼리 파라미터 생성 - 검색어만 사용
    const params = new URLSearchParams();
    if (keyword) params.append("keyword", keyword);

    // 검색 결과 페이지로 이동
    router.push(`/search?${params.toString()}`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full bg-white rounded-xl shadow-lg p-6 backdrop-blur-sm border border-white/20"
    >
      <div className="flex flex-col space-y-4">
        <div>
          <label
            htmlFor="keyword"
            className="block text-sm font-semibold text-gray-700 mb-2"
          >
            검색어
          </label>
          <input
            type="text"
            id="keyword"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="직무, 회사, 키워드 검색"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400 text-base transition-all duration-200 hover:border-gray-300"
            disabled={isLoading}
          />
        </div>

        <div className="flex justify-center pt-2">
          <button
            type="submit"
            className={`px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold text-base rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-500/50 focus:ring-offset-2 transform transition-all duration-200 hover:scale-105 shadow-lg ${
              isLoading ? "opacity-50 cursor-not-allowed transform-none" : ""
            }`}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center">
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
              <span className="flex items-center">
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
                검색하기
              </span>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
