# 구움과자 조리법 관리 앱

구움과자 조리법과 실험 결과를 관리하는 모바일 웹 앱입니다.

## 기능

- 조리법 관리 (추가/수정/삭제)
- 장비, 재료, 결과물 편집
- Slate.js 기반 조리법 흐름 편집 (멘션 기능 포함)
- 결과물 양 변경 시 재료/장비 자동 계산
- 실험 결과 저장 및 관리
- 이미지 업로드 및 관리
- 소셜 로그인 (Google, Kakao, Naver, Apple)

## 기술 스택

- **프레임워크**: Next.js 16 (App Router)
- **언어**: TypeScript
- **스타일링**: Tailwind CSS
- **백엔드**: Supabase (Auth + Database + Storage)
- **에디터**: Slate.js

## 시작하기

### 1. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Supabase 설정

1. [Supabase](https://supabase.com)에서 새 프로젝트를 생성합니다.
2. SQL Editor에서 `supabase/schema.sql` 파일의 내용을 실행합니다.
3. Storage에서 `experiment-photos` 버킷을 생성합니다 (Public).
4. Authentication > Providers에서 소셜 로그인을 설정합니다.

자세한 내용은 `supabase/README.md`를 참고하세요.

### 3. 의존성 설치

```bash
npm install
```

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 프로젝트 구조

```
sogwaja/
├── app/                    # Next.js App Router 페이지
│   ├── (auth)/            # 인증 관련 페이지
│   ├── (main)/            # 메인 앱 페이지
│   └── api/               # API 라우트
├── components/            # React 컴포넌트
│   ├── layout/            # 레이아웃 컴포넌트
│   ├── recipe/            # 조리법 관련 컴포넌트
│   └── ui/                # 공통 UI 컴포넌트
├── lib/                   # 유틸리티 및 설정
│   ├── hooks/             # 커스텀 훅
│   ├── supabase/          # Supabase 클라이언트
│   └── utils/             # 유틸리티 함수
├── types/                 # TypeScript 타입 정의
└── supabase/              # Supabase 스키마 및 설정
```

## 주요 기능 설명

### 조리법 관리

- 조리법 제목, 장비, 재료, 결과물을 편집할 수 있습니다.
- 변경사항은 자동으로 저장됩니다 (debounce 적용).
- 결과물의 양을 변경하면 재료와 장비의 양이 자동으로 계산됩니다.

### 조리법 흐름 편집

- Slate.js 기반 리치 텍스트 에디터를 사용합니다.
- `@장비명` 또는 `@재료명` 형식으로 멘션할 수 있습니다.
- 멘션된 항목은 결과물 양 변경 시 자동으로 업데이트됩니다.

### 실험 결과 관리

- 조리법에 대한 실험 결과를 저장할 수 있습니다.
- 사진과 메모를 첨부할 수 있습니다.
- 실험 목록에서 최신순으로 확인할 수 있습니다.

## 배포

### Vercel 배포

1. GitHub에 프로젝트를 푸시합니다.
2. [Vercel](https://vercel.com)에서 프로젝트를 import합니다.
3. 환경 변수를 설정합니다.
4. 배포합니다.

### 환경 변수

배포 시 다음 환경 변수를 설정해야 합니다:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 라이선스

MIT
