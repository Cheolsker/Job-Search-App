'use client';

import { useRouter } from 'next/navigation';

const popularTags = [
  '프론트엔드',
  '백엔드',
  '데이터 분석',
  'AI',
  '마케팅',
  '디자인',
  'PM',
  '신입',
  '경력 3년',
  '재택근무',
  '스타트업',
  '대기업',
];

export default function PopularSearchTags() {
  const router = useRouter();

  const handleTagClick = (tag: string) => {
    router.push(`/search?keyword=${encodeURIComponent(tag)}`);
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-6">
      <h3 className="text-lg font-medium text-gray-700 mb-3">인기 검색어</h3>
      <div className="flex flex-wrap gap-2">
        {popularTags.map((tag) => (
          <button
            key={tag}
            onClick={() => handleTagClick(tag)}
            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm rounded-full transition-colors"
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
}
