import { Suspense } from "react";
import { getServerUser } from "@/lib/supabase/auth";
import { getRecipes } from "@/app/(recipes)/recipes/actions";
import RecipeListHeader from "@/app/(recipes)/recipes/components/RecipeListHeader";
import RecipeListContent from "@/app/(recipes)/recipes/components/RecipeListContent";
import EmptyState from "@/components/shared/EmptyState";
import { LinkButton } from "@/components/ui";

export default async function RecipesPage() {
  // TODO: auth guard 로직은 분리해야 함.
  const user = await getServerUser();

  if (!user) {
    return (
      // TODO: 별도의 컴포넌트로 분리하기
      <main className="flex flex-col items-center justify-center min-h-screen p-4">
        <p className="text-muted-foreground mb-4 text-center">
          조리법을 저장하고 관리하려면 로그인이 필요합니다.
        </p>
        <LinkButton href="/auth" aria-label="로그인하기">
          로그인하기
        </LinkButton>
      </main>
    );
  }

  // 클라이언트 사이드 정렬을 위해 서버에서는 정렬 없이 모든 조리법 가져오기
  // 정렬은 클라이언트에서 수행됨
  const recipes = await getRecipes();

  return (
    <div className="min-h-screen">
      {/* TODO: Suspense로 감쌀 필요가 있는지 검증하기 */}
      <Suspense
        fallback={
          <header className="sticky top-0 bg-background border-b border-border z-10 px-4 py-3">
            <div className="flex items-center justify-between mb-3">
              <h1 className="text-2xl font-bold">조리법 목록</h1>
            </div>
          </header>
        }
      >
        <RecipeListHeader />
      </Suspense>
      <div className="px-4 py-4">
        {recipes.length === 0 ? (
          <EmptyState
            title="아직 조리법이 없습니다."
            action={{
              label: "첫 조리법 만들기",
              href: "/recipes/new",
            }}
          />
        ) : (
          <RecipeListContent recipes={recipes} />
        )}
      </div>
    </div>
  );
}
