"use client";

import { Button } from "@packages/ui/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@packages/ui/components/ui/card";
import { Input } from "@packages/ui/components/ui/input";
import { Label } from "@packages/ui/components/ui/label";
import { Textarea } from "@packages/ui/components/ui/textarea";
import Link from "next/link";
import { useState } from "react";

interface ContactFormProps {
  prefill: { name: string; email: string } | null;
}

interface FormState {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

export function ContactForm({ prefill }: ContactFormProps) {
  const [form, setForm] = useState<FormState>({
    name: prefill?.name ?? "",
    email: prefill?.email ?? "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  function validate(): FormErrors {
    const errs: FormErrors = {};
    if (!form.name.trim()) errs.name = "Le nom est requis";
    if (form.name.length > 100) errs.name = "100 caractères maximum";
    if (!form.email.trim()) errs.email = "L'email est requis";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = "Email invalide";
    if (!form.subject.trim()) errs.subject = "Le sujet est requis";
    if (form.subject.length > 200) errs.subject = "200 caractères maximum";
    if (form.message.length < 10)
      errs.message = "Le message doit faire au moins 10 caractères";
    if (form.message.length > 5000) errs.message = "5000 caractères maximum";
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
      const res = await fetch("/api/v1/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        setServerError(data.error ?? "Une erreur est survenue");
        return;
      }

      setSuccess(true);
    } catch {
      setServerError("Impossible d'envoyer le message. Veuillez réessayer.");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="mb-4 text-4xl">✉️</div>
          <h2 className="mb-2 text-xl font-semibold">Message envoyé !</h2>
          <p className="mb-6 text-muted-foreground">
            Nous avons bien reçu votre message et nous vous répondrons dans les
            plus brefs délais.
          </p>
          <Link href="/">
            <Button variant="outline">Retour à l&apos;accueil</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Envoyez-nous un message</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nom</Label>
              <Input
                id="name"
                placeholder="Votre nom"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                aria-invalid={!!errors.name}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="votre@email.com"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                aria-invalid={!!errors.email}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Sujet</Label>
            <Input
              id="subject"
              placeholder="De quoi s'agit-il ?"
              value={form.subject}
              onChange={(e) => handleChange("subject", e.target.value)}
              aria-invalid={!!errors.subject}
            />
            {errors.subject && (
              <p className="text-sm text-destructive">{errors.subject}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="Décrivez votre question ou retour..."
              rows={6}
              value={form.message}
              onChange={(e) => handleChange("message", e.target.value)}
              aria-invalid={!!errors.message}
            />
            {errors.message && (
              <p className="text-sm text-destructive">{errors.message}</p>
            )}
          </div>

          {serverError && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {serverError}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Envoi en cours..." : "Envoyer le message"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
