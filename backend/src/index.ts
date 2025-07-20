import express from "express";
import cors from "cors";
import dotenv from "dotenv";
// import { createClient } from '@supabase/supabase-js';
import { crawlAllJobs, searchJobs } from "./crawlers";
import { Job } from "./types/job";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Supabase 클라이언트 설정
/*
const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_ANON_KEY || ''
);
*/

// 미들웨어
app.use(
  cors({
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.use(express.json());

// 기본 라우트
app.get("/", (req, res) => {
  res.json({ message: "Job Search API Server" });
});

// 채용공고 검색 API (스크래핑 데이터)
app.get("/api/jobs", async (req, res) => {
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
      }); // 검색어가 없으면 빈 배열 반환
    }

    console.log(`Scraping jobs with keyword: ${keyword}`);

    // 스크래핑 실행 - 더 많은 결과를 가져와서 페이지네이션 처리
    const scrapedJobs = await searchJobs(
      keyword as string,
      category as string | undefined,
      location as string | undefined,
      limitNum * 5 // 더 많은 결과를 가져와서 페이지네이션 처리
    );

    console.log(`Found ${scrapedJobs.length} jobs after scraping`);

    // 정렬 옵션에 따라 정렬
    if (sortBy === "latest" || sortBy === "recent") {
      scrapedJobs.sort(
        (a, b) =>
          new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime()
      );
    } else if (sortBy === "salary") {
      // 연봉 정보가 있는 경우 높은 순으로 정렬
      scrapedJobs.sort((a, b) => {
        const salaryA = a.salary
          ? parseInt(a.salary.replace(/[^0-9]/g, ""))
          : 0;
        const salaryB = b.salary
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

// 채용공고 상세 조회
app.get("/api/jobs/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // ID 형식에 따라 데이터 소스 결정
    if (id.startsWith("db-")) {
      // DB에서 조회 - 주석 처리
      /*
      const dbId = id.replace('db-', '');
      const { data, error } = await supabase
        .from('job_posts')
        .select('*')
        .eq('id', dbId)
        .single();
      
      if (error || !data) {
        return res.status(404).json({ error: 'Job not found' });
      }
      
      return res.json({
        id: `db-${data.id}`,
        title: data.title,
        company: data.company,
        location: data.location,
        category: data.category,
        salary: data.salary,
        experience: data.experience,
        postedDate: data.posted_date,
        dueDate: data.due_date,
        source: 'database',
        sourceUrl: data.source_url || '',
        description: data.description,
        imageUrl: data.image_url,
        contractType: data.contract_type,
      });
      */
      return res
        .status(404)
        .json({ error: "Database functionality is currently disabled" });
    } else if (id.startsWith("wanted-")) {
      // 상세 정보 스크래핑 필요
      // 실제 구현에서는 상세 페이지 스크래핑 로직 추가 필요
      return res.status(501).json({
        error: "Not implemented yet",
        message: "상세 정보는 원본 사이트에서 확인해주세요",
        sourceUrl: `https://www.wanted.co.kr/wd/${id.replace("wanted-", "")}`,
      });
    } else {
      return res.status(400).json({ error: "Invalid job ID format" });
    }
  } catch (error) {
    console.error("Error in /api/jobs/:id:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 크롤링 수동 실행 API (관리자용)
app.post("/api/admin/crawl", async (req, res) => {
  try {
    const { keyword } = req.body;

    if (!keyword || keyword.trim() === "") {
      return res.status(400).json({ error: "Keyword is required" });
    }

    const jobs = await crawlAllJobs(keyword, 50);
    res.json({ success: true, count: jobs.length });
  } catch (error) {
    console.error("Error in manual crawl:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 테스트 API - 크롤링 결과 확인용
app.get("/api/test/crawl", async (req, res) => {
  try {
    const { keyword } = req.query;

    if (!keyword || (keyword as string).trim() === "") {
      return res.status(400).json({ error: "Keyword is required" });
    }

    const jobs = await crawlAllJobs(keyword as string, 10);
    res.json({ jobs });
  } catch (error) {
    console.error("Error in test crawl:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
