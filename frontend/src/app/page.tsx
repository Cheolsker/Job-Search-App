import SearchForm from "@/components/SearchForm";
import CrawlForm from "@/components/CrawlForm";

export default function Home() {
  return (
    <main className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
            채용공고를
            <span className="text-blue-600 block">검색해보세요</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            다양한 채용 정보를 한 곳에서 검색하고 지원하세요
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* 크롤링 폼 */}
          <div className="relative">
            <div className="mb-4 text-center">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                1단계: 데이터 수집
              </h3>
              <p className="text-sm text-gray-600">
                채용사이트에서 최신 채용공고를 크롤링하여 데이터베이스에
                저장합니다
              </p>
            </div>
            <CrawlForm />
            {/* Decorative elements */}
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-green-200 rounded-full opacity-20 animate-pulse"></div>
          </div>

          {/* 검색 폼 */}
          <div className="relative">
            <div className="mb-4 text-center">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                2단계: 채용공고 검색
              </h3>
              <p className="text-sm text-gray-600">
                저장된 채용공고 데이터베이스에서 원하는 조건으로 검색합니다
              </p>
            </div>
            <SearchForm />
            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-32 h-32 bg-blue-200 rounded-full opacity-20 animate-pulse delay-1000"></div>
          </div>
        </div>

        {/* Call to action section */}
        <div className="text-center mt-12">
          <p className="text-gray-500 text-sm mb-4">지금 바로 시작해보세요</p>
          <div className="flex justify-center space-x-8 text-sm text-gray-400">
            <span className="flex items-center">
              <svg
                className="w-4 h-4 mr-2 text-green-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              무료 검색
            </span>
            <span className="flex items-center">
              <svg
                className="w-4 h-4 mr-2 text-green-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              실시간 업데이트
            </span>
            <span className="flex items-center">
              <svg
                className="w-4 h-4 mr-2 text-green-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              다양한 기업
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}
