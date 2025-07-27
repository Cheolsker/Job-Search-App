"use client";

import { useEffect, useState, Suspense, useMemo, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import SearchForm from "@/components/SearchForm";
import SearchFilters, { FilterOptions } from "@/components/SearchFilters";
import JobCard from "@/components/JobCard";
import LoadingOverlay from "@/components/LoadingOverlay";
import SkeletonLoader from "@/components/SkeletonLoader";
import Pagination from "@/components/Pagination";
import PageSizeSelector from "@/components/PageSizeSelector";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  category: string;
  postedDate: string;
  salary?: string;
  experience?: string;
  source?: string;
  sourceUrl?: string;
  imageUrl?: string;
  contractType?: string;
}

function SearchPageContent() {
  console.log("@@@ SearchPage @@@");

  const searchParams = useSearchParams();
  const keyword = searchParams.get("keyword") || "";
  const category = searchParams.get("category") || "";
  const location = searchParams.get("location") || "";

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({});
  const [totalResults, setTotalResults] = useState(0);

  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // filters 객체를 메모이제이션하여 불필요한 리렌더링 방지
  const memoizedFilters = useMemo(() => filters, [filters]);

  const fetchJobs = useCallback(async () => {
    setLoading(true);

    console.log("Fetching jobs with params:");
    console.log(
      keyword,
      category,
      location,
      memoizedFilters,
      currentPage,
      pageSize
    );

    // 검색어가 없으면 빈 결과 표시
    if (!keyword || keyword.trim() === "") {
      setJobs([]);
      setTotalResults(0);
      setTotalPages(1);
      setLoading(false);
      return;
    }

    try {
      // 백엔드 API 호출
      const params = new URLSearchParams();
      params.append("keyword", keyword);
      if (category && category !== "전체") params.append("category", category);
      if (location && location !== "전국") params.append("location", location);

      // 페이지네이션 파라미터 추가
      params.append("page", currentPage.toString());
      params.append("limit", pageSize.toString());

      // 필터 옵션 추가
      if (memoizedFilters.experience && memoizedFilters.experience.length > 0) {
        params.append("experience", memoizedFilters.experience.join(","));
      }

      if (memoizedFilters.salary && memoizedFilters.salary.length > 0) {
        params.append("salary", memoizedFilters.salary.join(","));
      }

      if (
        memoizedFilters.companySize &&
        memoizedFilters.companySize.length > 0
      ) {
        params.append("companySize", memoizedFilters.companySize.join(","));
      }

      if (memoizedFilters.workType && memoizedFilters.workType.length > 0) {
        params.append("workType", memoizedFilters.workType.join(","));
      }

      if (memoizedFilters.sortBy) {
        params.append("sortBy", memoizedFilters.sortBy);
      }

      console.log("Fetching jobs with params:", params.toString());

      try {
        console.log(
          "Sending request to:",
          `http://localhost:3001/api/jobs/search?${params.toString()}`
        );
        const response = await fetch(
          `http://localhost:3001/api/jobs/search?${params.toString()}`
        );

        if (!response.ok) {
          console.error(
            "Response not OK:",
            response.status,
            response.statusText
          );
          throw new Error(
            `서버에서 데이터를 가져오는데 실패했습니다. 상태 코드: ${response.status}`
          );
        }

        const responseData = await response.json();
        console.log("Fetched response:", responseData);

        // 새로운 API 응답 형식 처리
        const {
          jobs: jobsData,
          totalCount,
          currentPage: serverPage,
          totalPages: serverTotalPages,
        } = responseData;

        // 데이터 구조 디버깅
        if (Array.isArray(jobsData)) {
          console.log(`Received ${jobsData.length} jobs from server`);
          console.log(
            `Total count: ${totalCount}, Current page: ${serverPage}, Total pages: ${serverTotalPages}`
          );
          if (jobsData.length > 0) {
            console.log("First job sample:", jobsData[0]);
            console.log("Job keys:", Object.keys(jobsData[0]));
          }
        } else {
          console.log("Received data is not in expected format:", responseData);
          throw new Error("서버에서 예상치 못한 응답 형식을 반환했습니다.");
        }

        // 서버에서 받은 데이터를 Job 인터페이스에 맞게 변환
        const formattedJobs: Job[] = Array.isArray(jobsData)
          ? jobsData.map((job) => {
              // 필수 필드에 대한 기본값 설정
              const formattedJob: Job = {
                id:
                  job.id ||
                  `job-${Math.random().toString(36).substring(2, 11)}`,
                title: job.title || "제목 없음",
                company: job.company || "회사명 없음",
                location: job.location || "위치 정보 없음",
                category: job.category || "카테고리 없음",
                postedDate:
                  job.postedDate || new Date().toISOString().split("T")[0],
                source: job.source || "unknown",
                sourceUrl: job.sourceUrl || "#",
              };

              // 선택적 필드 추가
              if (job.salary) formattedJob.salary = job.salary;
              if (job.experience) formattedJob.experience = job.experience;
              if (job.imageUrl) formattedJob.imageUrl = job.imageUrl;
              if (job.contractType)
                formattedJob.contractType = job.contractType;

              return formattedJob;
            })
          : [];

        // 중복된 ID를 가진 job 제거
        const uniqueJobs: Job[] = [];
        const seenIds = new Set<string>();

        for (const job of formattedJobs) {
          if (!seenIds.has(job.id)) {
            seenIds.add(job.id);
            uniqueJobs.push(job);
          } else {
            // 중복된 ID가 발견되면 고유한 ID로 변경
            const uniqueId = `${job.id}-${Date.now()}-${Math.random()
              .toString(36)
              .substring(2, 7)}`;
            uniqueJobs.push({
              ...job,
              id: uniqueId,
            });
            seenIds.add(uniqueId);
            console.warn(
              `Duplicate job ID found: ${job.id}, assigned new ID: ${uniqueId}`
            );
          }
        }

        console.log("Formatted jobs:", formattedJobs.length);
        console.log("Unique jobs after deduplication:", uniqueJobs.length);
        if (uniqueJobs.length > 0) {
          console.log("First unique job:", uniqueJobs[0]);
        }

        // 페이지네이션 정보 업데이트
        setJobs(uniqueJobs);
        setTotalResults(totalCount || uniqueJobs.length);
        setCurrentPage(serverPage || currentPage);
        setTotalPages(
          serverTotalPages || Math.ceil(totalCount / pageSize) || 1
        );
        setError(null); // 성공적으로 데이터를 가져왔으므로 오류 상태 초기화
        setLoading(false);
      } catch (fetchError) {
        console.error("Fetch error details:", fetchError);
        throw fetchError;
      }
    } catch (err) {
      console.error("Error fetching jobs:", err);
      setError("채용공고를 불러오는데 실패했습니다.");
      setLoading(false);

      // 오류 발생 시 임시 데이터 사용 (개발 중에만 사용)
      const mockJobs = [
        {
          id: "1",
          title: "프론트엔드 개발자",
          company: "테크 스타트업",
          location: "서울",
          category: "개발",
          postedDate: "2025-07-15",
          salary: "4,000만원 ~ 6,000만원",
          experience: "3년 이상",
          source: "mock",
          sourceUrl: "#",
        },
        {
          id: "2",
          title: "백엔드 개발자",
          company: "소프트웨어 회사",
          location: "경기",
          category: "개발",
          postedDate: "2025-07-16",
          salary: "4,500만원 ~ 7,000만원",
          experience: "5년 이상",
          source: "mock",
          sourceUrl: "#",
        },
        {
          id: "3",
          title: "마케팅 매니저",
          company: "이커머스 기업",
          location: "서울",
          category: "마케팅·광고",
          postedDate: "2025-07-17",
          salary: "3,500만원 ~ 5,000만원",
          experience: "3년 이상",
          source: "mock",
          sourceUrl: "#",
        },
      ];

      // 개발 환경에서만 임시 데이터 사용
      if (process.env.NODE_ENV === "development") {
        console.log("Using mock data in development mode");
        setJobs(mockJobs);
        setTotalResults(mockJobs.length);
        setError(null); // 임시 데이터를 사용하므로 오류 메시지 제거
      } else {
        setJobs([]);
        setTotalResults(0);
      }
    }
  }, [keyword, category, location, memoizedFilters, currentPage, pageSize]);

  useEffect(() => {
    console.log("@@@ useEffect triggered @@@");
    fetchJobs();
  }, [fetchJobs]);

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
    setCurrentPage(1); // 필터 변경 시 첫 페이지로 이동
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // 페이지 변경 시 화면 상단으로 스크롤
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1); // 페이지 크기 변경 시 첫 페이지로 이동
  };

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <SearchForm isLoading={loading} />
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* 필터 사이드바 */}
          <div className="w-full md:w-64 flex-shrink-0">
            <SearchFilters
              onFilterChange={handleFilterChange}
              initialFilters={filters}
              isLoading={loading}
            />
          </div>

          {/* 검색 결과 */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 mb-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800">
                  검색 결과{" "}
                  <span className="text-blue-600">{totalResults}</span>건
                </h2>

                <div className="flex items-center space-x-4">
                  <PageSizeSelector
                    pageSize={pageSize}
                    onPageSizeChange={handlePageSizeChange}
                    options={[10, 20, 50]}
                    isLoading={loading}
                  />

                  <div className="text-sm text-gray-500">
                    {keyword && <span>&ldquo;{keyword}&rdquo; </span>}
                    {category && category !== "전체" && (
                      <span>/ {category} </span>
                    )}
                    {location && location !== "전국" && (
                      <span>/ {location}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 로딩 오버레이 */}
            <LoadingOverlay isLoading={loading} message="검색 중입니다..." />

            {loading ? (
              <SkeletonLoader count={5} type="job-card" />
            ) : error ? (
              <div className="bg-red-50 text-red-600 p-4 rounded-lg">
                {error}
              </div>
            ) : jobs.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                {!keyword || keyword.trim() === "" ? (
                  <>
                    <p className="text-gray-600 text-lg">
                      검색어를 입력해주세요.
                    </p>
                    <p className="text-gray-500 mt-2">
                      원하는 직무, 회사, 키워드를 검색해보세요.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-gray-600 text-lg">
                      검색 결과가 없습니다.
                    </p>
                    <p className="text-gray-500 mt-2">
                      다른 키워드로 검색해보세요.
                    </p>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {jobs.map((job) => (
                  <JobCard
                    key={job.id}
                    title={job.title}
                    company={job.company}
                    location={job.location}
                    category={job.category}
                    postedDate={job.postedDate}
                    salary={job.salary}
                    experience={job.experience}
                    source={job.source}
                    sourceUrl={job.sourceUrl}
                    imageUrl={job.imageUrl}
                    contractType={job.contractType}
                  />
                ))}

                {/* 페이지네이션 컴포넌트 */}
                {totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    isLoading={loading}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
export default function SearchPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchPageContent />
    </Suspense>
  );
}
