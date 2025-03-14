import { defineConfig } from "wxt";
import react from '@vitejs/plugin-react';

// See https://wxt.dev/api/config.html
export default defineConfig({
    extensionApi: "chrome",
    manifest: {
        name: "Example Extension",
        description: "Example Extension",
        version: "0.0.1",
        permissions: ["storage"],
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
    browser: ["chrome", "firefox"],
    modules: ["@wxt-dev/module-react"],
    vite: {
        plugins: [react()]
    }
});
