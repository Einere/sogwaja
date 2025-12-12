import { SsgoiTransition } from "@ssgoi/react";

export default async function RecipesLayout({ children }: { children: React.ReactNode }) {
  return (
    <SsgoiTransition id="recipes">
      <div className="min-h-screen">
        <div className="max-w-md mx-auto bg-background min-h-screen">{children}</div>
      </div>
    </SsgoiTransition>
  );
}
