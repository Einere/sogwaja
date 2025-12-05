import { Editor, Element } from 'slate'

/**
 * 멘션을 인라인 요소로 설정하는 Slate 에디터 플러그인
 */
export function withMentions(editor: Editor): Editor {
  const { isInline } = editor

  editor.isInline = (element) => {
    if (Element.isElement(element) && 'type' in element && element.type === 'mention') {
      return true
    }
    return isInline(element)
  }

  return editor
}

