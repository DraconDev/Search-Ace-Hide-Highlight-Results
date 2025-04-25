import { defineContentScript } from "wxt/sandbox";
import { store } from "@/utils/store";

export default defineContentScript({
  matches: ["*://www.google.com/*", "*://www.google.co.uk/*"],
  main() {
    // Only run on Google search results pages
    if (!window.location.href.includes("search?")) return;

    const processResults = async () => {
      const { hiddenResults, highlightedResults, suspended } =
        await store.getValue();
      if (suspended) return;

      // Get all search result elements - try multiple selectors for different Google layouts
      const results = document.querySelectorAll("div.g, .g, .tF2Cxc, .MjjYud");

      results.forEach((result) => {
        const link = result.querySelector("a[href]");
        if (!link) return;

        const url = link.getAttribute("href");
        if (!url) return;

        console.log("Processing result with URL:", url);

        // Check if URL matches any hidden patterns
        for (const pattern in hiddenResults) {
          if (url.includes(pattern)) {
            (result as HTMLElement).style.display = "none";
            return;
          }
        }

        // Add action buttons container
        const actions = document.createElement("div");
        actions.style.display = "flex";
        actions.style.gap = "8px";
        actions.style.marginTop = "4px";

        // Add highlight button
        const highlightBtn = document.createElement("button");
        highlightBtn.innerHTML = "🌟";
        highlightBtn.title = "Highlight with default color";
        highlightBtn.style.cursor = "pointer";
        highlightBtn.style.background = "none";
        highlightBtn.style.border = "none";
        highlightBtn.style.padding = "0";
        highlightBtn.onclick = async (e) => {
          e.preventDefault();
          e.stopPropagation();
          const { defaultHighlightColor } = await store.getValue();
          const current = await store.getValue();
          await store.setValue({
            ...current,
            highlightedResults: {
              ...current.highlightedResults,
              [url]: defaultHighlightColor,
            },
          });
        };
        actions.appendChild(highlightBtn);

        // Add hide button
        const hideBtn = document.createElement("button");
        hideBtn.innerHTML = "👁️";
        hideBtn.title = "Hide this result";
        hideBtn.style.cursor = "pointer";
        hideBtn.style.background = "none";
        hideBtn.style.border = "none";
        hideBtn.style.padding = "0";
        hideBtn.onclick = async (e) => {
          e.preventDefault();
          e.stopPropagation();
          const current = await store.getValue();
          await store.setValue({
            ...current,
            hiddenResults: {
              ...current.hiddenResults,
              [url]: true,
            },
          });
        };
        actions.appendChild(hideBtn);

        // Insert buttons in a better position
        const titleContainer = result.querySelector("h3")?.parentElement;
        if (titleContainer) {
          // Create a container div for the title and buttons
          const container = document.createElement('div');
          container.style.display = 'flex';
          container.style.justifyContent = 'space-between';
          container.style.alignItems = 'center';
          
          // Move the title into our new container
          const title = titleContainer.querySelector('h3');
          if (title) {
            container.appendChild(title.cloneNode(true));
            title.remove();
          }
          
          // Add buttons to container
          container.appendChild(actions);
          
          // Add container to title's original position
          titleContainer.appendChild(container);
        }

        // Check if URL matches any highlighted patterns
        for (const [pattern, color] of Object.entries(highlightedResults)) {
          if (url.includes(pattern)) {
            (result as HTMLElement).style.borderLeft = `3px solid ${color}`;
            (result as HTMLElement).style.paddingLeft = "8px";
            break;
          }
        }
      });
    };

    // Run initially
    processResults();

    // Watch for store changes
    browser.storage.onChanged.addListener((changes, areaName) => {
      if (areaName === "sync" && changes["sync:store"]) {
        processResults();
      }
    });

    // Watch for dynamic result loading
    const observer = new MutationObserver(processResults);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  },
});
