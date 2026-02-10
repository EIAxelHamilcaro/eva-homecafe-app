import Link from "next/link";

export function LandingFooter() {
  return (
    <footer className="border-t border-border bg-background py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
          <div>
            <Link
              href="/"
              className="text-lg font-bold tracking-tight text-foreground"
            >
              HomeCafe
            </Link>
            <p className="mt-1 text-sm text-muted-foreground">
              Ton quotidien structuré avec créativité.
            </p>
          </div>
          <nav aria-label="Footer navigation" className="flex gap-6">
            <Link
              href="/contact"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Contact
            </Link>
            <Link
              href="/register"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              S'inscrire
            </Link>
            <Link
              href="/login"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Se connecter
            </Link>
          </nav>
        </div>
        <div className="mt-8 border-t border-border pt-6 text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} HomeCafe. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
}
