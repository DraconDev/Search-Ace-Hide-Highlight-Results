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

        const resultElement = result as HTMLElement;

        // Reset styles before applying based on current state
        resultElement.style.display = "";
        resultElement.style.borderLeft = "";
        resultElement.style.paddingLeft = "";
        resultElement.style.borderRight = ""; // Also reset right border
        resultElement.style.paddingRight = ""; // Also reset right padding


        // Check if URL matches any hidden patterns
        let isHidden = false;
        for (const pattern in hiddenResults) {
          if (url.includes(pattern)) {
            resultElement.style.display = "none";
            isHidden = true;
            break;
          }
        }

        // If hidden, no need to add buttons or check for highlighting
        if (isHidden) {
          return;
        }

        // Check if URL matches any highlighted patterns
        let isHighlighted = false;
        for (const [pattern, color] of Object.entries(highlightedResults)) {
          if (url.includes(pattern)) {
            resultElement.style.borderLeft = `3px solid ${color}`; // Apply border to the left
            resultElement.style.paddingLeft = "8px"; // Apply padding to the left
            isHighlighted = true;
            break;
          }
        }

        // Add action buttons container if it doesn't exist
        let actions = resultElement.querySelector('.search-result-actions') as HTMLElement;
        if (!actions) {
          actions = document.createElement("div");
          actions.classList.add('search-result-actions'); // Add a class for identification
          actions.style.display = "flex";
          actions.style.flexDirection = "column"; // Arrange items in a column
          actions.style.gap = "4px"; // Adjust gap for vertical spacing
          actions.style.marginTop = "4px";
          actions.style.position = "absolute";
          actions.style.right = "-26px"; // Move slightly outside to the right
          actions.style.top = "0";
          actions.style.zIndex = "1000"; // Bring to foreground

          // Add highlight button
          const highlightBtn = document.createElement("button");
          highlightBtn.innerHTML = "🌟";
          highlightBtn.title = "Highlight with default color";
          highlightBtn.style.cursor = "pointer";
          highlightBtn.style.background = "none";
          highlightBtn.style.border = "none";
          highlightBtn.style.padding = "0";
          highlightBtn.style.fontSize = "18px"; // Make icon a little bigger
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
            // Store change listener will re-process and apply styles
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
          hideBtn.style.fontSize = "18px"; // Make icon a little bigger
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
            // Store change listener will re-process and apply styles
          };
          actions.appendChild(hideBtn);

          // Append actions to the main result element
          resultElement.style.position = 'relative'; // Set main result element to relative positioning
          resultElement.appendChild(actions);
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
