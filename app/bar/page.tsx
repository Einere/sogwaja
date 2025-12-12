import { SsgoiTransition } from "@ssgoi/react";
import Link from "next/link";

export default function BarPage() {
  return (
    <SsgoiTransition id="bar">
      <div>
        BarPage
        <div>
          <Link href="/foo">Foo</Link>
        </div>
      </div>
    </SsgoiTransition>
  );
}
