import { X } from "lucide-react-native";
import { useEffect, useRef } from "react";
import {
  Animated,
  Pressable,
  Modal as RNModal,
  type StyleProp,
  View,
  type ViewProps,
  type ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { cn } from "@/src/libs/utils";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  animationType?: "none" | "slide" | "fade";
  showCloseButton?: boolean;
  className?: string;
  contentClassName?: string;
  style?: StyleProp<ViewStyle>;
};

function Modal({
  open,
  onClose,
  children,
  animationType = "fade",
  showCloseButton = true,
  className,
  contentClassName,
  style,
}: ModalProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (open) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }
  }, [open, fadeAnim]);

  return (
    <RNModal
      visible={open}
      transparent
      animationType={animationType}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View className={cn("flex-1 bg-black/50", className)} style={style}>
        <Animated.View
          style={[
            {
              opacity: fadeAnim,
              paddingTop: insets.top,
              paddingBottom: insets.bottom,
            },
          ]}
          className={cn("flex-1 bg-background", contentClassName)}
        >
          {showCloseButton && (
            <View
              className="absolute right-4 z-10"
              style={{ top: insets.top + 16 }}
            >
              <ModalCloseButton onPress={onClose} />
            </View>
          )}
          {children}
        </Animated.View>
      </View>
    </RNModal>
  );
}

type ModalCloseButtonProps = {
  onPress: () => void;
  className?: string;
};

function ModalCloseButton({ onPress, className }: ModalCloseButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      className={cn(
        "h-10 w-10 items-center justify-center rounded-full border border-homecafe-pink bg-background active:bg-muted",
        className,
      )}
      accessibilityRole="button"
      accessibilityLabel="Close modal"
    >
      <X size={20} color="#3D2E2E" strokeWidth={2} />
    </Pressable>
  );
}

type ModalHeaderProps = ViewProps & {
  className?: string;
};

function ModalHeader({ className, ...props }: ModalHeaderProps) {
  return (
    <View
      className={cn(
        "flex-row items-center justify-between p-4 pt-6",
        className,
      )}
      {...props}
    />
  );
}

type ModalContentProps = ViewProps & {
  className?: string;
};

function ModalContent({ className, ...props }: ModalContentProps) {
  return <View className={cn("flex-1 p-4", className)} {...props} />;
}

type ModalFooterProps = ViewProps & {
  className?: string;
};

function ModalFooter({ className, ...props }: ModalFooterProps) {
  return (
    <View
      className={cn("flex-row items-center justify-end gap-2 p-4", className)}
      {...props}
    />
  );
}

export {
  Modal,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  type ModalCloseButtonProps,
  type ModalContentProps,
  type ModalFooterProps,
  type ModalHeaderProps,
  type ModalProps,
};
