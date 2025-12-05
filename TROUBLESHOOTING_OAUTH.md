# OAuth 500 에러 해결 가이드

## 문제
Supabase `/auth/v1/authorize` 엔드포인트에서 500 에러가 발생합니다.

## 해결 방법

### 1. Supabase 대시보드 설정 확인

#### Site URL 설정
1. Supabase 대시보드 접속
2. **Settings > Authentication > URL Configuration**으로 이동
3. **Site URL**에 다음 중 하나를 설정:
   - 개발 환경: `http://localhost:3000`
   - 프로덕션 환경: 실제 도메인 URL
4. **Redirect URLs**에 다음 추가:
   ```
   http://localhost:3000/api/auth/callback
   http://localhost:3000/**
   ```
5. **Save** 클릭

#### Google OAuth 설정 확인
1. **Authentication > Providers > Google**로 이동
2. **Enable Google provider** 토글 활성화 확인
3. **Client ID**와 **Client Secret**이 올바르게 입력되어 있는지 확인
4. **Save** 클릭

### 2. Google Cloud Console 설정 확인

1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 프로젝트 선택
3. **API 및 서비스 > 사용자 인증 정보**로 이동
4. OAuth 2.0 클라이언트 ID 확인
5. **승인된 리디렉션 URI**에 다음이 포함되어 있는지 확인:
   ```
   https://vtztjrjdtuuiekaycttr.supabase.co/auth/v1/callback
   ```
6. 만약 없다면 추가하고 저장

### 3. 환경 변수 확인

`.env.local` 파일에 다음이 올바르게 설정되어 있는지 확인:

```env
NEXT_PUBLIC_SUPABASE_URL=https://vtztjrjdtuuiekaycttr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

환경 변수 변경 후 개발 서버를 재시작하세요.

### 4. Supabase 프로젝트 상태 확인

1. Supabase 대시보드에서 프로젝트가 활성화되어 있는지 확인
2. 프로젝트가 일시 중지되지 않았는지 확인
3. 할당량이 초과되지 않았는지 확인

## 추가 확인 사항

- 브라우저 콘솔에서 더 자세한 에러 메시지 확인
- Supabase 대시보드의 **Logs > Auth Logs**에서 에러 로그 확인
- 네트워크 탭에서 실제 요청/응답 확인

