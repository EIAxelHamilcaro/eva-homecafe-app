import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@packages/ui/components/ui/card";
import { Eye, Mountain } from "lucide-react";
import Link from "next/link";

type WidgetType =
  | "mood"
  | "posts"
  | "tasks"
  | "gallery"
  | "messages"
  | "calendar"
  | "journal"
  | "moodboard";

interface WidgetEmptyStateProps {
  type: WidgetType;
}

export function WidgetEmptyState({ type }: WidgetEmptyStateProps) {
  switch (type) {
    case "gallery":
      return <GalleryPlaceholder />;
    case "tasks":
      return <TasksPlaceholder />;
    case "messages":
      return <MessagesPlaceholder />;
    case "mood":
      return <MoodPlaceholder />;
    case "calendar":
      return <CalendarPlaceholder />;
    default:
      return <GenericPlaceholder type={type} />;
  }
}

function GalleryPlaceholder() {
  return (
    <Card className="border-0">
      <CardHeader>
        <CardTitle>Galerie</CardTitle>
        <p className="text-sm text-muted-foreground">
          Tes plus belles photos, c'est ici !
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          {["a", "b", "c", "d"].map((id) => (
            <div
              key={id}
              className="flex aspect-square items-center justify-center rounded-md bg-homecafe-beige"
            >
              <Mountain className="h-8 w-8 text-homecafe-beige/0 stroke-white" />
            </div>
          ))}
        </div>
        <Link
          href="/gallery"
          className="mt-4 inline-block rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-white hover:opacity-90"
        >
          Voir plus
        </Link>
      </CardContent>
    </Card>
  );
}

function TasksPlaceholder() {
  return (
    <Card className="border-0">
      <CardHeader>
        <CardTitle>To do list</CardTitle>
        <p className="text-sm text-muted-foreground">
          Ceci est un affichage restreint
        </p>
      </CardHeader>
      <CardContent>
        <div className="py-4 text-center">
          <p className="font-medium text-muted-foreground">Aucune tâche</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Crée ta première liste pour t'organiser.
          </p>
        </div>
        <Link
          href="/organization"
          className="mt-2 inline-block rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-white hover:opacity-90"
        >
          Créer
        </Link>
      </CardContent>
    </Card>
  );
}

function MessagesPlaceholder() {
  return (
    <Card className="border-0">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Messagerie</h3>
            <p className="text-sm text-muted-foreground">
              Ceci est un affichage restreint
            </p>
          </div>
          <Eye className="h-5 w-5 text-muted-foreground" />
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          Aucun message non lu
        </p>
        <Link
          href="/messages"
          className="mt-4 inline-block rounded-full bg-homecafe-green px-4 py-1.5 text-sm font-medium text-white hover:opacity-90"
        >
          Voir plus
        </Link>
      </CardContent>
    </Card>
  );
}

function MoodPlaceholder() {
  const months = ["Jan.", "Fév.", "Mars", "Avril", "Mai", "Juin"];
  const heights = [60, 70, 45, 65, 30, 80];

  return (
    <Card className="border-0">
      <CardContent className="pt-6">
        <h3 className="text-lg font-semibold">Suivi</h3>
        <p className="text-sm text-muted-foreground">
          Moodboard janvier &rarr; juin {new Date().getFullYear()}
        </p>
        <div className="mt-4 flex h-[120px] items-end justify-between gap-2">
          {months.map((label, i) => (
            <div key={label} className="flex flex-1 flex-col items-center">
              <div
                className="w-6 rounded-t bg-muted"
                style={{ height: `${heights[i]}%` }}
              />
              <span className="mt-1 text-[10px] text-muted-foreground">
                {label}
              </span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          En hausse de 5,2% ce mois-ci &#8599;
        </p>
      </CardContent>
    </Card>
  );
}

function CalendarPlaceholder() {
  return (
    <Card className="border-0">
      <CardContent className="pt-6">
        <div className="py-4 text-center">
          <p className="font-medium text-muted-foreground">Aucun événement</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Ajoute une tâche avec une date pour la voir ici.
          </p>
          <Link
            href="/organization"
            className="mt-3 inline-block rounded-full bg-homecafe-green px-4 py-1.5 text-sm font-medium text-white hover:opacity-90"
          >
            Ajouter
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

function GenericPlaceholder({ type }: { type: WidgetType }) {
  const config: Record<
    string,
    { title: string; message: string; href?: string }
  > = {
    posts: {
      title: "Posts récents",
      message: "Écris ton premier post pour le voir ici.",
      href: "/posts/new",
    },
    journal: {
      title: "Journal",
      message: "Écris ta première entrée ci-dessous.",
    },
    moodboard: {
      title: "Moodboard",
      message: "Crée un moodboard visuel pour t'exprimer.",
      href: "/moodboard",
    },
  };

  const c = config[type] ?? { title: type, message: "" };

  return (
    <Card className="border-0">
      <CardHeader>
        <CardTitle>{c.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{c.message}</p>
        {c.href && (
          <Link
            href={c.href}
            className="mt-3 inline-block rounded-full bg-homecafe-green px-4 py-1.5 text-sm font-medium text-white hover:opacity-90"
          >
            Voir plus
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
