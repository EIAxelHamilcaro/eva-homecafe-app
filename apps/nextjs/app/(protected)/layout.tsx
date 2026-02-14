import type { ReactNode } from "react";
import { requireAuth } from "@/adapters/guards/auth.guard";
import { getProfileAvatarUrl } from "@/adapters/queries/profile-avatar.query";
import { Footer } from "./_components/footer";
import { Navbar } from "./_components/navbar";

export default async function ProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await requireAuth();
  const profileAvatar = await getProfileAvatarUrl(session.user.id);

  const user = {
    ...session.user,
    image: profileAvatar ?? session.user.image,
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} />
      <main className="pt-18">{children}</main>
      <Footer />
    </div>
  );
}
