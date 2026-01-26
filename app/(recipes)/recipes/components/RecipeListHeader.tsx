import type { SortOption } from "../actions";
import { Button, LinkButton } from "@/components/ui";
import { PlusIcon, SettingsIcon } from "@/components/icons";
import Link from "next/link";

interface RecipeListHeaderProps {
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
}

export default function RecipeListHeader({ sortBy, onSortChange }: RecipeListHeaderProps) {
  return (
    <header className="bg-background border-border sticky top-0 z-10 border-b px-4 py-3">
      <div className="mb-3 flex items-center justify-between">
        <h1 className="text-2xl font-bold">조리법 목록</h1>
        <div className="flex items-center gap-2">
          <Link
            href="/settings/passkeys"
            className="text-muted-foreground hover:text-foreground rounded-md p-2 transition-colors"
            aria-label="설정"
          >
            <SettingsIcon className="h-5 w-5" />
          </Link>
          <LinkButton
            href="/recipes/new"
            size="sm"
            className="flex items-center gap-1"
            aria-label="새 조리법 만들기"
          >
            <PlusIcon className="h-4 w-4" aria-hidden="true" />새 조리법
          </LinkButton>
        </div>
      </div>
      <div className="flex gap-2" role="group" aria-label="정렬 옵션">
        <Button
          variant={sortBy === "name" ? "primary" : "secondary"}
          size="sm"
          aria-pressed={sortBy === "name"}
          aria-label="가나다순으로 정렬"
          onClick={() => onSortChange("name")}
        >
          가나다순
        </Button>
        <Button
          variant={sortBy === "updated" ? "primary" : "secondary"}
          size="sm"
          aria-pressed={sortBy === "updated"}
          aria-label="최근 수정순으로 정렬"
          onClick={() => onSortChange("updated")}
        >
          최근 수정순
        </Button>
      </div>
    </header>
  );
}
