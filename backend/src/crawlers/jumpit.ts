import puppeteer from "puppeteer";
import { JumpitJob } from "../types/job";

/**
 * JumpIt 웹사이트에서 채용 정보를 스크래핑하는 함수
 * @param keyword 검색 키워드
 * @param limit 가져올 채용 정보 수
 */
export async function crawlJumpitJobs(
  keyword: string = "",
  limit: number = 20
): Promise<JumpitJob[]> {
  console.log(`Crawling JumpIt jobs with keyword: ${keyword || "all"}`);
  const jobs: JumpitJob[] = [];

  try {
    // 브라우저 실행
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    try {
      const page = await browser.newPage();

      // 사용자 에이전트 설정
      await page.setUserAgent(
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      );

      // 검색 URL 설정 (saramin 도메인 사용)
      const searchUrl = keyword
        ? `https://jumpit.saramin.co.kr/search?sort=relation&keyword=${encodeURIComponent(
            keyword
          )}`
        : "https://jumpit.saramin.co.kr/search?sort=relation";

      console.log(`Navigating to: ${searchUrl}`);

      // 페이지 로드
      await page.goto(searchUrl, { waitUntil: "networkidle2", timeout: 60000 });

      // 채용 공고 카드가 로드될 때까지 대기
      await page
        .waitForSelector(".sc-d609d44f-0.grDLmW", { timeout: 15000 })
        .catch(() => console.log("Job cards not found, but continuing..."));

      // 스크롤을 통해 더 많은 채용 정보 로드
      let scrollCount = 0;
      const maxScrolls = Math.ceil(limit / 20);

      while (scrollCount < maxScrolls) {
        const previousHeight = (await page.evaluate(
          () => document.body.scrollHeight
        )) as number;
        await page.evaluate(() =>
          window.scrollTo(0, document.body.scrollHeight)
        );

        try {
          await page.waitForFunction(
            (prevHeight) => document.body.scrollHeight > prevHeight,
            { timeout: 5000 },
            previousHeight
          );
        } catch {
          console.log("No more content to load or timeout");
          break;
        }

        await new Promise((r) => setTimeout(r, 1000));
        scrollCount++;
      }

      // 채용 정보 추출
      const jobElements = await page.evaluate(() => {
        const elements = Array.from(
          document.querySelectorAll(".sc-d609d44f-0.grDLmW")
        );

        return elements
          .map((el) => {
            try {
              // 링크와 ID 추출
              const linkElement = el.querySelector("a");
              const href = linkElement ? linkElement.getAttribute("href") : "";
              const id = href ? href.split("/").pop() : "";

              // 회사명 추출 (sc-15ba67b8-0 kkQQfR 내부의 첫 번째 div)
              const companyElement = el.querySelector(".sc-15ba67b8-0 div div");
              const company = companyElement
                ? companyElement.textContent?.trim()
                : "";

              // 제목 추출 (position_card_info_title 클래스)
              const titleElement = el.querySelector(
                ".position_card_info_title"
              );
              const title = titleElement
                ? titleElement.textContent?.trim()
                : "";

              // 기술 스택 추출 (첫 번째 ul.sc-15ba67b8-1)
              const techStackElements = Array.from(
                el.querySelectorAll(".sc-15ba67b8-1.iFMgIl li")
              );
              const techStack = techStackElements
                .map((tag) => tag.textContent?.trim().replace("·", "").trim())
                .filter((tech) => tech && tech !== "·")
                .join(", ");

              // 지역과 경력 추출 (두 번째 ul.sc-15ba67b8-1)
              const locationExperienceElements = Array.from(
                el.querySelectorAll(".sc-15ba67b8-1.cdeuol li")
              );
              const location = locationExperienceElements[0]
                ? locationExperienceElements[0].textContent?.trim()
                : "";
              const experience = locationExperienceElements[1]
                ? locationExperienceElements[1].textContent?.trim()
                : "";

              // 마감일 추출 (D-day 정보)
              const deadlineElement = el.querySelector(".sc-a0b0873a-0");
              const deadline = deadlineElement
                ? deadlineElement.textContent?.trim()
                : "";

              return {
                id,
                company,
                title,
                location,
                techStack,
                experience,
                deadline,
                href: href ? `https://jumpit.saramin.co.kr${href}` : "",
              };
            } catch (error) {
              console.error("Error parsing job element:", error);
              return null;
            }
          })
          .filter((job) => job !== null);
      });

      // 결과 변환 및 저장
      for (const job of jobElements.slice(0, limit)) {
        if (job && job.id && job.title && job.company) {
          jobs.push({
            id: `jumpit-${job.id}`,
            title: job.title,
            company: job.company,
            location: job.location || "미지정",
            category: "개발", // JumpIt은 주로 개발 직군
            experience: job.experience || "경력 무관",
            techStack: job.techStack || "",
            postedDate: new Date().toISOString().split("T")[0],
            deadline: job.deadline || "",
            source: "jumpit",
            sourceUrl:
              job.href || `https://jumpit.saramin.co.kr/position/${job.id}`,
          });
        }
      }
    } finally {
      await browser.close();
    }
  } catch (error) {
    console.error("Error crawling JumpIt jobs:", error);
  }

  console.log(`Crawled ${jobs.length} jobs from JumpIt`);
  return jobs;
}
