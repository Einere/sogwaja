import { Text, Range, Element } from "slate";
import type { Database } from "@/types/database";

export type Equipment = Database["public"]["Tables"]["recipe_equipment"]["Row"];
export type Ingredient = Database["public"]["Tables"]["recipe_ingredients"]["Row"];

export type MentionType = "equipment" | "ingredient";

export interface MentionElement extends Element {
  type: "mention";
  mentionType: MentionType;
  name: string;
  children: Text[];
}

export interface MentionItem {
  id: string;
  name: string;
  displayName: string;
  type: MentionType;
}

export interface DropdownPosition {
  top: number;
  left: number;
}

export interface MentionDetectionResult {
  range: Range;
  searchText: string;
}
