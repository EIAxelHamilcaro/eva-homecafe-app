import { ChevronDown } from "lucide-react-native";
import * as React from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
  type ViewProps,
} from "react-native";

import { cn } from "@/src/libs/utils";

type DropdownOption = {
  label: string;
  value: string;
};

type DropdownProps = ViewProps & {
  value?: string;
  options: DropdownOption[];
  onValueChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
  optionClassName?: string;
};

function Dropdown({
  value,
  options,
  onValueChange,
  placeholder = "Select...",
  disabled = false,
  className,
  triggerClassName,
  optionClassName,
  ...props
}: DropdownProps) {
  const [open, setOpen] = React.useState(false);

  const selectedOption = options.find((opt) => opt.value === value);

  const handleSelect = (optionValue: string) => {
    onValueChange?.(optionValue);
    setOpen(false);
  };

  return (
    <View className={cn("relative", className)} {...props}>
      <Pressable
        onPress={() => !disabled && setOpen(true)}
        disabled={disabled}
        className={cn(
          "flex-row items-center justify-between rounded-lg border border-border bg-background px-4 py-3",
          disabled && "opacity-50",
          triggerClassName,
        )}
      >
        <Text
          className={cn(
            "text-base",
            selectedOption ? "text-foreground" : "text-muted-foreground",
          )}
        >
          {selectedOption?.label || placeholder}
        </Text>
        <ChevronDown size={20} color="#8D7E7E" />
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable
          className="flex-1 bg-black/30"
          onPress={() => setOpen(false)}
        >
          <View className="flex-1 items-center justify-center px-6">
            <View className="w-full max-w-sm rounded-xl bg-card p-2 shadow-lg">
              <ScrollView className="max-h-64">
                {options.map((option) => (
                  <Pressable
                    key={option.value}
                    onPress={() => handleSelect(option.value)}
                    className={cn(
                      "rounded-lg px-4 py-3",
                      option.value === value && "bg-primary/10",
                      optionClassName,
                    )}
                  >
                    <Text
                      className={cn(
                        "text-base text-foreground",
                        option.value === value && "font-semibold text-primary",
                      )}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

export { Dropdown, type DropdownProps, type DropdownOption };
