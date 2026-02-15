"use client";

import { Button } from "@packages/ui/components/ui/button";
import { Input } from "@packages/ui/components/ui/input";
import { Label } from "@packages/ui/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/common/auth-client";
import { loginSchema } from "../../_lib/schemas";

interface FormState {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
}

export function LoginForm() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({ email: "", password: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  function validate(): FormErrors {
    const result = loginSchema.safeParse(form);
    if (result.success) return {};
    const errs: FormErrors = {};
    for (const issue of result.error.issues) {
      const field = issue.path[0] as keyof FormErrors;
      if (!errs[field]) errs[field] = issue.message;
    }
    return errs;
  }

  function handleChange(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    setServerError(null);
  }

  async function handleGoogleSignIn() {
    setSubmitting(true);
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/dashboard",
      });
    } catch {
      setServerError("Impossible de se connecter avec Google.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    setServerError(null);

    try {
      const res = await fetch("/api/v1/auth/sign-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        setServerError(data.error ?? "Email ou mot de passe incorrect");
        return;
      }

      router.push("/dashboard");
    } catch {
      setServerError("Impossible de se connecter. Vérifiez votre connexion.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <div className="rounded-md border border-homecafe-grey px-4 pt-2 pb-3 transition-colors focus-within:border-homecafe-orange">
          <Label
            htmlFor="email"
            className="text-xs font-medium text-homecafe-orange"
          >
            E-mail
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="votre@email.com"
            value={form.email}
            onChange={(e) => handleChange("email", e.target.value)}
            className="h-auto border-0 bg-transparent p-0 text-sm text-black shadow-none outline-none ring-0 placeholder:text-gray-400 focus-visible:ring-0"
            autoComplete="email"
          />
        </div>
        {errors.email && (
          <p className="mt-1 text-xs text-homecafe-orange">{errors.email}</p>
        )}
      </div>

      <div>
        <div className="flex items-center rounded-md border border-homecafe-grey px-4 pt-2 pb-3 transition-colors focus-within:border-homecafe-orange">
          <div className="flex-1">
            <Label
              htmlFor="password"
              className="text-xs font-medium text-homecafe-orange"
            >
              Mot de passe
            </Label>
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Minimum 8 caractères"
              value={form.password}
              onChange={(e) => handleChange("password", e.target.value)}
              className="h-auto border-0 bg-transparent p-0 text-sm text-black shadow-none outline-none ring-0 placeholder:text-gray-400 focus-visible:ring-0"
              autoComplete="current-password"
            />
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setShowPassword(!showPassword)}
            className="ml-2 size-8 text-homecafe-blue hover:text-homecafe-blue/80"
            aria-label={
              showPassword
                ? "Masquer le mot de passe"
                : "Afficher le mot de passe"
            }
          >
            {showPassword ? (
              <EyeOff className="size-5" />
            ) : (
              <Eye className="size-5" />
            )}
          </Button>
        </div>
        {errors.password && (
          <p className="mt-1 text-xs text-red-500">{errors.password}</p>
        )}
      </div>

      {serverError && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {serverError}
        </div>
      )}

      <div className="flex items-center gap-4">
        <Button
          type="submit"
          disabled={submitting}
          className="rounded-full px-8 py-2.5"
        >
          {submitting ? "Connexion..." : "Se connecter"}
        </Button>
        <Link
          href="/forgot-password"
          className="text-sm font-medium text-homecafe-blue hover:text-homecafe-blue/80"
        >
          Mot de passe oublié ?
        </Link>
      </div>

      <div className="flex items-center gap-4 pt-2">
        <div className="h-px flex-1 bg-homecafe-grey" />
        <span className="text-xs text-muted-foreground">ou</span>
        <div className="h-px flex-1 bg-homecafe-grey" />
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full rounded-full py-2.5"
        onClick={handleGoogleSignIn}
        disabled={submitting}
      >
        <svg
          className="mr-2 h-4 w-4"
          viewBox="0 0 24 24"
          role="img"
          aria-label="Google"
        >
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        Continuer avec Google
      </Button>

      <p className="text-[10px] text-homecafe-grey-dark">Mentions légales</p>

      <p className="pt-2 text-sm text-black">
        Pas encore membre ?{" "}
        <Link
          href="/register"
          className="font-medium text-homecafe-blue hover:text-homecafe-blue/80"
        >
          Inscris-toi
        </Link>
      </p>
    </form>
  );
}
