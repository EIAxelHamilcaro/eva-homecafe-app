import { Button } from "@packages/ui/components/ui/button";
import Link from "next/link";
import { LandingLogo } from "./landing-logo";

export function LandingNavbar() {
  return (
    <header className="absolute top-0 left-0 z-50 w-full">
      <nav
        aria-label="Navigation principale"
        className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8"
      >
        <Link href="/">
          <LandingLogo width={90} height={56} />
        </Link>
        <Button asChild size="lg" className="rounded-full">
          <Link href="/register">S'inscrire</Link>
        </Button>
      </nav>
    </header>
  );
}
