# 구현 계획

- [x] 1. 프론트엔드 필터 컴포넌트 제거 및 레이아웃 수정

  - SearchPage에서 SearchFilters 컴포넌트 import 및 사용 제거
  - FilterOptions 인터페이스 import 제거
  - filters 상태 및 handleFilterChange 함수 제거
  - 레이아웃을 2컬럼에서 1컬럼으로 변경하여 검색 결과 영역이 전체 너비 사용하도록 수정
  - _요구사항: 1.1, 1.3_

- [x] 2. 검색 API 호출 로직에서 필터 파라미터 제거

  - fetchJobs 함수에서 필터 관련 파라미터 제거 (experience, salary, companySize, workType)
  - API 요청 시 키워드, 카테고리, 지역, 페이지네이션, 정렬 파라미터만 전송하도록 수정
  - memoizedFilters 관련 로직 제거
  - _요구사항: 1.2_

- [x] 3. 백엔드 API에서 필터 파라미터 처리 로직 제거

  - /api/jobs/search 엔드포인트에서 필터 파라미터 추출 로직 제거
  - JobSearchParams 인터페이스에서 필터 관련 필드 제거
  - searchJobsFromDatabase 함수에서 필터 쿼리 조건 제거
  - _요구사항: 1.2_

- [x] 4. 불필요한 코드 및 파일 정리

  - SearchFilters 컴포넌트 파일 제거
  - 사용하지 않는 import 문 정리
  - 타입 정의에서 필터 관련 필드 제거
  - _요구사항: 1.1_

- [x] 5. 기능 테스트 및 검증
  - 키워드 검색 기능이 정상 작동하는지 테스트
  - 페이지네이션 및 정렬 기능 동작 확인
  - 다양한 화면 크기에서 레이아웃 테스트
  - 필터 관련 오류가 발생하지 않는지 확인
  - _요구사항: 1.1, 1.2, 1.3_
