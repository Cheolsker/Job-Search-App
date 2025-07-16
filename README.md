# Job Search App

채용 정보 검색 웹 애플리케이션

## 프로젝트 구조

```
job-search-app/
├── frontend/          # Next.js 프론트엔드
├── backend/           # Express.js 백엔드
└── README.md
```

## 시작하기

### 환경 설정

1. 백엔드 환경 변수 설정:
   ```bash
   cd backend
   cp .env.example .env
   # .env 파일에 Supabase 정보 입력
   ```

### 개발 서버 실행

1. 백엔드 서버 실행:
   ```bash
   cd backend
   npm install
   npm run dev
   ```

2. 프론트엔드 서버 실행:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## 기술 스택

### Frontend
- Next.js 15
- React 19
- TypeScript
- Tailwind CSS

### Backend
- Express.js
- TypeScript
- Supabase
- CORS

## API 엔드포인트

- `GET /` - 서버 상태 확인
- `GET /api/jobs` - 채용공고 검색
- `GET /api/jobs/:id` - 채용공고 상세 조회
