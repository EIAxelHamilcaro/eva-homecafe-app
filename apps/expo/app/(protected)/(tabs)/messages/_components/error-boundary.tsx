import { AlertTriangle, RefreshCw } from "lucide-react-native";
import { Component, type ErrorInfo, type ReactNode } from "react";
import { Pressable, Text, View } from "react-native";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(_error: Error, _errorInfo: ErrorInfo) {
    // Error logging can be added here if needed (e.g., to a monitoring service)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View className="flex-1 items-center justify-center px-8 py-20">
          <View className="mb-4 h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle size={40} color="#EF4444" />
          </View>
          <Text className="mb-2 text-center text-lg font-semibold text-foreground">
            Une erreur est survenue
          </Text>
          <Text className="mb-6 text-center text-sm leading-5 text-muted-foreground">
            {this.state.error?.message || "Quelque chose s'est mal passé"}
          </Text>
          <Pressable
            onPress={this.handleReset}
            className="flex-row items-center rounded-full bg-primary px-6 py-3 active:opacity-80"
          >
            <RefreshCw size={18} color="#FFFFFF" />
            <Text className="ml-2 font-medium text-white">Réessayer</Text>
          </Pressable>
        </View>
      );
    }

    return this.props.children;
  }
}

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <View className="flex-1 items-center justify-center px-8 py-20">
      <View className="mb-4 h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
        <AlertTriangle size={40} color="#EF4444" />
      </View>
      <Text className="mb-2 text-center text-lg font-semibold text-foreground">
        Une erreur est survenue
      </Text>
      <Text className="mb-6 text-center text-sm leading-5 text-muted-foreground">
        {message || "Impossible de charger les données"}
      </Text>
      {onRetry && (
        <Pressable
          onPress={onRetry}
          className="flex-row items-center rounded-full bg-primary px-6 py-3 active:opacity-80"
        >
          <RefreshCw size={18} color="#FFFFFF" />
          <Text className="ml-2 font-medium text-white">Réessayer</Text>
        </Pressable>
      )}
    </View>
  );
}
