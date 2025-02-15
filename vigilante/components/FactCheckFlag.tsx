import React, { useEffect, useState } from "react"

import { Button } from "./ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "./ui/dialog"
import { ScrollArea } from "./ui/scroll-area"

export type FactCheckFlagProps = {
  tweetId: string
  promise: Promise<{
    final_decision: boolean | null
    claims?: {
      claim: string
      sources: string[]
      explanation: string
      is_misleading: boolean
    }[]
  }>
}

const FactCheckFlag: React.FC<FactCheckFlagProps> = ({ tweetId, promise }) => {
  const [showModal, setShowModal] = useState(false)
  const [scrollPosition, setScrollPosition] = useState(0)

  const handleFlagClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setScrollPosition(window.scrollY)
    setShowModal(true)
  }

  const handleModalClose = () => {
    setShowModal(false)
    setTimeout(() => window.scrollTo(0, scrollPosition), 0)
  }

  const [isLoading, setIsLoading] = useState(true)

  const [claims, setClaims] = useState<
    Awaited<FactCheckFlagProps["promise"]>["claims"]
  >([])
  const [isMisleading, setIsMisleading] = useState<boolean | null>(false)

  useEffect(() => {
    promise
      .then((result) => {
        console.log("✅ Analysis complete:", {
          tweetId,
          claimsCount: !result.claims ? 0 : result.claims.length,
          isMisleading: result.final_decision
        })

        setIsLoading(false)
        setClaims(result.claims)
        setIsMisleading(result.final_decision)
      })
      .catch((e) => {
        console.error("❌ Analysis failed:", {
          tweetId,
          error: e.message
        })
      })
  }, [])

  if (isLoading) {
    return (
      <Button className="mt-4 mb-2 w-full" disabled>
        Loading...
      </Button>
    )
  }

  if (isMisleading === null || claims.length === 0) {
    return null
  }

  return (
    <>
      <Button
        variant={isMisleading ? "destructive" : "success"}
        className="w-full mt-4 mb-2 transition-all duration-200 hover:scale-102 hover:shadow-md active:scale-98"
        onClick={handleFlagClick}>
        <svg className="w-4 h-4 mr-2 transition-transform group-hover:rotate-12" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 0a8 8 0 100 16A8 8 0 008 0zm0 14.5a6.5 6.5 0 110-13 6.5 6.5 0 010 13zm0-11a.75.75 0 01.75.75v4a.75.75 0 01-1.5 0v-4A.75.75 0 018 3.5zM8 10a1 1 0 100 2 1 1 0 000-2z" />
        </svg>
        {!isMisleading ? "Evidence Supports Claims" : "Possible Misinformation"}
      </Button>

      <Dialog open={showModal} onOpenChange={handleModalClose}>
        <DialogContent 
          className="max-h-[80vh] bg-zinc-950 border-zinc-800 transform duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=open]:slide-in-from-left-1/2"
          onOpenAutoFocus={(e) => {
            e.preventDefault()
          }}
          onCloseAutoFocus={(e) => {
            e.preventDefault()
          }}
          onEscapeKeyDown={(e) => {
            e.preventDefault()
            setShowModal(false)
          }}
          onPointerDownOutside={(e) => {
            e.preventDefault()
          }}
          onInteractOutside={(e) => {
            e.preventDefault()
          }}>
          <DialogHeader>
            <DialogTitle className="text-zinc-100">Deeper Dive</DialogTitle>
            <DialogDescription className="sr-only">
              Detailed analysis of claims and their supporting evidence
            </DialogDescription>
          </DialogHeader>

          <ScrollArea 
            className="max-h-[60vh] pr-4"
            onScrollCapture={(e) => e.stopPropagation()}>
            {(claims || []).map((claim, index) => (
              <div
                key={index}
                className={`mb-6 last:mb-0 w-full border rounded-lg p-4 transition-all duration-200 hover:shadow-md bg-zinc-900 ${
                  claim.is_misleading ? 'border-red-800' : 'border-green-800'
                }`}>
                <div
                  onClick={() => {
                    const content = document.getElementById(`claim-content-${index}`)
                    const arrow = document.getElementById(`arrow-${index}`)
                    if (content) {
                      content.classList.toggle('max-h-0')
                      content.classList.toggle('max-h-[500px]')
                      content.classList.toggle('opacity-0')
                      content.classList.toggle('opacity-100')
                    }
                    arrow?.classList.toggle('rotate-180')
                  }}
                  className="w-full text-left cursor-pointer">
                  <div className="flex items-center justify-between">
                    <p className={`font-medium transition-colors duration-200 ${
                      claim.is_misleading ? 'text-red-400' : 'text-green-400'
                    }`}>
                      <b>Claim: </b>
                      {claim.claim}
                    </p>
                    <svg
                      id={`arrow-${index}`}
                      className="w-5 h-5 transform transition-transform duration-200 text-zinc-400"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
                
                <div 
                  id={`claim-content-${index}`} 
                  className="max-h-0 opacity-0 overflow-hidden mt-4 transition-all duration-300 ease-in-out">
                  <p className="text-sm mb-4 text-zinc-300">{claim.explanation}</p>
                  {claim.sources.length > 0 && (
                    <div className="text-sm text-zinc-400">
                      <p className="mb-2">Sources:</p>
                      <div className="flex flex-wrap gap-2">
                        {claim.sources.map((source, idx) => (
                          <a
                            key={idx}
                            href={source}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block px-3 py-1 bg-zinc-800 rounded-md transition-all duration-200 hover:bg-zinc-700 hover:scale-105 hover:shadow-sm active:scale-95 text-zinc-300">
                            [{idx + 1}] {new URL(source).hostname}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </ScrollArea>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowModal(false)}
              className="transition-all duration-200 hover:scale-105 active:scale-95 bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700 hover:text-zinc-200">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default FactCheckFlag
