import cssText from "data-text:~index.css"
import { useEffect } from "react"
import { createRoot } from "react-dom/client"

import { sendToBackground } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"

import FactCheckFlag from "~components/FactCheckFlag"

import { getCachedAnalysis, setCachedAnalysis } from "../utils/cache"
import { extractTweetDataFromElement } from "../utils/extractTweetData"

const ContentScript = () => {
  useEffect(() => {
    if (window.location.hostname !== "x.com") return

    const style = document.createElement("style")
    style.textContent = cssText
    document.head.appendChild(style)
  }, [])

  useEffect(() => {
    const storage = new Storage()
    const processedTweets = new WeakSet<Element>()
    const observerOptions = {
      root: null,
      rootMargin: "1200px",
      threshold: 0
    }

    const tweetObserver = new IntersectionObserver(async (entries, observer) => {
      // Get current settings
      const isEnabled = await storage.get<boolean>("vigilante-enabled")
      const semanticFilter = await storage.get<string>("vigilante-semantic-filter")
      const excludedKeywords = await storage.get<string>("vigilante-excluded-keywords")

      // Skip processing if extension is disabled
      if (!isEnabled) {
        return
      }

      entries.forEach((entry) => {
        if (entry.isIntersecting && !processedTweets.has(entry.target)) {
          const processTweet = async () => {
            // Extract tweet data
            const tweetData = extractTweetDataFromElement(entry.target)
            
            // Apply keyword exclusion filter
            if (excludedKeywords) {
              const keywords = excludedKeywords.toLowerCase().split(',').map(k => k.trim())
              const tweetText = tweetData.text.toLowerCase()
              if (keywords.some(keyword => tweetText.includes(keyword))) {
                console.log("⏭️ Skipping tweet due to excluded keywords ", keywords, tweetData.id)
                entry.target.remove()
                return
              }
            }

            // Apply semantic filter (dummy implementation for now)
            // if (semanticFilter) {
            //   const isRelevant = await isSemanticallyRelevant(tweetData.text, semanticFilter)
            //   if (!isRelevant) {
            //     console.log("⏭️ Skipping tweet due to semantic filter:", semanticFilter, tweetData.id)
            //     entry.target.remove()
            //     return
            //   }
            // }

            console.log("�� Tweet Detection:", {
              id: tweetData.id,
              text: tweetData.text.substring(0, 50) + "...",
              hasMedia: tweetData.media.length > 0
            })

            let promise: Promise<any>

            // Skip video tweets with short text
            if (
              tweetData.media.some((media) => media.includes("video_thumb")) &&
              tweetData.text.length < 20
            ) {
              console.log("⏭️ Skipping video tweet:", tweetData.id)
              return
            }

            console.log("🔄 Analyzing tweet:", {
              id: tweetData.id,
              timestamp: new Date().toISOString()
            })

            // Check cache first
            const cachedResult = await getCachedAnalysis(tweetData.id)
            if (cachedResult) {
              console.log("📦 Using cached analysis for tweet:", tweetData.id)
              promise = Promise.resolve(cachedResult)
            } else {
              promise = sendToBackground({
                name: "analyze",
                body: tweetData
              })
            }

            // Cache the result when promise resolves
            promise.then((result) => {
              setCachedAnalysis(tweetData.id, result)
            })

            // Find metrics bar and insert flag component
            const metricsBar = entry.target.querySelector('[role="group"]')
            if (metricsBar) {
              const mountPoint = document.createElement("div")
              metricsBar.parentNode?.insertBefore(mountPoint, metricsBar)

              createRoot(mountPoint).render(
                <FactCheckFlag tweetId={tweetData.id} promise={promise} />
              )
            }

            processedTweets.add(entry.target)

            observer.unobserve(entry.target)
          }

          processTweet()
        } else {
          observer.unobserve(entry.target)
        }
      })
    }, observerOptions)

    function observeExistingTweets() {
      const tweetArticles = document.querySelectorAll(
        'article[data-testid="tweet"]'
      )
      tweetArticles.forEach((article) => {
        if (!processedTweets.has(article)) {
          tweetObserver.observe(article)
        }
      })
    }

    observeExistingTweets()

    let mutationTimeout: number | null = null
    const mutationObserver = new MutationObserver(() => {
      if (mutationTimeout) clearTimeout(mutationTimeout)
      mutationTimeout = window.setTimeout(() => {
        observeExistingTweets()
      }, 500)
    })

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true
    })

    return () => {
      tweetObserver.disconnect()
      mutationObserver.disconnect()
      if (mutationTimeout) clearTimeout(mutationTimeout)
    }
  }, [])

  return null
}

// Dummy semantic relevance checker with timeout
async function isSemanticallyRelevant(tweetText: string, filterTopic: string): Promise<boolean> {
  // Add artificial delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const response = await sendToBackground({
    name: "semantic",
    body: {
      text: tweetText,
      description: filterTopic
    }
  })
  console.log("Semantic server response:", response)
  return response.result == "YES"
}

export default ContentScript
