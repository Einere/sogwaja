import { SsgoiTransition } from "@ssgoi/react";

export default function ExperimentLayout({ children }: { children: React.ReactNode }) {
  return (
    <SsgoiTransition id="experiment">
      <div className="min-h-screen">
        <div className="bg-background mx-auto min-h-screen max-w-md">{children}</div>
      </div>
    </SsgoiTransition>
  );
}
