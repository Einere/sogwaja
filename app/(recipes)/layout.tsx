export default async function RecipesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-muted">
      <div className="max-w-md mx-auto bg-background min-h-screen">{children}</div>
    </div>
  );
}

