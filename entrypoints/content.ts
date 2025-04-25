import { defineContentScript } from "wxt/sandbox";
import { store } from "@/utils/store";

export default defineContentScript({
  matches: ["*://www.google.com/*", "*://www.google.co.uk/*"],
  main() {
    // Only run on Google search results pages
    if (!window.location.href.includes("search?")) return;

    const processResults = async () => {
      const { hiddenResults, highlightedResults, suspended } = await store.getValue();
      if (suspended) return;
      
      // Get all search result elements - try multiple selectors for different Google layouts
      const results = document.querySelectorAll('div.g, .g, .tF2Cxc, .MjjYud');
      
      results.forEach((result) => {
        const link = result.querySelector('a[href]');
        if (!link) return;
        
        const url = link.getAttribute('href');
        if (!url) return;
        
        console.log('Processing result with URL:', url);
        
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

    // Run initially
    processResults();
    
    // Watch for store changes
    browser.storage.onChanged.addListener((changes, areaName) => {
      if (areaName === 'sync' && changes['sync:store']) {
        processResults();
      }
    });

    // Watch for dynamic result loading
    const observer = new MutationObserver(processResults);
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  },
});
