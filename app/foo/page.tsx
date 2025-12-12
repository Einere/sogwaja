import { SsgoiTransition } from "@ssgoi/react";
import Link from "next/link";
import { ViewTransition } from "react";

export default function FooPage() {
  return (
    <ViewTransition enter="slide-right" exit="slide-left">
      <div>
        FooPage
        <div>
          <Link href="/bar">➡️</Link>
        </div>
      </div>
    </ViewTransition>
  );
}
