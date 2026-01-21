import { X } from "lucide-react-native";
import { useState } from "react";
import {
  Dimensions,
  Image,
  Modal,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { Attachment } from "@/constants/chat";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface ImageViewerProps {
  visible: boolean;
  images: Attachment[];
  initialIndex: number;
  onClose: () => void;
}

export function ImageViewer({
  visible,
  images,
  initialIndex,
  onClose,
}: ImageViewerProps) {
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const handleScroll = (event: {
    nativeEvent: { contentOffset: { x: number } };
  }) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setCurrentIndex(index);
  };

  if (images.length === 0) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black">
        <Pressable
          onPress={onClose}
          className="absolute z-10 h-10 w-10 items-center justify-center rounded-full bg-black/50"
          style={{ top: insets.top + 10, right: 16 }}
        >
          <X size={24} color="#FFFFFF" />
        </Pressable>

        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScroll}
          contentOffset={{ x: initialIndex * SCREEN_WIDTH, y: 0 }}
        >
          {images.map((image) => (
            <View
              key={image.id}
              style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT }}
              className="items-center justify-center"
            >
              <Image
                source={{ uri: image.url }}
                style={{
                  width: SCREEN_WIDTH,
                  height: SCREEN_HEIGHT * 0.8,
                }}
                resizeMode="contain"
              />
            </View>
          ))}
        </ScrollView>

        {images.length > 1 && (
          <View
            className="absolute w-full flex-row items-center justify-center"
            style={{ bottom: insets.bottom + 20 }}
          >
            {images.map((image, index) => (
              <View
                key={`dot-${image.id}`}
                className={`mx-1 h-2 w-2 rounded-full ${
                  index === currentIndex ? "bg-white" : "bg-white/40"
                }`}
              />
            ))}
          </View>
        )}
      </View>
    </Modal>
  );
}
