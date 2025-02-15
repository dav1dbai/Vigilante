import cssText from "data-text:~index.css"
import { useEffect } from "react"
import { createRoot } from "react-dom/client"

import { sendToBackground } from "@plasmohq/messaging"

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
    const processedTweets = new WeakSet<Element>()
    const observerOptions = {
      root: null,
      rootMargin: "1200px",
      threshold: 0
    }

    const tweetObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !processedTweets.has(entry.target)) {
          const processTweet = async () => {
            // Extract tweet data
            const tweetData = extractTweetDataFromElement(entry.target)
            console.log("🔍 Tweet Detection:", {
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

export default ContentScript
