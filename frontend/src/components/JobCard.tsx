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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex">
        {imageUrl && (
          <div className="w-20 h-20 mr-4 flex-shrink-0">
            <img
              src={imageUrl}
              alt={`${company} 로고`}
              className="w-full h-full object-cover rounded"
            />
          </div>
        )}
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                {sourceUrl ? (
                  <a
                    href={sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-blue-600"
                  >
                    {title}
                  </a>
                ) : (
                  title
                )}
              </h3>
              <p className="text-gray-600">{company}</p>

              <div className="flex flex-wrap gap-2 mt-3">
                {location && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {location}
                  </span>
                )}
                {category && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {category}
                  </span>
                )}
                {experience && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    {experience}
                  </span>
                )}
                {contractType && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    {contractType}
                  </span>
                )}
              </div>

              {salary && (
                <p className="mt-2 text-sm text-gray-600">
                  <span className="font-medium">연봉:</span> {salary}
                </p>
              )}

              {source && (
                <div className="mt-2 text-xs text-gray-500">
                  출처: {source}
                  {sourceUrl && (
                    <a
                      href={sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 text-blue-500 hover:underline"
                    >
                      원본 보기
                    </a>
                  )}
                </div>
              )}
            </div>

            <div className="text-right">
              <span className="text-sm text-gray-500">
                {formatDate(postedDate)}
              </span>
            </div>
          </div>
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
