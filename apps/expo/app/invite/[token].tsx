import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import { CheckCircle, Loader2, UserPlus, XCircle } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/ui/button";
import { useAcceptInvite } from "@/lib/api/hooks/use-invite";
import { useAuth } from "@/src/providers/auth-provider";

type InviteStatus = "loading" | "processing" | "success" | "error";

export default function InviteScreen() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [status, setStatus] = useState<InviteStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  const acceptInviteMutation = useAcceptInvite();

  useEffect(() => {
    if (isAuthLoading) return;

    if (!isAuthenticated) {
      return;
    }

    if (!token) {
      setStatus("error");
      setErrorMessage("Lien d'invitation invalide");
      return;
    }

    setStatus("processing");

    acceptInviteMutation.mutate(
      { token },
      {
        onSuccess: () => {
          setStatus("success");
        },
        onError: (error) => {
          setStatus("error");
          setErrorMessage(error?.message || "Une erreur est survenue");
        },
      },
    );
  }, [token, isAuthenticated, isAuthLoading, acceptInviteMutation]);

  if (isAuthLoading || status === "loading") {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 items-center justify-center px-8">
          <View className="mb-4 h-20 w-20 items-center justify-center rounded-full bg-muted">
            <Loader2 size={40} color="#F691C3" className="animate-spin" />
          </View>
          <Text className="text-center text-lg font-semibold text-foreground">
            Chargement...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href={`/(auth)/register?invite=${token}`} />;
  }

  if (status === "processing") {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 items-center justify-center px-8">
          <View className="mb-4 h-20 w-20 items-center justify-center rounded-full bg-pink-100">
            <UserPlus size={40} color="#F691C3" />
          </View>
          <Text className="mb-2 text-center text-lg font-semibold text-foreground">
            Ajout de l'ami...
          </Text>
          <Text className="text-center text-sm text-muted-foreground">
            Veuillez patienter
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const isSuccess = status === "success";

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 items-center justify-center px-8">
        <View
          className={`mb-4 h-20 w-20 items-center justify-center rounded-full ${
            isSuccess ? "bg-green-100" : "bg-red-100"
          }`}
        >
          {isSuccess ? (
            <CheckCircle size={40} color="#22C55E" />
          ) : (
            <XCircle size={40} color="#EF4444" />
          )}
        </View>
        <Text className="mb-2 text-center text-lg font-semibold text-foreground">
          {isSuccess ? "Ami ajoute !" : "Erreur"}
        </Text>
        <Text className="mb-6 text-center text-sm text-muted-foreground">
          {isSuccess
            ? "Vous etes maintenant amis"
            : errorMessage || "Impossible d'ajouter cet ami"}
        </Text>
        <View className="w-full gap-3">
          <Button
            variant="default"
            onPress={() => router.replace("/(protected)/(tabs)")}
          >
            <Text className="font-medium text-white">
              {isSuccess ? "Voir mes amis" : "Retour a l'accueil"}
            </Text>
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}
