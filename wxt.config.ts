import { defineConfig } from "wxt";
// See https://wxt.dev/api/config.html
export default defineConfig({
  extensionApi: "webextension-polyfill", // Corrected from "webextension" to "webextension-polyfill"
  manifest: {
    name: "Search Ace: Hide & Highlight Results",
    description: "Tired of sifting through irrelevant search results? Take control with Search Ace! This extension lets you:\n\n*   Hide unwanted results: Eliminate distractions and focus on what matters.\n*   Highlight key results: Make important links stand out for quick access.\n*   Sync settings: Your preferences are saved across all your devices.\n\nSearch Ace helps you declutter your search experience and find the information you need, faster. Download now and become a search master!",
    version: "0.0.205",
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
