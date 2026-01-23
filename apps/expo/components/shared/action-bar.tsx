import { Heart, MessageCircle, Repeat2, Send } from "lucide-react-native";
import { Pressable, View, type ViewProps } from "react-native";

import { colors } from "@/src/config/colors";
import { cn } from "@/src/libs/utils";

type ActionBarProps = ViewProps & {
  liked?: boolean;
  onLikePress?: () => void;
  onCommentPress?: () => void;
  onRepostPress?: () => void;
  onSharePress?: () => void;
  className?: string;
  iconSize?: number;
  iconColor?: string;
  likedColor?: string;
};

function ActionBar({
  liked = false,
  onLikePress,
  onCommentPress,
  onRepostPress,
  onSharePress,
  className,
  iconSize = 22,
  iconColor = colors.icon.default,
  likedColor = colors.icon.active,
  ...props
}: ActionBarProps) {
  return (
    <View
      className={cn(
        "flex-row items-center justify-around bg-blue-100/50 py-3 rounded-lg",
        className,
      )}
      {...props}
    >
      <Pressable
        onPress={onLikePress}
        className="items-center justify-center p-2 active:opacity-60"
        hitSlop={8}
      >
        <Heart
          size={iconSize}
          color={liked ? likedColor : iconColor}
          fill={liked ? likedColor : "transparent"}
        />
      </Pressable>

      <Pressable
        onPress={onCommentPress}
        className="items-center justify-center p-2 active:opacity-60"
        hitSlop={8}
      >
        <MessageCircle size={iconSize} color={iconColor} />
      </Pressable>

      <Pressable
        onPress={onRepostPress}
        className="items-center justify-center p-2 active:opacity-60"
        hitSlop={8}
      >
        <Repeat2 size={iconSize} color={iconColor} />
      </Pressable>

      <Pressable
        onPress={onSharePress}
        className="items-center justify-center p-2 active:opacity-60"
        hitSlop={8}
      >
        <Send size={iconSize} color={iconColor} />
      </Pressable>
    </View>
  );
}

export { ActionBar, type ActionBarProps };
