import { Button } from "@packages/ui/components/ui/button";
import Link from "next/link";

export function CtaSection() {
  return (
    <section aria-label="Appel à l'action" className="bg-white py-14 lg:py-20">
      <div className="text-center">
        <Button
          asChild
          size="lg"
          className="rounded-full bg-homecafe-pink px-8 text-white shadow-md hover:bg-homecafe-pink/80"
        >
          <Link href="/register">Tester HomeCaf&eacute;</Link>
        </Button>
      </div>
    </section>
  );
}
