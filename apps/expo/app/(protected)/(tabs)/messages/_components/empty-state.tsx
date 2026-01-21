import { MessageCircle, PenSquare, Search } from "lucide-react-native";
import { Text, View } from "react-native";

interface EmptyStateProps {
  icon: "messages" | "conversation" | "search";
  title: string;
  description: string;
}

export function EmptyState({ icon, title, description }: EmptyStateProps) {
  const IconComponent = {
    messages: MessageCircle,
    conversation: PenSquare,
    search: Search,
  }[icon];

  return (
    <View className="flex-1 items-center justify-center px-8 py-20">
      <View className="mb-4 h-20 w-20 items-center justify-center rounded-full bg-muted">
        <IconComponent size={40} color="#9CA3AF" />
      </View>
      <Text className="mb-2 text-center text-lg font-semibold text-foreground">
        {title}
      </Text>
      <Text className="text-center text-sm leading-5 text-muted-foreground">
        {description}
      </Text>
    </View>
  );
}

export function NoConversationsEmpty() {
  return (
    <EmptyState
      icon="messages"
      title="Aucune conversation"
      description="Appuyez sur le bouton + pour démarrer une nouvelle conversation"
    />
  );
}

export function NoMessagesEmpty() {
  return (
    <EmptyState
      icon="conversation"
      title="Aucun message"
      description="Envoyez un message pour démarrer la conversation"
    />
  );
}

export function NoSearchResultsEmpty() {
  return (
    <EmptyState
      icon="search"
      title="Aucun résultat"
      description="Essayez avec un autre terme de recherche"
    />
  );
}

export function SearchPromptEmpty() {
  return (
    <EmptyState
      icon="search"
      title="Rechercher"
      description="Tapez au moins 2 caractères pour rechercher"
    />
  );
}
