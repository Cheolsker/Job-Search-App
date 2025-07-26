import { Router } from "express";
import jobsRouter from "./jobs";
import adminRouter from "./admin";
import testRouter from "./test";

const router = Router();

// 각 라우터를 마운트
router.use("/jobs", jobsRouter);
router.use("/admin", adminRouter);
router.use("/test", testRouter);

export default router;
