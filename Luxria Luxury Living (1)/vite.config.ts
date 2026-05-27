import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { tanstackStartVite } from "@tanstack/react-start/vite";

export default defineConfig({
  plugins: [
    tanstackStartVite(),
    tsconfigPaths()
  ],
});
