import { Editor, Transforms, Range, Point, Path, Element } from "slate";
import { findMentionAtSelection } from "./mentionUtils";

/**
 * 커서 위치의 멘션을 찾습니다.
 * @param editor Slate 에디터 인스턴스
 * @returns 멘션 경로와 노드, 또는 null
 */
export function getMentionAtCursor(editor: Editor): { path: Path; node: Element } | null {
  const mention = findMentionAtSelection(editor);
  if (!mention) return null;
  
  return {
    path: mention.path,
    node: mention.node,
  };
}

/**
 * 멘션을 선택합니다.
 * @param editor Slate 에디터 인스턴스
 * @param mentionPath 멘션 경로
 * @returns 선택 성공 여부
 */
export function selectMention(editor: Editor, mentionPath: Path): boolean {
  try {
    const mentionStart = Editor.start(editor, mentionPath);
    const mentionEnd = Editor.end(editor, mentionPath);
    Transforms.setSelection(editor, {
      anchor: mentionStart,
      focus: mentionEnd,
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * 멘션 내부 선택을 감지하고 멘션을 선택합니다.
 * @param editor Slate 에디터 인스턴스
 * @returns 멘션 내부 선택이 감지되어 선택했는지 여부
 */
export function normalizeMentionSelection(editor: Editor): boolean {
  const mention = findMentionAtSelection(editor);
  if (!mention) return false;
  return selectMention(editor, mention.path);
}

/**
 * 방향키로 멘션을 건너뛰는 로직을 처리합니다.
 * @param editor Slate 에디터 인스턴스
 * @param direction 방향 ('ArrowLeft' | 'ArrowRight')
 * @returns 처리되었는지 여부
 */
export function handleMentionNavigation(
  editor: Editor,
  direction: "ArrowLeft" | "ArrowRight"
): boolean {
  const { selection } = editor;
  if (!selection) return false;

  const [start, end] = Range.edges(selection);
  const isCollapsed = Range.isCollapsed(selection);

  const mention = findMentionAtSelection(editor);
  if (!mention) return false;

  const { path, range } = mention;
  const [mentionStart, mentionEnd] = Range.edges(range);
  const isMentionSelected = 
    Point.equals(start, mentionStart) && Point.equals(end, mentionEnd);

  if (direction === "ArrowRight") {
    if (isMentionSelected) {
      // 이미 선택된 멘션에서 오른쪽 방향키: 멘션 끝으로 통과
      Transforms.setSelection(editor, {
        anchor: mentionEnd,
        focus: mentionEnd,
      });
      return true;
    } else if (isCollapsed && Point.equals(start, mentionStart)) {
      // 멘션 바로 앞에서 오른쪽 방향키: 멘션 선택
      return selectMention(editor, path);
    }
  } else if (direction === "ArrowLeft") {
    if (isMentionSelected) {
      // 이미 선택된 멘션에서 왼쪽 방향키: 멘션 앞으로 통과
      Transforms.setSelection(editor, {
        anchor: mentionStart,
        focus: mentionStart,
      });
      return true;
    } else if (isCollapsed && Point.equals(start, mentionEnd)) {
      // 멘션 바로 뒤에서 왼쪽 방향키: 멘션 선택
      return selectMention(editor, path);
    }
  }

  return false;
}

/**
 * 백스페이스로 멘션을 삭제하는 로직을 처리합니다.
 * @param editor Slate 에디터 인스턴스
 * @returns 처리되었는지 여부
 */
export function handleMentionDeletion(editor: Editor): boolean {
  const { selection } = editor;
  if (!selection) return false;

  // 선택된 멘션 삭제
  if (!Range.isCollapsed(selection)) {
    const mention = findMentionAtSelection(editor);
    if (mention) {
      const [start, end] = Range.edges(selection);
      const [mentionStart, mentionEnd] = Range.edges(mention.range);
      
      // 선택 범위가 멘션 전체를 포함하는지 확인
      if (Point.equals(start, mentionStart) && Point.equals(end, mentionEnd)) {
        Transforms.removeNodes(editor, { at: mention.path });
        return true;
      }
    }
  }

  // 커서 앞의 멘션 삭제
  const [start] = Range.edges(selection);
  const before = Editor.before(editor, start);
  if (!before) return false;

  const [node, path] = Editor.node(editor, before);
  
  // 이전 노드가 멘션 요소인지 확인
  if (node && typeof node === "object" && "type" in node && node.type === "mention") {
    Transforms.removeNodes(editor, { at: path });
    return true;
  }

  return false;
}
