import { redirect } from "next/navigation";
import { authGuard } from "@/adapters/guards/auth.guard";
import { RegisterForm } from "./_components/register-form";

export default async function RegisterPage() {
  try {
    const guardResult = await authGuard();
    if (guardResult.authenticated) {
      redirect("/dashboard");
    }
  } catch {
    // Auth unavailable — show register page
  }

  return (
    <>
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Créer un compte</h1>
        <p className="mt-2 text-muted-foreground">
          Rejoignez HomeCafe et commencez à organiser votre quotidien.
        </p>
      </div>
      <RegisterForm />
    </>
  );
}
