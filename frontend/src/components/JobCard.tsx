// Next/Image 대신 일반 img 태그 사용

interface JobCardProps {
  title: string;
  company: string;
  location: string;
  category: string;
  postedDate: string;
  salary?: string;
  experience?: string;
  source?: string;
  sourceUrl?: string;
  imageUrl?: string;
  contractType?: string;
}

export default function JobCard({
  title,
  company,
  location,
  category,
  postedDate,
  salary,
  experience,
  source,
  sourceUrl,
  imageUrl,
  contractType,
}: JobCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-5 hover:shadow-md transition-all duration-200 active:scale-[0.98] sm:active:scale-100">
      {/* 모든 화면에서 가로 레이아웃으로 통일 */}
      <div className="flex flex-row gap-3 sm:gap-4">
        {/* 회사 로고 */}
        {imageUrl && (
          <div className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0">
            <img
              src={imageUrl}
              alt={`${company} 로고`}
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
        )}

        <div className="flex-1 min-w-0">
          {/* 헤더 영역 */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-4">
            <div className="flex-1 min-w-0">
              {/* 제목 */}
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 leading-tight">
                {sourceUrl ? (
                  <a
                    href={sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-blue-600 transition-colors block overflow-hidden"
                    style={{
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {title}
                  </a>
                ) : (
                  <span
                    className="block overflow-hidden"
                    style={{
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {title}
                  </span>
                )}
              </h3>

              {/* 회사명 */}
              <p className="text-sm sm:text-base text-gray-600 mt-1 font-medium">
                {company}
              </p>
            </div>

            {/* 날짜 - 모바일에서는 상단 우측, 데스크톱에서는 우측 */}
            <div className="flex-shrink-0 self-start">
              <span className="text-xs sm:text-sm text-gray-500 bg-gray-50 px-2 py-1 rounded-md">
                {formatDate(postedDate)}
              </span>
            </div>
          </div>

          {/* 태그들 */}
          <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-3">
            {location && (
              <span className="inline-flex items-center px-2 sm:px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                📍 {location}
              </span>
            )}
            {category && (
              <span className="inline-flex items-center px-2 sm:px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                💼 {category}
              </span>
            )}
            {experience && (
              <span className="inline-flex items-center px-2 sm:px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                ⏱️ {experience}
              </span>
            )}
            {contractType && (
              <span className="inline-flex items-center px-2 sm:px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                📋 {contractType}
              </span>
            )}
          </div>

          {/* 연봉 정보 */}
          {salary && (
            <div className="mt-3 p-2 bg-green-50 rounded-lg">
              <p className="text-sm text-green-800 font-medium">💰 {salary}</p>
            </div>
          )}

          {/* 출처 정보 */}
          {source && (
            <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
              <span>출처: {source}</span>
              {sourceUrl && (
                <a
                  href={sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors font-medium"
                >
                  <svg
                    className="w-3 h-3 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                  원본 보기
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return "오늘";
  } else if (diffDays === 1) {
    return "어제";
  } else if (diffDays <= 7) {
    return `${diffDays}일 전`;
  } else {
    return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`;
  }
}
