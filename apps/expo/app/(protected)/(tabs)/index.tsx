import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "components/ui/card";
import { ScrollView, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "src/providers/auth-provider";

export default function HomeScreen() {
  const { user } = useAuth();

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView className="flex-1 p-4">
        <Text className="mb-4 text-2xl font-bold text-foreground">
          Home Cafe
        </Text>
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Bienvenue {user?.name}</CardTitle>
            <CardDescription>Votre café préféré</CardDescription>
          </CardHeader>
          <CardContent>
            <Text className="text-foreground">{user?.email}</Text>
          </CardContent>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
