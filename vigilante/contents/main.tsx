import React, { useEffect } from "react";
import { createRoot } from "react-dom/client";
import { extractTweetDataFromElement } from "./utils/extractTweetData";
import { simulateAPICall } from "./utils/api";
import FactCheckFlag from "./components/FactCheckFlag";

// Define a streamlined TweetMetadata type (only storing successfully extracted data)
interface TweetMetadata {
  id: string;
  text: string;
  url: string;
  epoch: number;
  media: string[];
  replyCount?: number;
  retweetCount?: number;
  likeCount?: number;
  quoteCount?: number;
  hashtags: string[];
  mentionedUsers: string[];
  links: string[];
  user: {
    username: string;
    profileLink: string;
    avatar?: string;
  };
  date: string;
  type?: string;
}

function ContentScript() {
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
            // Extract tweet data for logging.
            const tweetData = extractTweetDataFromElement(entry.target);
            console.log("Pre-fetched tweet data:", tweetData);

            // Immediately hit the simulated API for fact checking.
            simulateAPICall()
              .then((result) => {
                // Create a container element for the FactCheckFlag.
                const flagContainer = document.createElement("div");
                flagContainer.className = "fact-check-flag-container";

                // Render the FactCheckFlag component using React 18's createRoot.
                const root = createRoot(flagContainer);
                root.render(<FactCheckFlag result={result} />);

                // Append the flag container to the bottom of the tweet element.
                entry.target.appendChild(flagContainer);
                console.log("Flag component appended with result:", result);
              })
              .catch((error) => {
                console.error("Error in fact-checking API call:", error);
              });
            processedTweets.add(entry.target);
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
