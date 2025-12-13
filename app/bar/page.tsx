import Link from "next/link";
import { ViewTransition } from "react";

export default function BarPage() {
  return (
    <ViewTransition enter="slide-left" exit="slide-right">
      <div>
        BarPage
        <div>
          <Link href="/foo">⬅️</Link>
        </div>
      </div>
    </ViewTransition>
  );
}
