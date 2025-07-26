/**
 * 공통 채용 정보 인터페이스 (클라이언트에서 사용)
 */
export interface BaseJob {
  id: string; // 고유 식별자
  title: string; // 채용 공고 제목
  company: string; // 회사명
  location: string; // 근무 지역
  category: string; // 직무 카테고리
  experience?: string; // 요구 경력 (선택)
  postedDate: string; // 등록일 (YYYY-MM-DD)
  source: string; // 출처 (wanted, jumpit 등)
  sourceUrl: string; // 원본 채용공고 URL
}

/**
 * 원티드 채용 정보 인터페이스
 */
export interface WantedJob extends BaseJob {
  salary?: string; // 연봉/보상금 정보
  imageUrl?: string; // 회사 이미지 URL
  contractType?: string; // 계약 형태 (정규직, 계약직 등)
  reward?: string; // 합격 보상금
  description?: string; // 상세 설명
}

/**
 * 점핏 채용 정보 인터페이스
 */
export interface JumpitJob extends BaseJob {
  techStack?: string; // 기술 스택
  deadline?: string; // 마감까지 남은 일수 (D-day 형태)
  dueDate?: string; // 마감일 (YYYY-MM-DD)
  imageUrl?: string; // 회사 이미지 URL
}

/**
 * 통합 채용 정보 타입 (모든 사이트의 정보를 포함)
 */
export type Job = WantedJob | JumpitJob;

/**
 * Job을 BaseJob으로 변환하는 유틸리티 함수
 */
export function toBaseJob(job: Job): BaseJob {
  return {
    id: job.id,
    title: job.title,
    company: job.company,
    location: job.location,
    category: job.category,
    experience: job.experience,
    postedDate: job.postedDate,
    source: job.source,
    sourceUrl: job.sourceUrl,
  };
}
