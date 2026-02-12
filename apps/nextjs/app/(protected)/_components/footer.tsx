import { Button } from "@packages/ui/components/ui/button";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border bg-white py-6">
      <div className="mx-auto flex max-w-7xl items-center justify-center px-6">
        <Button
          asChild
          variant="outline"
          className="rounded-full border-border px-6 text-foreground hover:bg-muted"
        >
          <Link href="/settings">Inviter des ami&middot;es</Link>
        </Button>
      </div>
    </footer>
  );
}
