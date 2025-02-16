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
      borderRadius: "2px"
    }}>
      <header style={{ marginBottom: "24px" }}>
        <h1 style={{ 
          fontSize: "20px", 
          fontWeight: 600,
          marginBottom: "8px"
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
          justifyContent: "space-between" 
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
        <div>
          <h2 style={{ 
              fontSize: "14px",
              fontWeight: 500
            }}>
            Semantic Filter
          </h2>
          <p style={{ 
              fontSize: "12px",
              color: "rgb(161, 161, 170)"
            }}>
            Only show posts matching these topics
          </p>
          <input
            type="text"
            value={semanticFilter}
            onChange={(e) => setSemanticFilter(e.target.value)}
            placeholder="machine learning"
            style={{
              width: "70%",
              padding: "8px 12px",
              fontSize: "14px",
              borderRadius: "6px",
              backgroundColor: "rgb(24, 24, 27)",
              color: "rgb(244, 244, 245)",
              border: "1px solid rgb(39, 39, 42)",
              outline: "none",
            }}
          />
        </div>

        {/* Keyword Exclusions Field */}
        <div>
          <h2 style={{
              fontSize: "14px",
              fontWeight: 500
            }}>
            Excluded Keywords
          </h2>
          <p style={{
              fontSize: "12px",
              color: "rgb(161, 161, 170)"
            }}>
            Skip posts containing these words
          </p>
          <input
            type="text"
            value={excludedKeywords}
            onChange={(e) => setExcludedKeywords(e.target.value)}
            placeholder="coding, meme"
            style={{
              width: "70%",
              padding: "8px 12px",
              fontSize: "14px",
              borderRadius: "6px",
              backgroundColor: "rgb(24, 24, 27)",
              color: "rgb(244, 244, 245)",
              border: "1px solid rgb(39, 39, 42)",
              outline: "none",
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default IndexPopup
