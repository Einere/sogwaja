/**
 * 결과물의 양이 변경될 때 재료와 장비의 양을 자동으로 계산하는 유틸리티 함수들
 */

import type { Unit } from "@/lib/constants/recipe";

export interface Quantity {
  value: number;
  unit: Unit;
}

/**
 * 값이 유효한 number인지 확인
 * @param value 검증할 값
 * @returns 유효한 number인지 여부
 */
export function isValidNumber(value: unknown): value is number {
  return typeof value === "number" && !isNaN(value) && isFinite(value);
}

/**
 * 비율을 계산하여 새로운 양을 반환
 * @param originalQuantity 원래 양
 * @param originalOutput 원래 결과물 양
 * @param newOutput 새로운 결과물 양
 * @returns 계산된 새로운 양
 */
export function calculateProportionalQuantity(
  originalQuantity: Quantity,
  originalOutput: Quantity,
  newOutput: Quantity
): Quantity {
  // 타입 및 유효성 검증
  if (!isValidNumber(originalQuantity.value)) {
    // 원래 수량이 유효하지 않으면 원래 수량 유지
    return originalQuantity;
  }

  if (!isValidNumber(originalOutput.value)) {
    // 원래 결과물 수량이 유효하지 않으면 원래 수량 유지
    return originalQuantity;
  }

  if (!isValidNumber(newOutput.value)) {
    // 새로운 결과물 수량이 유효하지 않으면 원래 수량 유지
    return originalQuantity;
  }

  // 0 값 처리
  if (originalOutput.value === 0) {
    // 원래 결과물 수량이 0인 경우
    if (newOutput.value === 0) {
      // 새로운 결과물 수량도 0이면 원래 수량 유지
      return originalQuantity;
    }
    // 새로운 결과물 수량이 0보다 크면 비율 계산 불가 → 원래 수량 유지
    return originalQuantity;
  }

  if (newOutput.value === 0) {
    // 새로운 결과물 수량이 0이면 수량을 0으로 설정
    return {
      value: 0,
      unit: originalQuantity.unit,
    };
  }

  // 단위가 같아야 비율 계산이 가능
  if (originalOutput.unit !== newOutput.unit) {
    // 단위 변환이 필요한 경우, 일단 같은 단위로 가정하고 비율만 계산
    // 실제로는 단위 변환 로직이 필요할 수 있음
    const ratio = newOutput.value / originalOutput.value;
    return {
      value: Math.round(originalQuantity.value * ratio * 100) / 100,
      unit: originalQuantity.unit,
    };
  }

  // 정상 케이스: 비율 계산
  const ratio = newOutput.value / originalOutput.value;
  return {
    value: Math.round(originalQuantity.value * ratio * 100) / 100,
    unit: originalQuantity.unit,
  };
}

/**
 * 여러 재료의 양을 한 번에 계산
 */
export function calculateIngredients(
  ingredients: Array<{ amount: number; unit: Unit }>,
  originalOutput: Quantity,
  newOutput: Quantity
): Array<{ amount: number; unit: Unit }> {
  return ingredients.map(ingredient => {
    const calculated = calculateProportionalQuantity(
      { value: ingredient.amount, unit: ingredient.unit },
      originalOutput,
      newOutput
    );
    // 방어적 프로그래밍: 계산된 값이 유효하지 않으면 원래 값 유지
    const amount = isValidNumber(calculated.value) ? calculated.value : ingredient.amount;
    return {
      amount,
      unit: calculated.unit,
    };
  });
}

/**
 * 여러 장비의 개수를 한 번에 계산
 */
export function calculateEquipment(
  equipment: Array<{ quantity: number; unit: Unit }>,
  originalOutput: Quantity,
  newOutput: Quantity
): Array<{ quantity: number; unit: Unit }> {
  return equipment.map(eq => {
    const calculated = calculateProportionalQuantity(
      { value: eq.quantity, unit: eq.unit },
      originalOutput,
      newOutput
    );
    // 방어적 프로그래밍: 계산된 값이 유효하지 않으면 원래 값 유지
    const quantity = isValidNumber(calculated.value) ? calculated.value : eq.quantity;
    return {
      quantity,
      unit: calculated.unit,
    };
  });
}

/**
 * 재료 목록에 비율을 적용하여 업데이트된 목록 반환
 * 전체 객체를 유지하면서 amount와 unit만 업데이트
 */
export function applyProportionalToIngredients<T extends { amount: number; unit: Unit }>(
  ingredients: T[],
  originalOutput: Quantity,
  newOutput: Quantity
): T[] {
  return ingredients.map(ingredient => {
    const calculated = calculateProportionalQuantity(
      { value: ingredient.amount, unit: ingredient.unit },
      originalOutput,
      newOutput
    );
    return {
      ...ingredient,
      amount: isValidNumber(calculated.value) ? calculated.value : ingredient.amount,
      unit: calculated.unit,
    };
  });
}

/**
 * 장비 목록에 비율을 적용하여 업데이트된 목록 반환
 * 전체 객체를 유지하면서 quantity와 unit만 업데이트
 */
export function applyProportionalToEquipment<T extends { quantity: number; unit: Unit }>(
  equipment: T[],
  originalOutput: Quantity,
  newOutput: Quantity
): T[] {
  return equipment.map(eq => {
    const calculated = calculateProportionalQuantity(
      { value: eq.quantity, unit: eq.unit },
      originalOutput,
      newOutput
    );
    return {
      ...eq,
      quantity: isValidNumber(calculated.value) ? calculated.value : eq.quantity,
      unit: calculated.unit,
    };
  });
}
