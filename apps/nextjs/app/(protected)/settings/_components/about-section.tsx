"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@packages/ui/components/ui/card";
import { ChevronRight } from "lucide-react";

export function AboutSection() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">À propos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-muted-foreground text-sm">
          Version de l'application 1.0.0
        </p>

        <button
          type="button"
          className="flex w-full items-center justify-between py-1 text-sm hover:opacity-70"
        >
          <span>Mentions légales</span>
          <ChevronRight className="size-4 text-muted-foreground" />
        </button>

        <button
          type="button"
          className="flex w-full items-center justify-between py-1 text-sm hover:opacity-70"
        >
          <span>Politique de confidentialité</span>
          <ChevronRight className="size-4 text-muted-foreground" />
        </button>

        <button
          type="button"
          className="flex w-full items-center justify-between py-1 text-sm hover:opacity-70"
        >
          <span>Centre d'aide</span>
          <ChevronRight className="size-4 text-muted-foreground" />
        </button>
      </CardContent>
    </Card>
  );
}
