interface CachedAnalysis {
  timestamp: number;
  data: any;
}

interface AnalysisCache {
  [tweetId: string]: CachedAnalysis;
}

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds
const CACHE_KEY = 'tweet_analysis_cache';

export function getCachedAnalysis(tweetId: string): any | null {
  try {
    const cache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}') as AnalysisCache;
    const cachedItem = cache[tweetId];
    
    if (!cachedItem) {
      return null;
    }

    // Check if cache has expired
    if (Date.now() - cachedItem.timestamp > CACHE_TTL) {
      // Remove expired item
      delete cache[tweetId];
      localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
      return null;
    }

    return cachedItem.data;
  } catch (error) {
    console.error('Error reading from cache:', error);
    return null;
  }
}

export function setCachedAnalysis(tweetId: string, data: any): void {
  try {
    const cache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}') as AnalysisCache;
    
    // Add new item to cache
    cache[tweetId] = {
      timestamp: Date.now(),
      data
    };

    // Clean up expired items
    Object.keys(cache).forEach(key => {
      if (Date.now() - cache[key].timestamp > CACHE_TTL) {
        delete cache[key];
      }
    });

    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.error('Error writing to cache:', error);
  }
} 