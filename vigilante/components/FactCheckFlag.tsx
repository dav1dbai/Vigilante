import React, { useState, useRef, useEffect, useLayoutEffect, MouseEvent } from "react"
import { createPortal } from "react-dom"
import { Button } from "./ui/button"

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
  const [isLoading, setIsLoading] = useState(true)
  const [claims, setClaims] = useState<
    Awaited<FactCheckFlagProps["promise"]>["claims"]
  >([])
  const [isMisleading, setIsMisleading] = useState<boolean | null>(false)
  const [activeClaim, setActiveClaim] = useState<number | null>(null)

  // Ref for the misinformation banner container.
  const containerRef = useRef<HTMLDivElement>(null)
  // Ref for the modal element, used to measure its height.
  const modalRef = useRef<HTMLDivElement>(null)
  // Stores the modal's computed position.
  const [modalPos, setModalPos] = useState<{ top: number; left: number } | null>(null)

  // Generate a unique instance identifier.
  const instanceId = useRef(Math.random().toString(36).substring(2))

  // Update modal position so that its bottom aligns with the container's bottom.
  const updateModalPos = () => {
    if (containerRef.current && modalRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect()
      const modalHeight = modalRef.current.offsetHeight
      setModalPos({
        top: containerRect.bottom + window.scrollY - modalHeight,
        left: containerRect.right + 8 + window.scrollX, // position 8px to the right
      })
    }
  }

  // If another instance opens its modal, close ours.
  useEffect(() => {
    const handleModalOpen = (e: CustomEvent<{ id: string }>) => {
      if (e.detail.id !== instanceId.current && showModal) {
        closeModal()
      }
    }
    window.addEventListener("factCheckModalOpen", handleModalOpen as EventListener)
    return () =>
      window.removeEventListener("factCheckModalOpen", handleModalOpen as EventListener)
  }, [showModal])

  // Listen for page changes (popstate/hashchange) to close the modal.
  useEffect(() => {
    const handlePageChange = () => {
      if (showModal) {
        closeModal()
      }
    }
    window.addEventListener("popstate", handlePageChange)
    window.addEventListener("hashchange", handlePageChange)
    return () => {
      window.removeEventListener("popstate", handlePageChange)
      window.removeEventListener("hashchange", handlePageChange)
    }
  }, [showModal])

  const handleFlagClick = (e: MouseEvent) => {
    e.stopPropagation()
    // Dispatch a custom event so that other instances close theirs.
    window.dispatchEvent(
      new CustomEvent("factCheckModalOpen", { detail: { id: instanceId.current } })
    )
    setShowModal(true)
  }

  const closeModal = () => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur()
    }
    setShowModal(false)
    setModalPos(null)
    setActiveClaim(null)
  }

  useEffect(() => {
    promise
      .then((result) => {
        console.log("✅ Analysis complete:", {
          tweetId,
          claimsCount: result.claims ? result.claims.length : 0,
          isMisleading: result.final_decision,
        })
        setIsLoading(false)
        setClaims(result.claims || [])
        setIsMisleading(result.final_decision)
      })
      .catch((e) => {
        console.error("❌ Analysis failed:", { tweetId, error: e.message })
      })
  }, [promise, tweetId])

  // Once the modal is open, use a brief timeout so that its rendered height can be measured.
  useLayoutEffect(() => {
    if (showModal) {
      const timer = setTimeout(() => {
        updateModalPos()
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [showModal, claims])

  // Update modal position on scroll and window resize.
  useEffect(() => {
    if (!showModal) return
    const handleScrollOrResize = () => {
      updateModalPos()
    }
    window.addEventListener("scroll", handleScrollOrResize)
    window.addEventListener("resize", handleScrollOrResize)
    return () => {
      window.removeEventListener("scroll", handleScrollOrResize)
      window.removeEventListener("resize", handleScrollOrResize)
    }
  }, [showModal])

  if (isLoading) {
    return (
      <div className="relative" ref={containerRef}>
        <Button className="mt-4 mb-2 w-full" disabled>
          Loading...
        </Button>
      </div>
    )
  }

  if (
    isMisleading === null ||
    isMisleading === false ||
    isMisleading === undefined ||
    claims.length === 0
  ) {
    return null
  }

  return (
    <div className="relative" ref={containerRef}>
      {/* Misinformation banner spans the full tweet width */}
      <Button
        variant={isMisleading ? "destructive" : "success"}
        className="w-full mt-4 mb-2 transition-all duration-200 hover:scale-102 hover:shadow-md active:scale-98"
        onClick={handleFlagClick}
      >
        <svg
          className="w-4 h-4 mr-2 transition-transform group-hover:rotate-12"
          viewBox="0 0 16 16"
          fill="currentColor"
        >
          <path d="M8 0a8 8 0 100 16A8 8 0 008 0zm0 14.5a6.5 6.5 0 110-13 6.5 6.5 0 010 13zm0-11a.75.75 0 01.75.75v4a.75.75 0 01-1.5 0v-4A.75.75 0 018 3.5zM8 10a1 1 0 100 2 1 1 0 000-2z" />
        </svg>
        {isMisleading
          ? "Possible Misinformation"
          : "Evidence Supports Claims"}
      </Button>

      {showModal &&
        modalPos &&
        createPortal(
          <div
            style={{ position: "absolute", top: modalPos.top, left: modalPos.left }}
            className="z-[9999]"
          >
            <div
              ref={modalRef}
              className="bg-zinc-950 border border-zinc-800 max-h-[80vh] w-[350px] overflow-hidden shadow-lg rounded-lg flex flex-col"
            >
              <header className="p-4">
                <h2 className="text-zinc-100 text-lg font-semibold">Deeper Dive</h2>
                <p className="sr-only">
                  Detailed analysis of claims and their supporting evidence
                </p>
              </header>

              {/* Scrollable content container */}
              <div className="p-4 flex-1 overflow-y-auto">
                {(claims || []).map((claim, index) => (
                  <div
                    key={index}
                    className={`mb-6 last:mb-0 w-full border rounded-lg p-4 transition-all duration-200 hover:shadow-md bg-zinc-900 ${
                      claim.is_misleading
                        ? "border-red-800"
                        : "border-green-800"
                    }`}
                  >
                    <button
                      onClick={() =>
                        setActiveClaim((prev) =>
                          prev === index ? null : index
                        )
                      }
                      className="w-full text-left"
                    >
                      <div className="flex items-center justify-between">
                        <p
                          className={`font-medium transition-colors duration-200 ${
                            claim.is_misleading
                              ? "text-red-400"
                              : "text-green-400"
                          }`}
                        >
                          <b>Claim: </b>
                          {claim.claim}
                        </p>
                        <svg
                          className={`w-5 h-5 transform transition-transform duration-200 text-zinc-400 ${
                            activeClaim === index ? "rotate-180" : ""
                          }`}
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                    </button>
                    <div
                      className={`mt-4 transition-all duration-300 ease-in-out overflow-hidden ${
                        activeClaim === index
                          ? "max-h-[500px] opacity-100"
                          : "max-h-0 opacity-0"
                      }`}
                    >
                      <p className="text-sm mb-4 text-zinc-300">
                        {claim.explanation}
                      </p>
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
                                className="inline-block px-3 py-1 bg-zinc-800 rounded-md transition-all duration-200 hover:bg-zinc-700 hover:scale-105 hover:shadow-sm active:scale-95 text-zinc-300"
                              >
                                [{idx + 1}] {new URL(source).hostname}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <footer className="p-4">
                <Button variant="outline" onClick={closeModal}>
                  Close
                </Button>
              </footer>
            </div>
          </div>,
          document.body
        )}
    </div>
  )
}

export default FactCheckFlag
