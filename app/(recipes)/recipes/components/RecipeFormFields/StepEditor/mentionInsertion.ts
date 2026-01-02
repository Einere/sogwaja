import { Transforms, Range, Editor } from "slate";
import { ReactEditor } from "slate-react";
import type { MentionElement, MentionItem } from "./types";

/**
 * 멘션 요소를 생성합니다.
 */
function createMentionElement(item: MentionItem): MentionElement {
  return {
    type: "mention",
    mentionType: item.type,
    name: item.displayName,
    children: [{ text: `@${item.name}` }],
  };
}

/**
 * 멘션을 에디터에 삽입합니다.
 */
export function insertMention(
  editor: Editor & ReactEditor,
  item: MentionItem,
  replaceRange?: Range
): void {
  const mention = createMentionElement(item);
  const { selection } = editor;

  if (replaceRange && selection) {
    // replaceRange의 시작점부터 현재 커서 위치까지 삭제
    // (사용자가 추가로 입력한 글자까지 포함하기 위해)
    const actualRange = Range.isCollapsed(selection)
      ? Editor.range(editor, replaceRange.anchor, selection.anchor)
      : replaceRange;

    Transforms.select(editor, actualRange);
    Transforms.delete(editor);
  }

  // 멘션 삽입 및 공백 추가
  Transforms.insertNodes(editor, mention);
  Transforms.move(editor, { distance: 1, unit: "offset" });

  ReactEditor.focus(editor);
}
