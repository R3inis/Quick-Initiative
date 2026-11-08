import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  server: {
    cors: { origin: "https://www.owlbear.rodeo" },
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        tokenUI: resolve(__dirname, "token-ui.html")
      }
    }
  }
});