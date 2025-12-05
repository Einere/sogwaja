import { Editor, Range } from 'slate'
import { ReactEditor } from 'slate-react'
import type { DropdownPosition } from './types'

/**
 * Slate Range를 DOM 좌표로 변환하여 드롭다운 위치를 계산합니다.
 * @param editor Slate 에디터 인스턴스
 * @param range 드롭다운을 표시할 범위
 * @param editorElement 에디터 DOM 요소
 * @returns 드롭다운 위치 또는 null
 */
export function calculateDropdownPosition(
  editor: Editor & ReactEditor,
  range: Range,
  editorElement: HTMLElement | null
): DropdownPosition | null {
  if (!editorElement) {
    return null
  }

  try {
    const domRange = ReactEditor.toDOMRange(editor, range)
    const rect = domRange.getBoundingClientRect()
    const editorRect = editorElement.getBoundingClientRect()

    return {
      top: rect.bottom - editorRect.top + 4,
      left: rect.left - editorRect.left,
    }
  } catch (error) {
    // DOM 변환 실패 시 기본 위치 사용
    return { top: 200, left: 0 }
  }
}

