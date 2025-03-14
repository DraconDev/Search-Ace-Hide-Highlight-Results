import '../assets/style.css';
import { defineContentScript } from "wxt/sandbox";

export default defineContentScript({
  matches: ["<all_urls>"],
  // This makes the content script run on every website
  main() {
    console.log("Content script is running on this page");

    // Your content script logic here

    // Example: Listen for messages from the extension
    browser.runtime.onMessage.addListener((message) => {
      console.log("Received message in content script:", message);
      // Process the message as needed
      return true; // Indicates async response
    });
  },
});
