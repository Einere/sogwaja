import { Editor, Element } from "slate";
import { ReactEditor } from "slate-react";
import { withMentionActions, type MentionEditor } from "./mentionActions";

/**
 * 멘션을 인라인 요소로 설정하고 커스텀 액션을 추가하는 Slate 에디터 플러그인
 */
export function withMentions(editor: Editor & ReactEditor): MentionEditor {
  const { isInline } = editor;

  editor.isInline = element => {
    if (Element.isElement(element) && "type" in element && element.type === "mention") {
      return true;
    }
    return isInline(element);
  };

  return withMentionActions(editor);
}
