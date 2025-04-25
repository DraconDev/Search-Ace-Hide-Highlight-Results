import { defineConfig } from "wxt";
// See https://wxt.dev/api/config.html
export default defineConfig({
  extensionApi: "webextension-polyfill", // Corrected from "webextension" to "webextension-polyfill"
  manifest: {
    name: "Example Extension",
    description: "Example Extension",
    version: "0.0.124",
    permissions: ["storage"],
    icons: {
      "16": "icon/16.png",
      "32": "icon/32.png",
      "48": "icon/48.png",
      "96": "icon/96.png",
      "128": "icon/128.png",
    },
    browser_specific_settings: {
      gecko: {
        id: "random_id",
      },
    },
  },
  modules: ["@wxt-dev/module-react"],
});
