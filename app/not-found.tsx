import { LinkButton } from "@/components/ui";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-muted-foreground mb-4 text-6xl font-bold">404</h1>
        <h2 className="mb-2 text-2xl font-semibold">페이지를 찾을 수 없습니다</h2>
        <p className="text-muted-foreground mb-8">
          요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
        </p>
        <LinkButton href="/recipes" aria-label="조리법 목록으로 돌아가기">
          조리법 목록으로 돌아가기
        </LinkButton>
      </div>
    </main>
  );
}
