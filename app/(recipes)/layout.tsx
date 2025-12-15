import { SsgoiTransition } from "@ssgoi/react";

export default async function RecipesLayout({ children }: { children: React.ReactNode }) {
  return (
    <SsgoiTransition id="recipes">
      <div className="min-h-screen">
        <div className="bg-background mx-auto min-h-screen max-w-md">{children}</div>
      </div>
    </SsgoiTransition>
  );
}
