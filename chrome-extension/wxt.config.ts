import { defineConfig } from "wxt";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  outDir: "dist",
  srcDir: "src",
  modules: ["@wxt-dev/module-react"],
  vite: () => ({
    plugins: [tailwindcss()],
  }),
  manifest: {
    name: "tunl",
    description: "Focus timer that blocks distracting sites",
    permissions: ["storage", "alarms", "declarativeNetRequest", "notifications", "tabs"],
    host_permissions: ["<all_urls>"],
    web_accessible_resources: [
      {
        resources: ["blocked.html"],
        matches: ["<all_urls>"],
      },
    ],
    declarative_net_request: {
      rule_resources: [],
    },
  },
});
