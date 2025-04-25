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

        // Check if buttons already exist for this result
        if (result.querySelector(".search-result-actions")) {
          return;
        }

        // Check if URL matches any hidden patterns
        for (const pattern in hiddenResults) {
          if (url.includes(pattern)) {
            (result as HTMLElement).style.display = "none";
            return;
          }
        }

        // Add action buttons container
        const actions = document.createElement("div");
        actions.classList.add("search-result-actions"); // Add a class for identification
        actions.style.display = "flex";
        actions.style.flexDirection = "column"; // Arrange items in a column
        actions.style.gap = "4px"; // Adjust gap for vertical spacing
        actions.style.marginTop = "4px";

        // Add highlight button
        const highlightBtn = document.createElement("button");
        highlightBtn.innerHTML = "☆"; // Minimalistic star outline
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
        hideBtn.innerHTML = "✕"; // Minimalistic close/hide symbol
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
          // Hide the element immediately
          const resultElement = hideBtn.closest("div.g, .g, .tF2Cxc, .MjjYud") as HTMLElement;
          if (resultElement) {
            resultElement.style.display = "none";
          }
          // Store change listener will re-process and apply styles
        };
        actions.appendChild(hideBtn);

        // Position buttons to the right of the result using absolute positioning within the main result element
        const resultElement = result as HTMLElement;
        resultElement.style.position = "relative"; // Set main result element to relative positioning
        (actions as HTMLElement).style.position = "absolute";
        (actions as HTMLElement).style.right = "-26px"; // Move slightly outside to the right
        (actions as HTMLElement).style.top = "0";
        (actions as HTMLElement).style.zIndex = "1000"; // Bring to foreground
        resultElement.appendChild(actions); // Append actions to the main result element

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
