"use client";

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
        <p className="text-sm text-gray-600">
          Votre mot de passe a été réinitialisé avec succès.
        </p>
        <Link
          href="/login"
          className="inline-block rounded-full bg-homecafe-pink px-8 py-2.5 text-sm font-medium text-white transition-colors hover:bg-homecafe-pink-dark"
        >
          Se connecter
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-gray-600">
        Choisissez un nouveau mot de passe sécurisé.
      </p>

      <div>
        <div className="flex items-center rounded-xl border border-gray-200 px-4 pt-2 pb-3 transition-colors focus-within:border-rose-300">
          <div className="flex-1">
            <label
              htmlFor="password"
              className="block text-xs font-medium text-orange-400"
            >
              Nouveau mot de passe
            </label>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Minimum 8 caractères"
              value={form.password}
              onChange={(e) => handleChange("password", e.target.value)}
              className="w-full border-0 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
              autoComplete="new-password"
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
          <p className="mt-1 text-xs text-orange-400">{errors.password}</p>
        )}
      </div>

      <div>
        <div className="flex items-center rounded-xl border border-gray-200 px-4 pt-2 pb-3 transition-colors focus-within:border-rose-300">
          <div className="flex-1">
            <label
              htmlFor="passwordConfirm"
              className="block text-xs font-medium text-orange-400"
            >
              Confirmer le mot de passe
            </label>
            <input
              id="passwordConfirm"
              type={showPasswordConfirm ? "text" : "password"}
              placeholder="Retapez votre mot de passe"
              value={form.passwordConfirm}
              onChange={(e) => handleChange("passwordConfirm", e.target.value)}
              className="w-full border-0 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
              autoComplete="new-password"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
            className="ml-2 text-blue-500 hover:text-blue-600"
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
          </button>
        </div>
        {errors.passwordConfirm && (
          <p className="mt-1 text-xs text-orange-400">
            {errors.passwordConfirm}
          </p>
        )}
      </div>

      {serverError && (
        <div className="space-y-3">
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {serverError}
          </div>
          <Link
            href="/forgot-password"
            className="block text-sm font-medium text-blue-500 hover:text-blue-600"
          >
            Demander un nouveau lien
          </Link>
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-full bg-homecafe-pink px-8 py-2.5 text-sm font-medium text-white transition-colors hover:bg-homecafe-pink-dark disabled:opacity-50"
      >
        {submitting ? "Réinitialisation..." : "Réinitialiser"}
      </button>

      <p className="pt-2 text-sm text-gray-900">
        <Link
          href="/login"
          className="font-medium text-blue-500 hover:text-blue-600"
        >
          Retour à la connexion
        </Link>
      </p>
    </form>
  );
}
