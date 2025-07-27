import { crawlWantedJobs } from "./wanted";
import { crawlJumpitJobs } from "./jumpit";
import { Job, BaseJob, toBaseJob } from "../types/job";

/**
 * 모든 소스에서 채용 정보를 가져와 통합하는 함수
 * @param keyword 검색 키워드 (필수)
 * @param limit 가져올 채용 정보 수
 */
export async function crawlAllJobs(
  keyword: string,
  limit: number = 100
): Promise<Job[]> {
  const startTime = Date.now();

  try {
    // keyword가 없으면 빈 배열 반환
    if (!keyword || keyword.trim() === "") {
      console.log("No keyword provided, returning empty results");
      return [];
    }

    const halfLimit = Math.ceil(limit / 2);
    console.log(
      `Starting crawl for keyword: "${keyword}" with limit: ${limit} (${halfLimit} per site)`
    );

    // 병렬로 두 사이트에서 크롤링
    const [wantedJobs, jumpitJobs] = await Promise.all([
      crawlWantedJobs(keyword, halfLimit),
      crawlJumpitJobs(keyword, halfLimit),
    ]);

    console.log(
      `Crawling results - Wanted: ${wantedJobs.length}, Jumpit: ${jumpitJobs.length}`
    );

    // 모든 결과를 합치기
    const allJobs: Job[] = [...wantedJobs, ...jumpitJobs];

    // 최신순으로 정렬
    allJobs.sort((a, b) => {
      return (
        new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime()
      );
    });

    const finalResults = allJobs.slice(0, limit);
    const crawlingTime = Date.now() - startTime;

    console.log(
      `Crawling completed in ${crawlingTime}ms - Total collected: ${allJobs.length}, Final results: ${finalResults.length}`
    );

    return finalResults;
  } catch (error) {
    const crawlingTime = Date.now() - startTime;
    console.error(`Error crawling all jobs after ${crawlingTime}ms:`, error);
    return [];
  }
}

/**
 * 특정 소스에서만 채용 정보를 가져오는 함수
 */
export async function crawlJobsBySource(
  source: "wanted" | "jumpit",
  keyword: string,
  limit: number = 20
): Promise<Job[]> {
  try {
    if (!keyword || keyword.trim() === "") {
      console.log("No keyword provided, returning empty results");
      return [];
    }

    switch (source) {
      case "wanted":
        return await crawlWantedJobs(keyword, limit);
      case "jumpit":
        return await crawlJumpitJobs(keyword, limit);
      default:
        return [];
    }
  } catch (error) {
    console.error(`Error crawling ${source} jobs:`, error);
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
  limit: number = 100
): Promise<Job[]> {
  try {
    // keyword가 없으면 빈 배열 반환
    if (!keyword || keyword.trim() === "") {
      console.log("No keyword provided, returning empty results");
      return [];
    }

    // 키워드로 채용 정보 가져오기
    const allJobs = await crawlAllJobs(keyword, limit * 2);

    // 추가 필터링
    let filteredJobs = [...allJobs];

    // 카테고리 필터링
    if (category && category !== "전체") {
      filteredJobs = filteredJobs.filter((job) => job.category === category);
    }

    // 지역 필터링
    if (location && location !== "전국") {
      filteredJobs = filteredJobs.filter((job) =>
        job.location.includes(location)
      );
    }

    return filteredJobs.slice(0, limit);
  } catch (error) {
    console.error("Error searching jobs:", error);
    return [];
  }
}
