import { useRouter } from "expo-router";
import { ChevronLeft, Search, Users } from "lucide-react-native";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CloseButton } from "@/components/messages/close-button";
import { RecipientItem } from "@/components/messages/recipient-item";
import { RecipientListSkeleton } from "@/components/messages/skeleton";
import type { Recipient } from "@/constants/chat";
import { useCreateConversation } from "@/lib/api/hooks/use-conversations";
import { useFriends } from "@/lib/api/hooks/use-friends";
import { useSearchRecipients } from "@/lib/api/hooks/use-recipients";
import { useToast } from "@/lib/toast/toast-context";

export default function NewMessageScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const createConversation = useCreateConversation({
    onError: () => {
      showToast("Impossible de créer la conversation", "error");
    },
  });

  const isSearchActive = searchQuery.length >= 2;

  const { data: searchData, isLoading: isSearching } = useSearchRecipients({
    query: searchQuery,
    enabled: isSearchActive,
  });

  const { data: friendsData, isLoading: isLoadingFriends } = useFriends();

  const recentFriends: Recipient[] = useMemo(() => {
    if (!friendsData?.friends) return [];
    return friendsData.friends.slice(0, 5).map((f) => ({
      id: f.userId,
      name: f.displayName ?? f.name ?? f.email,
      email: f.email,
      image: f.avatarUrl,
    }));
  }, [friendsData]);

  const displayedRecipients = isSearchActive
    ? (searchData?.recipients ?? [])
    : recentFriends;

  const isLoading = isSearchActive ? isSearching : isLoadingFriends;

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleSelectRecipient = useCallback(
    async (recipient: Recipient) => {
      const result = await createConversation.mutateAsync({
        recipientId: recipient.id,
      });

      router.replace({
        pathname: "/messages/[conversationId]",
        params: { conversationId: result.conversationId },
      });
    },
    [createConversation, router],
  );

  const renderItem = useCallback(
    ({ item }: { item: Recipient }) => (
      <RecipientItem
        recipient={item}
        onPress={() => handleSelectRecipient(item)}
      />
    ),
    [handleSelectRecipient],
  );

  const keyExtractor = useCallback((item: Recipient) => item.id, []);

  const ItemSeparator = useCallback(
    () => <View className="mx-4 h-px bg-border" />,
    [],
  );

  const ListEmptyComponent = useCallback(() => {
    if (isLoading) {
      return <RecipientListSkeleton />;
    }

    if (isSearchActive) {
      return (
        <View className="items-center gap-2 px-4 py-8">
          <Search size={32} color="#999" />
          <Text className="text-center text-sm text-muted-foreground">
            Aucun résultat pour "{searchQuery}"
          </Text>
        </View>
      );
    }

    return (
      <View className="items-center gap-2 px-4 py-8">
        <Users size={32} color="#999" />
        <Text className="text-center text-sm text-muted-foreground">
          Ajoutez des amis pour leur envoyer des messages
        </Text>
      </View>
    );
  }, [isLoading, isSearchActive, searchQuery]);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <View className="flex-row items-center justify-between border-b border-border px-2 py-3">
        <View className="flex-row items-center">
          <Pressable
            onPress={handleBack}
            className="h-10 w-10 items-center justify-center rounded-full active:bg-muted"
          >
            <ChevronLeft size={24} color="#000" />
          </Pressable>
          <Text className="ml-1 text-xl font-semibold text-foreground">
            Nouveau message
          </Text>
        </View>
        <CloseButton onPress={handleBack} />
      </View>

      <View className="flex-row items-center border-b border-border px-4 py-2">
        <Search size={16} color="#999" className="mr-2" />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Rechercher un ami..."
          placeholderTextColor="#999"
          className="flex-1 text-base text-foreground"
          autoCapitalize="none"
          autoCorrect={false}
          autoFocus
        />
      </View>

      <View className="px-4 py-3">
        <Text className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {isSearchActive ? "Résultats" : "Amis récents"}
        </Text>
      </View>

      <FlatList
        data={displayedRecipients}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ItemSeparatorComponent={ItemSeparator}
        ListEmptyComponent={ListEmptyComponent}
        keyboardShouldPersistTaps="handled"
      />

      {createConversation.isPending && (
        <View className="absolute inset-0 items-center justify-center bg-background/80">
          <ActivityIndicator size="large" color="#F691C3" />
        </View>
      )}
    </SafeAreaView>
  );
}
