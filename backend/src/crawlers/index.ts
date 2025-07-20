import { crawlWantedJobs } from './wanted';
import { Job } from '../types/job';

/**
 * 모든 소스에서 채용 정보를 가져와 통합하는 함수
 * @param keyword 검색 키워드 (필수)
 * @param limit 가져올 채용 정보 수
 */
export async function crawlAllJobs(keyword: string, limit: number = 20): Promise<Job[]> {
  try {
    // keyword가 없으면 빈 배열 반환
    if (!keyword || keyword.trim() === '') {
      console.log('No keyword provided, returning empty results');
      return [];
    }
    
    // 현재는 Wanted만 크롤링
    const wantedJobs = await crawlWantedJobs(keyword, limit);

    // 최신순으로 정렬 (실제로는 정확한 등록일 정보가 필요)
    wantedJobs.sort((a, b) => {
      return new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime();
    });

    return wantedJobs.slice(0, limit);
  } catch (error) {
    console.error('Error crawling all jobs:', error);
    return [];
  }
}

/**
 * 키워드, 카테고리, 지역으로 채용 정보를 검색하는 함수
 */
export async function searchJobs(
  keyword?: string,
  category?: string,
  location?: string,
  limit: number = 50
): Promise<Job[]> {
  try {
    // keyword가 없으면 빈 배열 반환
    if (!keyword || keyword.trim() === '') {
      console.log('No keyword provided, returning empty results');
      return [];
    }
    
    // 키워드로 채용 정보 가져오기
    const allJobs = await crawlAllJobs(keyword, limit * 2);

    // 추가 필터링
    let filteredJobs = [...allJobs];

    // 카테고리 필터링
    if (category && category !== '전체') {
      filteredJobs = filteredJobs.filter(job => job.category === category);
    }

    // 지역 필터링
    if (location && location !== '전국') {
      filteredJobs = filteredJobs.filter(job => job.location.includes(location));
    }

    return filteredJobs.slice(0, limit);
  } catch (error) {
    console.error('Error searching jobs:', error);
    return [];
  }
}
