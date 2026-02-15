"use client";

import { Button } from "@packages/ui/components/ui/button";
import { Input } from "@packages/ui/components/ui/input";
import { Label } from "@packages/ui/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
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
