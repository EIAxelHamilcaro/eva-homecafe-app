"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="fr">
      <body className="flex min-h-screen items-center justify-center bg-[#fff8f0] px-4">
        <div className="w-full max-w-md text-center">
          <h1 className="mb-2 text-6xl font-bold text-gray-900">Oups !</h1>
          <p className="mb-6 text-lg text-gray-600">
            Quelque chose s&apos;est mal passé.
          </p>
          {error.digest && (
            <p className="mb-4 text-xs text-gray-400">
              Référence : {error.digest}
            </p>
          )}
          <button
            type="button"
            onClick={reset}
            className="rounded-full bg-[#ffb6c1] px-8 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#e91e63]"
          >
            Réessayer
          </button>
        </div>
      </body>
    </html>
  );
}
