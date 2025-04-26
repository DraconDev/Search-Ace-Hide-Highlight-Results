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

        // Check if this result has already been processed
        // We still process if suspended state changes, so don't return here
        // if (resultElement.classList.contains("processed-result")) {
        //   return;
        // }

        const link = resultElement.querySelector("a[href]");
        // If no link, it's likely not a standard search result, skip adding buttons but process visibility/highlight
        // if (!link) return;

        const url = link ? link.getAttribute("href") : null;
        let domain = "";
        if (url) {
          try {
            const urlObject = new URL(url);
            domain = urlObject.hostname;
          } catch (e) {
            console.error("Invalid URL:", url, e);
            // Continue processing visibility/highlight even for invalid URLs if needed,
            // but skip adding buttons as there's no valid link.
          }
        }


        console.log("Processing result with URL:", url, "Domain:", domain, "Suspended:", suspended);

        // Handle visibility and highlighting based on current state
        if (suspended) {
          // If suspended, ensure element is visible and remove highlight
          resultElement.style.display = "";
          resultElement.style.borderLeft = "";
          resultElement.style.paddingLeft = "";
        } else {
          // If not suspended, apply hidden/highlight logic
          let isHidden = false;
          for (const pattern in hiddenResults) {
            if (domain.includes(pattern)) {
              resultElement.style.display = "none";
              isHidden = true;
              break;
            }
          }

          if (!isHidden) {
            resultElement.style.display = ""; // Ensure visible if not hidden

            let isHighlighted = false;
            for (const [pattern, color] of Object.entries(highlightedResults)) {
              if (domain.includes(pattern)) {
                // Check if an ancestor already has a highlight border
                if (!resultElement.closest('[style*="border-left:"]')) {
                   // Remove existing highlight before applying a new one to prevent double borders
                  resultElement.style.borderLeft = "";
                  resultElement.style.paddingLeft = "";
                  resultElement.style.borderLeft = `3px solid ${color}`;
                  resultElement.style.paddingLeft = "8px";
                }
                isHighlighted = true;
                break;
              }
            }

            if (!isHighlighted) {
               // Remove highlight if not highlighted
              resultElement.style.borderLeft = "";
              resultElement.style.paddingLeft = "";
            }
          }
        }


        // Add action buttons container only if it doesn't exist and there's a valid link
        if (!resultElement.querySelector(".search-result-actions") && link) {
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
             const { defaultHighlightColor, highlightedResults } =
               await store.getValue();
             const current = await store.getValue();
             const resultElement = highlightBtn.closest(
               "div.g, .g, .tF2Cxc, .MjjYud"
             ) as HTMLElement;

             // Extract the domain from the URL
             let domain = "";
             const link = resultElement.querySelector("a[href]");
             const url = link ? link.getAttribute("href") : null;
             if (url) {
               try {
                 const urlObject = new URL(url);
                 domain = urlObject.hostname;
               } catch (e) {
                 console.error("Invalid URL:", url, e);
                 return; // Skip invalid URLs
               }
             } else {
                return; // No link, cannot highlight
             }


             if (highlightedResults && highlightedResults[domain]) {
               // If already highlighted, remove highlight
               const newHighlightedResults = { ...highlightedResults };
               delete newHighlightedResults[domain];
               await store.setValue({
                 ...current,
                 highlightedResults: newHighlightedResults,
               });
             } else {
               // If not highlighted, add highlight
               await store.setValue({
                 ...current,
                 highlightedResults: {
                   ...current.highlightedResults,
                   [domain]: defaultHighlightColor,
                 },
               });
             }
             // Store change listener will re-process and apply styles
           };
           actions.appendChild(highlightBtn);

           // Add hide button
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
             const link = hideBtn.closest(
               "div.g, .g, .tF2Cxc, .MjjYud"
             )?.querySelector("a[href]");
             const url = link ? link.getAttribute("href") : null;

             if (url) {
               try {
                 const urlObject = new URL(url);
                 domain = urlObject.hostname;
               } catch (e) {
                 console.error("Invalid URL:", url, e);
                 return; // Skip invalid URLs
               }
             } else {
                return; // No link, cannot hide
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
           // Use existing resultElement reference
           resultElement.style.position = "relative";
           (actions as HTMLElement).style.position = "absolute";
           (actions as HTMLElement).style.right = "-26px";
           (actions as HTMLElement).style.top = "0";
           (actions as HTMLElement).style.zIndex = "1000";
           resultElement.appendChild(actions);
        }


        // Mark the result as processed
        resultElement.classList.add("processed-result");
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
