/**
 * 결과물의 양이 변경될 때 재료와 장비의 양을 자동으로 계산하는 유틸리티 함수들
 */

export interface Quantity {
  value: number
  unit: string
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
  // 단위가 같아야 비율 계산이 가능
  if (originalOutput.unit !== newOutput.unit) {
    // 단위 변환이 필요한 경우, 일단 같은 단위로 가정하고 비율만 계산
    // 실제로는 단위 변환 로직이 필요할 수 있음
    const ratio = newOutput.value / originalOutput.value
    return {
      value: Math.round((originalQuantity.value * ratio) * 100) / 100,
      unit: originalQuantity.unit,
    }
  }

  const ratio = newOutput.value / originalOutput.value
  return {
    value: Math.round((originalQuantity.value * ratio) * 100) / 100,
    unit: originalQuantity.unit,
  }
}

/**
 * 여러 재료의 양을 한 번에 계산
 */
export function calculateIngredients(
  ingredients: Array<{ amount: number; unit: string }>,
  originalOutput: Quantity,
  newOutput: Quantity
): Array<{ amount: number; unit: string }> {
  return ingredients.map((ingredient) => {
    const calculated = calculateProportionalQuantity(
      { value: ingredient.amount, unit: ingredient.unit },
      originalOutput,
      newOutput
    )
    return {
      amount: calculated.value,
      unit: calculated.unit,
    }
  })
}

/**
 * 여러 장비의 개수를 한 번에 계산
 */
export function calculateEquipment(
  equipment: Array<{ quantity: number; unit: string }>,
  originalOutput: Quantity,
  newOutput: Quantity
): Array<{ quantity: number; unit: string }> {
  return equipment.map((eq) => {
    const calculated = calculateProportionalQuantity(
      { value: eq.quantity, unit: eq.unit },
      originalOutput,
      newOutput
    )
    return {
      quantity: calculated.value,
      unit: calculated.unit,
    }
  })
}

