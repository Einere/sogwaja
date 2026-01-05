/**
 * 조리법 관련 비즈니스 규칙 상수
 * 모든 제한사항, 옵션, 기본값을 한 곳에서 관리
 */

/**
 * 제한사항 (Limits)
 */
export const RECIPE_LIMITS = {
  /** 결과물 최대 개수 */
  MAX_OUTPUTS: 1,
  /** 실험 사진 최대 개수 */
  MAX_EXPERIMENT_PHOTOS: 9,
} as const;

/**
 * 허용되는 단위 옵션
 */
export const UNIT_OPTIONS = ["개", "g", "ml"] as const;

/**
 * 단위 타입
 */
export type Unit = (typeof UNIT_OPTIONS)[number];

/**
 * 기본 단위 값
 */
export const DEFAULT_UNITS = {
  /** 장비 기본 단위 */
  EQUIPMENT: "개",
  /** 재료 기본 단위 */
  INGREDIENT: "g",
  /** 결과물 기본 단위 */
  OUTPUT: "개",
} as const;

/**
 * 비즈니스 로직 판단 함수들
 * 뷰 레이어에서 직접 제한사항을 체크하지 않고 이 함수들을 사용
 */

/**
 * 결과물을 추가할 수 있는지 확인
 * @param outputs 현재 결과물 배열
 * @returns 결과물을 추가할 수 있으면 true
 */
export function canAddOutput(outputs: unknown[]): boolean {
  return outputs.length < RECIPE_LIMITS.MAX_OUTPUTS;
}

/**
 * 결과물이 있는지 확인
 * @param outputs 현재 결과물 배열
 * @returns 결과물이 있으면 true
 */
export function hasOutputs(outputs: unknown[]): boolean {
  return outputs.length > 0;
}

/**
 * 결과물이 최대 개수에 도달했는지 확인
 * @param outputs 현재 결과물 배열
 * @returns 최대 개수에 도달했으면 true
 */
export function isOutputLimitReached(outputs: unknown[]): boolean {
  return outputs.length >= RECIPE_LIMITS.MAX_OUTPUTS;
}

/**
 * 실험 사진을 더 추가할 수 있는지 확인
 * @param currentCount 현재 사진 개수
 * @returns 사진을 더 추가할 수 있으면 true
 */
export function canAddPhoto(currentCount: number): boolean {
  return currentCount < RECIPE_LIMITS.MAX_EXPERIMENT_PHOTOS;
}

/**
 * 실험 사진 개수가 최대를 초과했는지 확인
 * @param count 사진 개수
 * @returns 최대를 초과했으면 true
 */
export function isPhotoLimitExceeded(count: number): boolean {
  return count > RECIPE_LIMITS.MAX_EXPERIMENT_PHOTOS;
}

/**
 * 추가하려는 사진들을 추가할 수 있는지 확인
 * @param currentCount 현재 사진 개수
 * @param additionalCount 추가하려는 사진 개수
 * @returns 추가할 수 있으면 true
 */
export function canAddPhotos(currentCount: number, additionalCount: number): boolean {
  return currentCount + additionalCount <= RECIPE_LIMITS.MAX_EXPERIMENT_PHOTOS;
}

/**
 * 단위가 유효한지 확인
 * @param unit 확인할 단위 문자열
 * @returns 유효한 단위이면 true
 */
export function isValidUnit(unit: string): unit is Unit {
  return UNIT_OPTIONS.includes(unit as Unit);
}

/**
 * 단위를 정규화 (유효하지 않으면 기본값 반환)
 * @param unit 정규화할 단위 문자열
 * @param fallback 기본값 (기본값: 첫 번째 단위 옵션)
 * @returns 정규화된 Unit
 */
export function normalizeUnit(unit: string, fallback: Unit = UNIT_OPTIONS[0]): Unit {
  return isValidUnit(unit) ? unit : fallback;
}

/**
 * 단위 옵션 배열 생성
 * 뷰 레이어에서 사용하므로 string 타입으로 반환
 * @returns 단위 옵션 배열
 */
export function getUnitOptions(): Array<{ value: string; label: string }> {
  return UNIT_OPTIONS.map(unit => ({ value: unit, label: unit }));
}
