export default function ExperimentsLayout({ children }: { children: React.ReactNode }) {
  // Navigation 없음 - 실험 관련 화면에서는 Navigation을 표시하지 않음
  return (
    <div className="min-h-screen bg-muted">
      <div className="max-w-md mx-auto bg-background min-h-screen">{children}</div>
    </div>
  );
}

