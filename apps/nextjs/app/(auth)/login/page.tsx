import Image from "next/image";
import Link from "next/link";
import { LandingFooter } from "@/app/_components/landing-footer";
import { LandingLogo } from "@/app/_components/landing-logo";
import { LoginForm } from "./_components/login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="fixed top-0 right-0 left-0 z-10 flex items-center justify-between px-8 py-6">
        <Link href="/">
          <LandingLogo />
        </Link>
        <Link
          href="/register"
          className="rounded-full bg-homecafe-pink px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-homecafe-pink-dark"
        >
          S&apos;inscrire
        </Link>
      </header>

      <main className="flex flex-1">
        <div className="flex w-full flex-col justify-center px-8 lg:w-[45%] lg:px-16 xl:px-24">
          <div className="mx-auto w-full max-w-md pt-28">
            <h1 className="mb-8 text-3xl font-bold text-gray-900">
              C&apos;est chouette de te revoir !
            </h1>
            <LoginForm />
          </div>
        </div>

        <div className="hidden items-center justify-center p-8 lg:flex lg:w-[55%]">
          <div className="relative size-[50vh] overflow-hidden rounded-3xl">
            <Image
              src="/landing/login-image.png"
              alt="Maisons colorées"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
