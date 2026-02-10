import { Suspense } from "react";
import { requireAuth } from "@/adapters/guards/auth.guard";
import { SettingsForm } from "./_components/settings-form";

function SettingsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-64 animate-pulse rounded-lg bg-muted" />
      <div className="h-48 animate-pulse rounded-lg bg-muted" />
      <div className="h-48 animate-pulse rounded-lg bg-muted" />
      <div className="h-32 animate-pulse rounded-lg bg-muted" />
    </div>
  );
}

export default async function SettingsPage() {
  await requireAuth();

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 font-bold text-2xl">Paramètres</h1>
      <Suspense fallback={<SettingsSkeleton />}>
        <SettingsForm />
      </Suspense>
    </div>
  );
}
