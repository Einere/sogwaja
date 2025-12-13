import { SsgoiTransition } from "@ssgoi/react";

export default function ExperimentLayout({ children }: { children: React.ReactNode }) {
  return (
    <SsgoiTransition id="experiment">
      <div className="min-h-screen">
        <div className="max-w-md mx-auto bg-background min-h-screen">{children}</div>
      </div>
    </SsgoiTransition>
  );
}
