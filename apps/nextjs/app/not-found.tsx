import { Button } from "@packages/ui/components/ui/button";
import Link from "next/link";
import { authGuard } from "@/adapters/guards/auth.guard";
import { getProfileAvatarUrl } from "@/adapters/queries/profile-avatar.query";
import { LandingFooter } from "./_components/landing-footer";
import { LandingNavbar } from "./_components/landing-navbar";
import { Footer } from "./(protected)/_components/footer";
import { Navbar } from "./(protected)/_components/navbar";

export default async function NotFound() {
  const guardResult = await authGuard();

  const isAuthenticated = guardResult.authenticated;
  const user = isAuthenticated
    ? {
        ...guardResult.session.user,
        image:
          (await getProfileAvatarUrl(guardResult.session.user.id)) ??
          guardResult.session.user.image,
      }
    : null;

  return (
    <div className="flex min-h-screen flex-col bg-homecafe-cream">
      {isAuthenticated && user ? <Navbar user={user} /> : <LandingNavbar />}

      <main className="flex flex-1 flex-col items-center justify-center px-6 pt-28 pb-16">
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-6">
            <svg
              width="120"
              height="120"
              viewBox="0 0 120 120"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              className="text-homecafe-pink"
            >
              <ellipse
                cx="60"
                cy="108"
                rx="36"
                ry="6"
                className="fill-homecafe-pink/10"
              />
              <path
                d="M28 50C28 50 26 88 30 92C34 96 86 96 90 92C94 88 92 50 92 50H28Z"
                className="fill-homecafe-pink/20 stroke-homecafe-pink"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M92 58C92 58 104 60 104 72C104 84 92 84 92 84"
                className="stroke-homecafe-pink"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <path
                d="M24 50H96"
                className="stroke-homecafe-pink"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <g className="animate-steam-1">
                <path
                  d="M48 40C48 36 52 34 50 28"
                  className="stroke-homecafe-pink/40"
                  strokeWidth="2"
                  strokeLinecap="round"
                  fill="none"
                />
              </g>
              <g className="animate-steam-2">
                <path
                  d="M60 38C60 34 64 32 62 26"
                  className="stroke-homecafe-pink/40"
                  strokeWidth="2"
                  strokeLinecap="round"
                  fill="none"
                />
              </g>
              <g className="animate-steam-3">
                <path
                  d="M72 40C72 36 76 34 74 28"
                  className="stroke-homecafe-pink/40"
                  strokeWidth="2"
                  strokeLinecap="round"
                  fill="none"
                />
              </g>
            </svg>
          </div>

          <p className="text-8xl font-bold text-homecafe-pink/30 sm:text-9xl">
            404
          </p>

          <h1 className="mt-4 text-2xl font-medium text-foreground sm:text-3xl">
            Oups, cette page s&apos;est perdue...
          </h1>

          <p className="mt-3 max-w-md text-base leading-relaxed text-homecafe-grey-dark">
            On dirait que tu t&apos;es aventur&eacute;(e) un peu trop loin. Pas
            de panique, ton caf&eacute; t&apos;attend !
          </p>

          <div className="mt-10 flex flex-col items-center gap-3">
            <Button asChild size="lg" className="rounded-full px-8 shadow-md">
              <Link href={isAuthenticated ? "/dashboard" : "/"}>
                {isAuthenticated
                  ? "Retour au dashboard"
                  : "Retour \u00e0 l\u2019accueil"}
              </Link>
            </Button>
            {!isAuthenticated && (
              <Link
                href="/login"
                className="text-sm font-medium text-homecafe-grey-dark underline-offset-4 transition-colors hover:text-homecafe-pink hover:underline"
              >
                Se connecter
              </Link>
            )}
          </div>
        </div>
      </main>

      {isAuthenticated ? <Footer /> : <LandingFooter />}
    </div>
  );
}
