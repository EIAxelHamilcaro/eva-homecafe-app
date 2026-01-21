import { useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import { ArrowLeft, QrCode, Share2 } from "lucide-react-native";
import { useCallback } from "react";
import { Pressable, Text, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/ui/button";
import { useGenerateInvite } from "@/lib/api/hooks/use-invite";

function QRCodeSkeleton() {
  return (
    <View className="items-center justify-center">
      <View className="h-64 w-64 animate-pulse items-center justify-center rounded-2xl bg-muted">
        <QrCode size={48} color="#9CA3AF" />
      </View>
    </View>
  );
}

function QRCodeError({ onRetry }: { onRetry: () => void }) {
  return (
    <View className="items-center justify-center px-8">
      <View className="mb-4 h-20 w-20 items-center justify-center rounded-full bg-red-100">
        <QrCode size={40} color="#EF4444" />
      </View>
      <Text className="mb-2 text-center text-lg font-semibold text-foreground">
        Erreur
      </Text>
      <Text className="mb-6 text-center text-sm text-muted-foreground">
        Impossible de generer le QR code
      </Text>
      <Button variant="default" onPress={onRetry}>
        <Text className="font-medium text-white">Reessayer</Text>
      </Button>
    </View>
  );
}

export default function QRCodeScreen() {
  const router = useRouter();
  const { data, isLoading, isError, refetch } = useGenerateInvite();

  const handleGoBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleShare = useCallback(async () => {
    if (!data?.inviteUrl) return;

    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable) {
      await Sharing.shareAsync(data.inviteUrl, {
        dialogTitle: "Partager le lien d'invitation",
      });
    }
  }, [data?.inviteUrl]);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <View className="flex-row items-center border-b border-border px-4 py-3">
        <Pressable
          onPress={handleGoBack}
          className="mr-3 h-10 w-10 items-center justify-center rounded-full active:bg-muted"
        >
          <ArrowLeft size={24} color="#3D2E2E" />
        </Pressable>
        <Text className="text-xl font-semibold text-foreground">
          Mon QR Code
        </Text>
      </View>

      <View className="flex-1 items-center justify-center px-6">
        {isLoading ? (
          <QRCodeSkeleton />
        ) : isError ? (
          <QRCodeError onRetry={() => refetch()} />
        ) : data?.inviteUrl ? (
          <View className="items-center">
            <View className="mb-6 rounded-3xl bg-white p-6 shadow-lg">
              <QRCode
                value={data.inviteUrl}
                size={240}
                color="#3D2E2E"
                backgroundColor="#FFFFFF"
              />
            </View>

            <Text className="mb-2 text-center text-lg font-semibold text-foreground">
              Scannez pour m'ajouter
            </Text>
            <Text className="mb-8 text-center text-sm text-muted-foreground">
              Montrez ce QR code a vos amis pour qu'ils vous ajoutent
            </Text>

            <Button variant="outline" onPress={handleShare} className="w-full">
              <View className="flex-row items-center gap-2">
                <Share2 size={18} color="#3D2E2E" />
                <Text className="font-medium text-foreground">
                  Partager le lien
                </Text>
              </View>
            </Button>
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
}
