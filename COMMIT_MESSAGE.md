refactor: 앱 라우트 구조 개편 및 Navigation 표시 로직 개선

Next.js 라우트 그룹을 사용하여 라우트 구조를 재구성하고, Navigation 컴포넌트가
recipes/[recipeId] 화면에서만 표시되도록 개선했습니다.

## 주요 변경 사항

### URL 경로 변경

- `/login` → `/auth`로 변경
- 모든 리다이렉트 경로 및 미들웨어 업데이트

### 라우트 그룹 재구성

- `(main)`, `(recipes-list)` 그룹 제거
- 새로운 라우트 그룹 구조:
  - `(auth)`: `/auth` (로그인 페이지, Navigation 없음)
  - `(recipes)`: `/recipes`, `/recipes/new` (Navigation 없음)
  - `(recipe-editor)`: `/recipes/[recipeId]` (Navigation 표시)
  - `(experiments)`: `/recipes/[recipeId]/experiments/*` (Navigation 없음)

### 파일 구조 개선

- 경로 매개변수명 통일: `[id]` → `[recipeId]`
- `app/recipes` 폴더의 공유 파일들을 적절한 라우트 그룹으로 이동
- 각 라우트 그룹별로 레이아웃 파일 생성

### Navigation 컴포넌트 개선

- `recipeId`가 없을 때는 Navigation을 렌더링하지 않도록 수정
- `/recipes/new` 페이지에서 Navigation이 표시되지 않도록 보장

### Import 경로 업데이트

- 모든 `@/app/recipes/*` 경로를 새로운 위치에 맞게 수정
- 상대 경로를 절대 경로로 변경하여 가독성 향상

## 파일 이동 내역

### 인증 관련

- `app/(auth)/login/page.tsx` → `app/(auth)/auth/page.tsx`

### 레시피 목록 관련

- `app/(main)/recipes/new` → `app/(recipes)/recipes/new`
- `app/recipes/actions.ts` → `app/(recipes)/recipes/actions.ts`
- `app/recipes/components/*` → `app/(recipes)/recipes/components/*`

### 레시피 편집 관련

- `app/(main)/recipes/[id]` → `app/(recipe-editor)/recipes/[recipeId]`
- `app/recipes/[id]/*` → `app/(recipe-editor)/recipes/[recipeId]/*`

### 실험 관련

- `app/(main)/recipes/[id]/experiments` → `app/(experiments)/recipes/[recipeId]/experiments`
- `app/recipes/[id]/experiments/*` → `app/(experiments)/recipes/[recipeId]/experiments/*`

## 영향 범위

- 49개 파일 변경
- 3,834줄 삭제, 38줄 추가
- 기존 `(main)`, `(recipes-list)` 그룹 및 `app/recipes` 폴더 제거

## 테스트 필요 사항

- [ ] `/auth` 경로로 로그인 페이지 접근 확인
- [ ] `/recipes` 목록 페이지에서 Navigation 미표시 확인
- [ ] `/recipes/[recipeId]` 편집 페이지에서 Navigation 표시 확인
- [ ] `/recipes/[recipeId]/experiments/*` 페이지에서 Navigation 미표시 확인
- [ ] `/recipes/new` 페이지에서 Navigation 미표시 확인
