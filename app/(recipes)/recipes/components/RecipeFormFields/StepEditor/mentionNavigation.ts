import { Editor, Transforms, Range, Point, Path, Element } from "slate";
import { findMentionAtSelection, isMentionFullySelected } from "./mentionUtils";

/**
 * 멘션을 선택합니다.
 */
function selectMention(editor: Editor, mentionPath: Path): boolean {
  try {
    Transforms.select(editor, Editor.range(editor, mentionPath));
    return true;
  } catch {
    return false;
  }
}

/**
 * 멘션 내부 선택을 감지하고 멘션을 선택합니다.
 */
export function normalizeMentionSelection(editor: Editor): boolean {
  const mention = findMentionAtSelection(editor);
  if (!mention) return false;
  return selectMention(editor, mention.path);
}

/**
 * 백스페이스로 멘션 삭제 처리
 */
export function handleMentionDeletion(editor: Editor): boolean {
  const { selection } = editor;
  if (!selection || !Range.isCollapsed(selection)) {
    // 범위 선택된 경우: 선택된 멘션 삭제
    if (selection && !Range.isCollapsed(selection)) {
      const mention = findMentionAtSelection(editor);
      if (mention && isMentionFullySelected(editor, selection, mention.range)) {
        Transforms.removeNodes(editor, { at: mention.path });
        return true;
      }
    }
    return false;
  }

  // 커서가 접혀있는 경우: 커서 앞의 멘션 삭제
  const [start] = Range.edges(selection);

  // 현재 블록 찾기
  const block = Editor.above(editor, {
    match: n => Element.isElement(n) && Editor.isBlock(editor, n),
  });

  if (!block) return false;

  const [, blockPath] = block;

  // 블록 내의 모든 멘션 확인
  for (const [node, path] of Editor.nodes(editor, {
    at: blockPath,
    match: n => Element.isElement(n) && "type" in n && n.type === "mention",
  })) {
    const mentionRange = Editor.range(editor, path);
    const [mentionStart, mentionEnd] = Range.edges(mentionRange);

    // 커서가 멘션 바로 뒤에 있는지 확인
    if (Point.equals(start, mentionEnd)) {
      Transforms.removeNodes(editor, { at: path });
      return true;
    }
  }

  return false;
}
