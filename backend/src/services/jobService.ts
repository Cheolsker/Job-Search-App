import { supabase } from "../config/supabase";
import { Job, WantedJob, JumpitJob } from "../types/job";

export interface JobSearchParams {
  keyword?: string;
  category?: string;
  location?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
}

export interface JobSearchResult {
  jobs: Job[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasMore: boolean;
}

/**
 * 데이터베이스 레코드를 Job 타입으로 변환
 */
function dbRecordToJob(record: any): Job {
  const baseJob = {
    id: record.id,
    title: record.title,
    company: record.company,
    location: record.location,
    category: record.category,
    experience: record.experience,
    postedDate: record.posted_date,
    source: record.source,
    sourceUrl: record.source_url,
  };

  // 소스에 따라 다른 타입으로 변환
  if (record.source === "wanted") {
    return {
      ...baseJob,
      salary: record.salary,
      imageUrl: record.image_url,
      contractType: record.contract_type,
      reward: record.reward,
      description: record.description,
    } as WantedJob;
  } else if (record.source === "jumpit") {
    return {
      ...baseJob,
      techStack: record.tech_stack,
      deadline: record.deadline,
      dueDate: record.due_date,
      imageUrl: record.image_url,
    } as JumpitJob;
  }

  // 기본적으로 WantedJob으로 반환
  return {
    ...baseJob,
    salary: record.salary,
    imageUrl: record.image_url,
    contractType: record.contract_type,
    reward: record.reward,
    description: record.description,
  } as WantedJob;
}

/**
 * 크롤링한 채용 정보를 Supabase에 저장
 */
export async function saveJobsToDatabase(jobs: Job[]): Promise<void> {
  try {
    console.log(`Saving ${jobs.length} jobs to database...`);

    // 중복된 ID 제거 (같은 ID가 여러 개 있으면 첫 번째만 유지)
    const uniqueJobs = jobs.filter(
      (job, index, self) => index === self.findIndex((j) => j.id === job.id)
    );

    console.log(
      `Original jobs: ${jobs.length}, Unique jobs: ${uniqueJobs.length}`
    );

    // Job 객체를 데이터베이스 스키마에 맞게 변환
    const dbJobs = uniqueJobs.map((job) => ({
      id: job.id,
      title: job.title,
      company: job.company,
      location: job.location,
      category: job.category,
      experience: job.experience || null,
      posted_date: job.postedDate,
      source: job.source,
      source_url: job.sourceUrl,
      salary: "salary" in job ? job.salary || null : null,
      image_url: "imageUrl" in job ? job.imageUrl || null : null,
      contract_type: "contractType" in job ? job.contractType || null : null,
      reward: "reward" in job ? job.reward || null : null,
      description: "description" in job ? job.description || null : null,
      tech_stack: "techStack" in job ? job.techStack || null : null,
      deadline: "deadline" in job ? job.deadline || null : null,
      due_date: "dueDate" in job ? job.dueDate || null : null,
    }));

    // 중복 제거를 위해 upsert 사용
    const { error } = await supabase.from("jobs").upsert(dbJobs, {
      onConflict: "id",
      ignoreDuplicates: false,
    });

    if (error) {
      console.error("Error saving jobs to database:", error);
      throw error;
    }

    console.log(`Successfully saved ${jobs.length} jobs to database`);
  } catch (error) {
    console.error("Failed to save jobs to database:", error);
    throw error;
  }
}

/**
 * Supabase에서 채용 정보 검색
 */
export async function searchJobsFromDatabase(
  params: JobSearchParams
): Promise<JobSearchResult> {
  try {
    const {
      keyword = "",
      category,
      location,
      page = 1,
      limit = 10,
      sortBy = "latest",
    } = params;

    let query = supabase.from("jobs").select("*", { count: "exact" });

    // 키워드 검색 (제목, 회사명에서 검색)
    if (keyword && keyword.trim() !== "") {
      query = query.or(`title.ilike.%${keyword}%,company.ilike.%${keyword}%`);
    }

    // 카테고리 필터
    if (category && category !== "전체") {
      query = query.eq("category", category);
    }

    // 지역 필터
    if (location && location !== "전국") {
      query = query.ilike("location", `%${location}%`);
    }

    // 정렬
    if (sortBy === "latest" || sortBy === "recent") {
      query = query.order("posted_date", { ascending: false });
    } else if (sortBy === "company") {
      query = query.order("company", { ascending: true });
    }

    // 페이지네이션
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error("Error searching jobs from database:", error);
      throw error;
    }

    const totalCount = count || 0;
    const totalPages = Math.ceil(totalCount / limit);

    // 데이터베이스 레코드를 Job 타입으로 변환
    const jobs = (data || []).map((record) => dbRecordToJob(record));

    return {
      jobs,
      totalCount,
      currentPage: page,
      totalPages,
      hasMore: page < totalPages,
    };
  } catch (error) {
    console.error("Failed to search jobs from database:", error);
    throw error;
  }
}

/**
 * 데이터베이스에서 모든 채용 정보 삭제 (관리자용)
 */
export async function clearJobsDatabase(): Promise<void> {
  try {
    const { error } = await supabase.from("jobs").delete().neq("id", ""); // 모든 레코드 삭제

    if (error) {
      console.error("Error clearing jobs database:", error);
      throw error;
    }

    console.log("Successfully cleared jobs database");
  } catch (error) {
    console.error("Failed to clear jobs database:", error);
    throw error;
  }
}

/**
 * 데이터베이스 통계 조회
 */
export async function getJobsStats(): Promise<{
  totalJobs: number;
  jobsBySource: Record<string, number>;
  jobsByCategory: Record<string, number>;
  lastUpdated?: string;
}> {
  try {
    // 전체 채용 정보 수
    const { count: totalJobs } = await supabase
      .from("jobs")
      .select("*", { count: "exact", head: true });

    // 소스별 통계
    const { data: sourceStats } = await supabase
      .from("jobs")
      .select("source")
      .then(({ data }) => {
        const stats: Record<string, number> = {};
        data?.forEach((job) => {
          stats[job.source] = (stats[job.source] || 0) + 1;
        });
        return { data: stats };
      });

    // 카테고리별 통계
    const { data: categoryStats } = await supabase
      .from("jobs")
      .select("category")
      .then(({ data }) => {
        const stats: Record<string, number> = {};
        data?.forEach((job) => {
          stats[job.category] = (stats[job.category] || 0) + 1;
        });
        return { data: stats };
      });

    // 최근 업데이트 시간
    const { data: lastJob } = await supabase
      .from("jobs")
      .select("posted_date")
      .order("posted_date", { ascending: false })
      .limit(1)
      .single();

    return {
      totalJobs: totalJobs || 0,
      jobsBySource: sourceStats || {},
      jobsByCategory: categoryStats || {},
      lastUpdated: lastJob?.posted_date,
    };
  } catch (error) {
    console.error("Failed to get jobs stats:", error);
    throw error;
  }
}
