import { SsgoiTransition } from "@ssgoi/react";
import Link from "next/link";

export default function FooPage() {
  return (
    <SsgoiTransition id="foo">
      <div>
        FooPage
        <div>
          <Link href="/bar">Bar</Link>
        </div>
      </div>
    </SsgoiTransition>
  );
}
