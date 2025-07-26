import { Router } from "express";
import { searchJobs, crawlJobsBySource } from "../crawlers";
import { BaseJob, toBaseJob } from "../types/job";

const router = Router();

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
