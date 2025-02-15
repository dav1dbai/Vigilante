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
            // Extract tweet data
            const tweetData = extractTweetDataFromElement(entry.target);
            console.log("🔍 Tweet Detection:", {
              id: tweetData.id,
              text: tweetData.text.substring(0, 50) + "...",
              hasMedia: tweetData.media.length > 0
            });

            try {
              // Skip video tweets with short text
              if (tweetData.media.some(media => media.includes("video_thumb")) && tweetData.text.length < 20) {
                console.log("⏭️ Skipping video tweet:", tweetData.id);
                return;
              }

              console.log("🔄 Analyzing tweet:", {
                id: tweetData.id,
                timestamp: new Date().toISOString()
              });

              const result = await sendToBackground({
                name: "analyze",
                body: tweetData,
              });

              console.log("✅ Analysis complete:", {
                tweetId: result.tweet_id,
                claimsCount: !result.claims ? 0 : result.claims.length,
                isMisleading: result.final_decision
              });

              // Create and append flag component
              const flagContainer = document.createElement("div");
              flagContainer.className = "fact-check-flag-container";
              const root = createRoot(flagContainer);
              root.render(<FactCheckFlag result={!result.final_decision} />);
              entry.target.appendChild(flagContainer);
              
              console.log("🏁 Flag component rendered:", {
                tweetId: result.tweet_id,
                success: true
              });
            } catch (error) {
              console.error("❌ Analysis failed:", {
                tweetId: tweetData.id,
                error: error.message
              });
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
