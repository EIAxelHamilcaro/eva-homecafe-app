import { useRouter } from "expo-router";
import { ArrowLeft, Check, Mail, Send, UserPlus } from "lucide-react-native";
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
import { useSendFriendRequest } from "@/lib/api/hooks/use-friends";
import type { SendFriendRequestStatus } from "@/types/friend";

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
  const [email, setEmail] = useState("");
  const [resultStatus, setResultStatus] =
    useState<SendFriendRequestStatus | null>(null);

  const sendRequestMutation = useSendFriendRequest();

  const handleGoBack = useCallback(() => {
    router.back();
  }, [router]);

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

  const isValidEmail = email.includes("@") && email.includes(".");
  const canSubmitEmail = isValidEmail && !sendRequestMutation.isPending;

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
                Si la personne a un compte, une demande sera envoyee. Sinon, un
                email d'invitation lui sera envoye.
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
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
