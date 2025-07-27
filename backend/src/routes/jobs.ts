import { Router } from "express";
import { searchJobs, crawlJobsBySource, crawlAllJobs } from "../crawlers";
import { BaseJob, toBaseJob } from "../types/job";
import {
  saveJobsToDatabase,
  searchJobsFromDatabase,
  clearJobsDatabase,
  getJobsStats,
  JobSearchParams,
} from "../services/jobService";

const router = Router();

// 크롤링 실행 및 데이터베이스 저장 API
router.post("/crawl", async (req, res) => {
  try {
    console.log("@@@ API Request to /api/jobs/crawl @@@");
    console.log("@@@ Request body: @@@", req.body);

    const { keyword, limit = 100 } = req.body;

    if (!keyword || keyword.trim() === "") {
      return res.status(400).json({
        error: "키워드가 필요합니다.",
        message: "크롤링할 키워드를 입력해주세요.",
      });
    }

    console.log(`Starting crawl for keyword: ${keyword} with limit: ${limit}`);

    // 크롤링 실행
    const crawledJobs = await crawlAllJobs(keyword, limit);

    if (crawledJobs.length === 0) {
      return res.json({
        message: "크롤링 결과가 없습니다.",
        crawledCount: 0,
        savedCount: 0,
        keyword,
      });
    }

    // 데이터베이스에 저장
    await saveJobsToDatabase(crawledJobs);

    console.log(`Successfully crawled and saved ${crawledJobs.length} jobs`);

    res.json({
      message: "크롤링이 완료되었습니다.",
      crawledCount: crawledJobs.length,
      savedCount: crawledJobs.length,
      keyword,
      jobs: crawledJobs.slice(0, 5), // 처음 5개만 미리보기로 반환
    });
  } catch (error) {
    console.error("Error in /api/jobs/crawl:", error);
    res.status(500).json({
      error: "크롤링 중 오류가 발생했습니다.",
      message: error instanceof Error ? error.message : "알 수 없는 오류",
    });
  }
});

// 데이터베이스에서 채용 정보 검색 API
router.get("/search", async (req, res) => {
  try {
    console.log("@@@ API Request to /api/jobs/search @@@");
    console.log("@@@ Query parameters: @@@", req.query);

    const {
      keyword,
      category,
      location,
      page = "1",
      limit = "10",
      sortBy = "latest",
    } = req.query;

    const searchParams: JobSearchParams = {
      keyword: keyword as string,
      category: category as string,
      location: location as string,
      page: parseInt(page as string) || 1,
      limit: parseInt(limit as string) || 10,
      sortBy: sortBy as string,
    };

    console.log(`Searching database with params:`, searchParams);

    // 데이터베이스에서 검색
    const result = await searchJobsFromDatabase(searchParams);

    console.log(`Found ${result.totalCount} jobs in database`);

    res.json(result);
  } catch (error) {
    console.error("Error in /api/jobs/search:", error);
    res.status(500).json({
      error: "데이터베이스 검색 중 오류가 발생했습니다.",
      message: error instanceof Error ? error.message : "알 수 없는 오류",
    });
  }
});

// 데이터베이스 통계 조회 API
router.get("/stats", async (req, res) => {
  try {
    console.log("@@@ API Request to /api/jobs/stats @@@");

    const stats = await getJobsStats();

    res.json(stats);
  } catch (error) {
    console.error("Error in /api/jobs/stats:", error);
    res.status(500).json({
      error: "통계 조회 중 오류가 발생했습니다.",
      message: error instanceof Error ? error.message : "알 수 없는 오류",
    });
  }
});

// 공통 필드만 반환하는 API (클라이언트용) - 먼저 정의
router.get("/common", async (req, res) => {
  try {
    console.log("@@@ API Request to /api/jobs/common @@@");
    console.log("@@@ Query parameters: @@@", req.query);

    const {
      keyword,
      category,
      location,
      page = "1",
      limit = "10",
      sortBy = "latest",
    } = req.query;

    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 10;
    const offset = (pageNum - 1) * limitNum;

    if (!keyword || (keyword as string).trim() === "") {
      return res.json({
        jobs: [],
        totalCount: 0,
        currentPage: pageNum,
        totalPages: 0,
        hasMore: false,
      });
    }

    // 모든 사이트에서 데이터 수집
    const scrapedJobs = await searchJobs(
      keyword as string,
      category as string | undefined,
      location as string | undefined,
      limitNum * 5
    );

    // 공통 필드만 추출
    const commonJobs: BaseJob[] = scrapedJobs.map((job) => toBaseJob(job));

    // 정렬
    if (sortBy === "latest" || sortBy === "recent") {
      commonJobs.sort(
        (a, b) =>
          new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime()
      );
    }

    // 페이지네이션 처리
    const totalCount = commonJobs.length;
    const totalPages = Math.ceil(totalCount / limitNum);
    const paginatedJobs = commonJobs.slice(offset, offset + limitNum);
    const hasMore = pageNum < totalPages;

    res.json({
      jobs: paginatedJobs,
      totalCount,
      currentPage: pageNum,
      totalPages,
      hasMore,
    });
  } catch (error) {
    console.error("Error in /api/jobs/common:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 특정 소스에서만 데이터를 가져오는 API - 두 번째로 정의
router.get("/source/:source", async (req, res) => {
  try {
    console.log("@@@ API Request to /api/jobs/source/:source @@@");
    console.log("@@@ Params: @@@", req.params);
    console.log("@@@ Query parameters: @@@", req.query);

    const { source } = req.params;
    const { keyword, page = "1", limit = "10", sortBy = "latest" } = req.query;

    if (source !== "wanted" && source !== "jumpit") {
      return res
        .status(400)
        .json({ error: "Invalid source. Use 'wanted' or 'jumpit'" });
    }

    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 10;
    const offset = (pageNum - 1) * limitNum;

    if (!keyword || (keyword as string).trim() === "") {
      return res.json({
        jobs: [],
        totalCount: 0,
        currentPage: pageNum,
        totalPages: 0,
        hasMore: false,
      });
    }

    // 특정 소스에서만 데이터 수집
    const jobs = await crawlJobsBySource(
      source as "wanted" | "jumpit",
      keyword as string,
      limitNum * 3
    );

    // 정렬
    if (sortBy === "latest" || sortBy === "recent") {
      jobs.sort(
        (a, b) =>
          new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime()
      );
    }

    // 페이지네이션 처리
    const totalCount = jobs.length;
    const totalPages = Math.ceil(totalCount / limitNum);
    const paginatedJobs = jobs.slice(offset, offset + limitNum);
    const hasMore = pageNum < totalPages;

    res.json({
      jobs: paginatedJobs,
      totalCount,
      currentPage: pageNum,
      totalPages,
      hasMore,
      source,
    });
  } catch (error) {
    console.error(`Error in /api/jobs/source/${req.params.source}:`, error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 채용공고 검색 API (스크래핑 데이터) - 기본 라우트
router.get("/", async (req, res) => {
  try {
    console.log("@@@ API Request to /api/jobs @@@");
    console.log("@@@ Query parameters: @@@", req.query);

    const {
      keyword,
      category,
      location,
      page = "1",
      limit = "10",
      sortBy = "latest",
    } = req.query;

    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 10;
    const offset = (pageNum - 1) * limitNum;

    console.log(
      `Searching jobs with keyword: ${keyword}, category: ${category}, location: ${location}, page: ${pageNum}, limit: ${limitNum}`
    );

    // keyword가 필수
    if (!keyword || (keyword as string).trim() === "") {
      console.log("No keyword provided, returning empty array");
      return res.json({
        jobs: [],
        totalCount: 0,
        currentPage: pageNum,
        totalPages: 0,
        hasMore: false,
      });
    }

    console.log(`Scraping jobs with keyword: ${keyword}`);

    // 스크래핑 실행 - 더 많은 결과를 가져와서 페이지네이션 처리
    const scrapedJobs = await searchJobs(
      keyword as string,
      category as string | undefined,
      location as string | undefined,
      limitNum * 5
    );

    console.log(`Found ${scrapedJobs.length} jobs after scraping`);

    // 정렬 옵션에 따라 정렬
    if (sortBy === "latest" || sortBy === "recent") {
      scrapedJobs.sort(
        (a, b) =>
          new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime()
      );
    } else if (sortBy === "salary") {
      // WantedJob의 salary 필드만 정렬에 사용
      scrapedJobs.sort((a, b) => {
        const salaryA =
          "salary" in a && a.salary
            ? parseInt(a.salary.replace(/[^0-9]/g, ""))
            : 0;
        const salaryB =
          "salary" in b && b.salary
            ? parseInt(b.salary.replace(/[^0-9]/g, ""))
            : 0;
        return salaryB - salaryA;
      });
    }

    // 페이지네이션 처리
    const totalCount = scrapedJobs.length;
    const totalPages = Math.ceil(totalCount / limitNum);
    const paginatedJobs = scrapedJobs.slice(offset, offset + limitNum);
    const hasMore = pageNum < totalPages;

    console.log(
      `Returning ${paginatedJobs.length} jobs for page ${pageNum} of ${totalPages}`
    );

    // 페이지네이션 정보와 함께 응답
    res.json({
      jobs: paginatedJobs,
      totalCount,
      currentPage: pageNum,
      totalPages,
      hasMore,
    });
  } catch (error) {
    console.error("Error in /api/jobs:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 채용공고 상세 조회 - 마지막에 정의 (/:id 패턴이 다른 라우트와 충돌하지 않도록)
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // ID 형식에 따라 데이터 소스 결정
    if (id.startsWith("db-")) {
      return res
        .status(404)
        .json({ error: "Database functionality is currently disabled" });
    } else if (id.startsWith("wanted-")) {
      return res.status(501).json({
        error: "Not implemented yet",
        message: "상세 정보는 원본 사이트에서 확인해주세요",
        sourceUrl: `https://www.wanted.co.kr/wd/${id.replace("wanted-", "")}`,
      });
    } else if (id.startsWith("jumpit-")) {
      return res.status(501).json({
        error: "Not implemented yet",
        message: "상세 정보는 원본 사이트에서 확인해주세요",
        sourceUrl: `https://jumpit.saramin.co.kr/position/${id.replace(
          "jumpit-",
          ""
        )}`,
      });
    } else {
      return res.status(400).json({ error: "Invalid job ID format" });
    }
  } catch (error) {
    console.error("Error in /api/jobs/:id:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
