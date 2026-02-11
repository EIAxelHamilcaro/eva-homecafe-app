import { Button } from "@packages/ui/components/ui/button";
import Link from "next/link";
import { LandingLogo } from "./landing-logo";

export function LandingNavbar() {
  return (
    <header className="absolute top-0 left-0 z-50 w-full bg-white">
      <nav
        aria-label="Navigation principale"
        className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-[52px]"
      >
        <Link href="/">
          <LandingLogo width={107} height={67} />
        </Link>
        <Button
          asChild
          className="rounded-full bg-homecafe-pink px-6 text-white hover:bg-homecafe-pink/80"
        >
          <Link href="/register">S&apos;inscrire</Link>
        </Button>
      </nav>
    </header>
  );
}
