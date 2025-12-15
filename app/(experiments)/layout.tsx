import { SsgoiTransition } from "@ssgoi/react";

export default function ExperimentsLayout({ children }: { children: React.ReactNode }) {
  return (
    <SsgoiTransition id="experiments">
      <div className="min-h-screen">
        <div className="bg-background mx-auto min-h-screen max-w-md">{children}</div>
      </div>
    </SsgoiTransition>
  );
}
