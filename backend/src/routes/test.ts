import { Router } from "express";
import { crawlAllJobs, crawlJobsBySource } from "../crawlers";

const router = Router();

// 테스트 API - 크롤링 결과 확인용
router.get("/crawl", async (req, res) => {
  try {
    const { keyword, source } = req.query;

    if (!keyword || (keyword as string).trim() === "") {
      return res.status(400).json({ error: "Keyword is required" });
    }

    let jobs;
    if (source && (source === "wanted" || source === "jumpit")) {
      jobs = await crawlJobsBySource(
        source as "wanted" | "jumpit",
        keyword as string,
        10
      );
    } else {
      jobs = await crawlAllJobs(keyword as string, 10);
    }

    res.json({ jobs, count: jobs.length, source: source || "all" });
  } catch (error) {
    console.error("Error in test crawl:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
