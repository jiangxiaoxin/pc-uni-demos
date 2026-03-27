import { defineConfig } from "vite";
import uni from "@dcloudio/vite-plugin-uni";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [uni()],
  css: {
    preprocessorOptions: {
      scss: {
        // 自动注入 uview-pro 的主题变量
        additionalData: `@import "uview-pro/theme.scss";`,
        silenceDeprecations: ["legacy-js-api", "import"],
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
