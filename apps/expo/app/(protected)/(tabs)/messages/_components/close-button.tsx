import { X } from "lucide-react-native";
import { Pressable } from "react-native";

interface CloseButtonProps {
  onPress: () => void;
}

export function CloseButton({ onPress }: CloseButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      className="h-10 w-10 items-center justify-center rounded-full border-2 border-primary active:bg-muted"
    >
      <X size={20} color="#000" />
    </Pressable>
  );
}
