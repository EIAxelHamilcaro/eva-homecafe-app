import { type Href, useRouter } from "expo-router";
import {
  Calendar,
  ImageIcon,
  ListTodo,
  MessageCircle,
  Mountain,
  Pen,
  Smile,
} from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

type WidgetType =
  | "gallery"
  | "tasks"
  | "messages"
  | "mood"
  | "calendar"
  | "journal"
  | "moodboard";

interface WidgetEmptyStateProps {
  type: WidgetType;
}

const CONFIG: Record<
  WidgetType,
  {
    icon: typeof ImageIcon;
    title: string;
    message: string;
    cta: string;
    href: Href;
    ctaColor: string;
  }
> = {
  gallery: {
    icon: Mountain,
    title: "Galerie",
    message: "Tes plus belles photos, c'est ici !",
    cta: "Voir plus",
    href: "/(protected)/galerie" as Href,
    ctaColor: "bg-homecafe-pink",
  },
  tasks: {
    icon: ListTodo,
    title: "To do list",
    message: "Crée ta première liste pour t'organiser.",
    cta: "Créer",
    href: "/organisation" as Href,
    ctaColor: "bg-homecafe-pink",
  },
  messages: {
    icon: MessageCircle,
    title: "Messagerie",
    message: "Aucun message non lu",
    cta: "Voir plus",
    href: "/(protected)/(tabs)/messages" as Href,
    ctaColor: "bg-homecafe-pink",
  },
  mood: {
    icon: Smile,
    title: "Suivi",
    message: "Enregistre ton humeur pour voir tes tendances.",
    cta: "Commencer",
    href: "/(protected)/moodboard" as Href,
    ctaColor: "bg-homecafe-green",
  },
  calendar: {
    icon: Calendar,
    title: "Calendrier",
    message: "Ajoute une tâche avec une date pour la voir ici.",
    cta: "Ajouter",
    href: "/organisation" as Href,
    ctaColor: "bg-homecafe-green",
  },
  journal: {
    icon: Pen,
    title: "Journal",
    message: "Écris ta première entrée ci-dessous.",
    cta: "Écrire",
    href: "/(protected)/(tabs)/journal" as Href,
    ctaColor: "bg-homecafe-pink",
  },
  moodboard: {
    icon: ImageIcon,
    title: "Moodboard",
    message: "Crée un moodboard visuel pour t'exprimer.",
    cta: "Créer",
    href: "/(protected)/inspirations" as Href,
    ctaColor: "bg-homecafe-pink",
  },
};

export function WidgetEmptyState({ type }: WidgetEmptyStateProps) {
  const router = useRouter();
  const config = CONFIG[type];
  const Icon = config.icon;

  return (
    <View className="rounded-2xl bg-card p-4">
      <Text className="text-lg font-semibold text-foreground">
        {config.title}
      </Text>
      <View className="items-center py-6">
        <Icon size={32} color="#B8A898" strokeWidth={1.5} />
        <Text className="mt-2 text-sm font-medium text-muted-foreground">
          {config.message}
        </Text>
      </View>
      <Pressable
        onPress={() => router.push(config.href)}
        className={`self-start rounded-full ${config.ctaColor} px-4 py-1.5 active:opacity-90`}
      >
        <Text className="text-sm font-medium text-white">{config.cta}</Text>
      </Pressable>
    </View>
  );
}
