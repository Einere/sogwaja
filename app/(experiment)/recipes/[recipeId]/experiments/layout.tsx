import { SsgoiTransition } from "@ssgoi/react";
import { AuthGuard } from "@/lib/auth";

export default function ExperimentLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <SsgoiTransition id="experiment">
        <div className="min-h-screen">
          <div className="bg-background mx-auto min-h-screen max-w-md">{children}</div>
        </div>
      </SsgoiTransition>
    </AuthGuard>
  );
}
