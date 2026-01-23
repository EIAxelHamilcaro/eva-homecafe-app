import Constants from "expo-constants";

type Environment = "development" | "staging" | "production";

interface EnvConfig {
  apiUrl: string;
  environment: Environment;
}

const getEnvironment = (): Environment => {
  if (__DEV__) return "development";
  const releaseChannel = Constants.expoConfig?.extra?.releaseChannel as
    | string
    | undefined;
  if (releaseChannel === "staging") return "staging";
  return "production";
};

const envConfigs: Record<Environment, EnvConfig> = {
  development: {
    apiUrl: Constants.expoConfig?.extra?.apiUrl ?? "http://localhost:3000",
    environment: "development",
  },
  staging: {
    apiUrl: "https://staging-api.homecafe.app",
    environment: "staging",
  },
  production: {
    apiUrl: "https://api.homecafe.app",
    environment: "production",
  },
};

const currentEnvironment = getEnvironment();

export const env: EnvConfig = envConfigs[currentEnvironment];

export const isDev = currentEnvironment === "development";
export const isStaging = currentEnvironment === "staging";
export const isProd = currentEnvironment === "production";
