import { Router } from "express";
import { crawlAllJobs } from "../crawlers";

const router = Router();

// 크롤링 수동 실행 API (관리자용)
router.post("/crawl", async (req, res) => {
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

export default router;
