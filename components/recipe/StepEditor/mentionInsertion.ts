import { Transforms, Range, Editor } from 'slate'
import { ReactEditor } from 'slate-react'
import type { MentionElement, MentionItem } from './types'

/**
 * 멘션 요소를 생성합니다.
 */
function createMentionElement(item: MentionItem): MentionElement {
  return {
    type: 'mention',
    mentionType: item.type,
    name: item.displayName,
    children: [{ text: `@${item.name}` }],
  }
}

/**
 * 멘션을 에디터에 삽입합니다.
 * @param editor Slate 에디터 인스턴스
 * @param item 삽입할 멘션 아이템
 * @param replaceRange 교체할 범위 (없으면 현재 선택 범위 사용)
 */
export function insertMention(
  editor: Editor & ReactEditor,
  item: MentionItem,
  replaceRange?: Range
): void {
  const mention = createMentionElement(item)

  if (replaceRange) {
    const { selection } = editor
    
    // 조합 중인 문자를 포함하기 위해 DOM을 직접 확인
    try {
      // 현재 DOM 선택 범위를 확인하여 조합 중인 문자 포함
      const domSelection = window.getSelection()
      
      if (domSelection && domSelection.rangeCount > 0 && selection && Range.isCollapsed(selection)) {
        // DOM의 실제 선택 범위 (조합 중인 문자 포함)
        const domRange = domSelection.getRangeAt(0)
        
        // replaceRange의 시작점을 DOM으로 변환
        const [domStartNode, domStartOffset] = ReactEditor.toDOMPoint(editor, replaceRange.anchor)
        
        // DOM Range를 생성하여 조합 중인 문자까지 포함
        const actualDomRange = document.createRange()
        actualDomRange.setStart(domStartNode, domStartOffset)
        actualDomRange.setEnd(domRange.endContainer, domRange.endOffset)
        
        // DOM Range를 Slate Range로 변환
        const actualRange = ReactEditor.toSlateRange(editor, actualDomRange, {
          exactMatch: false,
          suppressThrow: true,
        })
        
        if (actualRange) {
          // 조합 중인 문자를 포함한 범위를 삭제
          Transforms.select(editor, actualRange)
          Transforms.delete(editor)
          Transforms.insertNodes(editor, mention)
          Transforms.insertText(editor, ' ')
          Transforms.move(editor, { distance: 1, unit: 'offset' })
          ReactEditor.focus(editor)
          return
        }
      }
    } catch {
      // DOM 변환 실패 시 기존 로직 사용
    }
    
    // 기존 로직 (fallback)
    const extendedRange =
      selection && Range.isCollapsed(selection)
        ? Editor.range(editor, replaceRange.anchor, selection.anchor)
        : replaceRange

    Transforms.select(editor, extendedRange)
    Transforms.delete(editor)
    Transforms.insertNodes(editor, mention)
    Transforms.insertText(editor, ' ')
    Transforms.move(editor, { distance: 1, unit: 'offset' })
  } else {
    // 직접 삽입
    Transforms.insertNodes(editor, mention)
    Transforms.insertText(editor, ' ')
    Transforms.move(editor, { distance: 1, unit: 'offset' })
  }

  // 포커스 유지
  ReactEditor.focus(editor)
}

