"use client";

import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

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
  unitPlaceholder?: string;
  unitType?: "input" | "select";
  unitOptions?: { value: string; label: string }[];
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
  unitPlaceholder = "단위",
  unitType = "input",
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
        value={value}
        onChange={e => onValueChange(e.target.value)}
        onKeyPress={handleKeyPress}
        className="w-24 text-sm"
        placeholder={valuePlaceholder}
        aria-label={`${valuePlaceholder} 입력`}
      />
      {unitType === "select" && unitOptions ? (
        <select
          value={unit}
          onChange={e => onUnitChange(e.target.value)}
          className="w-20 px-3 py-1.5 border border-input bg-background rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          aria-label="단위 선택"
        >
          {unitOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <Input
          type="text"
          value={unit}
          onChange={e => onUnitChange(e.target.value)}
          onKeyPress={handleKeyPress}
          className="w-16 text-sm"
          placeholder={unitPlaceholder}
          aria-label={`${unitPlaceholder} 입력`}
        />
      )}
      <Button onClick={onSubmit} size="sm" className="text-sm" aria-label={submitLabel}>
        {submitLabel}
      </Button>
    </div>
  );
}
