"use client";

import { Button } from "@packages/ui/components/ui/button";
import { Input } from "@packages/ui/components/ui/input";
import { Label } from "@packages/ui/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { resetPasswordSchema } from "../../../_lib/schemas";

interface FormState {
  password: string;
  passwordConfirm: string;
}

interface FormErrors {
  password?: string;
  passwordConfirm?: string;
}

export function ResetPasswordForm({ token }: { token: string }) {
  const [form, setForm] = useState<FormState>({
    password: "",
    passwordConfirm: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  function validate(): FormErrors {
    const result = resetPasswordSchema.safeParse(form);
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
      const res = await fetch("/api/v1/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: form.password }),
      });

      if (!res.ok) {
        const data = await res.json();
        if (data.code === "INVALID_TOKEN" || data.code === "TOKEN_EXPIRED") {
          setServerError(
            "Ce lien a expiré ou est invalide. Demandez un nouveau lien.",
          );
        } else {
          setServerError(data.error ?? "Une erreur est survenue");
        }
        return;
      }

      setSuccess(true);
    } catch {
      setServerError(
        "Impossible de réinitialiser le mot de passe. Vérifiez votre connexion.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-homecafe-grey-dark">
          Votre mot de passe a été réinitialisé avec succès.
        </p>
        <Button
          asChild
          className="rounded-full bg-homecafe-pink px-8 py-2.5 text-sm font-medium text-white transition-colors hover:bg-homecafe-pink/80"
        >
          <Link href="/login">Se connecter</Link>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-homecafe-grey-dark">
        Choisissez un nouveau mot de passe sécurisé.
      </p>

      <div>
        <div className="flex items-center rounded-md border border-homecafe-grey px-4 pt-2 pb-3 transition-colors focus-within:border-homecafe-orange">
          <div className="flex-1">
            <Label
              htmlFor="password"
              className="text-xs font-medium text-homecafe-orange"
            >
              Nouveau mot de passe
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
        <div className="space-y-3">
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {serverError}
          </div>
          <Link
            href="/forgot-password"
            className="block text-sm font-medium text-homecafe-blue hover:text-homecafe-blue/80"
          >
            Demander un nouveau lien
          </Link>
        </div>
      )}

      <Button
        type="submit"
        disabled={submitting}
        className="rounded-full bg-homecafe-pink px-8 py-2.5 text-sm font-medium text-white transition-colors hover:bg-homecafe-pink/80 disabled:opacity-50"
      >
        {submitting ? "Réinitialisation..." : "Réinitialiser"}
      </Button>

      <p className="pt-2 text-sm text-black">
        <Link
          href="/login"
          className="font-medium text-homecafe-blue hover:text-homecafe-blue/80"
        >
          Retour à la connexion
        </Link>
      </p>
    </form>
  );
}
