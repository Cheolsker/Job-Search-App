import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { corsOptions } from "./config/cors";
import apiRoutes from "./routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// 미들웨어
app.use(cors(corsOptions));
app.use(express.json());

// 기본 라우트
app.get("/", (req, res) => {
  res.json({ message: "Job Search API Server" });
});

// API 라우트
app.use("/api", apiRoutes);

// 404 핸들러
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// 에러 핸들러
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
