import { defineConfig } from "vite";
import pkg from "@lovable.dev/vite-tanstack-config";

const { bundledConfig } = pkg;

export default defineConfig(bundledConfig);
