import { Router } from "express";
import { crawlAllJobs } from "../crawlers";
import {
  saveJobsToDatabase,
  clearJobsDatabase,
  getJobsStats,
} from "../services/jobService";

const router = Router();

// 크롤링 수동 실행 및 데이터베이스 저장 API (관리자용)
router.post("/crawl", async (req, res) => {
  try {
    const { keyword, limit = 50 } = req.body;

    if (!keyword || keyword.trim() === "") {
      return res.status(400).json({ error: "Keyword is required" });
    }

    // 크롤링 실행
    const jobs = await crawlAllJobs(keyword, limit);

    if (jobs.length > 0) {
      // 데이터베이스에 저장
      await saveJobsToDatabase(jobs);
    }

    res.json({
      success: true,
      crawledCount: jobs.length,
      savedCount: jobs.length,
      keyword,
    });
  } catch (error) {
    console.error("Error in manual crawl:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 데이터베이스 초기화 API (관리자용)
router.delete("/clear", async (req, res) => {
  try {
    await clearJobsDatabase();
    res.json({
      success: true,
      message: "Database cleared successfully",
    });
  } catch (error) {
    console.error("Error clearing database:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 데이터베이스 통계 조회 API (관리자용)
router.get("/stats", async (req, res) => {
  try {
    const stats = await getJobsStats();
    res.json(stats);
  } catch (error) {
    console.error("Error getting stats:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
