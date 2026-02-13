"use client";

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
      <button
        type="button"
        onClick={reset}
        className="rounded-full bg-homecafe-pink px-6 py-2 text-sm font-medium text-white hover:opacity-90"
      >
        Reessayer
      </button>
    </div>
  );
}
