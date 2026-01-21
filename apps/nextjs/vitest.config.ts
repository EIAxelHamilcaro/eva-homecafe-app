import baseConfig from "@packages/test/base-vitest.config";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig, mergeConfig } from "vitest/config";

export default mergeConfig(
  baseConfig,
  defineConfig({
    plugins: [tsconfigPaths()],
  }),
);
