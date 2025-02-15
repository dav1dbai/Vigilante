import React, { useEffect } from "react";
import { createRoot } from "react-dom/client";

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

// FactCheckFlag component displays a flag message based on the API result.
type FactCheckFlagProps = {
  result: boolean;
};

const FactCheckFlag: React.FC<FactCheckFlagProps> = ({ result }) => {
  const style = {
    marginTop: "8px",
    padding: "4px 8px",
    backgroundColor: result ? "green" : "red",
    color: "#fff",
    borderRadius: "4px",
    textAlign: "center" as const,
    fontWeight: "bold" as const,
    fontSize: "12px",
  };

  return (
    <div className="fact-check-flag" style={style}>
      {result ? "Verified Fact" : "Flagged as Misinformation"}
    </div>
  );
};

// Function to extract tweet data from a tweet element.
function extractTweetDataFromElement(article: Element): TweetMetadata {
  let tweetText = "";
  const textDiv = article.querySelector('div[data-testid="tweetText"]');
  if (textDiv) {
    tweetText = textDiv.textContent?.trim() || "";
  }

  let username = "";
  let profileLink = "";
  const userNamesDiv = article.querySelector('div[data-testid="User-Names"]');
  if (userNamesDiv) {
    const usernameAnchor = userNamesDiv.querySelector('a[href^="/"] span');
    if (usernameAnchor) {
      username = usernameAnchor.textContent?.trim() || "";
      const href = (usernameAnchor.parentElement?.getAttribute("href") || "").trim();
      profileLink = href.startsWith("http") ? href : "https://twitter.com" + href;
    }
  }
  if (!username) {
    const fallbackAnchor = article.querySelector('a[href^="/"]');
    if (fallbackAnchor) {
      username = fallbackAnchor.textContent?.trim() || "";
      const href = fallbackAnchor.getAttribute("href") || "";
      profileLink = href.startsWith("http") ? href : "https://twitter.com" + href;
    }
  }

  let tweetId = "";
  let tweetUrl = "";
  const tweetLink = article.querySelector('a[href*="/status/"]');
  if (tweetLink) {
    const href = tweetLink.getAttribute("href") || "";
    const match = href.match(/status\/(\d+)/);
    if (match && match[1]) {
      tweetId = match[1];
    }
    tweetUrl = href.startsWith("http") ? href : "https://twitter.com" + href;
  }

  let timestamp = "";
  let epoch = 0;
  const timeElement = article.querySelector("time");
  if (timeElement) {
    timestamp = timeElement.getAttribute("datetime") || "";
    epoch = new Date(timestamp).getTime();
  }

  const media: string[] = [];
  const mediaElements = article.querySelectorAll('div[data-testid="tweetPhoto"] img');
  mediaElements.forEach((img) => {
    const src = img.getAttribute("src");
    if (src) {
      media.push(src);
    }
  });

  const extractCount = (selector: string): number | undefined => {
    const element = article.querySelector(selector);
    if (element && element.textContent) {
      const num = parseInt(element.textContent.replace(/[^\d]/g, ""), 10);
      return isNaN(num) ? 0 : num;
    }
    return 0;
  };
  const replyCount = extractCount('div[data-testid="reply"] span');
  const retweetCount = extractCount('div[data-testid="retweet"] span');
  const likeCount = extractCount('div[data-testid="like"] span');
  const quoteCount = extractCount('div[data-testid="quote"] span');

  const hashtagElements = article.querySelectorAll('a[href*="/hashtag/"]');
  const hashtags = Array.from(hashtagElements)
    .map(el => el.textContent?.trim() || "")
    .filter(text => text !== "");

  const mentionElements = article.querySelectorAll('a[href*="/"]');
  const mentionedUsers = Array.from(mentionElements)
    .map(el => el.textContent?.trim() || "")
    .filter(text => text.startsWith("@") && text !== username);

  const linkElements = article.querySelectorAll('a[href^="http"]');
  const links = Array.from(linkElements)
    .map(el => el.getAttribute("href") || "")
    .filter(href => href !== "");

  const quotedTweetEl = article.querySelector('div[data-testid="tweetQuoted"]');
  const quotedTweet = quotedTweetEl ? quotedTweetEl.textContent?.trim() || "" : "";

  let type = "original";
  const socialContextEl = article.querySelector('div[data-testid="socialContext"]');
  if (socialContextEl && socialContextEl.textContent) {
    if (socialContextEl.textContent.includes("Retweeted")) {
      type = "retweet";
    } else if (socialContextEl.textContent.includes("Replying to")) {
      type = "reply";
    }
  }

  let in_reply_to_screen_name = "";
  if (socialContextEl && socialContextEl.textContent?.includes("Replying to")) {
    in_reply_to_screen_name = socialContextEl.textContent.replace("Replying to", "").trim();
  }

  let avatar = "";
  const avatarImg = article.querySelector('img[src*="profile_images"]');
  if (avatarImg) {
    avatar = avatarImg.getAttribute("src") || "";
  }
  const user = {
    username,
    profileLink,
    avatar,
  };

  const tweetData: TweetMetadata = {
    id: tweetId,
    text: tweetText,
    url: tweetUrl,
    epoch,
    media,
    replyCount,
    retweetCount,
    likeCount,
    quoteCount,
    hashtags,
    mentionedUsers,
    links,
    user,
    date: timestamp,
    type,
  };

  return tweetData;
}

// Simulated API call that returns a Promise<boolean>
function simulateAPICall(): Promise<boolean> {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate the API returning true (adjust as needed)
      const result = Math.random() < 0.5;
      resolve(result);
    }, 1000);
  });
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
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (!processedTweets.has(entry.target)) {
            const tweetData = extractTweetDataFromElement(entry.target);
            console.log("Pre-fetched tweet data:", tweetData);

            // Immediately hit the simulated API for fact checking.
            simulateAPICall()
              .then(result => {
                // Create a container element for the FactCheckFlag.
                const flagContainer = document.createElement("div");
                flagContainer.className = "fact-check-flag-container";
                // Render the FactCheckFlag component into the container using createRoot.
                const root = createRoot(flagContainer);
                root.render(<FactCheckFlag result={result} />);
                // Append the flag container to the bottom of the tweet article.
                entry.target.appendChild(flagContainer);
                console.log("Flag component appended with result:", result);
              })
              .catch(error => {
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
      tweetArticles.forEach(article => {
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
