import { router } from "expo-router";
import { Image, X } from "lucide-react-native";
import { Pressable, SafeAreaView, ScrollView, View } from "react-native";

interface GalleryImageData {
  id: string;
  height: "small" | "medium" | "large";
}

const mockImages: GalleryImageData[] = [
  { id: "1", height: "large" },
  { id: "2", height: "small" },
  { id: "3", height: "large" },
  { id: "4", height: "medium" },
  { id: "5", height: "large" },
  { id: "6", height: "medium" },
  { id: "7", height: "small" },
  { id: "8", height: "large" },
];

const heightMap = {
  small: 80,
  medium: 140,
  large: 180,
};

function ImagePlaceholder({
  height,
}: {
  height: "small" | "medium" | "large";
}) {
  return (
    <View
      className="mb-3 w-full items-center justify-center rounded-2xl"
      style={{
        height: heightMap[height],
        backgroundColor: "#F5E6D3",
      }}
    >
      <Image size={32} color="#FFFFFF" strokeWidth={1.5} />
    </View>
  );
}

export default function GalerieModal() {
  const handleClose = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(protected)/(tabs)");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1">
        {/* Close button */}
        <View className="absolute right-4 top-4 z-10">
          <Pressable
            onPress={handleClose}
            className="h-10 w-10 items-center justify-center rounded-full border border-homecafe-pink bg-background active:bg-muted"
            accessibilityRole="button"
            accessibilityLabel="Fermer"
          >
            <X size={20} color="#3D2E2E" strokeWidth={2} />
          </Pressable>
        </View>

        {/* Image grid */}
        <ScrollView
          className="flex-1 px-6 pt-16"
          contentContainerStyle={{ paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        >
          {mockImages.map((image) => (
            <ImagePlaceholder key={image.id} height={image.height} />
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
