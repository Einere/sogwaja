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
