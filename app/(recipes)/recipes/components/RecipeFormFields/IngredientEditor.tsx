"use client";

import { useState, useMemo } from "react";
import type { Database } from "@/types/database";
import { DEFAULT_UNITS, getUnitOptions } from "@/lib/constants/recipe";
import EditorItem from "./EditorItem";
import EditorForm from "./EditorForm";

type Ingredient = Database["public"]["Tables"]["recipe_ingredients"]["Row"];

interface IngredientEditorProps {
  ingredients: Ingredient[];
  onUpdate: (ingredients: Ingredient[]) => void;
  outputQuantity?: number;
  outputUnit?: string;
  readOnly?: boolean;
}

export default function IngredientEditor({
  ingredients,
  onUpdate,
  readOnly = false,
}: IngredientEditorProps) {
  const [newName, setNewName] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newUnit, setNewUnit] = useState<string>(DEFAULT_UNITS.INGREDIENT);

  const unitOptions = useMemo(() => getUnitOptions(), []);

  const handleAdd = () => {
    if (!newName.trim() || !newAmount) return;

    const newIngredient: Ingredient = {
      id: `temp-${Date.now()}`,
      recipe_id: "",
      name: newName.trim(),
      amount: parseFloat(newAmount),
      unit: newUnit,
      created_at: new Date().toISOString(),
    };

    onUpdate([...ingredients, newIngredient]);
    setNewName("");
    setNewAmount("");
    setNewUnit(DEFAULT_UNITS.INGREDIENT);
  };

  const handleRemove = (id: string) => {
    onUpdate(ingredients.filter(ing => ing.id !== id));
  };

  const handleUpdate = (id: string, field: "name" | "amount" | "unit", value: string | number) => {
    onUpdate(ingredients.map(ing => (ing.id === id ? { ...ing, [field]: value } : ing)));
  };

  return (
    <section className="space-y-3" aria-labelledby="ingredients-heading">
      <h3 id="ingredients-heading" className="text-lg font-semibold">
        재료
      </h3>
      <div className="space-y-2" role="list" aria-label="재료 목록">
        {ingredients.map(ing => (
          <EditorItem
            key={ing.id}
            id={ing.id}
            name={ing.name}
            value={ing.amount}
            unit={ing.unit}
            onNameChange={value => handleUpdate(ing.id, "name", value)}
            onValueChange={value => handleUpdate(ing.id, "amount", value)}
            onUnitChange={value => handleUpdate(ing.id, "unit", value)}
            onRemove={!readOnly ? () => handleRemove(ing.id) : undefined}
            readOnly={readOnly}
            namePlaceholder="재료 이름"
            valuePlaceholder="양"
            unitPlaceholder="단위"
            ariaLabel={`재료: ${ing.name}, ${ing.amount} ${ing.unit}`}
          />
        ))}
      </div>
      {!readOnly && (
        <EditorForm
          name={newName}
          value={newAmount}
          unit={newUnit}
          onNameChange={setNewName}
          onValueChange={setNewAmount}
          onUnitChange={setNewUnit}
          onSubmit={handleAdd}
          namePlaceholder="재료 이름"
          valuePlaceholder="양"
          unitOptions={unitOptions}
          submitLabel="추가"
          ariaLabel="새 재료 추가"
        />
      )}
    </section>
  );
}
