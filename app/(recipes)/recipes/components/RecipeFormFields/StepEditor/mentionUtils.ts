import { Editor, Range, Point, Element, Path } from "slate";
import type { MentionElement } from "./types";

/**
 * 현재 선택 위치의 멘션을 찾습니다 (Slate.js의 Editor.above 활용)
 * 커서가 멘션 내부나 경계에 있을 때 해당 멘션을 반환합니다.
 */
export function findMentionAtSelection(editor: Editor): {
  path: Path;
  node: MentionElement;
  range: Range;
} | null {
  const { selection } = editor;
  if (!selection) return null;

  // Slate.js의 Editor.above로 현재 위치의 멘션 부모 찾기
  const mentionEntry = Editor.above(editor, {
    match: n => Element.isElement(n) && "type" in n && n.type === "mention",
  });

  if (!mentionEntry) return null;

  const [node, path] = mentionEntry;
  if (!("type" in node) || node.type !== "mention") return null;

  const range = Editor.range(editor, path);
  return {
    path,
    node: node as MentionElement,
    range,
  };
}

/**
 * 범위가 멘션과 겹치는지 확인
 */
export function isRangeOverlappingMention(editor: Editor, range: Range): boolean {
  const mention = findMentionAtSelection(editor);
  if (!mention) return false;
  return Range.intersection(range, mention.range) !== null;
}

/**
 * 커서가 멘션 내부/경계에 있는지 확인
 */
export function isCursorAtMention(editor: Editor): boolean {
  const { selection } = editor;
  if (!selection || !Range.isCollapsed(selection)) return false;
  
  const mention = findMentionAtSelection(editor);
  if (!mention) return false;

  const [cursor] = Range.edges(selection);
  const { range } = mention;
  const [start, end] = Range.edges(range);

  return (
    Point.compare(cursor, start) >= 0 && 
    Point.compare(cursor, end) <= 0
  );
}

/**
 * 검색 범위가 멘션 요소와 겹치는지 확인 (Editor.nodes 활용)
 * @param editor Slate 에디터
 * @param searchRange 검색할 범위
 * @param blockPath 블록 경로
 */
export function isSearchRangeOverlappingMentions(
  editor: Editor,
  searchRange: Range,
  blockPath: Path
): boolean {
  // Slate.js의 Editor.nodes를 사용하여 블록 내 모든 멘션 찾기
  for (const [node, path] of Editor.nodes(editor, {
    at: blockPath,
    match: n => Element.isElement(n) && "type" in n && n.type === "mention",
  })) {
    const mentionRange = Editor.range(editor, path);
    if (Range.intersection(searchRange, mentionRange)) {
      return true;
    }
  }
  return false;
}

/**
 * 멘션이 완전히 선택되었는지 확인
 */
export function isMentionFullySelected(
  editor: Editor,
  selection: Range,
  mentionRange: Range
): boolean {
  if (Range.isCollapsed(selection)) return false;
  
  const [selStart, selEnd] = Range.edges(selection);
  const [mentionStart, mentionEnd] = Range.edges(mentionRange);
  
  return (
    Point.equals(selStart, mentionStart) && 
    Point.equals(selEnd, mentionEnd)
  );
}

