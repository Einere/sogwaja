import type { MentionElement } from "./types";
import type {
  RenderElementProps as SlateRenderElementProps,
  RenderLeafProps as SlateRenderLeafProps,
} from "slate-react";
import Badge from "@/components/ui/Badge";

interface RenderElementProps extends SlateRenderElementProps {
  element: SlateRenderElementProps["element"] | MentionElement;
}

type RenderLeafProps = SlateRenderLeafProps;

export function MentionElement({ attributes, children, element }: RenderElementProps) {
  const mentionElement = element as MentionElement;
  const isEquipment = mentionElement.mentionType === "equipment";

  return (
    <Badge
      {...attributes}
      variant={isEquipment ? "equipment" : "ingredient"}
      size="sm"
      className="text-base md:text-sm"
      contentEditable={false}
      style={{ userSelect: "none" }}
      role="textbox"
      aria-label={`${isEquipment ? "장비" : "재료"} 멘션: ${mentionElement.name}`}
    >
      {children}
    </Badge>
  );
}

export function DefaultElement({ attributes, children }: RenderElementProps) {
  return <p {...attributes}>{children}</p>;
}

export function Leaf({ attributes, children }: RenderLeafProps) {
  return <span {...attributes}>{children}</span>;
}
