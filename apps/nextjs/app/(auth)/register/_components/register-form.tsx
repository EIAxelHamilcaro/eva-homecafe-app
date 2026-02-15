"use client";

import { Button } from "@packages/ui/components/ui/button";
import { Input } from "@packages/ui/components/ui/input";
import { Label } from "@packages/ui/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { registerSchema } from "../../_lib/schemas";

interface FormState {
  name: string;
  email: string;
  password: string;
  passwordConfirm: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  passwordConfirm?: string;
}

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get("invite_token");
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    password: "",
    passwordConfirm: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  function validate(): FormErrors {
    const result = registerSchema.safeParse(form);
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
      const res = await fetch("/api/v1/auth/sign-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setServerError(data.error ?? "Impossible de créer le compte");
        return;
      }

      if (inviteToken) {
        router.push(`/dashboard?invite_token=${inviteToken}`);
      } else {
        router.push("/dashboard");
      }
    } catch {
      setServerError(
        "Impossible de créer le compte. Vérifiez votre connexion.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <div className="rounded-md border border-homecafe-grey px-4 pt-2 pb-3 transition-colors focus-within:border-homecafe-orange">
          <Label
            htmlFor="name"
            className="text-xs font-medium text-homecafe-orange"
          >
            Nom
          </Label>
          <Input
            id="name"
            type="text"
            placeholder="Votre nom"
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
            className="h-auto border-0 bg-transparent p-0 text-sm text-black shadow-none outline-none ring-0 placeholder:text-gray-400 focus-visible:ring-0"
            autoComplete="name"
          />
        </div>
        {errors.name && (
          <p className="mt-1 text-xs text-red-500">{errors.name}</p>
        )}
      </div>

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
          <p className="mt-1 text-xs text-red-500">{errors.email}</p>
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
              autoComplete="new-password"
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

      <div>
        <div className="flex items-center rounded-md border border-homecafe-grey px-4 pt-2 pb-3 transition-colors focus-within:border-homecafe-orange">
          <div className="flex-1">
            <Label
              htmlFor="passwordConfirm"
              className="text-xs font-medium text-homecafe-orange"
            >
              Confirmer le mot de passe
            </Label>
            <Input
              id="passwordConfirm"
              type={showPasswordConfirm ? "text" : "password"}
              placeholder="Retapez votre mot de passe"
              value={form.passwordConfirm}
              onChange={(e) => handleChange("passwordConfirm", e.target.value)}
              className="h-auto border-0 bg-transparent p-0 text-sm text-black shadow-none outline-none ring-0 placeholder:text-gray-400 focus-visible:ring-0"
              autoComplete="new-password"
            />
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
            className="ml-2 size-8 text-homecafe-blue hover:text-homecafe-blue/80"
            aria-label={
              showPasswordConfirm
                ? "Masquer le mot de passe"
                : "Afficher le mot de passe"
            }
          >
            {showPasswordConfirm ? (
              <EyeOff className="size-5" />
            ) : (
              <Eye className="size-5" />
            )}
          </Button>
        </div>
        {errors.passwordConfirm && (
          <p className="mt-1 text-xs text-red-500">{errors.passwordConfirm}</p>
        )}
      </div>

      {serverError && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {serverError}
        </div>
      )}

      <Button
        type="submit"
        disabled={submitting}
        className="rounded-full px-8 py-2.5"
      >
        {submitting ? "Inscription en cours..." : "S'inscrire"}
      </Button>

      <p className="text-[10px] text-homecafe-grey-dark">Mentions légales</p>

      <p className="pt-2 text-sm text-black">
        Déjà membre ?{" "}
        <Link
          href="/login"
          className="font-medium text-homecafe-blue hover:text-homecafe-blue/80"
        >
          Connecte-toi
        </Link>
      </p>
    </form>
  );
}
