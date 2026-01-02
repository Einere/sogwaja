import { Editor, Range, Point, Element } from "slate";
import type { MentionDetectionResult } from "./types";
import { isCursorAtMention, isSearchRangeOverlappingMentions } from "./mentionUtils";

/**
 * 커서 위치에서 역방향으로 @ 문자를 찾고 멘션 범위를 계산합니다.
 * @param editor Slate 에디터 인스턴스
 * @returns 멘션 범위와 검색 텍스트, 또는 null
 */
export function detectMention(editor: Editor): MentionDetectionResult | null {
  const { selection } = editor;
  if (!selection || !Range.isCollapsed(selection)) {
    return null;
  }

  // 커서가 멘션에 있으면 드롭다운 표시하지 않음
  if (isCursorAtMention(editor)) {
    return null;
  }

  const [start] = Range.edges(selection);

  // 현재 블록 찾기
  const block = Editor.above(editor, {
    match: n => Element.isElement(n) && Editor.isBlock(editor, n),
  });

  if (!block) return null;

  const [, blockPath] = block;
  const startOfBlock = Editor.start(editor, blockPath);

  // 역방향으로 @ 찾기 (최대 50자)
  let point = start;
  let searchText = "";
  let atPoint: Point | null = null;

  for (let i = 0; i < 50; i++) {
    const before = Editor.before(editor, point);
    if (!before || Point.compare(before, startOfBlock) < 0) break;

    const char = Editor.string(editor, Editor.range(editor, before, point));

    if (char === "@") {
      atPoint = before;
      break;
    }

    if (/\s/.test(char)) break;

    searchText = char + searchText;
    point = before;
  }

  if (!atPoint) return null;

  // 검색 범위가 멘션과 겹치는지 확인
  const searchRange = Editor.range(editor, atPoint, start);
  if (isSearchRangeOverlappingMentions(editor, searchRange, blockPath)) {
    return null;
  }

  // @ 앞 문맥 확인
  const beforeAt = Editor.before(editor, atPoint);
  const isStart = !beforeAt || Point.equals(beforeAt, startOfBlock);
  const beforeChar = beforeAt ? Editor.string(editor, Editor.range(editor, beforeAt, atPoint)) : "";

  if (!isStart && beforeChar !== "" && !/[\s\n\r]/.test(beforeChar)) {
    return null;
  }

  // 유효한 멘션 패턴 확인
  if (!/^[\w_가-힣]*$/.test(searchText)) return null;

  return {
    range: searchRange,
    searchText,
  };
}
