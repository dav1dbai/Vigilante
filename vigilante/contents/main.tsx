import React, { useEffect } from "react";
import { createRoot } from "react-dom/client";
import { extractTweetDataFromElement } from "../utils/extractTweetData";
import { sendToBackground } from "@plasmohq/messaging";
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
        if (entry.isIntersecting && !processedTweets.has(entry.target)) {
          const processTweet = async () => {
            // Extract and log tweet data
            const tweetData = extractTweetDataFromElement(entry.target);
            console.log("Pre-fetched tweet data:", tweetData);

            try {
              // Add extra logging before sending the message
              if (tweetData.media.some(media => media.includes("video_thumb")) && tweetData.text.length < 20) {
                console.log("ignoring video tweets")
                // TODO: add a flag to the tweet
                return;
              }
              console.log("Sending tweet data to background with name 'analyze'...", tweetData);
              const result = await sendToBackground({
                name: "analyze",
                body: tweetData,
              });
              console.log("Received background response:", result);

              // Create a container element for the fact-check flag.
              const flagContainer = document.createElement("div");
              flagContainer.className = "fact-check-flag-container";

              // Render the FactCheckFlag component using React 18's createRoot.
              const root = createRoot(flagContainer);
              root.render(<FactCheckFlag result={result} />);

              // Append the flag container to the tweet element.
              entry.target.appendChild(flagContainer);
              console.log("Flag component appended with result:", result);
            } catch (error) {
              console.error("Error in fact-checking API call:", error);
            }

            processedTweets.add(entry.target);
            observer.unobserve(entry.target);
          };

          processTweet();
        } else {
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
};

export default ContentScript;
