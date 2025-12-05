import type { MentionElement } from './types'
import type { RenderElementProps as SlateRenderElementProps, RenderLeafProps as SlateRenderLeafProps } from 'slate-react'

interface RenderElementProps extends SlateRenderElementProps {
  element: SlateRenderElementProps['element'] | MentionElement
}

type RenderLeafProps = SlateRenderLeafProps

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

