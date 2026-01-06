"use client";

import { useMemo } from "react";
import {
  Input,
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import { getUnitOptions } from "@/lib/constants/recipe";

interface IngredientFormProps {
  name: string;
  value: string;
  unit: string;
  onNameChange: (value: string) => void;
  onValueChange: (value: string) => void;
  onUnitChange: (value: string) => void;
  onSubmit: () => void;
}

export default function IngredientForm({
  name,
  value,
  unit,
  onNameChange,
  onValueChange,
  onUnitChange,
  onSubmit,
}: IngredientFormProps) {
  const unitOptions = useMemo(() => getUnitOptions(), []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      onSubmit();
    }
  };

  return (
    <div className="flex gap-2" role="group" aria-label="새 재료 추가">
      <Input
        type="text"
        value={name}
        onChange={e => onNameChange(e.target.value)}
        onKeyDown={handleKeyDown}
        className="flex-1 text-sm"
        placeholder="재료 이름"
        aria-label="재료 이름 입력"
      />
      <Input
        type="number"
        inputMode="numeric"
        value={value}
        onChange={e => onValueChange(e.target.value)}
        onKeyDown={handleKeyDown}
        className="w-24 text-sm"
        placeholder="양"
        aria-label="양 입력"
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
      <Button onClick={onSubmit} size="sm" className="text-sm" aria-label="추가">
        추가
      </Button>
    </div>
  );
}
