import Navigation from "@/components/layout/Navigation";
import { SsgoiTransition } from "@ssgoi/react";

export default function RecipeEditorLayout({ children }: { children: React.ReactNode }) {
  return (
    <SsgoiTransition id="recipe-editor">
      <div className="min-h-screen">
        <div className="max-w-md mx-auto bg-background min-h-screen">
          {children}

          <Navigation />
        </div>
      </div>
    </SsgoiTransition>
  );
}
