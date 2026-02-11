import { useQueryClient } from "@tanstack/react-query";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import { ArrowLeft, Camera, CheckCircle, XCircle } from "lucide-react-native";
import { useCallback, useRef, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/ui/button";
import { friendRequestKeys } from "@/lib/api/hooks/query-keys";
import { useAcceptInvite } from "@/lib/api/hooks/use-invite";
import {
  isAlreadyFriendsError,
  mapInviteApiError,
} from "@/lib/utils/invite-errors";
import { extractTokenFromUrl } from "@/lib/utils/invite-token";

type ScanStatus = "scanning" | "processing" | "success" | "error";

function PermissionDenied({
  onRequestPermission,
}: {
  onRequestPermission: () => void;
}) {
  return (
    <View className="flex-1 items-center justify-center px-8">
      <View className="mb-4 h-20 w-20 items-center justify-center rounded-full bg-muted">
        <Camera size={40} color="#9CA3AF" />
      </View>
      <Text className="mb-2 text-center text-lg font-semibold text-foreground">
        Acces camera requis
      </Text>
      <Text className="mb-6 text-center text-sm text-muted-foreground">
        Pour scanner un QR code, autorisez l'acces a la camera
      </Text>
      <Button variant="default" onPress={onRequestPermission}>
        <Text className="font-medium text-white">Autoriser la camera</Text>
      </Button>
    </View>
  );
}

function ScanResult({
  status,
  errorMessage,
  onScanAgain,
  onGoBack,
}: {
  status: "success" | "error";
  errorMessage?: string;
  onScanAgain: () => void;
  onGoBack: () => void;
}) {
  const isSuccess = status === "success";

  return (
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
        {isSuccess ? (
          <Button variant="default" onPress={onGoBack}>
            <Text className="font-medium text-white">Retour</Text>
          </Button>
        ) : (
          <>
            <Button variant="default" onPress={onScanAgain}>
              <Text className="font-medium text-white">Scanner a nouveau</Text>
            </Button>
            <Button variant="outline" onPress={onGoBack}>
              <Text className="font-medium text-foreground">Annuler</Text>
            </Button>
          </>
        )}
      </View>
    </View>
  );
}

export default function ScanQRCodeScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanStatus, setScanStatus] = useState<ScanStatus>("scanning");
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const isProcessingRef = useRef(false);

  const acceptInviteMutation = useAcceptInvite();

  const handleGoBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleBarCodeScanned = useCallback(
    async ({ data }: { data: string }) => {
      if (scanStatus !== "scanning" || isProcessingRef.current) return;
      isProcessingRef.current = true;

      const token = extractTokenFromUrl(data);
      if (!token) {
        setScanStatus("error");
        const looksLikeUrl = data.startsWith("http") || data.includes("://");
        setErrorMessage(
          looksLikeUrl ? "Lien d'invitation invalide" : "QR code non reconnu",
        );
        return;
      }

      setScanStatus("processing");

      acceptInviteMutation.mutate(
        { token },
        {
          onSuccess: () => {
            setScanStatus("success");
            queryClient.invalidateQueries({
              queryKey: friendRequestKeys.all,
            });
          },
          onError: (error) => {
            if (isAlreadyFriendsError(error?.message ?? "")) {
              setScanStatus("success");
            } else {
              setScanStatus("error");
              setErrorMessage(mapInviteApiError(error?.message ?? ""));
            }
          },
        },
      );
    },
    [scanStatus, acceptInviteMutation, queryClient],
  );

  const handleScanAgain = useCallback(() => {
    isProcessingRef.current = false;
    setScanStatus("scanning");
    setErrorMessage(undefined);
  }, []);

  if (!permission) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
        <View className="flex-1 items-center justify-center">
          <Text className="text-muted-foreground">Chargement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const showCamera = permission.granted && scanStatus === "scanning";
  const showResult = scanStatus === "success" || scanStatus === "error";

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
          Scanner un QR Code
        </Text>
      </View>

      <View className="flex-1">
        {!permission.granted ? (
          <PermissionDenied onRequestPermission={requestPermission} />
        ) : showResult ? (
          <ScanResult
            status={scanStatus as "success" | "error"}
            errorMessage={errorMessage}
            onScanAgain={handleScanAgain}
            onGoBack={handleGoBack}
          />
        ) : showCamera ? (
          <View className="flex-1">
            <CameraView
              style={{ flex: 1 }}
              facing="back"
              barcodeScannerSettings={{
                barcodeTypes: ["qr"],
              }}
              onBarcodeScanned={handleBarCodeScanned}
            >
              <View className="flex-1 items-center justify-center">
                <View className="h-64 w-64 rounded-3xl border-4 border-white/50" />
                <Text className="mt-6 text-center text-white">
                  Placez le QR code dans le cadre
                </Text>
              </View>
            </CameraView>
          </View>
        ) : (
          <View className="flex-1 items-center justify-center">
            <Text className="text-muted-foreground">
              Traitement en cours...
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
