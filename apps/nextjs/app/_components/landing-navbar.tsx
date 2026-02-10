import Link from "next/link";

export function LandingNavbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav
        aria-label="Navigation principale"
        className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8"
      >
        <Link
          href="/"
          className="text-xl font-bold tracking-tight text-foreground"
        >
          HomeCafe
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Se connecter
          </Link>
          <Link
            href="/register"
            className="inline-flex h-9 items-center rounded-lg bg-rose-500 px-4 text-sm font-medium text-white transition-colors hover:bg-rose-600"
          >
            S'inscrire
          </Link>
        </div>
      </nav>
    </header>
  );
}
