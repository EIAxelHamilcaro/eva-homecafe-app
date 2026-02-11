import { redirect } from "next/navigation";
import { ResetPasswordForm } from "./_components/reset-password-form";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    redirect("/forgot-password");
  }

  return (
    <>
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">
          Nouveau mot de passe
        </h1>
        <p className="mt-2 text-muted-foreground">
          Choisissez un nouveau mot de passe sécurisé.
        </p>
      </div>
      <ResetPasswordForm token={token} />
    </>
  );
}
