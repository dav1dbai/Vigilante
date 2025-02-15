import { useState } from "react"

export function SettingsPanel({ isOpen, onClose }) {
  const [isEnabled, setIsEnabled] = useState(true)
  const [semanticFilter, setSemanticFilter] = useState("")
  const [excludedKeywords, setExcludedKeywords] = useState("")
  const [isSemanticOpen, setIsSemanticOpen] = useState(false)
  const [isKeywordsOpen, setIsKeywordsOpen] = useState(false)

  if (!isOpen) return null

  return (
    <div className="settings-panel">
      <div className="settings-container">
        <header className="settings-header">
          <h1 className="settings-title">Vigilante Settings</h1>
          <p className="settings-subtitle">Configure how Vigilante analyzes your feed</p>
        </header>

        <div className="settings-content">
          {/* Enable/Disable Toggle Switch */}
          <div className="settings-row">
            <div>
              <h2 className="settings-label">Extension Status</h2>
              <p className="settings-description">Toggle fact-checking functionality</p>
            </div>
            <div 
              onClick={() => setIsEnabled(!isEnabled)}
              className={`toggle-switch ${isEnabled ? 'enabled' : ''}`}
            >
              <div className="toggle-handle" />
            </div>
          </div>

          {/* Semantic Filter Dropdown */}
          <div>
            <div 
              onClick={() => setIsSemanticOpen(!isSemanticOpen)}
              className={`dropdown-header ${isSemanticOpen ? 'open' : ''}`}>
              <h2 className="settings-label">
                Semantic Filter
                <svg 
                  className={`dropdown-arrow ${isSemanticOpen ? 'open' : ''}`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </h2>
              <p className="settings-description">Only show posts matching these topics</p>
            </div>
            {isSemanticOpen && (
              <textarea
                value={semanticFilter}
                onChange={(e) => setSemanticFilter(e.target.value)}
                placeholder="I want to fact-check posts about elections, climate change, and public health"
                className="settings-textarea"
                rows={2}
              />
            )}
          </div>

          {/* Keyword Exclusions Dropdown */}
          <div>
            <div 
              onClick={() => setIsKeywordsOpen(!isKeywordsOpen)}
              className={`dropdown-header ${isKeywordsOpen ? 'open' : ''}`}>
              <h2 className="settings-label">
                Excluded Keywords
                <svg 
                  className={`dropdown-arrow ${isKeywordsOpen ? 'open' : ''}`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </h2>
              <p className="settings-description">Skip posts containing these words</p>
            </div>
            {isKeywordsOpen && (
              <textarea
                value={excludedKeywords}
                onChange={(e) => setExcludedKeywords(e.target.value)}
                placeholder="e.g., meme, joke, parody"
                className="settings-textarea"
                rows={2}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}