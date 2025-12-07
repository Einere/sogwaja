import type { MentionItem, Equipment, Ingredient } from "./types";

/**
 * equipment와 ingredients를 통합 태그 목록으로 변환합니다.
 */
export function createMentionItems(
  equipment: Equipment[],
  ingredients: Ingredient[]
): MentionItem[] {
  const items: MentionItem[] = [];

  equipment.forEach(eq => {
    items.push({
      id: eq.id,
      name: eq.name.replace(/\s+/g, "_"),
      displayName: eq.name,
      type: "equipment",
    });
  });

  ingredients.forEach(ing => {
    items.push({
      id: ing.id,
      name: ing.name.replace(/\s+/g, "_"),
      displayName: ing.name,
      type: "ingredient",
    });
  });

  return items;
}

/**
 * 검색어를 기반으로 태그 목록을 필터링합니다.
 * @param items 전체 태그 목록
 * @param searchText 검색어
 * @param maxResults 최대 결과 수 (기본값: 10)
 * @returns 필터링된 태그 목록
 */
export function filterMentionItems(
  items: MentionItem[],
  searchText: string,
  maxResults: number = 10
): MentionItem[] {
  if (!searchText) {
    return items.slice(0, maxResults);
  }

  const lowerSearch = searchText.toLowerCase();
  return items
    .filter(item => {
      const nameMatch = item.name.toLowerCase().includes(lowerSearch);
      const displayMatch = item.displayName.toLowerCase().includes(lowerSearch);
      return nameMatch || displayMatch;
    })
    .slice(0, maxResults);
}
