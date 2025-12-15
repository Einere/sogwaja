"use client";

import type { MentionItem, DropdownPosition } from "./types";
import { Badge } from "@/components/ui";

interface MentionDropdownProps {
  items: MentionItem[];
  selectedIndex: number;
  position: DropdownPosition;
  onSelect: (item: MentionItem) => void;
}

export default function MentionDropdown({
  items,
  selectedIndex,
  position,
  onSelect,
}: MentionDropdownProps) {
  return (
    <div
      className="bg-background border-border absolute z-50 max-h-60 overflow-auto rounded-lg border shadow-lg"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        minWidth: "200px",
      }}
      role="listbox"
      aria-label="멘션 목록"
      aria-expanded="true"
    >
      {items.map((item, i) => (
        <div
          key={item.id}
          tabIndex={0}
          className={`focus:ring-ring cursor-pointer px-3 py-2 transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none ${
            i === selectedIndex
              ? item.type === "equipment"
                ? "bg-info/20 text-foreground"
                : "bg-warning/20 text-warning-foreground"
              : "hover:bg-accent"
          }`}
          onClick={() => onSelect(item)}
          onKeyDown={e => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onSelect(item);
            }
          }}
          role="option"
          aria-selected={i === selectedIndex}
          aria-label={`${item.type === "equipment" ? "장비" : "재료"}: ${item.displayName}`}
        >
          <Badge
            variant={item.type === "equipment" ? "equipment" : "ingredient"}
            size="sm"
            className="mr-2"
          >
            {item.type === "equipment" ? "장비" : "재료"}
          </Badge>
          {item.displayName.replace(/\s+/g, "_")}
        </div>
      ))}
    </div>
  );
}
