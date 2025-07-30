# Design Document

## Overview

검색 결과 페이지에 클라이언트 사이드 필터링 기능을 추가하여 사용자가 채용공고를 더 효율적으로 탐색할 수 있도록 합니다. 이 기능은 서버 요청 없이 프론트엔드에서 실시간으로 결과를 필터링하여 빠른 사용자 경험을 제공합니다.

## Architecture

### Component Structure

```
SearchPage
├── SearchForm (기존)
├── FilterPanel (새로 추가)
│   ├── FilterSection
│   │   ├── LocationFilter
│   │   ├── ExperienceFilter
│   │   ├── CategoryFilter
│   │   ├── ContractTypeFilter
│   │   ├── SourceFilter
│   │   └── SalaryFilter
│   └── ActiveFilters
└── JobList (기존 JobCard 목록)
```

### Data Flow

1. **초기 로드**: 검색 결과가 로드되면 필터 옵션들이 자동으로 생성됩니다
2. **필터 적용**: 사용자가 필터를 선택하면 클라이언트에서 즉시 결과를 필터링합니다
3. **상태 관리**: React state를 통해 필터 상태와 필터링된 결과를 관리합니다
4. **실시간 업데이트**: 필터 변경 시 즉시 UI가 업데이트됩니다

## Components and Interfaces

### 1. FilterPanel Component

메인 필터 패널 컴포넌트로 모든 필터 섹션을 포함합니다.

```typescript
interface FilterPanelProps {
  jobs: Job[];
  filteredJobs: Job[];
  onFilterChange: (filters: FilterState) => void;
  isLoading: boolean;
}

interface FilterState {
  locations: string[];
  experiences: string[];
  categories: string[];
  contractTypes: string[];
  sources: string[];
  hasSalary: boolean | null; // true: 연봉정보 있음, false: 없음, null: 전체
}
```

### 2. FilterSection Component

개별 필터 섹션의 공통 레이아웃을 제공하는 재사용 가능한 컴포넌트입니다.

```typescript
interface FilterSectionProps {
  title: string;
  icon: string;
  isCollapsed: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  count?: number; // 해당 필터의 옵션 개수
}
```

### 3. Individual Filter Components

각 필터 타입별 전용 컴포넌트들:

```typescript
// LocationFilter
interface LocationFilterProps {
  options: FilterOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

// ExperienceFilter
interface ExperienceFilterProps {
  options: FilterOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

// 기타 필터들도 동일한 패턴
```

### 4. ActiveFilters Component

현재 적용된 필터들을 표시하고 관리하는 컴포넌트입니다.

```typescript
interface ActiveFiltersProps {
  filters: FilterState;
  onRemoveFilter: (filterType: string, value: string) => void;
  onClearAll: () => void;
  resultCount: number;
}
```

### 5. FilterOption Interface

필터 옵션의 공통 인터페이스입니다.

```typescript
interface FilterOption {
  value: string;
  label: string;
  count: number; // 해당 옵션의 채용공고 개수
}
```

## Data Models

### Filter State Management

```typescript
// 필터 상태를 관리하는 커스텀 훅
const useJobFilters = (jobs: Job[]) => {
  const [filters, setFilters] = useState<FilterState>({
    locations: [],
    experiences: [],
    categories: [],
    contractTypes: [],
    sources: [],
    hasSalary: null,
  });

  const [filteredJobs, setFilteredJobs] = useState<Job[]>(jobs);

  // 필터 옵션 생성
  const filterOptions = useMemo(
    () => ({
      locations: generateFilterOptions(jobs, "location"),
      experiences: generateFilterOptions(jobs, "experience"),
      categories: generateFilterOptions(jobs, "category"),
      contractTypes: generateFilterOptions(jobs, "contractType"),
      sources: generateFilterOptions(jobs, "source"),
    }),
    [jobs]
  );

  // 필터링 로직
  const applyFilters = useCallback(
    (newFilters: FilterState) => {
      const filtered = jobs.filter((job) => {
        // 위치 필터
        if (
          newFilters.locations.length > 0 &&
          !newFilters.locations.includes(job.location)
        ) {
          return false;
        }

        // 경력 필터
        if (newFilters.experiences.length > 0) {
          const jobExperience = job.experience || "경력 무관";
          if (!newFilters.experiences.includes(jobExperience)) {
            return false;
          }
        }

        // 카테고리 필터
        if (
          newFilters.categories.length > 0 &&
          !newFilters.categories.includes(job.category)
        ) {
          return false;
        }

        // 계약 형태 필터
        if (newFilters.contractTypes.length > 0) {
          const jobContractType = job.contractType || "정보 없음";
          if (!newFilters.contractTypes.includes(jobContractType)) {
            return false;
          }
        }

        // 출처 필터
        if (
          newFilters.sources.length > 0 &&
          !newFilters.sources.includes(job.source)
        ) {
          return false;
        }

        // 연봉 정보 필터
        if (newFilters.hasSalary !== null) {
          const hasSalaryInfo = Boolean(job.salary);
          if (newFilters.hasSalary !== hasSalaryInfo) {
            return false;
          }
        }

        return true;
      });

      setFilteredJobs(filtered);
      setFilters(newFilters);
    },
    [jobs]
  );

  return {
    filters,
    filteredJobs,
    filterOptions,
    applyFilters,
    clearFilters: () =>
      applyFilters({
        locations: [],
        experiences: [],
        categories: [],
        contractTypes: [],
        sources: [],
        hasSalary: null,
      }),
  };
};
```

### Filter Option Generation

```typescript
const generateFilterOptions = (
  jobs: Job[],
  field: keyof Job
): FilterOption[] => {
  const counts = new Map<string, number>();

  jobs.forEach((job) => {
    let value = job[field] as string;

    // 빈 값 처리
    if (!value) {
      if (field === "experience") value = "경력 무관";
      else if (field === "contractType") value = "정보 없음";
      else return;
    }

    counts.set(value, (counts.get(value) || 0) + 1);
  });

  return Array.from(counts.entries())
    .map(([value, count]) => ({ value, label: value, count }))
    .sort((a, b) => b.count - a.count); // 개수 순으로 정렬
};
```

## Error Handling

### Filter State Validation

```typescript
const validateFilters = (
  filters: FilterState,
  availableOptions: any
): FilterState => {
  return {
    locations: filters.locations.filter((loc) =>
      availableOptions.locations.some((opt: FilterOption) => opt.value === loc)
    ),
    experiences: filters.experiences.filter((exp) =>
      availableOptions.experiences.some(
        (opt: FilterOption) => opt.value === exp
      )
    ),
    // 다른 필터들도 동일하게 검증
    categories: filters.categories.filter((cat) =>
      availableOptions.categories.some((opt: FilterOption) => opt.value === cat)
    ),
    contractTypes: filters.contractTypes.filter((type) =>
      availableOptions.contractTypes.some(
        (opt: FilterOption) => opt.value === type
      )
    ),
    sources: filters.sources.filter((src) =>
      availableOptions.sources.some((opt: FilterOption) => opt.value === src)
    ),
    hasSalary: filters.hasSalary,
  };
};
```

### Empty State Handling

```typescript
const EmptyFilterResults = () => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
    <div className="text-4xl mb-4">🔍</div>
    <p className="text-gray-600 text-lg font-medium">
      조건에 맞는 채용공고가 없습니다
    </p>
    <p className="text-gray-500 mt-2">필터 조건을 조정해보세요</p>
  </div>
);
```

## Testing Strategy

### Unit Tests

1. **Filter Logic Tests**

   - 각 필터 타입별 필터링 로직 테스트
   - 다중 필터 조합 테스트
   - 빈 값 처리 테스트

2. **Component Tests**

   - FilterPanel 렌더링 테스트
   - 필터 선택/해제 동작 테스트
   - ActiveFilters 표시 테스트

3. **Hook Tests**
   - useJobFilters 훅 동작 테스트
   - 필터 상태 변경 테스트
   - 성능 테스트 (대량 데이터)

### Integration Tests

1. **Search Page Integration**

   - 검색 결과와 필터 연동 테스트
   - 무한 스크롤과 필터 조합 테스트
   - URL 상태 동기화 테스트 (선택사항)

2. **Mobile Responsiveness**
   - 모바일 필터 UI 테스트
   - 터치 인터랙션 테스트
   - 접기/펼치기 동작 테스트

## UI/UX Design

### Desktop Layout

```
┌─────────────────────────────────────────────────────────────┐
│ SearchForm                                                  │
├─────────────────────────────────────────────────────────────┤
│ 검색 결과 N건 | 적용된 필터: [위치] [경력] [전체 초기화]      │
├─────────────────┬───────────────────────────────────────────┤
│ FilterPanel     │ JobList                                   │
│ ┌─────────────┐ │ ┌─────────────────────────────────────┐   │
│ │📍 근무위치   │ │ │ JobCard                             │   │
│ │ □ 서울 (45) │ │ │                                     │   │
│ │ □ 경기 (23) │ │ └─────────────────────────────────────┘   │
│ └─────────────┘ │ ┌─────────────────────────────────────┐   │
│ ┌─────────────┐ │ │ JobCard                             │   │
│ │⏱️ 경력      │ │ │                                     │   │
│ │ □ 신입 (12) │ │ └─────────────────────────────────────┘   │
│ │ □ 3년+ (34) │ │                                           │
│ └─────────────┘ │                                           │
└─────────────────┴───────────────────────────────────────────┘
```

### Mobile Layout

```
┌─────────────────────────────────────┐
│ SearchForm                          │
├─────────────────────────────────────┤
│ 검색 결과 N건                       │
│ [필터] 적용된 필터: [위치] [경력]    │
├─────────────────────────────────────┤
│ JobCard                             │
│                                     │
├─────────────────────────────────────┤
│ JobCard                             │
│                                     │
└─────────────────────────────────────┘

// 필터 버튼 클릭 시 모달/드로어 형태로 표시
┌─────────────────────────────────────┐
│ 필터                          [닫기] │
├─────────────────────────────────────┤
│ 📍 근무위치                  [▼]    │
│   □ 서울 (45)                      │
│   □ 경기 (23)                      │
├─────────────────────────────────────┤
│ ⏱️ 경력                      [▼]    │
│   □ 신입 (12)                      │
│   □ 3년 이상 (34)                  │
├─────────────────────────────────────┤
│           [초기화] [적용하기]        │
└─────────────────────────────────────┘
```

### Visual Design Principles

1. **일관성**: 기존 SearchForm과 JobCard의 디자인 언어 유지
2. **접근성**: 키보드 네비게이션 및 스크린 리더 지원
3. **성능**: 가상화를 통한 대량 데이터 처리 최적화
4. **반응형**: 모바일과 데스크톱에서 최적화된 경험 제공

### Color Scheme

기존 컴포넌트와 일관성을 위해 다음 색상 체계를 사용:

- Primary: Blue (blue-600, blue-700)
- Secondary: Gray (gray-100, gray-200, gray-600)
- Success: Green (green-100, green-800)
- Warning: Yellow (yellow-100, yellow-800)
- Info: Purple (purple-100, purple-800)

### Animation and Transitions

- 필터 적용 시: 200ms ease-in-out transition
- 필터 패널 접기/펼치기: 300ms ease-in-out
- 결과 업데이트: fade-in 효과 (150ms)
- 모바일 필터 모달: slide-up 애니메이션 (250ms)
