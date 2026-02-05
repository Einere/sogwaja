import { SsgoiTransition } from "@ssgoi/react";
import { AuthGuard } from "@/lib/auth";

export default function ExperimentsLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <SsgoiTransition id="experiments">
        <div className="min-h-screen">
          <div className="bg-background mx-auto min-h-screen max-w-md">{children}</div>
        </div>
      </SsgoiTransition>
    </AuthGuard>
  );
}
