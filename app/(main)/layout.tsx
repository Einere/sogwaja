import Navigation from "@/components/layout/Navigation";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  // 인증 체크는 각 페이지에서 수행 (레이아웃의 책임이 아님)
  return (
    <div className="min-h-screen bg-muted">
      <div className="max-w-md mx-auto bg-background min-h-screen">
        {children}

        <Navigation />
      </div>
    </div>
  );
}
