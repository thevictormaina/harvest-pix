import { watch } from "fs";
import { defineConfig } from "rolldown";
import copy from "rollup-plugin-copy";

export default defineConfig({
  input: {
    popup: "src/popup.js",
    content: "src/content.js",
    background: "src/background.js",
  },
  resolve: {
    extensionAlias: {
      ".js": [".ts", ".js"],
    },
    alias: {},
  },
  output: {
    format: "es",
    dir: "dist",
  },
  watch: {
    include: ["src/**/*", "src/styles/globab.css", "./rolldown.config.ts"],
  },
  plugins: [
    copy({
      targets: [
        { src: "src/**/*.html", dest: "dist" },
        { src: "src/**/*.css", dest: "dist" },
        { src: "manifest.json", dest: "dist" },
      ],
      flatten: false,
    }),
  ],
});
