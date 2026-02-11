import { redirect } from "next/navigation";
import { authGuard } from "@/adapters/guards/auth.guard";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const guardResult = await authGuard();
  if (guardResult.authenticated) redirect("/dashboard");

  return <>{children}</>;
}
