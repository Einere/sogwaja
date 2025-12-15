"use client";

import {
  Input,
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";

interface EditorFormProps {
  name: string;
  value: string;
  unit: string;
  onNameChange: (value: string) => void;
  onValueChange: (value: string) => void;
  onUnitChange: (value: string) => void;
  onSubmit: () => void;
  namePlaceholder?: string;
  valuePlaceholder?: string;
  unitOptions: { value: string; label: string }[];
  submitLabel?: string;
  ariaLabel?: string;
}

export default function EditorForm({
  name,
  value,
  unit,
  onNameChange,
  onValueChange,
  onUnitChange,
  onSubmit,
  namePlaceholder = "이름",
  valuePlaceholder = "값",
  unitOptions,
  submitLabel = "추가",
  ariaLabel,
}: EditorFormProps) {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      onSubmit();
    }
  };

  return (
    <div className="flex gap-2" role="group" aria-label={ariaLabel || "새 항목 추가"}>
      <Input
        type="text"
        value={name}
        onChange={e => onNameChange(e.target.value)}
        onKeyPress={handleKeyPress}
        className="flex-1 text-sm"
        placeholder={namePlaceholder}
        aria-label={`${namePlaceholder} 입력`}
      />
      <Input
        type="number"
        inputMode="numeric"
        value={value}
        onChange={e => onValueChange(e.target.value)}
        onKeyPress={handleKeyPress}
        className="w-24 text-sm"
        placeholder={valuePlaceholder}
        aria-label={`${valuePlaceholder} 입력`}
      />
      <Select value={unit} onValueChange={onUnitChange}>
        <SelectTrigger className="w-20 text-sm" aria-label="단위 선택">
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
      <Button onClick={onSubmit} size="sm" className="text-sm" aria-label={submitLabel}>
        {submitLabel}
      </Button>
    </div>
  );
}
