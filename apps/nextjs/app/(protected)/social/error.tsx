"use client";

import { Button } from "@packages/ui/components/ui/button";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="container mx-auto flex max-w-7xl flex-col items-center justify-center px-4 py-16">
      <h2 className="mb-4 text-xl font-semibold">Une erreur est survenue</h2>
      <p className="mb-6 text-muted-foreground">
        {error.message || "Quelque chose s'est mal passe."}
      </p>
      <Button onClick={reset} className="rounded-full px-6">
        Reessayer
      </Button>
    </div>
  );
}
