import { authGuard } from "@/adapters/guards/auth.guard";
import { ContactForm } from "./_components/contact-form";

export default async function ContactPage() {
  let prefill: { name: string; email: string } | null = null;

  try {
    const guardResult = await authGuard();
    if (guardResult.authenticated) {
      prefill = {
        name: guardResult.session.user.name,
        email: guardResult.session.user.email,
      };
    }
  } catch {
    // Not authenticated — that's fine for a public page
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-12">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Contactez-nous</h1>
          <p className="mt-2 text-muted-foreground">
            Une question, un retour ou besoin d&apos;aide ? Nous serions ravis
            de vous entendre.
          </p>
        </div>
        <ContactForm prefill={prefill} />
      </div>
    </main>
  );
}
