"use client";

import { Button } from "@packages/ui/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@packages/ui/components/ui/sheet";
import { AlignJustify, Bell, Search, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import type { IUserDto } from "@/application/dto/common.dto";
import { useUnreadCountQuery } from "../_hooks/use-notifications";

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
  const [open, setOpen] = useState(false);
  const { data: unreadData } = useUnreadCountQuery();
  const unreadCount = unreadData?.unreadCount ?? 0;

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

        <div className="hidden items-center gap-1 lg:flex">
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

        <div className="hidden items-center gap-2 lg:flex">
          <Link
            href="/notifications"
            className="relative rounded-full p-2 transition-colors hover:bg-muted"
            aria-label="Notifications"
          >
            <Bell size={20} className="text-foreground" />
            {unreadCount > 0 && (
              <span className="absolute top-0.5 right-0.5 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
            )}
          </Link>

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
        </div>

        <Button
          variant="ghost"
          className="lg:hidden"
          onClick={() => setOpen(true)}
          aria-label="Ouvrir le menu"
        >
          <AlignJustify size={24} className="text-foreground" />
        </Button>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent side="right" className="w-72">
            <SheetHeader>
              <SheetTitle>
                <Image
                  src="/landing/logo.svg"
                  alt="homecafe"
                  width={80}
                  height={50}
                />
              </SheetTitle>
            </SheetHeader>

            <div className="flex flex-col gap-1 px-4">
              {navItems.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <SheetClose key={item.href} asChild>
                    <Link
                      href={item.href}
                      className={`rounded-lg px-3 py-2.5 text-base font-medium transition-colors ${
                        active
                          ? "bg-homecafe-cream text-homecafe-yellow"
                          : "text-foreground hover:bg-muted"
                      }`}
                    >
                      {item.label}
                    </Link>
                  </SheetClose>
                );
              })}

              <SheetClose asChild>
                <Link
                  href="/notifications"
                  className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-base font-medium transition-colors ${
                    isActive(pathname, "/notifications")
                      ? "bg-homecafe-cream text-homecafe-yellow"
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Bell size={18} />
                    Notifications
                  </span>
                  {unreadCount > 0 && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-homecafe-pink px-1.5 text-xs font-bold text-white">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </Link>
              </SheetClose>
            </div>

            <div className="mt-auto border-t border-border px-4 pt-4 pb-6">
              <SheetClose asChild>
                <Link
                  href="/profile"
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-muted"
                >
                  <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-homecafe-pink-light">
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
                  </div>
                  <span className="text-sm font-medium">{user.name}</span>
                </Link>
              </SheetClose>
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  );
}
