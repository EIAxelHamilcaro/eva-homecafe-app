import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AppState, type AppStateStatus, Platform } from "react-native";

interface NetworkContextValue {
  isOnline: boolean;
  isChecking: boolean;
  checkConnection: () => Promise<boolean>;
}

const NetworkContext = createContext<NetworkContextValue | undefined>(
  undefined,
);

const HEALTH_CHECK_URL = Platform.select({
  ios: "https://www.apple.com/library/test/success.html",
  android: "https://clients3.google.com/generate_204",
  default: "https://www.google.com",
});

export function NetworkProvider({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState(true);
  const [isChecking, setIsChecking] = useState(false);
  const checkTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastCheckRef = useRef<number>(0);

  const checkConnection = useCallback(async (): Promise<boolean> => {
    const now = Date.now();
    if (now - lastCheckRef.current < 5000) {
      return isOnline;
    }

    lastCheckRef.current = now;
    setIsChecking(true);

    try {
      const fetchPromise = fetch(HEALTH_CHECK_URL, {
        method: "HEAD",
        cache: "no-cache",
      });

      const timeoutPromise = new Promise<Response>((_, reject) => {
        setTimeout(() => reject(new Error("Timeout")), 5000);
      });

      const response = await Promise.race([fetchPromise, timeoutPromise]);
      const online = response.ok;
      setIsOnline(online);
      return online;
    } catch {
      setIsOnline(false);
      return false;
    } finally {
      setIsChecking(false);
    }
  }, [isOnline]);

  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === "active") {
        if (checkTimeoutRef.current) {
          clearTimeout(checkTimeoutRef.current);
        }
        checkTimeoutRef.current = setTimeout(() => {
          checkConnection();
        }, 1000);
      }
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange,
    );

    return () => {
      subscription.remove();
      if (checkTimeoutRef.current) {
        clearTimeout(checkTimeoutRef.current);
      }
    };
  }, [checkConnection]);

  const value = useMemo(
    () => ({ isOnline, isChecking, checkConnection }),
    [isOnline, isChecking, checkConnection],
  );

  return (
    <NetworkContext.Provider value={value}>{children}</NetworkContext.Provider>
  );
}

export function useNetwork() {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error("useNetwork must be used within a NetworkProvider");
  }
  return context;
}
