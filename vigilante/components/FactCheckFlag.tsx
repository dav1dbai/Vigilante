import React, { useEffect, useState } from "react"

import { Button } from "./ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
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

  const handleFlagClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowModal(true)
  }

  const handleModalClose = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setShowModal(false)
    }
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
        className="w-full mt-4 mb-2"
        onClick={handleFlagClick}>
        <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 0a8 8 0 100 16A8 8 0 008 0zm0 14.5a6.5 6.5 0 110-13 6.5 6.5 0 010 13zm0-11a.75.75 0 01.75.75v4a.75.75 0 01-1.5 0v-4A.75.75 0 018 3.5zM8 10a1 1 0 100 2 1 1 0 000-2z" />
        </svg>
        {!isMisleading ? "Evidence Supports Claims" : "Possible Misinformation"}
      </Button>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Deeper Dive</DialogTitle>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh] pr-4">
            {(claims || []).map((claim, index) => (
              <div
                key={index}
                className="mb-6 last:mb-0 w-full text-ellipsis overflow-hidden">
                <div className="flex justify-start">
                  <p className="font-medium mb-2">
                    <b>Claim: </b>
                    {claim.claim}
                  </p>
                </div>
                <p className="text-sm mb-2">{claim.explanation}</p>
                {claim.sources.length > 0 && (
                  <div className="text-sm text-muted-foreground">
                    <p className="mb-1">Sources:</p>
                    <ul className="list-disc pl-4 space-y-1">
                      {claim.sources.map((source, idx) => (
                        <li key={idx}>
                          <a
                            href={source}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline break-all">
                            {source}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </ScrollArea>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default FactCheckFlag
