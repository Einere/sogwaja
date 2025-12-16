"use client";

import { useState } from "react";
import type { Database } from "@/types/database";
import EditorItem from "./EditorItem";
import EditorForm from "./EditorForm";

type Output = Database["public"]["Tables"]["recipe_outputs"]["Row"];

interface OutputEditorProps {
  outputs: Output[];
  onUpdate: (outputs: Output[]) => void;
  onQuantityChange?: (
    quantity: number,
    unit: string,
    originalQuantity?: number,
    originalUnit?: string
  ) => void;
  readOnly?: boolean;
}

const UNIT_OPTIONS = [
  { value: "개", label: "개" },
  { value: "g", label: "g" },
  { value: "ml", label: "ml" },
];

export default function OutputEditor({
  outputs,
  onUpdate,
  onQuantityChange,
  readOnly = false,
}: OutputEditorProps) {
  const [newName, setNewName] = useState("");
  const [newQuantity, setNewQuantity] = useState("");
  const [newUnit, setNewUnit] = useState("개");

  const handleAdd = () => {
    if (!newName.trim() || !newQuantity) return;

    const newOutput: Output = {
      id: `temp-${Date.now()}`,
      recipe_id: "",
      name: newName.trim(),
      quantity: parseFloat(newQuantity),
      unit: newUnit,
      created_at: new Date().toISOString(),
    };

    onUpdate([...outputs, newOutput]);
    setNewName("");
    setNewQuantity("");
    setNewUnit("개");
  };

  const handleRemove = (id: string) => {
    onUpdate(outputs.filter(out => out.id !== id));
  };

  const handleUpdate = (
    id: string,
    field: "name" | "quantity" | "unit",
    value: string | number
  ) => {
    // Store original output before update for quantity change calculation
    const originalOutput = outputs.find(out => out.id === id);

    const updated = outputs.map(out => (out.id === id ? { ...out, [field]: value } : out));
    onUpdate(updated);

    if (field === "quantity" || field === "unit") {
      const output = updated.find(out => out.id === id);
      if (output && onQuantityChange && originalOutput) {
        // Pass both original and new values for calculation
        onQuantityChange(
          output.quantity,
          output.unit,
          originalOutput.quantity,
          originalOutput.unit
        );
      }
    }
  };

  return (
    <section className="space-y-3" aria-labelledby="outputs-heading">
      <h3 id="outputs-heading" className="text-lg font-semibold">
        결과물
      </h3>
      <div className="space-y-2" role="list" aria-label="결과물 목록">
        {outputs.map(out => (
          <EditorItem
            key={out.id}
            id={out.id}
            name={out.name}
            value={out.quantity}
            unit={out.unit}
            onNameChange={value => handleUpdate(out.id, "name", value)}
            onValueChange={value => handleUpdate(out.id, "quantity", value)}
            onUnitChange={value => handleUpdate(out.id, "unit", value)}
            onRemove={!readOnly ? () => handleRemove(out.id) : undefined}
            readOnly={readOnly}
            namePlaceholder="결과물 이름"
            valuePlaceholder="양"
            unitType="select"
            unitOptions={UNIT_OPTIONS}
            ariaLabel={`결과물: ${out.name}, ${out.quantity} ${out.unit}`}
          />
        ))}
      </div>
      {!readOnly && (
        <EditorForm
          name={newName}
          value={newQuantity}
          unit={newUnit}
          onNameChange={setNewName}
          onValueChange={setNewQuantity}
          onUnitChange={setNewUnit}
          onSubmit={handleAdd}
          namePlaceholder="결과물 이름"
          valuePlaceholder="양"
          unitOptions={UNIT_OPTIONS}
          submitLabel="추가"
          ariaLabel="새 결과물 추가"
        />
      )}
    </section>
  );
}
