"use client";

import { Search, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import type { IUserDto } from "@/application/dto/common.dto";

const navItems = [
  { label: "Home", href: "/dashboard" },
  { label: "Journal", href: "/journal" },
  { label: "Moodboard", href: "/moodboard" },
  { label: "Organisation", href: "/organization" },
  { label: "Social", href: "/social" },
  { label: "Messagerie", href: "/messages" },
  { label: "Contact", href: "/contact" },
] as const;

function isActive(pathname: string, href: string): boolean {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname.startsWith(href);
}

export function Navbar({ user }: { user: IUserDto }) {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 left-0 z-50 w-full border-b border-border bg-white">
      <nav
        aria-label="Navigation principale"
        className="mx-auto flex h-18 max-w-7xl items-center justify-between px-6"
      >
        <Link href="/dashboard" className="shrink-0">
          <Image
            src="/landing/logo.svg"
            alt="homecafe"
            width={80}
            height={50}
            priority
          />
        </Link>

        <div className="flex items-center gap-1">
          <Link
            href="/dashboard"
            className="rounded-full p-2 font-extrabold text-homecafe-orange transition-colors hover:bg-muted"
            aria-label="Rechercher"
          >
            <Search size={20} />
          </Link>

          {navItems.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                  active
                    ? "text-homecafe-yellow"
                    : "text-foreground hover:text-homecafe-yellow"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        <Link
          href="/profile"
          className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-homecafe-pink-light transition-opacity hover:opacity-80"
        >
          {user.image ? (
            <Image
              src={user.image}
              alt={user.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <User size={18} className="text-homecafe-pink" />
            </div>
          )}
        </Link>
      </nav>
    </header>
  );
}
