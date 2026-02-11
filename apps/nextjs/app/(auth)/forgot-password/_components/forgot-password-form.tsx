"use client";

import Link from "next/link";
import { useState } from "react";
import { forgotPasswordSchema } from "../../_lib/schemas";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  function validate(): string | null {
    const result = forgotPasswordSchema.safeParse({ email });
    if (result.success) return null;
    return result.error.issues[0]?.message ?? "Email invalide";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/v1/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        setError("Une erreur est survenue. Veuillez réessayer.");
        return;
      }

      setSuccess(true);
    } catch {
      setError("Impossible d'envoyer l'email. Vérifiez votre connexion.");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Si un compte existe avec cette adresse, vous recevrez un email de
          réinitialisation.
        </p>
        <Link
          href="/login"
          className="inline-block rounded-full bg-homecafe-pink px-8 py-2.5 text-sm font-medium text-white transition-colors hover:bg-homecafe-pink-dark"
        >
          Retour à la connexion
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-gray-600">
        Entrez votre email pour recevoir un lien de réinitialisation.
      </p>

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
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError(null);
            }}
            className="w-full border-0 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
            autoComplete="email"
          />
        </div>
        {error && <p className="mt-1 text-xs text-orange-400">{error}</p>}
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="rounded-full bg-homecafe-pink px-8 py-2.5 text-sm font-medium text-white transition-colors hover:bg-homecafe-pink-dark disabled:opacity-50"
      >
        {submitting ? "Envoi en cours..." : "Envoyer le lien"}
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
