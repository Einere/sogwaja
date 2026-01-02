import { Editor, Transforms, Range, Point, Path, Element } from "slate";
import { ReactEditor } from "slate-react";
import { findMentionAtSelection, isMentionFullySelected } from "./mentionUtils";

/**
 * 멘션 관련 커스텀 액션을 Editor에 추가하는 타입
 */
export interface MentionEditor extends Editor {
  mentionActions: {
    /**
     * 멘션을 선택합니다.
     */
    selectMention: (path: Path) => boolean;
    /**
     * 멘션 내부 선택을 감지하고 멘션을 선택합니다.
     */
    normalizeMentionSelection: () => boolean;
    /**
     * 백스페이스로 멘션 삭제 처리
     */
    handleMentionDeletion: () => boolean;
    /**
     * 선택 해제 시 커서를 멘션 끝으로 이동
     */
    collapseToMentionEnd: (mentionPath: Path) => void;
  };
}

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
 * 멘션 액션을 Editor에 추가합니다.
 */
export function withMentionActions(editor: Editor & ReactEditor): MentionEditor {
  const e = editor as MentionEditor & ReactEditor;

  e.mentionActions = {
    selectMention: (path: Path) => selectMention(e, path),

    normalizeMentionSelection: () => {
      const mention = findMentionAtSelection(e);
      if (!mention) return false;
      return selectMention(e, mention.path);
    },

    handleMentionDeletion: () => {
      const { selection } = e;
      if (!selection) return false;

      // 범위 선택된 경우: 선택된 멘션 삭제
      if (!Range.isCollapsed(selection)) {
        const mention = findMentionAtSelection(e);
        if (mention && isMentionFullySelected(e, selection, mention.range)) {
          Transforms.removeNodes(e, { at: mention.path });
          return true;
        }
        return false;
      }

      // 커서가 접혀있는 경우: 커서 바로 앞의 멘션 삭제
      const [start] = Range.edges(selection);
      const before = Editor.before(e, start);

      if (!before) return false;

      // before 포인트에서 멘션 찾기 (Editor.above 활용)
      const mentionEntry = Editor.above(e, {
        at: before,
        match: n => Element.isElement(n) && "type" in n && n.type === "mention",
      });

      if (!mentionEntry) return false;
      const [node, path] = mentionEntry;

      if (!("type" in node) || node.type !== "mention") return false;

      // 커서가 멘션 바로 뒤에 있는지 확인
      const [, mentionEnd] = Range.edges(Editor.range(e, path));

      if (Point.equals(mentionEnd, before)) {
        Transforms.removeNodes(e, { at: path });
        return true;
      }

      return false;
    },

    collapseToMentionEnd: (mentionPath: Path) => {
      try {
        const mentionRange = Editor.range(e, mentionPath);
        const [, mentionEnd] = Range.edges(mentionRange);
        Transforms.select(e, {
          anchor: mentionEnd,
          focus: mentionEnd,
        });
        // DOM 포커스 및 선택 업데이트
        ReactEditor.focus(e);
        // 다음 틱에서 DOM 선택을 명시적으로 업데이트 (React 렌더링 후)
        setTimeout(() => {
          try {
            const { selection: slateSelection } = e;
            if (slateSelection && Range.isCollapsed(slateSelection)) {
              const domRange = ReactEditor.toDOMRange(e, slateSelection);
              const selection = window.getSelection();
              if (selection && domRange) {
                selection.removeAllRanges();
                selection.addRange(domRange);
              }
            }
          } catch {
            // DOM 변환 실패 시 무시
          }
        }, 0);
      } catch {
        // 경로가 유효하지 않으면 무시
      }
    },
  };

  return e;
}
