import { Redirect, useLocalSearchParams } from "expo-router";

export default function ResetPasswordIndex() {
  const { token } = useLocalSearchParams<{ token?: string }>();

  if (!token) {
    return <Redirect href="/(auth)/forgot-password" />;
  }

  return <Redirect href={`/(auth)/reset-password/${token}`} />;
}
