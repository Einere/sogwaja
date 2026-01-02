"use client";

import { useCallback, useMemo, useState, useRef, useEffect } from "react";
import { createEditor, Descendant, Range, Element, Path, Point, Editor } from "slate";
import {
  Editable,
  Slate,
  withReact,
  ReactEditor,
  RenderElementProps,
  RenderLeafProps,
} from "slate-react";
import { withHistory } from "slate-history";
import type { Equipment, Ingredient } from "./StepEditor/types";
import { detectMention } from "./StepEditor/mentionDetection";
import { createMentionItems, filterMentionItems } from "./StepEditor/mentionFilter";
import { insertMention } from "./StepEditor/mentionInsertion";
import type { MentionEditor } from "./StepEditor/mentionActions";
import {
  findMentionAtSelection,
  isCursorAtMention,
  isMentionFullySelected,
} from "./StepEditor/mentionUtils";
import { calculateDropdownPosition } from "./StepEditor/mentionDropdownPosition";
import type { MentionItem } from "./StepEditor/types";
import { withMentions } from "./StepEditor/editorPlugins";
import { MentionElement, DefaultElement, Leaf } from "./StepEditor/renderers";
import MentionDropdown from "./StepEditor/MentionDropdown";

interface StepEditorProps {
  value: { children: Descendant[] } | null | undefined;
  onChange: (value: { children: Descendant[] }) => void;
  equipment: Equipment[];
  ingredients: Ingredient[];
  readOnly?: boolean;
}

const initialValue: Descendant[] = [
  {
    type: "paragraph",
    children: [{ text: "" }],
  } as Element,
];

export default function StepEditor({
  value,
  onChange,
  equipment,
  ingredients,
  readOnly = false,
}: StepEditorProps) {
  const [target, setTarget] = useState<Range | null>(null);
  const [search, setSearch] = useState("");
  const [index, setIndex] = useState(0);
  const [dropdownPosition, setDropdownPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [selectedMentionPath, setSelectedMentionPath] = useState<Path | null>(null);
  const previousSelectedMentionPathRef = useRef<Path | null>(null);
  const editorRef = useRef<HTMLDivElement | null>(null);
  const isComposingRef = useRef(false);
  const pendingMentionRef = useRef<{
    item: { id: string; name: string; displayName: string; type: "equipment" | "ingredient" };
    range: Range;
  } | null>(null);

  const editor = useMemo(
    () => withMentions(withHistory(withReact(createEditor()))) as ReactEditor & MentionEditor,
    []
  );

  // 모든 항목 목록 생성
  const allItems = useMemo(
    () => createMentionItems(equipment, ingredients),
    [equipment, ingredients]
  );

  // 검색 필터링
  const filteredItems = useMemo(() => filterMentionItems(allItems, search, 10), [search, allItems]);

  // 드롭다운 위치 계산
  useEffect(() => {
    if (target && editorRef.current) {
      const position = calculateDropdownPosition(editor, target, editorRef.current);
      setDropdownPosition(position);
    } else {
      setDropdownPosition(null);
    }
  }, [target, editor]);

  const renderElement = useCallback(
    (props: RenderElementProps) => {
      if ("type" in props.element && props.element.type === "mention") {
        // 현재 멘션이 선택된 멘션인지 확인
        const isSelected =
          selectedMentionPath !== null &&
          Path.equals(ReactEditor.findPath(editor, props.element), selectedMentionPath);
        return <MentionElement {...props} selected={isSelected} />;
      }
      return <DefaultElement {...props} />;
    },
    [editor, selectedMentionPath]
  );

  const renderLeaf = useCallback((props: RenderLeafProps) => {
    return <Leaf {...props} />;
  }, []);

  const handleChange = useCallback(
    (newValue: Descendant[]) => {
      onChange({ children: newValue });
      if (readOnly) return;

      const { selection } = editor;
      if (!selection) {
        setTarget(null);
        setSelectedMentionPath(null);
        previousSelectedMentionPathRef.current = null;
        return;
      }

      // 멘션 상태 확인 및 업데이트
      const mention = findMentionAtSelection(editor);
      const wasMentionSelected = selectedMentionPath !== null;

      if (mention) {
        const isFullySelected = isMentionFullySelected(editor, selection, mention.range);

        if (isFullySelected) {
          // 멘션 전체 선택: 드롭다운 숨김, 선택 상태 유지
          setTarget(null);
          setSelectedMentionPath(mention.path);
          previousSelectedMentionPathRef.current = mention.path;
          return;
        }

        if (isCursorAtMention(editor)) {
          // 커서가 멘션 내부: 드롭다운 숨김
          setTarget(null);
          setSelectedMentionPath(null);
          previousSelectedMentionPathRef.current = null;
          return;
        }
      }

      // @ 입력 감지
      const mentionDetection = detectMention(editor);
      if (mentionDetection) {
        setTarget(mentionDetection.range);
        setSearch(mentionDetection.searchText);
        setIndex(0);
        setSelectedMentionPath(null);
        previousSelectedMentionPathRef.current = null;
        return;
      }

      // 멘션 선택 상태 업데이트
      if (mention && !Range.isCollapsed(selection)) {
        const isFullySelected = isMentionFullySelected(editor, selection, mention.range);
        setSelectedMentionPath(isFullySelected ? mention.path : null);
        previousSelectedMentionPathRef.current = isFullySelected ? mention.path : null;
      } else {
        // 선택이 해제되었을 때: 이전에 멘션이 선택되어 있었고, 현재 collapsed 선택이면 커서를 멘션 끝으로 이동
        if (wasMentionSelected && Range.isCollapsed(selection) && selectedMentionPath !== null) {
          const prevPath = selectedMentionPath;
          try {
            const prevMentionNode = Editor.node(editor, prevPath)[0];
            if (
              Element.isElement(prevMentionNode) &&
              "type" in prevMentionNode &&
              prevMentionNode.type === "mention"
            ) {
              const [start] = Range.edges(selection);
              const prevMentionRange = Editor.range(editor, prevPath);
              const [, prevMentionEnd] = Range.edges(prevMentionRange);

              // 커서가 이전 멘션 범위 밖에 있으면 멘션 끝으로 이동
              if (Point.compare(start, prevMentionEnd) > 0) {
                editor.mentionActions.collapseToMentionEnd(prevPath);
                previousSelectedMentionPathRef.current = prevPath;
                setSelectedMentionPath(null);
                return;
              }
            }
          } catch {
            // 경로가 유효하지 않으면 무시
          }
          previousSelectedMentionPathRef.current = prevPath;
        } else if (wasMentionSelected) {
          previousSelectedMentionPathRef.current = selectedMentionPath;
        }
        setSelectedMentionPath(null);
      }

      setTarget(null);
    },
    [editor, onChange, readOnly, selectedMentionPath]
  );

  const handleSelect = useCallback(() => {
    if (readOnly) return;

    const { selection } = editor;
    if (!selection) {
      return;
    }

    const mention = findMentionAtSelection(editor);
    const [start] = Range.edges(selection);

    if (!mention) {
      return;
    }

    const [mentionStart, mentionEnd] = Range.edges(mention.range);

    if (!Range.isCollapsed(selection)) {
      // 범위 선택: 멘션 전체 선택 여부 확인 (onChange에서 처리)
      return;
    }

    // 커서만 있음: 멘션 내부면 자동 선택
    const isInside = Point.compare(start, mentionStart) > 0 && Point.compare(start, mentionEnd) < 0;

    if (isInside) {
      editor.mentionActions.normalizeMentionSelection();
    }
  }, [editor, readOnly]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (readOnly) return;

      const { selection } = editor;
      if (!selection) return;

      // 조합 중일 때는 Tab/Enter를 처리하지 않음 (조합 완료 후 처리)
      if (isComposingRef.current && (event.key === "Tab" || event.key === "Enter")) {
        // 조합이 완료될 때까지 대기하기 위해 pendingMentionRef에 저장
        if (target && filteredItems.length > 0) {
          pendingMentionRef.current = {
            item: filteredItems[index],
            range: target,
          };
        }
        return;
      }

      // 백스페이스로 멘션 삭제 처리
      if (event.key === "Backspace") {
        if (editor.mentionActions.handleMentionDeletion()) {
          event.preventDefault();
          setSelectedMentionPath(null);
          previousSelectedMentionPathRef.current = null;
          return;
        }
      }

      // 자동완성 드롭다운 키보드 네비게이션
      if (target && filteredItems.length > 0) {
        switch (event.key) {
          case "ArrowDown":
            event.preventDefault();
            setIndex(prev => (prev >= filteredItems.length - 1 ? 0 : prev + 1));
            break;
          case "ArrowUp":
            event.preventDefault();
            setIndex(prev => (prev <= 0 ? filteredItems.length - 1 : prev - 1));
            break;
          case "Tab":
          case "Enter":
            event.preventDefault();
            // 조합이 완료된 후에만 멘션 삽입
            if (!isComposingRef.current) {
              insertMention(editor, filteredItems[index], target);
            }
            break;
          case "Escape":
            event.preventDefault();
            setTarget(null);
            pendingMentionRef.current = null;
            break;
        }
      }
    },
    [target, index, filteredItems, editor, readOnly]
  );

  // 조합 완료 후 pending 멘션 처리
  const handleCompositionEnd = useCallback(() => {
    isComposingRef.current = false;

    // 조합 완료 후 pending 멘션이 있으면 삽입
    if (pendingMentionRef.current) {
      // 약간의 지연을 두어 조합이 완전히 완료된 후 처리
      setTimeout(() => {
        if (pendingMentionRef.current) {
          insertMention(editor, pendingMentionRef.current.item, pendingMentionRef.current.range);
          pendingMentionRef.current = null;
        }
      }, 0);
    }
  }, [editor]);

  const editorValue = useMemo(() => {
    if (value && Array.isArray(value.children)) {
      return value.children;
    }
    return initialValue;
  }, [value]);

  return (
    <div
      ref={editorRef}
      className={`border-input relative flex min-h-[200px] flex-1 flex-col rounded-lg border p-4 ${
        readOnly ? "bg-muted cursor-not-allowed" : "bg-background cursor-text"
      }`}
    >
      <Slate editor={editor} initialValue={editorValue} onChange={handleChange}>
        <Editable
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          placeholder={readOnly ? "" : "조리법 흐름을 입력하세요... @로 멘션할 수 있습니다"}
          readOnly={readOnly}
          className={`min-h-[150px] flex-1 outline-none ${
            readOnly ? "cursor-not-allowed opacity-50" : ""
          }`}
          onKeyDown={handleKeyDown}
          onSelect={handleSelect}
          onCompositionStart={() => {
            isComposingRef.current = true;
          }}
          onCompositionEnd={handleCompositionEnd}
          role="textbox"
          aria-label="조리법 흐름 입력"
          aria-multiline="true"
        />
        {target && filteredItems.length > 0 && dropdownPosition && (
          <MentionDropdown
            items={filteredItems}
            selectedIndex={index}
            position={dropdownPosition}
            onSelect={(item: MentionItem) => insertMention(editor, item, target)}
          />
        )}
      </Slate>
    </div>
  );
}
