# Supabase 설정 가이드

## 1. Supabase 프로젝트 생성

1. [Supabase](https://supabase.com)에 접속하여 새 프로젝트를 생성합니다.
2. 프로젝트 설정에서 다음 정보를 확인합니다:
   - Project URL
   - Anon/Public Key

## 2. 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용을 추가합니다:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 3. 데이터베이스 스키마 생성

### 3-1. 스키마 실행

Supabase 대시보드의 **SQL Editor**에서 다음 단계를 따르세요:

1. Supabase 대시보드 접속
2. 왼쪽 메뉴에서 **SQL Editor** 클릭
3. **New query** 버튼 클릭
4. `supabase/schema.sql` 파일의 **전체 내용**을 복사하여 붙여넣기
5. **Run** 버튼 클릭 (또는 Ctrl/Cmd + Enter)
6. 성공 메시지 확인

> **중요**: 스키마 파일의 전체 내용을 한 번에 실행해야 합니다. 일부만 실행하면 오류가 발생할 수 있습니다.

### 3-2. 스키마 확인

스키마가 제대로 생성되었는지 확인하려면:

1. SQL Editor에서 `supabase/check-schema.sql` 파일의 내용을 실행
2. 또는 Table Editor에서 `recipes` 테이블이 보이는지 확인

### 3-3. 문제 해결

**에러 코드 PGRST205**가 발생하는 경우:

- 테이블이 생성되지 않았습니다
- `supabase/schema.sql` 파일을 다시 실행하세요
- 실행 후 Supabase 대시보드를 새로고침하세요

### 3-4. 마이그레이션 사용 (권장)

**마이그레이션 도구를 사용하는 것이 더 안전합니다:**

#### 장점

- ✅ 변경 이력 관리: 모든 스키마 변경이 파일로 기록됨
- ✅ 롤백 가능: 문제 발생 시 이전 상태로 되돌리기 쉬움
- ✅ 안전성: 이미 적용된 마이그레이션은 재실행되지 않음
- ✅ 환경 일관성: 개발/스테이징/프로덕션 환경 동기화 용이

#### Supabase CLI 설치

```bash
# macOS
brew install supabase/tap/supabase

# 또는 npm으로 설치
npm install -g supabase
```

#### Supabase 프로젝트 연결

```bash
# Supabase CLI 로그인
supabase login

# 프로젝트 연결 (프로젝트 참조 ID 필요)
supabase link --project-ref your-project-ref
```

프로젝트 참조 ID는 Supabase 대시보드의 **Settings > General > Reference ID**에서 확인할 수 있습니다.

#### 마이그레이션 적용

```bash
# 모든 마이그레이션 적용
supabase db push

# 또는 특정 마이그레이션만 확인
supabase migration list
```

#### 새 마이그레이션 생성

스키마 변경이 필요할 때:

```bash
# 새 마이그레이션 파일 생성
supabase migration new your_migration_name

# 생성된 파일에 SQL 작성 후
supabase db push
```

#### 현재 최적화 마이그레이션 적용

성능 최적화를 위한 인덱스 추가:

```bash
# 마이그레이션 적용
supabase db push

# 또는 SQL Editor에서 직접 실행
# supabase/migrations/20250104000000_add_performance_indexes.sql 파일 내용 실행
```

## 4. Storage 설정 (이미지 업로드용)

### 4-1. 버킷 생성

Supabase 대시보드에서 Storage를 활성화하고 다음 버킷을 생성합니다:

1. 대시보드에서 **Storage** 메뉴로 이동
2. **New bucket** 버튼 클릭
3. 다음 설정으로 버킷 생성:
   - 버킷 이름: `experiment-photos`
   - Public bucket: **Yes** (체크)
   - File size limit: 5MB (또는 원하는 크기)
   - Allowed MIME types: `image/jpeg, image/png, image/webp`

### 4-2. Storage 정책 설정

버킷을 생성한 후, **Policies** 탭에서 정책을 설정합니다.

#### 방법 1: 대시보드에서 설정 (권장)

1. `experiment-photos` 버킷을 클릭하여 상세 페이지로 이동
2. **Policies** 탭 클릭
3. **New Policy** 버튼 클릭
4. 각 정책을 하나씩 추가합니다:

**정책 1: 사진 조회 (SELECT)**

- Policy name: `Users can view photos`
- Allowed operation: `SELECT`
- Policy definition: 다음 SQL 사용

```sql
bucket_id = 'experiment-photos'
```

**정책 2: 사진 업로드 (INSERT)**

- Policy name: `Users can upload their own photos`
- Allowed operation: `INSERT`
- Policy definition: 다음 SQL 사용

```sql
bucket_id = 'experiment-photos' AND
auth.uid()::text = (string_to_array(name, '/'))[1]
```

**정책 3: 사진 삭제 (DELETE)**

- Policy name: `Users can delete their own photos`
- Allowed operation: `DELETE`
- Policy definition: 다음 SQL 사용

```sql
bucket_id = 'experiment-photos' AND
auth.uid()::text = (string_to_array(name, '/'))[1]
```

#### 방법 2: SQL Editor에서 직접 실행

Supabase 대시보드의 **SQL Editor**에서 다음 SQL을 실행합니다:

```sql
-- 사진 조회 정책 (모든 사용자가 볼 수 있음)
CREATE POLICY "Users can view photos"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'experiment-photos'
);

-- 사진 업로드 정책 (자신의 폴더에만 업로드 가능)
-- 파일 경로 형식: {user_id}/{experiment_id}/{filename}
CREATE POLICY "Users can upload their own photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'experiment-photos' AND
  auth.uid()::text = (string_to_array(name, '/'))[1]
);

-- 사진 삭제 정책 (자신의 파일만 삭제 가능)
CREATE POLICY "Users can delete their own photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'experiment-photos' AND
  auth.uid()::text = (string_to_array(name, '/'))[1]
);
```

### 정책 설명

- **SELECT 정책**: Public 버킷이므로 모든 사용자가 사진을 볼 수 있습니다.
- **INSERT 정책**: 파일 경로의 첫 번째 폴더가 현재 로그인한 사용자의 ID와 일치해야 업로드할 수 있습니다.
- **DELETE 정책**: 파일 경로의 첫 번째 폴더가 현재 로그인한 사용자의 ID와 일치해야 삭제할 수 있습니다.

> **참고**: 파일 경로는 `{user_id}/{experiment_id}/{filename}` 형식으로 저장됩니다.

## 5. 소셜 로그인 설정

Supabase 대시보드의 **Authentication > Providers**에서 소셜 로그인을 활성화합니다.

### 5-1. Google 로그인 설정

1. **Google Cloud Console**에서 설정:

   - [Google Cloud Console](https://console.cloud.google.com/) 접속
   - 새 프로젝트 생성 또는 기존 프로젝트 선택
   - **API 및 서비스 > 사용자 인증 정보**로 이동
   - **사용자 인증 정보 만들기 > OAuth 클라이언트 ID** 선택
   - 애플리케이션 유형: **웹 애플리케이션**
   - 승인된 리디렉션 URI 추가:
     ```
     https://{your-project-ref}.supabase.co/auth/v1/callback
     ```
     (프로젝트 참조 ID는 Supabase 대시보드의 Settings > API에서 확인 가능)
   - **만들기** 클릭하여 Client ID와 Client Secret 확인

2. **Supabase 대시보드**에서 설정:
   - Authentication > Providers > Google 선택
   - **Enable Google provider** 토글 활성화
   - Google Client ID 입력
   - Google Client Secret 입력
   - **Save** 클릭

### 5-2. Apple 로그인 설정

1. **Apple Developer**에서 설정:

   - [Apple Developer](https://developer.apple.com/) 접속
   - Certificates, Identifiers & Profiles로 이동
   - **Identifiers**에서 **Services IDs** 생성
   - Services ID 등록 후 **Configure** 클릭
   - **Web Authentication Configuration**에서:
     - Primary App ID 선택
     - Website URLs에 다음 추가:
       - Domains and Subdomains: `supabase.co`
       - Return URLs: `https://{your-project-ref}.supabase.co/auth/v1/callback`
   - **Continue** > **Save** 클릭

2. **Supabase 대시보드**에서 설정:
   - Authentication > Providers > Apple 선택
   - **Enable Apple provider** 토글 활성화
   - Services ID 입력 (예: `com.example.app`)
   - Secret Key 생성:
     - Apple Developer에서 **Keys** 섹션으로 이동
     - 새 Key 생성 (Apple Sign In 활성화)
     - Key ID와 Team ID 확인
     - .p8 파일 다운로드
   - Team ID 입력
   - Key ID 입력
   - Private Key (.p8 파일 내용) 입력
   - **Save** 클릭

### 5-3. Kakao 로그인 설정 (Custom OAuth)

1. **Kakao Developers**에서 설정:

   - [Kakao Developers](https://developers.kakao.com/) 접속
   - 내 애플리케이션 > 애플리케이션 추가하기
   - 앱 이름, 사업자명 입력 후 생성
   - **앱 설정 > 플랫폼**에서 Web 플랫폼 추가:
     - 사이트 도메인: `https://{your-project-ref}.supabase.co`
   - **제품 설정 > 카카오 로그인** 활성화
   - **Redirect URI** 등록:
     ```
     https://{your-project-ref}.supabase.co/auth/v1/callback
     ```
   - **앱 키**에서 REST API 키 확인

2. **Supabase 대시보드**에서 설정:
   - Authentication > Providers에서 **Add new provider** 클릭
   - Provider 선택: **Custom OAuth**
   - Provider name: `kakao`
   - Client ID: Kakao REST API 키 입력
   - Client Secret: (Kakao는 Secret이 없으므로 빈 값 또는 임의 값)
   - Authorize URL: `https://kauth.kakao.com/oauth/authorize`
   - Token URL: `https://kauth.kakao.com/oauth/token`
   - User Info URL: `https://kapi.kakao.com/v2/user/me`
   - Scope: `profile_nickname,account_email` (필요한 권한에 따라 조정)
   - **Save** 클릭

### 5-4. Naver 로그인 설정 (Custom OAuth)

1. **Naver Developers**에서 설정:

   - [Naver Developers](https://developers.naver.com/) 접속
   - **Application > 애플리케이션 등록**
   - 애플리케이션 이름, 사용 API 선택 (네이버 로그인)
   - 로그인 오픈 API 서비스 환경: **서비스 URL** 설정
     - 서비스 URL: `https://{your-project-ref}.supabase.co`
   - **Callback URL** 등록:
     ```
     https://{your-project-ref}.supabase.co/auth/v1/callback
     ```
   - 등록 후 **Client ID**와 **Client Secret** 확인

2. **Supabase 대시보드**에서 설정:
   - Authentication > Providers에서 **Add new provider** 클릭
   - Provider 선택: **Custom OAuth**
   - Provider name: `naver`
   - Client ID: Naver Client ID 입력
   - Client Secret: Naver Client Secret 입력
   - Authorize URL: `https://nid.naver.com/oauth2.0/authorize`
   - Token URL: `https://nid.naver.com/oauth2.0/token`
   - User Info URL: `https://openapi.naver.com/v1/nid/me`
   - Scope: (기본값 사용 또는 필요에 따라 조정)
   - **Save** 클릭

### 5-5. 리디렉션 URL 확인

모든 소셜 로그인 프로바이더에서 다음 형식의 리디렉션 URL을 등록해야 합니다:

```
https://{your-project-ref}.supabase.co/auth/v1/callback
```

프로젝트 참조 ID는 Supabase 대시보드의 **Settings > API > Project URL**에서 확인할 수 있습니다.

예시:

- Project URL: `https://abcdefghijklmnop.supabase.co`
- 리디렉션 URL: `https://abcdefghijklmnop.supabase.co/auth/v1/callback`

### 5-6. 테스트

각 프로바이더 설정 완료 후:

1. 앱의 로그인 페이지에서 각 소셜 로그인 버튼 클릭
2. 해당 프로바이더의 로그인 화면으로 리디렉션되는지 확인
3. 로그인 성공 후 앱으로 돌아오는지 확인

> **참고**:
>
> - 각 프로바이더의 설정은 변경 사항이 반영되는 데 몇 분이 걸릴 수 있습니다.
> - 개발 환경에서는 localhost를 사용할 수 없으므로, 실제 도메인 또는 Supabase 프로젝트 URL을 사용해야 합니다.
> - Kakao와 Naver는 Custom OAuth로 설정해야 하며, Supabase의 기본 제공 프로바이더가 아닙니다.
