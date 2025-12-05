import { Editor, Transforms, Range, Point, Element } from 'slate'

/**
 * 멘션 내부 선택을 감지하고 커서를 멘션 앞으로 이동합니다.
 * @param editor Slate 에디터 인스턴스
 * @returns 멘션 내부 선택이 감지되어 이동했는지 여부
 */
export function normalizeMentionSelection(editor: Editor): boolean {
  const { selection } = editor
  if (!selection) return false

  const [start, end] = Range.edges(selection)

  // 현재 블록 찾기
  const block = Editor.above(editor, {
    match: (n) => Element.isElement(n) && Editor.isBlock(editor, n),
  })

  if (!block) return false

  const [, blockPath] = block
  const blockNode = Editor.node(editor, blockPath)[0]

  if (
    !blockNode ||
    typeof blockNode !== 'object' ||
    !('children' in blockNode)
  ) {
    return false
  }

  // 블록의 모든 노드를 순회하며 멘션 찾기
  for (let i = 0; i < blockNode.children.length; i++) {
    const child = blockNode.children[i]
    const childPath = [...blockPath, i]

    if (typeof child === 'object' && 'type' in child && child.type === 'mention') {
      const mentionStart = Editor.start(editor, childPath)
      const mentionEnd = Editor.end(editor, childPath)

      // 선택 범위가 멘션과 겹치는지 확인
      const startCompare = Point.compare(start, mentionStart)
      const endCompare = Point.compare(end, mentionEnd)
      const startEndCompare = Point.compare(start, mentionEnd)
      const endStartCompare = Point.compare(end, mentionStart)

      // 커서가 멘션 내부에 있는지 확인
      const isStartInMention = startCompare >= 0 && startEndCompare < 0
      const isEndInMention = endStartCompare > 0 && endCompare <= 0
      // 선택 범위가 멘션을 포함하는지 확인
      const isMentionInSelection = startCompare < 0 && endCompare > 0

      if (isStartInMention || isEndInMention || isMentionInSelection) {
        // 멘션 앞으로 이동
        Transforms.setSelection(editor, {
          anchor: mentionStart,
          focus: mentionStart,
        })
        return true
      }
    }
  }

  return false
}

/**
 * 방향키로 멘션을 건너뛰는 로직을 처리합니다.
 * @param editor Slate 에디터 인스턴스
 * @param direction 방향 ('ArrowLeft' | 'ArrowRight')
 * @returns 처리되었는지 여부
 */
export function handleMentionNavigation(
  editor: Editor,
  direction: 'ArrowLeft' | 'ArrowRight'
): boolean {
  const { selection } = editor
  if (!selection || !Range.isCollapsed(selection)) {
    return false
  }

  const [start] = Range.edges(selection)

  // 현재 블록 찾기
  const block = Editor.above(editor, {
    match: (n) => Element.isElement(n) && Editor.isBlock(editor, n),
  })

  if (!block) return false

  const [, blockPath] = block
  const blockNode = Editor.node(editor, blockPath)[0]

  if (
    !blockNode ||
    typeof blockNode !== 'object' ||
    !('children' in blockNode)
  ) {
    return false
  }

  // 블록의 모든 노드를 순회하며 멘션 찾기
  for (let i = 0; i < blockNode.children.length; i++) {
    const child = blockNode.children[i]
    const childPath = [...blockPath, i]

    if (typeof child === 'object' && 'type' in child && child.type === 'mention') {
      const mentionStart = Editor.start(editor, childPath)
      const mentionEnd = Editor.end(editor, childPath)

      if (direction === 'ArrowRight') {
        // 오른쪽 방향키: 커서가 멘션 바로 앞에 있으면 멘션 끝으로
        if (Point.equals(start, mentionStart)) {
          Transforms.setSelection(editor, {
            anchor: mentionEnd,
            focus: mentionEnd,
          })
          return true
        }
      } else if (direction === 'ArrowLeft') {
        // 왼쪽 방향키: 커서가 멘션 바로 뒤에 있으면 멘션 앞으로
        if (Point.equals(start, mentionEnd)) {
          Transforms.setSelection(editor, {
            anchor: mentionStart,
            focus: mentionStart,
          })
          return true
        }
      }
    }
  }

  return false
}

/**
 * 백스페이스로 멘션을 삭제하는 로직을 처리합니다.
 * @param editor Slate 에디터 인스턴스
 * @returns 처리되었는지 여부
 */
export function handleMentionDeletion(editor: Editor): boolean {
  const { selection } = editor
  if (!selection || !Range.isCollapsed(selection)) {
    return false
  }

  const [start] = Range.edges(selection)
  const before = Editor.before(editor, start)

  if (!before) return false

  const [node, path] = Editor.node(editor, before)

  // 이전 노드가 멘션 요소인지 확인
  if (node && typeof node === 'object' && 'type' in node && node.type === 'mention') {
    // 멘션 요소 전체를 삭제
    Transforms.removeNodes(editor, { at: path })
    return true
  }

  // 멘션 요소 내부에 있는지 확인 (커서가 멘션 안에 있을 때)
  const [parent] = Editor.parent(editor, path)
  if (
    parent &&
    typeof parent === 'object' &&
    'type' in parent &&
    parent.type === 'mention'
  ) {
    // 부모 멘션 요소 전체를 삭제
    const parentPath = Editor.path(editor, path.slice(0, -1))
    Transforms.removeNodes(editor, { at: parentPath })
    return true
  }

  return false
}

