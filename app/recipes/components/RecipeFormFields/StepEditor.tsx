'use client'

import { useCallback, useMemo, useState, useRef, useEffect } from 'react'
import { createEditor, Descendant, Range, Element } from 'slate'
import {
  Editable,
  Slate,
  withReact,
  ReactEditor,
  RenderElementProps,
  RenderLeafProps,
} from 'slate-react'
import { withHistory } from 'slate-history'
import type { Equipment, Ingredient } from './StepEditor/types'
import { detectMention } from './StepEditor/mentionDetection'
import { createMentionItems, filterMentionItems } from './StepEditor/mentionFilter'
import { insertMention } from './StepEditor/mentionInsertion'
import {
  normalizeMentionSelection,
  handleMentionNavigation,
  handleMentionDeletion,
} from './StepEditor/mentionNavigation'
import { calculateDropdownPosition } from './StepEditor/mentionDropdownPosition'
import type { MentionItem } from './StepEditor/types'
import { withMentions } from './StepEditor/editorPlugins'
import {
  MentionElement,
  DefaultElement,
  Leaf,
} from './StepEditor/renderers'
import MentionDropdown from './StepEditor/MentionDropdown'

interface StepEditorProps {
  value: { children: Descendant[] } | null | undefined
  onChange: (value: { children: Descendant[] }) => void
  equipment: Equipment[]
  ingredients: Ingredient[]
  readOnly?: boolean
}

const initialValue: Descendant[] = [
  {
    type: 'paragraph',
    children: [{ text: '' }],
  } as Element,
]

export default function StepEditor({
  value,
  onChange,
  equipment,
  ingredients,
  readOnly = false,
}: StepEditorProps) {
  const [target, setTarget] = useState<Range | null>(null)
  const [search, setSearch] = useState('')
  const [index, setIndex] = useState(0)
  const [dropdownPosition, setDropdownPosition] = useState<{
    top: number
    left: number
  } | null>(null)
  const editorRef = useRef<HTMLDivElement | null>(null)
  const isComposingRef = useRef(false)
  const pendingMentionRef = useRef<{
    item: { id: string; name: string; displayName: string; type: 'equipment' | 'ingredient' }
    range: Range
  } | null>(null)

  const editor = useMemo(
    () => withMentions(withHistory(withReact(createEditor()))) as ReactEditor,
    []
  )

  // 모든 항목 목록 생성
  const allItems = useMemo(
    () => createMentionItems(equipment, ingredients),
    [equipment, ingredients]
  )

  // 검색 필터링
  const filteredItems = useMemo(
    () => filterMentionItems(allItems, search, 10),
    [search, allItems]
  )

  // 드롭다운 위치 계산
  useEffect(() => {
    if (target && editorRef.current) {
      const position = calculateDropdownPosition(editor, target, editorRef.current)
      setDropdownPosition(position)
    } else {
      setDropdownPosition(null)
    }
  }, [target, editor])

  const renderElement = useCallback(
    (props: RenderElementProps) => {
      if ('type' in props.element && props.element.type === 'mention') {
        return <MentionElement {...props} />
      }
      return <DefaultElement {...props} />
    },
    []
  )

  const renderLeaf = useCallback(
    (props: RenderLeafProps) => {
      return <Leaf {...props} />
    },
    []
  )

  const handleChange = (newValue: Descendant[]) => {
    onChange({ children: newValue })

    if (readOnly) return

    const { selection } = editor
    if (!selection) {
      setTarget(null)
      return
    }

    // @ 입력 감지 및 드롭다운 표시
    const mentionDetection = detectMention(editor)
    if (mentionDetection) {
      setTarget(mentionDetection.range)
      setSearch(mentionDetection.searchText)
      setIndex(0)
      return
    }

    // @ 입력이 감지되지 않았을 때만 멘션 내부 선택 정규화
    if (target === null) {
      normalizeMentionSelection(editor)
    }

    setTarget(null)
  }

  const handleSelect = useCallback(() => {
    if (readOnly) return
    // 선택이 변경될 때마다 멘션 내부 선택 정규화
    normalizeMentionSelection(editor)
  }, [editor, readOnly])

  const handleInsertMention = useCallback(
    (item: { id: string; name: string; displayName: string; type: 'equipment' | 'ingredient' }, replaceRange?: Range) => {
      insertMention(editor, item, replaceRange || target || undefined)
      setTarget(null)
    },
    [editor, target]
  )

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (readOnly) return

      const { selection } = editor
      if (!selection) return

      // 조합 중일 때는 Tab/Enter를 처리하지 않음 (조합 완료 후 처리)
      if (isComposingRef.current && (event.key === 'Tab' || event.key === 'Enter')) {
        // 조합이 완료될 때까지 대기하기 위해 pendingMentionRef에 저장
        if (target && filteredItems.length > 0) {
          pendingMentionRef.current = {
            item: filteredItems[index],
            range: target,
          }
        }
        return
      }

      // 방향키로 멘션 네비게이션 처리
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        if (handleMentionNavigation(editor, event.key)) {
          event.preventDefault()
          return
        }
      }

      // 백스페이스로 멘션 삭제 처리
      if (event.key === 'Backspace') {
        if (handleMentionDeletion(editor)) {
          event.preventDefault()
          return
        }
      }

      // 자동완성 드롭다운 키보드 네비게이션
      if (target && filteredItems.length > 0) {
        switch (event.key) {
          case 'ArrowDown':
            event.preventDefault()
            setIndex((prev) =>
              prev >= filteredItems.length - 1 ? 0 : prev + 1
            )
            break
          case 'ArrowUp':
            event.preventDefault()
            setIndex((prev) =>
              prev <= 0 ? filteredItems.length - 1 : prev - 1
            )
            break
          case 'Tab':
          case 'Enter':
            event.preventDefault()
            // 조합이 완료된 후에만 멘션 삽입
            if (!isComposingRef.current) {
              handleInsertMention(filteredItems[index], target)
            }
            break
          case 'Escape':
            event.preventDefault()
            setTarget(null)
            pendingMentionRef.current = null
            break
        }
      }
    },
    [target, index, filteredItems, handleInsertMention, editor, readOnly]
  )

  // 조합 완료 후 pending 멘션 처리
  const handleCompositionEnd = useCallback(() => {
    isComposingRef.current = false
    
    // 조합 완료 후 pending 멘션이 있으면 삽입
    if (pendingMentionRef.current) {
      // 약간의 지연을 두어 조합이 완전히 완료된 후 처리
      setTimeout(() => {
        if (pendingMentionRef.current) {
          handleInsertMention(
            pendingMentionRef.current.item,
            pendingMentionRef.current.range
          )
          pendingMentionRef.current = null
        }
      }, 0)
    }
  }, [handleInsertMention])

  const editorValue = useMemo(() => {
    if (value && Array.isArray(value.children)) {
      return value.children
    }
    return initialValue
  }, [value])

  return (
    <div
      ref={editorRef}
      className="border border-gray-300 rounded-lg p-4 min-h-[200px] relative"
      role="textbox"
      aria-label="조리법 흐름 입력"
      aria-multiline="true"
    >
      <Slate editor={editor} initialValue={editorValue} onChange={handleChange}>
        <Editable
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          placeholder={
            readOnly ? '' : '조리법 흐름을 입력하세요... @로 멘션할 수 있습니다'
          }
          readOnly={readOnly}
          className="outline-none min-h-[150px]"
          onKeyDown={handleKeyDown}
          onSelect={handleSelect}
          onCompositionStart={() => {
            isComposingRef.current = true
          }}
          onCompositionEnd={handleCompositionEnd}
          aria-label="조리법 흐름 에디터"
        />
        {target && filteredItems.length > 0 && dropdownPosition && (
          <MentionDropdown
            items={filteredItems}
            selectedIndex={index}
            position={dropdownPosition}
            onSelect={(item: MentionItem) => handleInsertMention(item, target)}
          />
        )}
      </Slate>
    </div>
  )
}

