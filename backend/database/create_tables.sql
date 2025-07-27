-- 채용 정보 테이블 생성
CREATE TABLE IF NOT EXISTS jobs (
  id VARCHAR(255) PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  company VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  experience VARCHAR(100),
  posted_date DATE NOT NULL,
  source VARCHAR(50) NOT NULL,
  source_url TEXT NOT NULL,
  salary VARCHAR(255),
  image_url TEXT,
  contract_type VARCHAR(100),
  reward VARCHAR(255),
  description TEXT,
  tech_stack VARCHAR(500),
  deadline VARCHAR(50),
  due_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성 (검색 성능 향상)
CREATE INDEX IF NOT EXISTS idx_jobs_title ON jobs USING gin(to_tsvector('korean', title));
CREATE INDEX IF NOT EXISTS idx_jobs_company ON jobs USING gin(to_tsvector('korean', company));
CREATE INDEX IF NOT EXISTS idx_jobs_category ON jobs(category);
CREATE INDEX IF NOT EXISTS idx_jobs_location ON jobs(location);
CREATE INDEX IF NOT EXISTS idx_jobs_source ON jobs(source);
CREATE INDEX IF NOT EXISTS idx_jobs_posted_date ON jobs(posted_date DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at DESC);

-- RLS (Row Level Security) 정책 설정
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽기 가능
CREATE POLICY "Anyone can read jobs" ON jobs
  FOR SELECT USING (true);

-- 인증된 사용자만 삽입/업데이트/삭제 가능 (관리자용)
CREATE POLICY "Authenticated users can insert jobs" ON jobs
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update jobs" ON jobs
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete jobs" ON jobs
  FOR DELETE USING (auth.role() = 'authenticated');