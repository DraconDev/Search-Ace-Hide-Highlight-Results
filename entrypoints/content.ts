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
      // Get all search result elements - try multiple selectors for different Google layouts
      const results = document.querySelectorAll("div.g, .g, .tF2Cxc, .MjjYud");

      results.forEach((result) => {
        const resultElement = result as HTMLElement;

        const link = resultElement.querySelector("a[href]");
        if (!link) return;

        const url = link.getAttribute("href");
        if (!url) return;

        // Extract the domain from the URL
        let domain = "";
        try {
          const urlObject = new URL(url);
          domain = urlObject.hostname;
        } catch (e) {
          console.error("Invalid URL:", url, e);
          return; // Skip invalid URLs
        }

        // Add action buttons if they don't exist and not suspended
        if (!resultElement.classList.contains("processed-result") && !suspended) {
           const actions = document.createElement("div");
           actions.classList.add("search-result-actions"); // Add a class for identification
           actions.style.display = "flex";
           actions.style.flexDirection = "column"; // Arrange items in a column
           actions.style.gap = "4px"; // Adjust gap for vertical spacing
           actions.style.marginTop = "4px";

           // Add highlight button (onclick logic remains the same)
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
             const { defaultHighlightColor, highlightedResults } =
               await store.getValue();
             const current = await store.getValue();
             const resultElement = highlightBtn.closest(
               "div.g, .g, .tF2Cxc, .MjjYud"
             ) as HTMLElement;

             // Extract the domain from the URL
             let domain = "";
             try {
               const urlObject = new URL(url);
               domain = urlObject.hostname;
             } catch (e) {
               console.error("Invalid URL:", url, e);
               return; // Skip invalid URLs
             }

             if (highlightedResults && highlightedResults[domain]) {
               // If already highlighted, remove highlight
               const newHighlightedResults = { ...highlightedResults };
               delete newHighlightedResults[domain];
               await store.setValue({
                 ...current,
                 highlightedResults: newHighlightedResults,
               });
               // Store change listener will re-process and apply styles
             } else {
               // If not highlighted, add highlight
               await store.setValue({
                 ...current,
                 highlightedResults: {
                   ...current.highlightedResults,
                   [domain]: defaultHighlightColor,
                 },
               });
               // Store change listener will re-process and apply styles
             }
           };
           actions.appendChild(highlightBtn);

           // Add hide button (onclick logic remains the same)
           const hideBtn = document.createElement("button");
           hideBtn.innerHTML = `
             <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" fill="none">
               <path d="M18 6L6 18M6 6l12 12"/>
             </svg>
           `;
           hideBtn.title = "Hide domain";
           hideBtn.style.cursor = "pointer";
           hideBtn.style.background = "none";
           hideBtn.style.border = "none";
           hideBtn.style.padding = "0";
           hideBtn.style.fontSize = "18px"; // Make icon a little bigger
           hideBtn.onclick = async (e) => {
             e.preventDefault();
             e.stopPropagation();
             const current = await store.getValue();

             // Extract the domain from the URL
             let domain = "";
             try {
               const urlObject = new URL(url);
               domain = urlObject.hostname;
             } catch (e) {
               console.error("Invalid URL:", url, e);
               return; // Skip invalid URLs
             }

             await store.setValue({
               ...current,
               hiddenResults: {
                 ...current.hiddenResults,
                 [domain]: true,
               },
             });
             // Store change listener will re-process and apply styles
           };
           actions.appendChild(hideBtn);

           // Position buttons to the right of the result using absolute positioning within the main result element
           resultElement.style.position = "relative";
           (actions as HTMLElement).style.position = "absolute";
           (actions as HTMLElement).style.right = "-26px";
           (actions as HTMLElement).style.top = "0";
           (actions as HTMLElement).style.zIndex = "1000";
           resultElement.appendChild(actions);

          resultElement.classList.add("processed-result");
        }

        // Apply/remove styles based on current state
        if (!suspended) {
          // Remove any previously applied styles first
          resultElement.style.display = "";
          resultElement.style.borderLeft = "";
          resultElement.style.paddingLeft = "";

          // Check if domain matches any hidden patterns
          for (const pattern in hiddenResults) {
            if (domain.includes(pattern)) {
              resultElement.style.display = "none";
              break; // No need to check highlights if hidden
            }
          }

          // If not hidden, check for highlights
          if (resultElement.style.display !== "none") {
            for (const [pattern, color] of Object.entries(highlightedResults)) {
              if (domain.includes(pattern)) {
                // Check if an ancestor already has a highlight border
                if (resultElement.closest('[style*="border-left:"]')) {
                  console.log("Skipping highlight on nested element:", resultElement);
                  break; // Skip applying highlight to this element
                }
                resultElement.style.borderLeft = `3px solid ${color}`;
                resultElement.style.paddingLeft = "8px";
                break;
              }
            }
          }
        } else {
          // If suspended, remove all applied styles and hide the action buttons
          resultElement.style.display = "";
          resultElement.style.borderLeft = "";
          resultElement.style.paddingLeft = "";
          const existingActions = resultElement.querySelector(".search-result-actions");
          if (existingActions) {
            (existingActions as HTMLElement).style.display = "none";
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
