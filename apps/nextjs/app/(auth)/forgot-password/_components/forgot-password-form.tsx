"use client";

import { Button } from "@packages/ui/components/ui/button";
import { Input } from "@packages/ui/components/ui/input";
import { Label } from "@packages/ui/components/ui/label";
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
        <p className="text-sm text-homecafe-grey-dark">
          Si un compte existe avec cette adresse, vous recevrez un email de
          réinitialisation.
        </p>
        <Button asChild className="rounded-full px-8 py-2.5">
          <Link href="/login">Retour à la connexion</Link>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-homecafe-grey-dark">
        Entrez votre email pour recevoir un lien de réinitialisation.
      </p>

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
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError(null);
            }}
            className="h-auto border-0 bg-transparent p-0 text-sm text-black shadow-none outline-none ring-0 placeholder:text-gray-400 focus-visible:ring-0"
            autoComplete="email"
          />
        </div>
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>

      <Button
        type="submit"
        disabled={submitting}
        className="rounded-full px-8 py-2.5"
      >
        {submitting ? "Envoi en cours..." : "Envoyer le lien"}
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
