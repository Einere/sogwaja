# 문제 해결 가이드

## 조리법 생성 오류

### 증상

"조리법 생성 중 오류가 발생했습니다." 메시지가 표시됨

### 가능한 원인 및 해결 방법

#### 1. Supabase 스키마가 실행되지 않음

**확인 방법:**

- Supabase 대시보드 > Table Editor에서 `recipes` 테이블이 존재하는지 확인

**해결 방법:**

1. Supabase 대시보드 > SQL Editor로 이동
2. `supabase/schema.sql` 파일의 내용을 복사하여 실행
3. 모든 테이블과 정책이 생성되었는지 확인

#### 2. RLS (Row Level Security) 정책 문제

**확인 방법:**

- Supabase 대시보드 > Authentication > Policies에서 `recipes` 테이블의 정책 확인
- 다음 정책이 있어야 함:
  - `Users can view their own recipes` (SELECT)
  - `Users can insert their own recipes` (INSERT)
  - `Users can update their own recipes` (UPDATE)
  - `Users can delete their own recipes` (DELETE)

**해결 방법:**

1. `supabase/schema.sql` 파일의 RLS 정책 부분을 다시 실행
2. 또는 Table Editor > recipes 테이블 > RLS 탭에서 정책 확인

#### 3. 사용자 인증 문제

**확인 방법:**

- 브라우저 콘솔에서 "User is not authenticated" 또는 "No active session" 메시지 확인
- Supabase 대시보드 > Authentication > Users에서 사용자가 등록되어 있는지 확인

**해결 방법:**

1. 로그아웃 후 다시 로그인
2. 브라우저 쿠키 및 로컬 스토리지 초기화 후 재시도

#### 4. 환경 변수 설정 문제

**확인 방법:**

- `.env.local` 파일이 존재하는지 확인
- `NEXT_PUBLIC_SUPABASE_URL`과 `NEXT_PUBLIC_SUPABASE_ANON_KEY`가 올바르게 설정되었는지 확인

**해결 방법:**

1. `.env.local` 파일 확인
2. Supabase 대시보드 > Settings > API에서 올바른 값 확인
3. 개발 서버 재시작 (`npm run dev`)

#### 5. 브라우저 콘솔에서 에러 확인

**확인 방법:**

1. 브라우저 개발자 도구 열기 (F12)
2. Console 탭 확인
3. 에러 메시지와 에러 코드 확인

**일반적인 에러 코드:**

- `42501`: 권한 오류 (RLS 정책 문제)
- `42P01`: 테이블이 존재하지 않음 (스키마 미실행)
- `23503`: 외래 키 제약 조건 오류 (user_id 문제)

### 디버깅 단계

1. **브라우저 콘솔 확인**
   - 개발자 도구(F12) > Console 탭
   - 에러 메시지와 스택 트레이스 확인

2. **Supabase 대시보드 확인**
   - Table Editor에서 `recipes` 테이블 존재 확인
   - Authentication > Policies에서 RLS 정책 확인
   - Logs에서 API 요청 로그 확인

3. **네트워크 탭 확인**
   - 개발자 도구 > Network 탭
   - 실패한 요청 확인
   - 응답 본문에서 에러 메시지 확인

4. **환경 변수 확인**
   - `.env.local` 파일 내용 확인
   - Supabase 프로젝트 설정과 일치하는지 확인

### 추가 도움

문제가 계속되면 다음 정보를 포함하여 이슈를 제기하세요:

- 브라우저 콘솔의 전체 에러 메시지
- Supabase 대시보드의 Logs 섹션 스크린샷
- 에러 코드 (있는 경우)
