import { defineConfig } from "vite";
import vitestConfig from "./vitest.config";

export default defineConfig({
  plugins: [],
  test: vitestConfig.test,
});
