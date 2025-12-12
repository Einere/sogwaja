import { SsgoiTransition } from "@ssgoi/react";

export default function ExperimentsLayout({ children }: { children: React.ReactNode }) {
  return (
    <SsgoiTransition id="experiments">
      <div className="min-h-screen">
        <div className="max-w-md mx-auto bg-background min-h-screen">{children}</div>
      </div>
    </SsgoiTransition>
  );
}
