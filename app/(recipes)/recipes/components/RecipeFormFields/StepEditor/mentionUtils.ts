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
 * 검색 범위가 멘션 요소와 겹치는지 확인
 * @param editor Slate 에디터
 * @param searchRange 검색할 범위
 * @param blockPath 블록 경로
 */
export function isSearchRangeOverlappingMentions(
  editor: Editor,
  searchRange: Range,
  blockPath: Path
): boolean {
  const blockNode = Editor.node(editor, blockPath)[0];
  
  if (!blockNode || typeof blockNode !== "object" || !("children" in blockNode)) {
    return false;
  }

  // 블록의 모든 멘션 요소 확인
  for (let i = 0; i < blockNode.children.length; i++) {
    const child = blockNode.children[i];
    if (typeof child === "object" && "type" in child && child.type === "mention") {
      const childPath = [...blockPath, i];
      const mentionRange = Editor.range(editor, childPath);
      
      // 범위가 겹치는지 확인
      if (Range.intersection(searchRange, mentionRange) !== null) {
        return true;
      }
    }
  }

  return false;
}

