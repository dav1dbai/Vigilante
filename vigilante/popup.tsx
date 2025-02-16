import { useState, useEffect } from "react"
import { useStorage } from "@plasmohq/storage/hook"


function IndexPopup() {
  const [isEnabled, setIsEnabled] = useStorage<boolean>(
    "vigilante-enabled",
    true // default value
  )
  
  const [semanticFilter, setSemanticFilter] = useStorage<string>(
    "vigilante-semantic-filter",
    "" // default value
  )
  
  const [excludedKeywords, setExcludedKeywords] = useStorage<string>(
    "vigilante-excluded-keywords",
    "" // default value
  )

  useEffect(() => {
    console.log(isEnabled, semanticFilter, excludedKeywords)
  }, [])
  
  return (
    <div style={{
      width: "400px",
      backgroundColor: "rgb(9, 9, 11)",
      color: "rgb(244, 244, 245)",
      padding: "24px",
      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
      border: "none",
      margin: "0",
      outline: "none",
      borderRadius: "8px"
    }}>
      <header style={{ 
        marginBottom: "24px",
        position: "relative",
        overflow: "hidden"
      }}>
        <div style={{
          position: "absolute",
          top: "-100%",
          left: "-100%",
          height: "300%",
          width: "300%",
          background: `linear-gradient(
            45deg,
            #DB4E66 0%,
            #A24688 50%,
            #4E3ABA 100%
          )`,
          opacity: 0.1,
          animation: "shine 3s infinite"
        }} />
        <style>
          {`
            @keyframes shine {
              0% {
                transform: translateY(100%) translateX(100%);
              }
              100% {
                transform: translateY(-100%) translateX(-100%);
              }
            }
          `}
        </style>
        <h1 style={{ 
          fontSize: "24px", 
          fontWeight: 600,
          marginBottom: "8px",
          background: `linear-gradient(
            45deg,
            #DB4E66 0%,
            #A24688 50%,
            #4E3ABA 100%
          )`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundSize: "200% 200%",
        }}>Vigilante Settings</h1>
        <p style={{ 
          fontSize: "14px",
          color: "rgb(161, 161, 170)"
        }}>Configure how Vigilante analyzes your feed</p>
      </header>

      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* Enable/Disable Toggle Switch */}
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "space-between",
          padding: "16px",
          backgroundColor: "rgba(24, 24, 27, 0.5)",
          borderRadius: "8px",
        }}>
          <div>
            <h2 style={{ 
              fontSize: "14px",
              fontWeight: 500
            }}>Extension Status</h2>
            <p style={{ 
              fontSize: "12px",
              color: "rgb(161, 161, 170)"
            }}>Toggle fact-checking functionality</p>
          </div>
          <div 
            onClick={() => setIsEnabled(!isEnabled)}
            style={{
              width: "48px",
              height: "24px",
              backgroundColor: isEnabled ? "rgb(34, 197, 94)" : "rgb(153, 27, 27)",
              borderRadius: "12px",
              position: "relative",
              cursor: "pointer",
              transition: "background-color 0.2s",
            }}
          >
            <div style={{
              width: "20px",
              height: "20px",
              backgroundColor: "white",
              borderRadius: "50%",
              position: "absolute",
              top: "2px",
              left: isEnabled ? "26px" : "2px",
              transition: "left 0.2s",
            }} />
          </div>
        </div>

        {/* Semantic Filter Field */}
        <div style={{
          padding: "16px",
          backgroundColor: "rgba(24, 24, 27, 0.5)",
          borderRadius: "8px",
        }}>
          <h2 style={{ 
            fontSize: "14px",
            fontWeight: 500,
            marginBottom: "4px"
          }}>
            Semantic Filter
          </h2>
          <p style={{ 
            fontSize: "12px",
            color: "rgb(161, 161, 170)",
            marginBottom: "12px"
          }}>
            Only show posts matching these topics
          </p>
          <input
            type="text"
            value={semanticFilter}
            onChange={(e) => setSemanticFilter(e.target.value)}
            placeholder="e.g., machine learning, AI, technology"
            style={{
              width: "100%",
              padding: "10px 12px",
              fontSize: "14px",
              borderRadius: "6px",
              backgroundColor: "rgb(24, 24, 27)",
              color: "rgb(244, 244, 245)",
              border: "1px solid rgb(39, 39, 42)",
              outline: "none",
              transition: "border-color 0.2s",
              ":focus": {
                borderColor: "#A24688"
              }
            }}
          />
        </div>

        {/* Keyword Exclusions Field */}
        <div style={{
          padding: "16px",
          backgroundColor: "rgba(24, 24, 27, 0.5)",
          borderRadius: "8px",
        }}>
          <h2 style={{
            fontSize: "14px",
            fontWeight: 500,
            marginBottom: "4px"
          }}>
            Excluded Keywords
          </h2>
          <p style={{
            fontSize: "12px",
            color: "rgb(161, 161, 170)",
            marginBottom: "12px"
          }}>
            Skip posts containing these words (comma-separated)
          </p>
          <input
            type="text"
            value={excludedKeywords}
            onChange={(e) => setExcludedKeywords(e.target.value)}
            placeholder="e.g., coding, meme, nsfw"
            style={{
              width: "100%",
              padding: "10px 12px",
              fontSize: "14px",
              borderRadius: "6px",
              backgroundColor: "rgb(24, 24, 27)",
              color: "rgb(244, 244, 245)",
              border: "1px solid rgb(39, 39, 42)",
              outline: "none",
              transition: "border-color 0.2s",
              ":focus": {
                borderColor: "#A24688"
              }
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default IndexPopup
