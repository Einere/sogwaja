import { Editor, Transforms, Range, Point, Element, Path } from "slate";

/**
 * 커서 위치의 멘션을 찾습니다.
 * @param editor Slate 에디터 인스턴스
 * @returns 멘션 경로와 노드, 또는 null
 */
export function getMentionAtCursor(editor: Editor): { path: Path; node: Element } | null {
  const { selection } = editor;
  if (!selection) return null;

  const [start, end] = Range.edges(selection);

  // 현재 블록 찾기
  const block = Editor.above(editor, {
    match: n => Element.isElement(n) && Editor.isBlock(editor, n),
  });

  if (!block) return null;

  const [, blockPath] = block;
  const blockNode = Editor.node(editor, blockPath)[0];

  if (!blockNode || typeof blockNode !== "object" || !("children" in blockNode)) {
    return null;
  }

  // 블록의 모든 노드를 순회하며 멘션 찾기
  for (let i = 0; i < blockNode.children.length; i++) {
    const child = blockNode.children[i];
    const childPath = [...blockPath, i];

    if (typeof child === "object" && "type" in child && child.type === "mention") {
      const mentionStart = Editor.start(editor, childPath);
      const mentionEnd = Editor.end(editor, childPath);

      // 선택 범위가 멘션과 겹치는지 확인
      const startCompare = Point.compare(start, mentionStart);
      const endCompare = Point.compare(end, mentionEnd);
      const startEndCompare = Point.compare(start, mentionEnd);
      const endStartCompare = Point.compare(end, mentionStart);

      // 커서가 멘션 내부에 있는지 확인
      const isStartInMention = startCompare >= 0 && startEndCompare < 0;
      const isEndInMention = endStartCompare > 0 && endCompare <= 0;
      // 선택 범위가 멘션을 포함하는지 확인
      const isMentionInSelection = startCompare < 0 && endCompare > 0;
      // 커서가 멘션 경계에 있는지 확인
      const isAtMentionBoundary = Point.equals(start, mentionStart) || Point.equals(start, mentionEnd);

      if (isStartInMention || isEndInMention || isMentionInSelection || isAtMentionBoundary) {
        return { path: childPath, node: child as Element };
      }
    }
  }

  return null;
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
  const mention = getMentionAtCursor(editor);
  if (!mention) return false;

  // 멘션을 선택
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

  // 현재 블록 찾기
  const block = Editor.above(editor, {
    match: n => Element.isElement(n) && Editor.isBlock(editor, n),
  });

  if (!block) return false;

  const [, blockPath] = block;
  const blockNode = Editor.node(editor, blockPath)[0];

  if (!blockNode || typeof blockNode !== "object" || !("children" in blockNode)) {
    return false;
  }

  // 블록의 모든 노드를 순회하며 멘션 찾기
  for (let i = 0; i < blockNode.children.length; i++) {
    const child = blockNode.children[i];
    const childPath = [...blockPath, i];

    if (typeof child === "object" && "type" in child && child.type === "mention") {
      const mentionStart = Editor.start(editor, childPath);
      const mentionEnd = Editor.end(editor, childPath);

      // 현재 선택이 이 멘션 전체를 선택하고 있는지 확인
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
          return selectMention(editor, childPath);
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
          return selectMention(editor, childPath);
        }
      }
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

  // 선택된 멘션이 있는지 확인 (멘션 전체가 선택된 경우)
  if (!Range.isCollapsed(selection)) {
    const [start, end] = Range.edges(selection);
    const mention = getMentionAtCursor(editor);
    if (mention) {
      const mentionStart = Editor.start(editor, mention.path);
      const mentionEnd = Editor.end(editor, mention.path);
      // 선택 범위가 멘션 전체를 포함하는지 확인
      if (Point.equals(start, mentionStart) && Point.equals(end, mentionEnd)) {
        // 선택된 멘션 삭제
        Transforms.removeNodes(editor, { at: mention.path });
        return true;
      }
    }
  }

  // 커서가 접혀있는 경우 기존 로직 사용
  const [start] = Range.edges(selection);
  const before = Editor.before(editor, start);

  if (!before) return false;

  const [node, path] = Editor.node(editor, before);

  // 이전 노드가 멘션 요소인지 확인
  if (node && typeof node === "object" && "type" in node && node.type === "mention") {
    // 멘션 요소 전체를 삭제
    Transforms.removeNodes(editor, { at: path });
    return true;
  }

  // 멘션 요소 내부에 있는지 확인 (커서가 멘션 안에 있을 때)
  const [parent] = Editor.parent(editor, path);
  if (parent && typeof parent === "object" && "type" in parent && parent.type === "mention") {
    // 부모 멘션 요소 전체를 삭제
    const parentPath = Editor.path(editor, path.slice(0, -1));
    Transforms.removeNodes(editor, { at: parentPath });
    return true;
  }

  return false;
}
