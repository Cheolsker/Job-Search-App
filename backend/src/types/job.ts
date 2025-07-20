/**
 * 채용 정보를 나타내는 인터페이스
 */
export interface Job {
  id: string;           // 고유 식별자
  title: string;        // 채용 공고 제목
  company: string;      // 회사명
  location: string;     // 근무 지역
  category: string;     // 직무 카테고리
  salary?: string;      // 연봉 정보 (선택)
  experience?: string;  // 요구 경력 (선택)
  postedDate: string;   // 등록일 (YYYY-MM-DD)
  dueDate?: string;     // 마감일 (YYYY-MM-DD) (선택)
  source: string;       // 출처 (wanted, jumpit 등)
  sourceUrl: string;    // 원본 채용공고 URL
  description?: string; // 상세 설명 (선택)
  imageUrl?: string;    // 회사 이미지 URL (선택)
  contractType?: string; // 계약 형태 (정규직, 계약직 등) (선택)
}
