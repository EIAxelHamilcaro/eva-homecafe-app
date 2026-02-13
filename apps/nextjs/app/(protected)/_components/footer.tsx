import { Button } from "@packages/ui/components/ui/button";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="">
      <div className="mx-auto flex max-w-7xl items-center justify-center px-6">
        <Button
          asChild
          variant="outline"
          className="rounded-full border-homecafe-pink/50 py-6 px-3 text-foreground hover:bg-homecafe-pink/5"
        >
          <Link href="/settings">Inviter des ami&middot;es</Link>
        </Button>
      </div>
    </footer>
  );
}
