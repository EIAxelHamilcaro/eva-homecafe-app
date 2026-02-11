import Image from "next/image";
import Link from "next/link";
import { LandingFooter } from "@/app/_components/landing-footer";
import { LandingLogo } from "@/app/_components/landing-logo";
import { RegisterForm } from "./_components/register-form";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="fixed top-0 right-0 left-0 z-10 flex items-center justify-between bg-white px-8 py-6">
        <Link href="/">
          <LandingLogo />
        </Link>
        <Link
          href="/login"
          className="rounded-full bg-homecafe-pink px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-homecafe-pink/80"
        >
          S&apos;identifier
        </Link>
      </header>

      <main className="flex flex-1">
        <div className="flex w-full flex-col justify-center px-8 lg:w-1/2 lg:px-16 xl:px-24">
          <div className="mx-auto w-full max-w-md pt-28">
            <h1 className="mb-8 text-2xl font-medium text-homecafe-grey-dark">
              Bienvenue !
            </h1>
            <RegisterForm />
          </div>
        </div>

        <div className="hidden pt-28 pr-8 pb-8 lg:flex lg:w-1/2">
          <div className="relative w-full flex-1 overflow-hidden rounded-[30px]">
            <Image
              src="/landing/signup-image.png"
              alt="Inscription"
              fill
              className="object-cover object-top"
              priority
            />
          </div>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
