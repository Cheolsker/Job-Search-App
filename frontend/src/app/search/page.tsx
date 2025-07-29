"use client";

import { useEffect, useState, Suspense, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import SearchForm from "@/components/SearchForm";
import JobCard from "@/components/JobCard";
import SkeletonLoader from "@/components/SkeletonLoader";

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
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalResults, setTotalResults] = useState(0);

  // 무한스크롤 상태
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [pageSize] = useState(10); // 페이지 크기는 고정

  const fetchJobs = useCallback(
    async (isLoadMore = false) => {
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setCurrentPage(1);
        setHasMore(true);
      }

      console.log("Fetching jobs with params:");
      console.log(
        keyword,
        category,
        location,
        isLoadMore ? currentPage + 1 : 1,
        pageSize
      );

      // 검색어가 없으면 빈 결과 표시
      if (!keyword || keyword.trim() === "") {
        setJobs([]);
        setTotalResults(0);
        setHasMore(false);
        setLoading(false);
        setLoadingMore(false);
        return;
      }

      try {
        // 백엔드 API 호출
        const params = new URLSearchParams();
        params.append("keyword", keyword);
        if (category && category !== "전체")
          params.append("category", category);
        if (location && location !== "전국")
          params.append("location", location);

        // 페이지네이션 파라미터 추가
        params.append("page", (isLoadMore ? currentPage + 1 : 1).toString());
        params.append("limit", pageSize.toString());

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
            console.log(
              "Received data is not in expected format:",
              responseData
            );
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

          // 무한스크롤 정보 업데이트
          if (isLoadMore) {
            // 더 많은 데이터를 기존 목록에 추가
            setJobs((prevJobs) => [...prevJobs, ...uniqueJobs]);
            setCurrentPage(serverPage || currentPage + 1);
          } else {
            // 새로운 검색 결과로 교체
            setJobs(uniqueJobs);
            setCurrentPage(serverPage || 1);
          }

          setTotalResults(totalCount || uniqueJobs.length);

          // hasMore 로직 개선
          const shouldHaveMore =
            uniqueJobs.length > 0 && // 결과가 있고
            uniqueJobs.length === pageSize && // 페이지 크기만큼 받았고
            (serverTotalPages ? (serverPage || 1) < serverTotalPages : true); // 총 페이지보다 작거나 총 페이지 정보가 없을 때

          setHasMore(shouldHaveMore);
          setError(null); // 성공적으로 데이터를 가져왔으므로 오류 상태 초기화
          setLoading(false);
          setLoadingMore(false);
        } catch (fetchError) {
          console.error("Fetch error details:", fetchError);
          throw fetchError;
        }
      } catch (err) {
        console.error("Error fetching jobs:", err);
        setError("채용공고를 불러오는데 실패했습니다.");
        setLoading(false);
        setLoadingMore(false);

        // 에러 발생 시 추가 요청 중단
        setHasMore(false);

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
          setHasMore(false); // 임시 데이터이므로 더 이상 로드하지 않음
        } else {
          setJobs([]);
          setTotalResults(0);
        }
      }
    },
    [keyword, category, location, currentPage, pageSize]
  );

  useEffect(() => {
    console.log("@@@ useEffect triggered @@@");
    fetchJobs();
  }, [fetchJobs]);

  // 무한스크롤 이벤트 리스너
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
          document.documentElement.offsetHeight - 1000 && // 1000px 전에 미리 로드
        hasMore &&
        !loading &&
        !loadingMore
      ) {
        fetchJobs(true);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasMore, loading, loadingMore, fetchJobs]);

  return (
    <main className="min-h-screen bg-gray-50 py-4 sm:py-8 px-3 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <SearchForm isLoading={loading} />
        </div>

        {/* 검색 결과 */}
        <div className="w-full">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-5 mb-4 sm:mb-6">
            {/* 모바일: 세로 레이아웃, 데스크톱: 가로 레이아웃 */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
              <div className="flex-1">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                  검색 결과{" "}
                  <span className="text-blue-600">{totalResults}</span>건
                </h2>

                {/* 검색 조건 표시 - 모바일에서는 더 작게 */}
                {(keyword ||
                  (category && category !== "전체") ||
                  (location && location !== "전국")) && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {keyword && (
                      <span className="inline-flex items-center px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
                        🔍 &quot;{keyword}&quot;
                      </span>
                    )}
                    {category && category !== "전체" && (
                      <span className="inline-flex items-center px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full">
                        📂 {category}
                      </span>
                    )}
                    {location && location !== "전국" && (
                      <span className="inline-flex items-center px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded-full">
                        📍 {location}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {loading ? (
            <SkeletonLoader count={5} type="job-card" />
          ) : error ? (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>
          ) : jobs.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8 text-center">
              {!keyword || keyword.trim() === "" ? (
                <>
                  <div className="text-4xl sm:text-5xl mb-4">🔍</div>
                  <p className="text-gray-600 text-base sm:text-lg font-medium">
                    검색어를 입력해주세요
                  </p>
                  <p className="text-gray-500 mt-2 text-sm sm:text-base">
                    원하는 직무, 회사, 키워드를 검색해보세요
                  </p>
                </>
              ) : (
                <>
                  <div className="text-4xl sm:text-5xl mb-4">😔</div>
                  <p className="text-gray-600 text-base sm:text-lg font-medium">
                    검색 결과가 없습니다
                  </p>
                  <p className="text-gray-500 mt-2 text-sm sm:text-base">
                    다른 키워드로 검색해보세요
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

              {/* 무한스크롤 로딩 및 더 보기 버튼 */}
              {loadingMore && (
                <div className="flex justify-center py-8">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <svg
                      className="animate-spin h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span className="text-sm">
                      더 많은 채용공고를 불러오는 중...
                    </span>
                  </div>
                </div>
              )}

              {/* 더 보기 버튼 (모바일에서 스크롤이 어려운 경우를 위한 대안) */}
              {hasMore && !loadingMore && jobs.length > 0 && (
                <div className="flex justify-center py-6">
                  <button
                    onClick={() => fetchJobs(true)}
                    className="px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/50 transition-all duration-200 shadow-lg active:scale-95 flex items-center space-x-2"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 14l-7 7m0 0l-7-7m7 7V3"
                      />
                    </svg>
                    <span>더 많은 채용공고 보기</span>
                  </button>
                </div>
              )}

              {/* 모든 결과를 불러왔을 때 메시지 */}
              {!hasMore && jobs.length > 0 && (
                <div className="text-center py-8">
                  <div className="text-gray-500 text-sm">
                    🎉 모든 검색 결과를 확인했습니다
                  </div>
                </div>
              )}
            </div>
          )}
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
