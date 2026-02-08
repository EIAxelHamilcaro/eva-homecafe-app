import type { ReactNode } from "react";
import { requireAuth } from "@/adapters/guards/auth.guard";

export default async function OrganizationLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireAuth();
  return <>{children}</>;
}
