import type { MentionElement } from './types'

interface RenderElementProps {
  attributes: any
  children: any
  element: any
}

interface RenderLeafProps {
  attributes: any
  children: any
}

export function MentionElement({ attributes, children, element }: RenderElementProps) {
  const mentionElement = element as MentionElement
  const isEquipment = mentionElement.mentionType === 'equipment'

  return (
    <span
      {...attributes}
      contentEditable={false}
      className={`inline px-1 rounded ${
        isEquipment ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
      }`}
      style={{ userSelect: 'none' }}
      role="textbox"
      aria-label={`${isEquipment ? '장비' : '재료'} 멘션: ${mentionElement.name}`}
    >
      {children}
    </span>
  )
}

export function DefaultElement({ attributes, children }: RenderElementProps) {
  return <p {...attributes}>{children}</p>
}

export function Leaf({ attributes, children }: RenderLeafProps) {
  return <span {...attributes}>{children}</span>
}

