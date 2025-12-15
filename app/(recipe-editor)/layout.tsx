import Navigation from "@/components/layout/Navigation";
import { SsgoiTransition } from "@ssgoi/react";

export default function RecipeEditorLayout({ children }: { children: React.ReactNode }) {
  return (
    <SsgoiTransition id="recipe-editor">
      <div className="min-h-screen">
        <div className="bg-background mx-auto min-h-screen max-w-md">
          {children}

          <Navigation />
        </div>
      </div>
    </SsgoiTransition>
  );
}
