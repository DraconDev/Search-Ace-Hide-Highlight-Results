import { defineConfig } from "wxt";
// See https://wxt.dev/api/config.html
export default defineConfig({
  extensionApi: "webextension-polyfill",
  browser: ["chrome", "firefox"], // Explicitly target Firefox
  manifest: {
    name: "Example Extension",
    description: "Example Extension",
    version: "0.0.43",
    permissions: ["storage"],
    // Add browser_specific_settings for Firefox
    browser_specific_settings: {
      gecko: {
        id: "{example-extension@yourdomain.com}", // Required for Firefox - choose a unique ID
        strict_min_version: "109.0" // Minimum Firefox version that supports your extension
      }
    },
    icons: {
      "16": "icon/16.png",
      "32": "icon/32.png",
      "48": "icon/48.png",
      "96": "icon/96.png",
      "128": "icon/128.png",
    },
    action: {
      default_popup: "popup.html",
      default_icon: {
        "16": "icon/16.png",
        "32": "icon/32.png",
        "48": "icon/48.png",
        "128": "icon/128.png",
      },
      default_title: "",
    },
  },
  modules: ["@wxt-dev/module-react"],
});
