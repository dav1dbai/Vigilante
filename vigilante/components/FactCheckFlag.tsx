import React, { useEffect, useRef, useState, type MouseEvent } from "react"
import { createPortal } from "react-dom"

import TextFormat from "./TextFormat"
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
  const containerRef = useRef<HTMLDivElement>(null)

  // Ref for the modal element, used to measure its height.
  const modalRef = useRef<HTMLDivElement>(null)

  // Stores the modal's computed position.
  const [modalPos, setModalPos] = useState<{
    top: number
    left: number
  } | null>(null)

  const updateModalPos = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      setModalPos({
        top: rect.top - 200 + window.scrollY,
        left: rect.right + 8 + window.scrollX
      })
    }
  }

  const handleFlagClick = (e: MouseEvent) => {
    e.stopPropagation()
    updateModalPos()
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
    if (!showModal) return

    // Create intersection observer to detect when container leaves viewport
    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) {
          closeModal()
        }
      },
      { threshold: 0 }
    )

    if (containerRef.current) {
      intersectionObserver.observe(containerRef.current)
    }

    const handleScrollOrResize = () => {
      if (!containerRef.current) {
        closeModal()
        return
      }
      updateModalPos()
    }

    window.addEventListener("scroll", handleScrollOrResize)
    window.addEventListener("resize", handleScrollOrResize)

    // Check if ref is lost
    const mutationObserver = new MutationObserver(() => {
      if (!containerRef.current) {
        closeModal()
      }
    })

    if (containerRef.current) {
      mutationObserver.observe(containerRef.current.parentElement!, { childList: true })
    }

    return () => {
      window.removeEventListener("scroll", handleScrollOrResize)
      window.removeEventListener("resize", handleScrollOrResize)
      intersectionObserver.disconnect()
      mutationObserver.disconnect()
    }
  }, [showModal])

  useEffect(() => {
    promise
      .then((result) => {
        console.log("✅ Analysis complete:", {
          tweetId,
          claimsCount: result.claims ? result.claims.length : 0,
          isMisleading: result.final_decision
        })
        setIsLoading(false)
        setClaims(result.claims || [])
        console.log("claims:", result.claims)
        setIsMisleading(result.final_decision)
      })
      .catch((e) => {
        console.error("❌ Analysis failed:", { tweetId, error: e.message })
      })
  }, [promise, tweetId])

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

  // detect clicking outside of modal
  useEffect(() => {
    if (!showModal) return

    const handleClickOutside = (event: Event) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        closeModal()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showModal, setShowModal])

  if (isLoading) {
    return (
      <div className="relative" ref={containerRef}>
        <Button className="mt-4 mb-2 w-full" disabled>
          Loading...
        </Button>
      </div>
    )
  }

  // Only show flag if there are claims
  if (claims.length === 0) {
    return null
  }

  const allClaimsVerified = claims.length > 0 && claims.every(claim => !claim.is_misleading)

  console.log(claims, allClaimsVerified)
  
  //console.log(showModal, modalPos)

  return (
    <div className="relative" ref={containerRef}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap" rel="stylesheet"></link>
      <Button
        variant="destructive"
        className={`w-full mt-4 mb-2 transition-all duration-200 hover:shadow-md active:scale-98 bg-black/5 border ${
          allClaimsVerified 
            ? "border-green-500/20 text-green-500 hover:bg-green-500/10" 
            : "border-[#DA4E67]/20 text-[#DA4E67] hover:bg-[#DA4E67]/10"
        } relative overflow-hidden group`}
        onClick={handleFlagClick}>
        <svg
          className="w-4 h-4 mr-2 transition-transform group-hover:rotate-12"
          viewBox="0 0 16 16"
          fill="currentColor">
          <path d="M8 0a8 8 0 100 16A8 8 0 008 0zm0 14.5a6.5 6.5 0 110-13 6.5 6.5 0 010 13zm0-11a.75.75 0 01.75.75v4a.75.75 0 01-1.5 0v-4A.75.75 0 018 3.5zM8 10a1 1 0 100 2 1 1 0 000-2z" />
        </svg>
        {allClaimsVerified ? 'Verified' : 'Flagged'}
      </Button>

      {showModal &&
        modalPos &&
        createPortal(
          <>
            <div className="fixed inset-0 z-[9998] bg-black/80" onClick={closeModal} />
            <div
              ref={modalRef}
              style={{
                position: "absolute",
                top: modalPos.top,
                left: modalPos.left
              }}
              className="z-[9999]">
              <div 
                className="bg-gray-900 max-h-[80vh] w-[400px] overflow-hidden shadow-lg rounded-lg flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                <header className="p-4 border-b border-gray-800">
                  <h2 className="text-xl font-semibold text-white">
                    Dive Deeper
                  </h2>
                  <p className="text-gray-400 text-sm mt-1">
                    {claims.length} claim{claims.length !== 1 ? 's' : ''} analyzed
                  </p>
                </header>

                <div className="p-3 flex-1 overflow-y-auto space-y-2">
                  {claims.map((claim, index) => (
                    <div
                      key={index}
                      className={`w-full border rounded-lg p-3 transition-all duration-200 hover:shadow-md ${
                        claim.is_misleading
                          ? "border-[#DA4E67]/20 bg-[#DA4E67]/10"
                          : "border-green-500/20 bg-green-500/10"
                      }`}>
                      <button
                        onClick={() => setActiveClaim((prev) => prev === index ? null : index)}
                        className="w-full text-left">
                        <div className="flex items-start gap-3">
                          <div className={`mt-1 ${
                            claim.is_misleading ? "text-[#DA4E67]" : "text-green-500"
                          }`}>
                            {claim.is_misleading ? (
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                              </svg>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-white">
                              {claim.claim}
                            </p>
                          </div>
                          <svg
                            className={`w-5 h-5 transform transition-transform duration-200 text-gray-400 ${
                              activeClaim === index ? "rotate-180" : ""
                            }`}
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </button>

                      <div
                        className={`mt-3 transition-all duration-300 ease-in-out overflow-hidden ${
                          activeClaim === index ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
                        }`}>
                        <div className="text-sm mb-3 text-gray-300">
                          <TextFormat text={claim.explanation} />
                        </div>
                        {claim.sources.length > 0 && (
                          <div className="text-sm">
                            <p className="mb-2 text-gray-400">Sources:</p>
                            <div className="flex flex-wrap gap-2">
                              {claim.sources.map((source, idx) => (
                                <a
                                  key={idx}
                                  href={source}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-block px-3 py-1.5 bg-gray-800 rounded-md transition-all duration-200 hover:bg-gray-700 text-gray-300 text-sm">
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

                <footer className="p-3 border-t border-gray-800">
                  <Button 
                    variant="outline" 
                    onClick={closeModal} 
                    className="w-full bg-gray-800 hover:bg-gray-700 text-gray-300 border-gray-700">
                    Close
                  </Button>
                </footer>
              </div>
            </div>
          </>,
          document.body
        )}
    </div>
  )
}

export default FactCheckFlag
