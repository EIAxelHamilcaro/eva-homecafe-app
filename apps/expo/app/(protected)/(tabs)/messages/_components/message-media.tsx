import { Image, Pressable, useWindowDimensions, View } from "react-native";
import type { Attachment } from "@/constants/chat";

interface MessageMediaProps {
  attachments: Attachment[];
  onImagePress: (index: number) => void;
}

export function MessageMedia({ attachments, onImagePress }: MessageMediaProps) {
  const { width: screenWidth } = useWindowDimensions();
  const maxWidth = screenWidth * 0.65;

  if (attachments.length === 0) {
    return null;
  }

  if (attachments.length === 1) {
    const attachment = attachments[0];
    if (!attachment) return null;

    const aspectRatio =
      attachment.dimensions?.width && attachment.dimensions?.height
        ? attachment.dimensions.width / attachment.dimensions.height
        : 1;

    const imageWidth = maxWidth;
    const imageHeight = imageWidth / aspectRatio;
    const constrainedHeight = Math.min(imageHeight, maxWidth * 1.5);

    return (
      <Pressable
        onPress={() => onImagePress(0)}
        className="mb-1 overflow-hidden rounded-lg"
      >
        <Image
          source={{ uri: attachment.url }}
          style={{
            width: imageWidth,
            height: constrainedHeight,
          }}
          resizeMode="cover"
        />
      </Pressable>
    );
  }

  if (attachments.length === 2) {
    const gap = 2;
    const itemWidth = (maxWidth - gap) / 2;
    const itemHeight = itemWidth;

    return (
      <View
        className="mb-1 flex-row overflow-hidden rounded-lg"
        style={{ gap }}
      >
        {attachments.map((attachment, index) => (
          <Pressable key={attachment.id} onPress={() => onImagePress(index)}>
            <Image
              source={{ uri: attachment.url }}
              style={{
                width: itemWidth,
                height: itemHeight,
              }}
              resizeMode="cover"
            />
          </Pressable>
        ))}
      </View>
    );
  }

  if (attachments.length === 3) {
    const gap = 2;
    const largeWidth = (maxWidth * 2) / 3;
    const smallWidth = maxWidth / 3 - gap;
    const smallHeight = (largeWidth - gap) / 2;

    return (
      <View
        className="mb-1 flex-row overflow-hidden rounded-lg"
        style={{ gap }}
      >
        <Pressable onPress={() => onImagePress(0)}>
          <Image
            source={{ uri: attachments[0]?.url }}
            style={{
              width: largeWidth,
              height: largeWidth,
            }}
            resizeMode="cover"
          />
        </Pressable>
        <View style={{ gap }}>
          {[1, 2].map((idx) => {
            const attachment = attachments[idx];
            if (!attachment) return null;
            return (
              <Pressable key={attachment.id} onPress={() => onImagePress(idx)}>
                <Image
                  source={{ uri: attachment.url }}
                  style={{
                    width: smallWidth,
                    height: smallHeight,
                  }}
                  resizeMode="cover"
                />
              </Pressable>
            );
          })}
        </View>
      </View>
    );
  }

  const gap = 2;
  const itemWidth = (maxWidth - gap) / 2;
  const itemHeight = itemWidth;
  const visibleAttachments = attachments.slice(0, 4);
  const remainingCount = attachments.length - 4;

  return (
    <View
      className="mb-1 flex-row flex-wrap overflow-hidden rounded-lg"
      style={{ gap }}
    >
      {visibleAttachments.map((attachment, index) => (
        <Pressable
          key={attachment.id}
          onPress={() => onImagePress(index)}
          className="relative"
        >
          <Image
            source={{ uri: attachment.url }}
            style={{
              width: itemWidth,
              height: itemHeight,
            }}
            resizeMode="cover"
          />
          {index === 3 && remainingCount > 0 && (
            <View className="absolute inset-0 items-center justify-center bg-black/50">
              <View className="text-xl font-bold text-white">
                +{remainingCount}
              </View>
            </View>
          )}
        </Pressable>
      ))}
    </View>
  );
}
