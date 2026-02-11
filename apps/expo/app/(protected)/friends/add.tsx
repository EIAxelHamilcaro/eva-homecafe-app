import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Check,
  Link,
  Mail,
  Send,
  UserPlus,
} from "lucide-react-native";
import { useCallback, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/ui/button";
import { friendRequestKeys } from "@/lib/api/hooks/query-keys";
import { useSendFriendRequest } from "@/lib/api/hooks/use-friends";
import { useAcceptInvite } from "@/lib/api/hooks/use-invite";
import {
  isAlreadyFriendsError,
  mapInviteApiError,
} from "@/lib/utils/invite-errors";
import { extractTokenFromInput } from "@/lib/utils/invite-token";
import type { SendFriendRequestStatus } from "@/types/friend";

type InputMode = "email" | "code";

const STATUS_MESSAGES: Record<SendFriendRequestStatus, string> = {
  request_sent: "Demande d'ami envoyee !",
  invitation_sent: "Invitation envoyee par email !",
  already_friends: "Vous etes deja amis !",
};

const STATUS_ICONS: Record<SendFriendRequestStatus, typeof Check> = {
  request_sent: UserPlus,
  invitation_sent: Mail,
  already_friends: Check,
};

export default function AddFriendScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<InputMode>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [resultStatus, setResultStatus] =
    useState<SendFriendRequestStatus | null>(null);
  const [codeSuccess, setCodeSuccess] = useState(false);
  const [codeSuccessMessage, setCodeSuccessMessage] = useState("");
  const [codeError, setCodeError] = useState<string | null>(null);

  const sendRequestMutation = useSendFriendRequest();
  const acceptInviteMutation = useAcceptInvite();

  const handleGoBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleModeChange = useCallback(
    (newMode: InputMode) => {
      if (newMode === mode) return;
      setMode(newMode);
      setResultStatus(null);
      setCodeSuccess(false);
      setCodeError(null);
      sendRequestMutation.reset();
      acceptInviteMutation.reset();
    },
    [mode, sendRequestMutation, acceptInviteMutation],
  );

  const handleSendRequest = useCallback(() => {
    if (!email.trim()) return;

    setResultStatus(null);
    sendRequestMutation.mutate(
      { receiverEmail: email.trim() },
      {
        onSuccess: (data) => {
          setResultStatus(data.status);
          if (data.status !== "already_friends") {
            setEmail("");
          }
        },
      },
    );
  }, [email, sendRequestMutation]);

  const handleAcceptCode = useCallback(() => {
    if (!code.trim()) return;

    const token = extractTokenFromInput(code);
    if (!token || token.length < 20) {
      setCodeError("Code d'invitation invalide");
      return;
    }

    setCodeSuccess(false);
    setCodeError(null);

    acceptInviteMutation.mutate(
      { token },
      {
        onSuccess: () => {
          setCodeSuccess(true);
          setCodeSuccessMessage("Ami ajoute avec succes !");
          setCode("");
          queryClient.invalidateQueries({
            queryKey: friendRequestKeys.all,
          });
        },
        onError: (error) => {
          const msg = error?.message ?? "";
          if (isAlreadyFriendsError(msg)) {
            setCodeSuccess(true);
            setCodeSuccessMessage("Vous etes deja amis !");
            setCode("");
          } else {
            setCodeError(mapInviteApiError(msg));
          }
        },
      },
    );
  }, [code, acceptInviteMutation, queryClient]);

  const isValidEmail = email.includes("@") && email.includes(".");
  const canSubmitEmail = isValidEmail && !sendRequestMutation.isPending;
  const canSubmitCode =
    code.trim().length > 0 && !acceptInviteMutation.isPending;

  const StatusIcon = resultStatus ? STATUS_ICONS[resultStatus] : null;

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
          Ajouter un ami
        </Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View className="flex-1 px-4 py-6">
            <View className="mb-6 flex-row rounded-xl bg-muted p-1">
              <Pressable
                onPress={() => handleModeChange("email")}
                className={`flex-1 items-center rounded-lg py-2.5 ${
                  mode === "email" ? "bg-white shadow-sm" : ""
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    mode === "email"
                      ? "text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  Email
                </Text>
              </Pressable>
              <Pressable
                onPress={() => handleModeChange("code")}
                className={`flex-1 items-center rounded-lg py-2.5 ${
                  mode === "code" ? "bg-white shadow-sm" : ""
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    mode === "code"
                      ? "text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  Code d'invitation
                </Text>
              </Pressable>
            </View>

            {mode === "email" ? (
              <>
                <View className="mb-6">
                  <Text className="mb-2 text-sm font-medium text-foreground">
                    Adresse email
                  </Text>
                  <View className="flex-row items-center rounded-xl border border-border bg-white px-4">
                    <Mail size={20} color="#9CA3AF" />
                    <TextInput
                      className="ml-3 flex-1 py-4 text-base text-foreground"
                      placeholder="ami@exemple.com"
                      placeholderTextColor="#9CA3AF"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      autoComplete="email"
                      returnKeyType="send"
                      onSubmitEditing={
                        canSubmitEmail ? handleSendRequest : undefined
                      }
                      editable={!sendRequestMutation.isPending}
                    />
                  </View>
                  <Text className="mt-2 text-xs text-muted-foreground">
                    Entrez l'adresse email de la personne que vous souhaitez
                    ajouter
                  </Text>
                </View>

                <Button
                  variant="default"
                  onPress={handleSendRequest}
                  disabled={!canSubmitEmail}
                  loading={sendRequestMutation.isPending}
                  className="mb-4"
                >
                  <View className="flex-row items-center gap-2">
                    <Send size={18} color="#FFFFFF" />
                    <Text className="font-medium text-white">
                      Envoyer la demande
                    </Text>
                  </View>
                </Button>

                {resultStatus && (
                  <View className="rounded-xl bg-green-50 p-4">
                    <View className="flex-row items-center">
                      {StatusIcon && (
                        <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-green-100">
                          <StatusIcon size={20} color="#22C55E" />
                        </View>
                      )}
                      <View className="flex-1">
                        <Text className="font-medium text-green-800">
                          {STATUS_MESSAGES[resultStatus]}
                        </Text>
                        {resultStatus === "invitation_sent" && (
                          <Text className="mt-1 text-sm text-green-600">
                            Un email d'invitation a ete envoye
                          </Text>
                        )}
                      </View>
                    </View>
                  </View>
                )}

                {sendRequestMutation.isError && (
                  <View className="rounded-xl bg-red-50 p-4">
                    <Text className="font-medium text-red-800">
                      Erreur lors de l'envoi
                    </Text>
                    <Text className="mt-1 text-sm text-red-600">
                      {sendRequestMutation.error?.message ||
                        "Une erreur est survenue"}
                    </Text>
                  </View>
                )}
              </>
            ) : (
              <>
                <View className="mb-6">
                  <Text className="mb-2 text-sm font-medium text-foreground">
                    Code d'invitation
                  </Text>
                  <View className="flex-row items-center rounded-xl border border-border bg-white px-4">
                    <Link size={20} color="#9CA3AF" />
                    <TextInput
                      className="ml-3 flex-1 py-4 text-base text-foreground"
                      placeholder="Collez le code d'invitation"
                      placeholderTextColor="#9CA3AF"
                      value={code}
                      onChangeText={setCode}
                      autoCapitalize="none"
                      autoCorrect={false}
                      returnKeyType="send"
                      onSubmitEditing={
                        canSubmitCode ? handleAcceptCode : undefined
                      }
                      editable={!acceptInviteMutation.isPending}
                    />
                  </View>
                  <Text className="mt-2 text-xs text-muted-foreground">
                    Entrez le code d'invitation partage par votre ami
                  </Text>
                </View>

                <Button
                  variant="default"
                  onPress={handleAcceptCode}
                  disabled={!canSubmitCode}
                  loading={acceptInviteMutation.isPending}
                  className="mb-4"
                >
                  <View className="flex-row items-center gap-2">
                    <UserPlus size={18} color="#FFFFFF" />
                    <Text className="font-medium text-white">
                      Accepter l'invitation
                    </Text>
                  </View>
                </Button>

                {codeSuccess && (
                  <View className="rounded-xl bg-green-50 p-4">
                    <View className="flex-row items-center">
                      <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-green-100">
                        <Check size={20} color="#22C55E" />
                      </View>
                      <Text className="flex-1 font-medium text-green-800">
                        {codeSuccessMessage}
                      </Text>
                    </View>
                  </View>
                )}

                {codeError && (
                  <View className="rounded-xl bg-red-50 p-4">
                    <Text className="font-medium text-red-800">Erreur</Text>
                    <Text className="mt-1 text-sm text-red-600">
                      {codeError}
                    </Text>
                  </View>
                )}
              </>
            )}
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
