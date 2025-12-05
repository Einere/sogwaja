import { Editor, Range, Point, Element } from 'slate'
import type { MentionDetectionResult } from './types'

/**
 * 커서 위치에서 역방향으로 @ 문자를 찾고 멘션 범위를 계산합니다.
 * @param editor Slate 에디터 인스턴스
 * @returns 멘션 범위와 검색 텍스트, 또는 null
 */
export function detectMention(editor: Editor): MentionDetectionResult | null {

  const { selection } = editor
  if (!selection || !Range.isCollapsed(selection)) {
    return null
  }

  const [start] = Range.edges(selection)

  // 현재 블록 찾기
  const block = Editor.above(editor, {
    match: (n) => Element.isElement(n) && Editor.isBlock(editor, n),
  })

  if (!block) {
    return null
  }

  const [, blockPath] = block
  const startOfBlock = Editor.start(editor, blockPath)

  // 역방향으로 @ 찾기: 최대 50자까지 역방향으로 검색
  let searchPoint = start
  let searchText = ''
  let foundAt: typeof start | null = null

  for (let i = 0; i < 50; i++) {
    const before = Editor.before(editor, searchPoint)
    if (!before || Point.compare(before, startOfBlock) < 0) {
      break
    }

    const charRange = Editor.range(editor, before, searchPoint)
    const char = Editor.string(editor, charRange)

    if (char === '@') {
      foundAt = before
      break
    }

    // 공백을 만나면 중단
    if (/\s/.test(char)) {
      break
    }

    searchText = char + searchText
    searchPoint = before
  }
  if (!foundAt) {
    return null
  }

  // @ 바로 앞에 공백, 개행 문자, 또는 시작이 있는지 확인
  const beforeAt = Editor.before(editor, foundAt)
  const isStart = !beforeAt || Point.equals(beforeAt, startOfBlock)
  const beforeChar = beforeAt
    ? Editor.string(editor, Editor.range(editor, beforeAt, foundAt))
    : ''

  // 블록 시작이거나, 빈 문자열(개행 직후), 공백/개행 문자가 있으면 허용
  if (!isStart && beforeChar !== '' && !/[\s\n\r]/.test(beforeChar)) {
    return null
  }

  // @ 뒤의 텍스트가 유효한 멘션 패턴인지 확인
  const mentionMatch = searchText.match(/^([\w_가-힣]*)$/)
  if (!mentionMatch) {
    return null
  }

  const range = Editor.range(editor, foundAt, start)

  return {
    range,
    searchText: mentionMatch[1] || '',
  }
}

