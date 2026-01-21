import { Button } from "components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "components/ui/card";
import { useSignOut } from "lib/api/hooks/use-auth";
import { ScrollView, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "src/providers/auth-provider";

export default function HomeScreen() {
  const { user } = useAuth();
  const signOutMutation = useSignOut();

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
          <CardFooter>
            <Button
              variant="destructive"
              onPress={() => signOutMutation.mutate()}
              loading={signOutMutation.isPending}
            >
              Se déconnecter
            </Button>
          </CardFooter>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
