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
        for (const pattern in hiddenResults) {
          if (url.includes(pattern)) {
            (result as HTMLElement).style.display = 'none';
            return;
          }
        }
        
        // Add action buttons container
        const actions = document.createElement('div');
        actions.style.display = 'flex';
        actions.style.gap = '8px';
        actions.style.marginTop = '4px';
        
        // Add highlight button
        const highlightBtn = document.createElement('button');
        highlightBtn.innerHTML = '🌟';
        highlightBtn.title = 'Highlight with default color';
        highlightBtn.style.cursor = 'pointer';
        highlightBtn.style.background = 'none';
        highlightBtn.style.border = 'none';
        highlightBtn.style.padding = '0';
        highlightBtn.onclick = async (e) => {
          e.preventDefault();
          e.stopPropagation();
          const { defaultHighlightColor } = await store.getValue();
          const current = await store.getValue();
    });

    // Watch for dynamic result loading
    const observer = new MutationObserver(processResults);
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  },
});
