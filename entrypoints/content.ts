import { defineContentScript } from "wxt/sandbox";
import { store } from "@/utils/store";

export default defineContentScript({
  matches: ["*://www.google.com/*", "*://www.google.co.uk/*"],
  main() {
    // Only run on Google search results pages
    if (!window.location.href.includes("search?")) return;

    const processResults = async () => {
      const { hiddenResults, highlightedResults } = await store.getValue();
      
      // Get all search result elements
      const results = document.querySelectorAll('div.g');
      
      results.forEach((result) => {
        const link = result.querySelector('a[href]');
        if (!link) return;
        
        const url = link.getAttribute('href');
        if (!url) return;
        
        // Check if URL matches any hidden patterns
        if (hiddenResults.some(pattern => url.includes(pattern))) {
          (result as HTMLElement).style.display = 'none';
          return;
        }
        
        // Check if URL matches any highlighted patterns
        for (const [pattern, color] of Object.entries(highlightedResults)) {
          if (url.includes(pattern)) {
            (result as HTMLElement).style.borderLeft = `3px solid ${color}`;
            (result as HTMLElement).style.paddingLeft = '8px';
            break;
          }
        }
      });
    };

    // Run initially and whenever the store changes
    processResults();
    store.onChange(processResults);
  },
});
