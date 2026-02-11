import { redirect } from "next/navigation";
import { authGuard } from "@/adapters/guards/auth.guard";
import { LoginForm } from "./_components/login-form";

export default async function LoginPage() {
  try {
    const guardResult = await authGuard();
    if (guardResult.authenticated) {
      redirect("/dashboard");
    }
  } catch {
    // Auth unavailable — show login page
  }

  return (
    <>
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Se connecter</h1>
        <p className="mt-2 text-muted-foreground">
          Connectez-vous à votre compte HomeCafe.
        </p>
      </div>
      <LoginForm />
    </>
  );
}
