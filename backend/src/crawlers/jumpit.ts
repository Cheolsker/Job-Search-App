import puppeteer from 'puppeteer';
import { Job } from '../types/job';

/**
 * JumpIt 웹사이트에서 채용 정보를 스크래핑하는 함수
 * @param keyword 검색 키워드
 * @param limit 가져올 채용 정보 수
 */
export async function crawlJumpitJobs(keyword: string = '', limit: number = 20): Promise<Job[]> {
  console.log(`Crawling JumpIt jobs with keyword: ${keyword || 'all'}`);
  const jobs: Job[] = [];
  
  try {
    // 브라우저 실행
    const browser = await puppeteer.launch({
      headless: 'new', // 새로운 헤드리스 모드 사용
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
      const page = await browser.newPage();
      
      // 사용자 에이전트 설정
      await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      
      // 검색 URL 설정
      const searchUrl = keyword 
        ? `https://www.jumpit.co.kr/search?keyword=${encodeURIComponent(keyword)}` 
        : 'https://www.jumpit.co.kr/positions';
      
      // 페이지 로드
      await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 60000 });
      
      // 페이지가 완전히 로드될 때까지 대기
      await page.waitForSelector('.sc-fznMnq', { timeout: 10000 })
        .catch(() => console.log('Selector not found, but continuing...'));
      
      // 스크롤을 통해 더 많은 채용 정보 로드
      let previousHeight = 0;
      let scrollCount = 0;
      const maxScrolls = Math.ceil(limit / 20); // 한 번 스크롤에 약 20개 정도 로드된다고 가정
      
      while (scrollCount < maxScrolls) {
        // 페이지 끝까지 스크롤
        previousHeight = await page.evaluate('document.body.scrollHeight');
        await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
        await page.waitForFunction(`document.body.scrollHeight > ${previousHeight}`, { timeout: 10000 })
          .catch(() => console.log('No more content to load or timeout'));
        
        // 새 콘텐츠가 로드될 때까지 잠시 대기
        await new Promise(r => setTimeout(r, 1000));
        scrollCount++;
      }
      
      // 채용 정보 추출
      const jobElements = await page.evaluate(() => {
        // JumpIt의 채용 공고 카드 선택자는 실제 사이트에서 확인 필요
        // 여기서는 예상되는 선택자를 사용
        const elements = Array.from(document.querySelectorAll('.position-card'));
        return elements.map(el => {
          // 채용 공고 ID 추출
          const linkElement = el.querySelector('a');
          const href = linkElement ? linkElement.getAttribute('href') : '';
          const id = href ? href.split('/').pop() : '';
          
          // 회사명 추출
          const companyElement = el.querySelector('.company-name');
          const company = companyElement ? companyElement.textContent?.trim() : '';
          
          // 제목 추출
          const titleElement = el.querySelector('.position-title');
          const title = titleElement ? titleElement.textContent?.trim() : '';
          
          // 지역 추출
          const locationElement = el.querySelector('.company-location');
          const location = locationElement ? locationElement.textContent?.trim() : '';
          
          // 기술 스택 추출
          const techStackElements = Array.from(el.querySelectorAll('.skill-tag'));
          const techStack = techStackElements.map(tag => tag.textContent?.trim()).join(', ');
          
          // 경력 추출
          const experienceElement = el.querySelector('.experience');
          const experience = experienceElement ? experienceElement.textContent?.trim() : '';
          
          // 카테고리 (JumpIt은 주로 개발 직군)
          const category = '개발';
          
          return {
            id,
            company,
            title,
            location,
            techStack,
            experience,
            category,
            href
          };
        });
      });
      
      // 결과 변환 및 저장
      for (const job of jobElements.slice(0, limit)) {
        if (job.id && job.title && job.company) {
          jobs.push({
            id: `jumpit-${job.id}`,
            title: job.title,
            company: job.company,
            location: job.location || '미지정',
            category: job.category || '개발',
            experience: job.experience || '경력 무관',
            postedDate: new Date().toISOString().split('T')[0], // 정확한 등록일은 상세 페이지에서 확인 필요
            source: 'jumpit',
            sourceUrl: `https://www.jumpit.co.kr/position/${job.id}`
          });
        }
      }
      
    } finally {
      // 브라우저 종료
      await browser.close();
    }
    
  } catch (error) {
    console.error('Error crawling JumpIt jobs:', error);
  }
  
  console.log(`Crawled ${jobs.length} jobs from JumpIt`);
  return jobs;
}
