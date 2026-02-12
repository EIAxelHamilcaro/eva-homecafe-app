import type { ReactNode } from "react";
import { requireAuth } from "@/adapters/guards/auth.guard";
import { Footer } from "./_components/footer";
import { Navbar } from "./_components/navbar";

export default async function ProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await requireAuth();

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={session.user} />
      <main className="pt-[72px]">{children}</main>
      <Footer />
    </div>
  );
}
