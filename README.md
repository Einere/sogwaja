# 소과자 (Sogwaja, 焼菓子)

나만의 조리법을 찾아낼 수 있는 조리법 앱

## 1. 문제 정의와 해결 방향

### 1.1. 문제 상황

구움과자는 동일한 조리법이라고 하더라도, 환경과 장비에 크게 영향을 받기 때문에 결과가 천차만별입니다. 다른 사람의 조리법이 나에게 100% 맞을 수는 없으며, 실험을 통해 나에게 맞는 조리법을 찾을 수밖에 없습니다.

따라서 구움과자 제작은 반복적인 실험과 개선이 필요한 과정입니다. 각 실험마다 사용한 재료 양, 장비, 결과물을 기록하고 개선해나가야 합니다.

### 1.2. 해결 방향

**실험 기반 조리법 관리 앱**을 만드는 것으로 문제를 해결합니다.

1. 조리법 관리: 장비, 재료, 결과물, 조리 단계를 관리할 수 있습니다.
2. 실험 관리: 조리법마다 실험을 저장하고 열람할 수 있습니다.
3. 모바일 우선: 주방에서 바로 사용할 수 있도록 모바일 환경을 고려했습니다.

## 2. 아키텍처 설계와 기술 선택

### 2.1. Supabase

- 소셜 로그인과 매끄러운 인증 흐름
- 인증, 데이터베이스, 스토리지를 하나의 플랫폼에서 제공하여 개발 속도 향상
- 백엔드 인프라 구축 시간을 대폭 단축

### 2.2. Next.js

- 풀스택 경험
- 풀스택 프레임워크를 활용하여 웹 서버 및 API 서버 구현 비용 절감
- 민감한 데이터 및 통신을 서버 계층에서 처리
- 서버 함수를 활용한 폼 제출 처리 방식을 사용
- SSR/SSG로 첫 화면 렌더링 속도 개선

### 2.3. 유연하고 확장성있는 에디터 데이터 저장 구조

Slate.js 에디터의 재귀적인 노드 구조를 PostgreSQL의 JSONB 타입으로 저장합니다.

- 유연하게 스키마 변경 가능, 스키마 관리 비용 감소로 인해 비즈니스 민첩성 향상
- 매우 빠른 조회 성능
- GIN을 활용하여 추후 상세 검색 기능 확장 가능
- TypeScript로 클라이언트에서 타입 안전성을 보장하여 JSONB의 데이터 무결성을 보완

### 2.4. 동적으로 확장 가능한 조리법

- 장비, 재료, 결과물을 유연하게 추가 및 제거 가능
- React Hook Form을 이용하여 동적 폼 상태를 간편하게 관리
- Zod로 스키마를 빌드타임과 런타임 둘 다 검증하여 단일 진실의 원천 준수

### 2.5. 매끄러운 자동 저장

- 별도의 조작 없이 간편하고 매끄럽게 조리법을 저장
- debounce를 활용하여 불필요한 요청 최소화

## 3. 구현된 기능

### 3.1. 조리법

- 조리법 추가/수정/삭제
- 장비, 재료, 결과물 편집
- 자동 저장
- 결과물 수량 변경 시 재료/장비 수량 자동 계산

### 3.2. 조리 단계

- 유연하게 확장 가능한 Slate.js 기반 리치 텍스트 에디터
- `@장비명` 또는 `@재료명` 형식의 멘션 기능

### 3.3. 실험 결과

- 실험 결과 저장 및 조회
- 저장 시점의 재료/장비/결과물/작업흐름을 스냅샷으로 저장
- 사진 업로드 및 메모 작성 가능

### 3.4. 인증 및 보안

- 소셜 로그인 지원 (Google)
- Row Level Security로 사용자별 데이터 접근 제어
- 세션 관리 자동화 (Next.js Middleware)

### 3.5. 사용자 경험

- 모바일 우선 디자인
- 네이티브 앱 느낌의 화면 전환 효과 (SSGOI)
- 접근성 고려 (reduced motion 지원)
- 낙관적 업데이트로 즉각적인 피드백
- 간편하고 매끄러운 자동 저장

## 4. 기술 스택

- **프레임워크**: Next.js 16 (App Router)
- **언어**: TypeScript
- **스타일링**: Tailwind CSS
- **백엔드**: Supabase (Auth + Database + Storage)
- **에디터**: Slate.js
- **폼 관리**: React Hook Form + Zod
- **UI 컴포넌트**: Radix UI
- **화면전환**: SSGOI

## 5. 도전적인 기능 구현 경험

### 5.1. Slate.js 기반 멘션 시스템

#### 5.1.1. 도전 과제

조리 단계는 일반적인 텍스트 에디터와 다르게 인터렉티브한 에디터로 만들고 싶었습니다.
그래서 생각한 것이 바로 태그(멘션)기능입니다. 멘션을 통해 장비와 재료를 시각적으로 부각시켜 시인성을 높이고자 했습니다.

멘션 기능을 구현하려고 하니, 수많은 복잡성이 있었습니다.

- 멘션 기능 트리거 여부 판단
- 기존 멘션 요소와 텍스트 입력의 경계 구분
- 드롭다운 위치를 동적으로 계산
- 키보드 네비게이션(Arrow keys, Enter) 지원

#### 5.1.2. 해결 방법

**역방향 텍스트 탐색**

```typescript
// mentionDetection.ts
// 커서 위치에서 최대 50자까지 역방향으로 @ 문자 탐색
for (let i = 0; i < 50; i++) {
  const before = Editor.before(editor, point);
  const char = Editor.string(editor, Editor.range(editor, before, point));
  if (char === "@") {
    atPoint = before;
    break;
  }
  // 공백이나 줄바꿈이면 중단
  if (/\s/.test(char)) break;
}
```

**멘션 충돌 방지**

기존 멘션 요소와 겹치지 않도록 Range 기반 검증을 수행합니다.

**드롭다운 위치 계산**

커서의 실제 DOM 위치를 계산하여 드롭다운을 배치합니다. 스크롤, 뷰포트 경계, 기존 멘션 요소를 고려하여 최적 위치를 결정합니다.

#### 5.1.3. 배운 점

- **상태 관리의 중요성**: 멘션 감지, 드롭다운 표시, 키보드 네비게이션 등 복잡하게 얽힌 상태들을 잘 관리하는 것이 핵심
- **사용자 입력 패턴 분석**: 사용자가 `@`를 입력한 후 백스페이스로 삭제하는 경우, 멘션을 다시 입력하는 경우 등 엣지 케이스를 고려해야 함
- **에디터 라이브러리의 이해**: Slate.js의 Editor API를 이해해야 복잡한 기능을 구현할 수 있음

### 5.2. 자동 저장 시스템

#### 5.2.1. 도전 과제

- 불필요한 저장 요청 최소화 (초기 로드, 동일 값 저장 방지)
- 에러 발생 시 이전 상태로 롤백
- 여러 필드가 동시에 변경될 때 중복 저장 방지

#### 5.2.2. 해결 방법

**초기화 상태 관리**

```typescript
// useAutoSave.ts
const isInitializingRef = useRef(true);
useEffect(() => {
  if (initialValueRef.current === null) {
    initialValueRef.current = value;
    setTimeout(() => {
      isInitializingRef.current = false;
    }, 100);
  }
}, [value]);
```

조리법 초기 로드 시, 자동 저장이 발생하지 않도록 플래그를 사용합니다. 100ms 지연을 두어 React의 상태 업데이트 사이클과 동기화합니다.

**Debounce + 변경 감지**

```typescript
// useRecipeEditor.ts
const debouncedSaveTitle = useDebouncedCallback((newTitle: string) => {
  if (recipe && newTitle !== recipe.title && !isInitializingRef.current) {
    saveTitle(newTitle);
  }
}, AUTO_SAVE_DEBOUNCE_MS);
```

연속된 입력을 하나의 요청으로 통합하고, 실제로 값이 변경되었을 때만 저장합니다.

**Optimistic Update + 롤백**

저장 요청 전에 UI를 즉시 업데이트하고, 실패 시 이전 상태로 복원합니다. 이를 통해 사용자는 즉각적인 피드백을 받으면서도 데이터 일관성을 보장합니다.

#### 5.2.3. 배운 점

- **사용자 경험과 서버 부하의 균형**: 너무 짧은 debounce는 서버 부하를 증가시키고, 너무 길면 사용자가 변경사항이 저장되지 않았다고 느낄 수 있음
- **상태 동기화의 복잡성**: 클라이언트 상태, 서버 상태, 폼 상태를 일관되게 유지하는 것이 예상보다 복잡함
- **에러 처리 전략**: 네트워크 오류, 서버 오류, 동시성 충돌 등 다양한 에러 시나리오를 고려해야 함

### 5.3. 비례 계산 시스템

#### 5.3.1. 도전 과제

- 결과물의 수량을 변경 시 재료와 장비의 수량을 비례 계산
- 단위 불일치 처리 (예: g vs kg, 개 vs 박스)
- 0 값, 무효 값, 음수 값 등 엣지 케이스 처리

#### 5.3.2. 해결 방법

**비율 기반 계산 알고리즘**

```typescript
// calculations.ts
export function calculateProportionalQuantity(
  originalQuantity: Quantity,
  originalOutput: Quantity,
  newOutput: Quantity
): Quantity {
  // 0으로 나누기 방지
  if (originalOutput.value === 0) {
    if (newOutput.value === 0) return originalQuantity;
    return originalQuantity; // 비율 계산 불가
  }

  const ratio = newOutput.value / originalOutput.value;
  return {
    value: originalQuantity.value * ratio,
    unit: originalQuantity.unit, // 단위는 유지
  };
}
```

**타입 가드로 런타임 검증**

```typescript
export function isValidNumber(value: unknown): value is number {
  return typeof value === "number" && !isNaN(value) && isFinite(value);
}
```

사용자 입력이나 API 응답에서 오는 값이 유효한지 런타임에 검증합니다.

**엣지 케이스 처리**

- 원래 결과물이 0인 경우: 비율 계산 불가 → 원래 값 유지
- 새로운 결과물이 0인 경우: 모든 재료/장비를 0으로 설정
- 무효한 숫자: 원래 값 유지

#### 5.3.3. 배운 점

- **도메인 로직의 정확성 검증**: 수학적으로 간단해 보이는 계산도 실제 사용 시나리오에서는 다양한 엣지 케이스가 발생
- **사용자 실수 방지를 위한 방어적 프로그래밍**: 사용자가 실수로 0을 입력하거나, 음수를 입력하는 경우를 고려해야 함

### 5.4. 네이티브 앱 경험 구현 (SSGOI)

#### 5.4.1. 도전 과제

네이티브 앱 수준의 화면 전환 효과를 제공하고, 일부 사용자를 위해 감소된 애니메이션 기능을 제공해야 합니다.

#### 5.4.2. 해결 방법

**SSGOI 라이브러리 활용**

```typescript
// SsgoiProvider.tsx
const config = {
  transitions: [
    {
      from: "recipes",
      to: "recipe-editor",
      transition: drill({ direction: "enter" }),
      symmetric: true,
    },
    // ...
  ],
};
```

페이지 관계별로 전환 효과를 중앙집중식으로 관리할 수 있습니다.

**접근성 고려**

```typescript
const prefersReducedMotion = usePrefersReducedMotion();
return (
  <Ssgoi config={prefersReducedMotion ? nullConfig : config}>
    {children}
  </Ssgoi>
);
```

`prefers-reduced-motion` 미디어 쿼리를 감지하여 애니메이션을 비활성화합니다.

#### 5.4.3. 배운 점

- **사용자 경험 향상을 위한 세부적인 배려**: 작은 디테일이 전체적인 사용자 경험에 큰 영향을 미침
- **접근성은 선택이 아닌 필수**: 모든 사용자가 앱을 사용할 수 있도록 고려해야 함
