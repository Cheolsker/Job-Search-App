import puppeteer from "puppeteer";
import { WantedJob } from "../types/job";

/**
 * Wanted 웹사이트에서 채용 정보를 스크래핑하는 함수
 * @param keyword 검색 키워드 (필수)
 * @param limit 가져올 채용 정보 수
 */
export async function crawlWantedJobs(
  keyword: string,
  limit: number = 20
): Promise<WantedJob[]> {
  console.log(`Crawling Wanted jobs with keyword: ${keyword}`);

  // keyword가 없으면 빈 배열 반환
  if (!keyword || keyword.trim() === "") {
    console.log("No keyword provided, returning empty results");
    return [];
  }

  const jobs: WantedJob[] = [];

  try {
    // 브라우저 실행
    const browser = await puppeteer.launch({
      headless: true, // headless 모드 사용 (boolean 값으로 변경)
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    try {
      const page = await browser.newPage();

      // 사용자 에이전트 설정
      await page.setUserAgent(
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      );

      // 검색 URL 설정 (항상 keyword를 사용하는 URL만 사용)
      const searchUrl = `https://www.wanted.co.kr/search?query=${encodeURIComponent(
        keyword
      )}&tab=position`;

      console.log(`Navigating to: ${searchUrl}`);

      // 페이지 로드
      await page.goto(searchUrl, { waitUntil: "networkidle2", timeout: 60000 });

      // 페이지가 완전히 로드될 때까지 대기
      // 정확한 선택자 사용
      await page
        .waitForSelector(".JobList_container__Hf1rb", { timeout: 10000 })
        .catch(() =>
          console.log("JobList container selector not found, but continuing...")
        );

      // 스크롤을 통해 더 많은 채용 정보 로드
      let previousHeight;
      let scrollCount = 0;
      const maxScrolls = Math.ceil(limit / 8); // 한 번에 약 8개 정도 로드된다고 가정

      while (scrollCount < maxScrolls) {
        // 페이지 끝까지 스크롤
        previousHeight = await page.evaluate(() => {
          return document.body.scrollHeight;
        });

        await page.evaluate(() => {
          window.scrollTo(0, document.body.scrollHeight);
        });

        try {
          await page.waitForFunction(
            (prevHeight) => document.body.scrollHeight > prevHeight,
            { timeout: 10000 },
            previousHeight
          );
        } catch (e) {
          console.log("No more content to load or timeout");
          break;
        }

        // 새 콘텐츠가 로드될 때까지 잠시 대기
        await new Promise((r) => setTimeout(r, 1000));
        scrollCount++;
      }

      // 채용 정보 추출
      type JobElement = {
        id: string;
        title: string;
        company: string;
        experience: string;
        contractType: string;
        reward: string;
        imgSrc: string;
        category: string;
        href: string;
      };

      const jobElements = (await page.evaluate(() => {
        const elements = Array.from(
          document.querySelectorAll(".JobCard_container__zQcZs")
        );
        return elements.map((el) => {
          // 채용 공고 ID 추출
          const linkElement = el.querySelector("a");
          const href = linkElement
            ? linkElement.getAttribute("href") || ""
            : "";
          const id = href ? href.split("/").pop() || "" : "";

          // 제목 추출
          const titleElement = el.querySelector(".JobCard_title___kfvj");
          const title = titleElement
            ? titleElement.textContent?.trim() || ""
            : "";

          // 회사명 추출
          const companyElement = el.querySelector(
            ".CompanyNameWithLocationPeriod_CompanyNameWithLocationPeriod__company__ByVLu"
          );
          const company = companyElement
            ? companyElement.textContent?.trim() || ""
            : "";

          // 경력 추출
          const locationElement = el.querySelector(
            ".CompanyNameWithLocationPeriod_CompanyNameWithLocationPeriod__location__4_w0l"
          );
          const experience = locationElement
            ? locationElement.textContent?.trim() || ""
            : "";

          // 계약직 여부 확인
          const contractElement = el.querySelector(".wds-5jjoh5");
          const contractType = contractElement
            ? contractElement.textContent?.trim() || ""
            : "";

          // 합격 보상금 추출
          const rewardElement = el.querySelector(".JobCard_reward__oCSIQ");
          const reward = rewardElement
            ? rewardElement.textContent?.trim() || ""
            : "";

          // 썸네일 이미지 URL 추출
          const imgElement = el.querySelector(".JobCard_thumbnail__A1ieG img");
          const imgSrc = imgElement ? imgElement.getAttribute("src") || "" : "";

          // 카테고리 추출 (data-job-category 속성에서)
          const jobCategory = linkElement
            ? linkElement.getAttribute("data-job-category") || "개발"
            : "개발";

          return {
            id,
            title,
            company,
            experience,
            contractType,
            reward,
            imgSrc,
            category: jobCategory,
            href,
          };
        });
      })) as JobElement[];

      console.log(`Found ${jobElements.length} job elements`);

      // 결과 변환 및 저장
      for (const job of jobElements.slice(0, limit)) {
        if (job.id && job.title && job.company) {
          const jobData: WantedJob = {
            id: `wanted-${job.id}`,
            title: job.title,
            company: job.company,
            location: "미지정", // 위치 정보가 명확하지 않음
            category: job.category || "개발",
            experience: job.experience || "경력 무관",
            postedDate: new Date().toISOString().split("T")[0], // 정확한 등록일은 상세 페이지에서 확인 필요
            source: "wanted",
            sourceUrl: `https://www.wanted.co.kr/wd/${job.id}`,
            salary: job.reward || "회사 내규에 따름",
            reward: job.reward || undefined,
          };

          // 선택적 필드 추가
          if (job.imgSrc) {
            jobData.imageUrl = job.imgSrc;
          }

          if (job.contractType) {
            jobData.contractType = job.contractType;
          }

          jobs.push(jobData);
        }
      }
    } finally {
      // 브라우저 종료
      await browser.close();
    }
  } catch (error) {
    console.error("Error crawling Wanted jobs:", error);
  }

  console.log(`Crawled ${jobs.length} jobs from Wanted`);
  return jobs;
}
