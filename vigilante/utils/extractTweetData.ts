export interface TweetMetadata {
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

export function extractTweetDataFromElement(article: Element): TweetMetadata {
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

  const socialContextEl = article.querySelector('div[data-testid="socialContext"]');
  let type = "original";
  if (socialContextEl && socialContextEl.textContent) {
    if (socialContextEl.textContent.includes("Retweeted")) {
      type = "retweet";
    } else if (socialContextEl.textContent.includes("Replying to")) {
      type = "reply";
    }
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

  console.log("🔍 Extracted tweet data:", tweetData);

  return tweetData;
} 