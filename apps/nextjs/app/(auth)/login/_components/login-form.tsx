"use client";

import { Button } from "@packages/ui/components/ui/button";
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
        <div className="rounded-xl border border-gray-200 px-4 pt-2 pb-3 transition-colors focus-within:border-rose-300">
          <label
            htmlFor="email"
            className="block text-xs font-medium text-orange-400"
          >
            E-mail
          </label>
          <input
            id="email"
            type="email"
            placeholder="votre@email.com"
            value={form.email}
            onChange={(e) => handleChange("email", e.target.value)}
            className="w-full border-0 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
            autoComplete="email"
          />
        </div>
        {errors.email && (
          <p className="mt-1 text-xs text-orange-400">{errors.email}</p>
        )}
      </div>

      <div>
        <div className="flex items-center rounded-xl border border-gray-200 px-4 pt-2 pb-3 transition-colors focus-within:border-rose-300">
          <div className="flex-1">
            <label
              htmlFor="password"
              className="block text-xs font-medium text-orange-400"
            >
              Mot de passe
            </label>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Minimum 8 caractères"
              value={form.password}
              onChange={(e) => handleChange("password", e.target.value)}
              className="w-full border-0 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
              autoComplete="current-password"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="ml-2 text-blue-500 hover:text-blue-600"
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
          </button>
        </div>
        {errors.password && (
          <p className="mt-1 text-xs text-red-500">{errors.password}</p>
        )}
      </div>

      <div className="text-right">
        <Link
          href="/forgot-password"
          className="font-medium text-blue-500 hover:text-blue-600"
        >
          Mot de passe oublié ?
        </Link>
      </div>

      {serverError && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {serverError}
        </div>
      )}

      <Button
        type="submit"
        disabled={submitting}
        className="rounded-full bg-homecafe-pink px-8 py-2.5 text-sm font-medium text-white transition-colors hover:bg-homecafe-pink-dark disabled:opacity-50"
      >
        {submitting ? "Connexion..." : "Se connecter"}
      </Button>

      <p className="text-xs text-gray-400">Mentions légales</p>

      <p className="pt-2 text-sm text-gray-900">
        Pas encore membre ?{" "}
        <Link
          href="/register"
          className="font-medium text-blue-500 hover:text-blue-600"
        >
          Inscris-toi
        </Link>
      </p>
    </form>
  );
}
