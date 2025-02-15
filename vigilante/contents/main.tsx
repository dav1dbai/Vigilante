import React, { useEffect } from "react";
import { createRoot } from "react-dom/client";
import { extractTweetDataFromElement } from "../utils/extractTweetData";
import { simulateAPICall } from "../utils/api";
import FactCheckFlag from "../components/FactCheckFlag";

const ContentScript = () => {
  useEffect(() => {
    const processedTweets = new WeakSet<Element>();

    const observerOptions = {
      root: null,
      rootMargin: "600px",
      threshold: 0,
    };

    const tweetObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (!processedTweets.has(entry.target)) {
            const tweetData = extractTweetDataFromElement(entry.target);
            console.log("Pre-fetched tweet data:", tweetData);

            // Find the metrics bar container
            const metricsBar = entry.target.querySelector('[role="group"]');
            
            if (metricsBar) {
              simulateAPICall()
                .then((result) => {
                  // Create wrapper div for proper positioning
                  const wrapper = document.createElement("div");
                  wrapper.style.width = "100%";
                  wrapper.style.marginTop = "8px";
                  wrapper.style.borderTop = "1px solid rgb(239, 243, 244)";
                  wrapper.style.paddingTop = "12px";
                  
                  // Insert wrapper after the metrics bar
                  metricsBar.parentNode?.insertBefore(wrapper, metricsBar.nextSibling);
                  
                  const root = createRoot(wrapper);
                  root.render(<FactCheckFlag result={result} />);
                  
                  console.log("Flag component appended with result:", result);
                })
                .catch((error) => {
                  console.error("Error in fact-checking API call:", error);
                });
              processedTweets.add(entry.target);
            }
          }
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    function observeExistingTweets() {
      const tweetArticles = document.querySelectorAll('article[data-testid="tweet"]');
      tweetArticles.forEach((article) => {
        if (!processedTweets.has(article)) {
          tweetObserver.observe(article);
        }
      });
    }

    observeExistingTweets();

    let mutationTimeout: number | null = null;
    const mutationObserver = new MutationObserver(() => {
      if (mutationTimeout) clearTimeout(mutationTimeout);
      mutationTimeout = window.setTimeout(() => {
        observeExistingTweets();
      }, 500);
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      tweetObserver.disconnect();
      mutationObserver.disconnect();
      if (mutationTimeout) clearTimeout(mutationTimeout);
    };
  }, []);

  return null;
}

export default ContentScript;
