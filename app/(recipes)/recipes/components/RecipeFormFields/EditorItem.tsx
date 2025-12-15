"use client";

import { Input, Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui";

interface EditorItemProps {
  id: string;
  name: string;
  value: string | number;
  unit: string;
  onNameChange: (value: string) => void;
  onValueChange: (value: number) => void;
  onUnitChange: (value: string) => void;
  onRemove?: () => void;
  readOnly?: boolean;
  namePlaceholder?: string;
  valuePlaceholder?: string;
  unitPlaceholder?: string;
  unitType?: "input" | "select";
  unitOptions?: { value: string; label: string }[];
  ariaLabel?: string;
}

export default function EditorItem({
  id,
  name,
  value,
  unit,
  onNameChange,
  onValueChange,
  onUnitChange,
  onRemove,
  readOnly = false,
  namePlaceholder = "이름",
  valuePlaceholder = "값",
  unitPlaceholder = "단위",
  unitType = "input",
  unitOptions,
  ariaLabel,
}: EditorItemProps) {
  const itemId = `editor-item-${id}`;

  return (
    <div
      className="flex items-center gap-2 p-2 bg-muted rounded-lg"
      role="listitem"
      aria-label={ariaLabel || `${name}, ${value} ${unit}`}
    >
      <Input
        type="text"
        id={`${itemId}-name`}
        value={name}
        onChange={e => onNameChange(e.target.value)}
        disabled={readOnly}
        className="flex-1 text-sm"
        placeholder={namePlaceholder}
        aria-label={`${namePlaceholder} 입력`}
      />
      <Input
        type="number"
        id={`${itemId}-value`}
        value={value}
        onChange={e => onValueChange(parseFloat(e.target.value) || 0)}
        disabled={readOnly}
        className="w-24 text-sm"
        placeholder={valuePlaceholder}
        aria-label={`${valuePlaceholder} 입력`}
      />
      {unitType === "select" && unitOptions ? (
        <Select value={unit} onValueChange={onUnitChange} disabled={readOnly}>
          <SelectTrigger id={`${itemId}-unit`} className="w-20 text-sm" aria-label="단위 선택">
            <SelectValue placeholder="단위" />
          </SelectTrigger>
          <SelectContent>
          {unitOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
              {option.label}
              </SelectItem>
          ))}
          </SelectContent>
        </Select>
      ) : (
        <Input
          type="text"
          id={`${itemId}-unit`}
          value={unit}
          onChange={e => onUnitChange(e.target.value)}
          disabled={readOnly}
          className="w-16 text-sm"
          placeholder={unitPlaceholder}
          aria-label={`${unitPlaceholder} 입력`}
        />
      )}
      {!readOnly && onRemove && (
        <Button
          onClick={onRemove}
          variant="ghost"
          size="sm"
          className="text-error hover:text-error hover:bg-error/10 p-2 h-auto"
          aria-label="삭제"
        >
          삭제
        </Button>
      )}
    </div>
  );
}
