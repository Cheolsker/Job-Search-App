"use client";

import { useState } from "react";

interface CrawlFormProps {
  onCrawlComplete?: (result: any) => void;
}

export default function CrawlForm({ onCrawlComplete }: CrawlFormProps) {
  const [keyword, setKeyword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!keyword.trim()) {
      setError("검색할 키워드를 입력해주세요.");
      // 입력창에 포커스하고 시각적 피드백 제공
      const input = document.getElementById(
        "crawl-keyword"
      ) as HTMLInputElement;
      if (input) {
        input.focus();
        input.classList.add("border-red-500", "focus:ring-red-500");
        setTimeout(() => {
          input.classList.remove("border-red-500", "focus:ring-red-500");
        }, 3000);
      }
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("http://localhost:3001/api/jobs/crawl", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          keyword: keyword.trim(),
          limit: 100,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "크롤링 중 오류가 발생했습니다.");
      }

      setResult(data);
      onCrawlComplete?.(data);
    } catch (err) {
      console.error("Crawl error:", err);
      setError(
        err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full bg-white rounded-xl shadow-lg p-6 backdrop-blur-sm border border-white/20">
      <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4 text-center sm:text-left flex items-center justify-center sm:justify-start">
        <svg
          className="w-5 h-5 mr-2 text-blue-600"
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
        채용사이트에서 검색하기
      </h2>

      <form onSubmit={handleSubmit}>
        <div>
          <label
            htmlFor="crawl-keyword"
            className="block text-sm font-medium text-gray-700 mb-2 sr-only sm:not-sr-only"
          >
            검색 키워드
          </label>

          {/* 모바일: 통합된 검색바, 데스크톱: 분리된 입력창과 버튼 */}
          <div className="sm:hidden">
            {/* 모바일 통합 검색바 */}
            <div className="relative">
              <input
                type="text"
                id="crawl-keyword"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="검색할 키워드 입력..."
                className="w-full pl-12 pr-16 py-4 border-2 border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 placeholder-gray-400 text-base transition-all duration-200 hover:border-gray-300 shadow-sm"
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
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
              </div>
              <button
                type="submit"
                className={`absolute inset-y-0 right-0 px-4 flex items-center justify-center bg-green-600 text-white rounded-r-full hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 ${
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
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
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
                id="crawl-keyword-desktop"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="검색할 키워드를 입력하세요 (예: 프론트엔드, 백엔드, 마케팅)"
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 placeholder-gray-400 text-base transition-all duration-200 hover:border-gray-300 shadow-sm"
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
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
              </div>
            </div>

            <button
              type="submit"
              className={`w-full py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold text-base rounded-xl hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-4 focus:ring-green-500/50 focus:ring-offset-2 transition-all duration-200 shadow-lg active:scale-95 ${
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
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
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
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  채용사이트에서 검색하기
                </span>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* 에러 메시지 */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* 성공 결과 */}
      {result && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="text-green-800 font-semibold mb-2">검색 완료!</h3>
          <div className="text-green-700 text-sm space-y-1">
            <p>
              • 키워드: <span className="font-medium">{result.keyword}</span>
            </p>
            <p>
              • 수집된 채용공고:{" "}
              <span className="font-medium">{result.crawledCount}개</span>
            </p>
            <p>
              • 데이터베이스 저장:{" "}
              <span className="font-medium">{result.savedCount}개</span>
            </p>
          </div>
          {result.jobs && result.jobs.length > 0 && (
            <div className="mt-3">
              <p className="text-green-700 text-sm font-medium mb-2">
                미리보기 (최근 5개):
              </p>
              <div className="space-y-1">
                {result.jobs.map((job: unknown, index: number) => (
                  <div
                    key={index}
                    className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded"
                  >
                    {job.title} - {job.company} ({job.location})
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
