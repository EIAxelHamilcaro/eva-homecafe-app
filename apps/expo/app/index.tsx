import { Button } from "components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "components/ui/card";
import { ScrollView, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 p-4">
        <Text className="text-2xl font-bold text-foreground mb-4">
          Home Cafe
        </Text>
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Bienvenue</CardTitle>
            <CardDescription>Votre café préféré</CardDescription>
          </CardHeader>
          <CardContent>
            <Text className="text-foreground">Contenu de la carte</Text>
          </CardContent>
          <CardFooter>
            <Button>Action</Button>
          </CardFooter>
        </Card>
        <Button variant="destructive">Test Button</Button>
      </ScrollView>
    </SafeAreaView>
  );
}
