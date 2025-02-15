import React, { useEffect } from "react";

// Define a richer TweetMetadata type.
interface TweetMetadata {
  id: string;
  text: string;
  url: string;
  epoch: number;
  media: string[];
  retweetedTweet?: string;
  retweetedTweetID?: string;
  retweetedUserID?: string;
  id_str: string;
  lang?: string;
  rawContent: string;
  replyCount?: number;
  retweetCount?: number;
  likeCount?: number;
  quoteCount?: number;
  conversationId?: string;
  conversationIdStr?: string;
  hashtags: string[];
  mentionedUsers: string[];
  links: string[];
  viewCount?: number;
  quotedTweet?: string;
  in_reply_to_screen_name?: string;
  in_reply_to_status_id_str?: string;
  in_reply_to_user_id_str?: string;
  location?: string;
  cash_app_handle?: string;
  user: {
    username: string;
    profileLink: string;
    avatar?: string;
  };
  date: string;
  type?: string;
  user_id?: number;
}

// Function to extract as many tweet data fields as possible from a tweet element.
function extractTweetDataFromElement(article: Element): TweetMetadata {
  // Extract tweet text.
  let tweetText = "";
  const textDiv = article.querySelector('div[data-testid="tweetText"]');
  if (textDiv) {
    tweetText = textDiv.textContent?.trim() || "";
  }

  // Extract username and profile link from the first user link.
  let username = "";
  let profileLink = "";
  const usernameLink = article.querySelector('a[href^="/"]');
  if (usernameLink) {
    username = usernameLink.textContent?.trim() || "";
    const href = usernameLink.getAttribute("href") || "";
    profileLink = href.startsWith("http") ? href : "https://twitter.com" + href;
  }

  // Extract tweet ID and URL.
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

  // Extract the timestamp; compute the epoch and assign the date.
  let timestamp = "";
  let epoch = 0;
  const timeElement = article.querySelector("time");
  if (timeElement) {
    timestamp = timeElement.getAttribute("datetime") || "";
    epoch = new Date(timestamp).getTime();
  }

  // Extract media URLs from tweet photos.
  const media: string[] = [];
  const mediaElements = article.querySelectorAll('div[data-testid="tweetPhoto"] img');
  mediaElements.forEach((img) => {
    const src = img.getAttribute("src");
    if (src) {
      media.push(src);
    }
  });

  // Helper to extract numeric counts (reply, retweet, like, quote).
  const extractCount = (selector: string): number | undefined => {
    const element = article.querySelector(selector);
    if (element && element.textContent) {
      // Remove non-numeric characters (e.g., commas) to parse the count.
      const num = parseInt(element.textContent.replace(/[^\d]/g, ""), 10);
      return isNaN(num) ? 0 : num;
    }
    return 0;
  };
  const replyCount = extractCount('div[data-testid="reply"] span');
  const retweetCount = extractCount('div[data-testid="retweet"] span');
  const likeCount = extractCount('div[data-testid="like"] span');
  const quoteCount = extractCount('div[data-testid="quote"] span');

  // Extract hashtags from links containing "/hashtag/".
  const hashtagElements = article.querySelectorAll('a[href*="/hashtag/"]');
  const hashtags = Array.from(hashtagElements)
    .map(el => el.textContent?.trim() || "")
    .filter(text => text !== "");

  // Extract mentioned users from links whose text starts with "@".
  const mentionElements = article.querySelectorAll('a[href^="/"]');
  let mentionedUsers = Array.from(mentionElements)
    .map(el => el.textContent?.trim() || "")
    .filter(text => text.startsWith("@"));
  // Remove the primary username if present.
  mentionedUsers = mentionedUsers.filter(mention => mention !== username);

  // Extract external links from anchors whose href begins with "http".
  const linkElements = article.querySelectorAll('a[href^="http"]');
  const links = Array.from(linkElements)
    .map(el => el.getAttribute("href") || "")
    .filter(href => href !== "");

  // Extract a quoted tweet if available.
  const quotedTweetEl = article.querySelector('div[data-testid="tweetQuoted"]');
  const quotedTweet = quotedTweetEl ? quotedTweetEl.textContent?.trim() || "" : "";

  // Determine tweet type by checking for contextual cues.
  let type = "original";
  const socialContextEl = article.querySelector('div[data-testid="socialContext"]');
  if (socialContextEl && socialContextEl.textContent) {
    if (socialContextEl.textContent.includes("Retweeted")) {
      type = "retweet";
    } else if (socialContextEl.textContent.includes("Replying to")) {
      type = "reply";
    }
  }

  // Attempt to extract in-reply-to screen name from the social context.
  let in_reply_to_screen_name = "";
  if (socialContextEl && socialContextEl.textContent?.includes("Replying to")) {
    in_reply_to_screen_name = socialContextEl.textContent.replace("Replying to", "").trim();
  }

  // Extract the user avatar if available.
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

  // Assemble and return the tweet metadata object.
  const tweetData: TweetMetadata = {
    id: tweetId,
    text: tweetText,
    url: tweetUrl,
    epoch,
    media,
    id_str: tweetId,
    rawContent: tweetText,
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

// The main content script uses IntersectionObserver to pre-fetch tweets (and a MutationObserver to catch dynamic changes).
function ContentScript() {
  useEffect(() => {
    const tweetsMetadata: TweetMetadata[] = [];
    // Use a WeakSet to ensure each tweet element is only processed once.
    const processedTweets = new WeakSet<Element>();

    // Configure the IntersectionObserver to trigger when tweets are near (300px away from) the viewport.
    const observerOptions = {
      root: null,
      rootMargin: "300px",
      threshold: 0,
    };

    const tweetObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (!processedTweets.has(entry.target)) {
            const tweetData = extractTweetDataFromElement(entry.target);
            tweetsMetadata.push(tweetData);
            processedTweets.add(entry.target);
            console.log("Pre-fetched tweet data:", tweetData);
          }
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // Observe current tweet elements.
    function observeExistingTweets() {
      const tweetArticles = document.querySelectorAll('article[data-testid="tweet"]');
      tweetArticles.forEach(article => {
        if (!processedTweets.has(article)) {
          tweetObserver.observe(article);
        }
      });
    }
    observeExistingTweets();

    // Use a MutationObserver to detect when new tweets are added to the DOM.
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

    // Cleanup observers on component unmount.
    return () => {
      tweetObserver.disconnect();
      mutationObserver.disconnect();
      if (mutationTimeout) clearTimeout(mutationTimeout);
    };
  }, []);

  return null;
}

export default ContentScript;
