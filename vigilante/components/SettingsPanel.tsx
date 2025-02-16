import React from "react"
import { createPortal } from "react-dom"
import { useStorage } from "@plasmohq/storage/hook"
import { Button } from "~components/ui/button"

type SettingsPanelProps = {
  onClose: () => void
}

export default function SettingsPanel({ onClose }: SettingsPanelProps) {
  const [isEnabled, setIsEnabled] = useStorage<boolean>("vigilante-enabled", true)
  const [semanticFilter, setSemanticFilter] = useStorage<string>("vigilante-semantic-filter", "")
  const [excludedKeywords, setExcludedKeywords] = useStorage<string>("vigilante-excluded-keywords", "")

  const content = (
    <div className="fixed inset-0 z-[9998] flex items-start justify-end pt-4 pr-16">
      {/* Overlay for closing when clicking outside */}
      {!document.querySelector('.modal-overlay') && (
        <div 
          onClick={onClose} 
          className="absolute inset-0 bg-transparent modal-overlay" 
          style={{ pointerEvents: 'auto' }}
        />
      )}
      <div 
        className="relative z-[9999] bg-gray-900 w-[400px] max-h-[80vh] overflow-hidden shadow-lg rounded-lg flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="p-4 border-b border-gray-800">
          <h2 className="text-xl font-semibold text-white">Vigilante Settings</h2>
          <p className="text-gray-400 text-sm mt-1">
            Configure how Vigilante analyzes your feed
          </p>
        </header>

        <div className="p-4 flex-1 overflow-y-auto space-y-6">
          {/* Enable/Disable Toggle Switch */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-medium text-white">Extension Status</h2>
              <p className="text-xs text-gray-400">
                Toggle fact-checking functionality
              </p>
            </div>
            <button
              onClick={() => setIsEnabled(!isEnabled)}
              className={`relative w-12 h-6 transition-colors rounded-full ${
                isEnabled ? "bg-green-600" : "bg-red-800"
              }`}
            >
              <div
                className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-all ${
                  isEnabled ? "left-[26px]" : "left-0.5"
                }`}
              />
            </button>
          </div>

          {/* Semantic Filter Field */}
          <div>
            <h2 className="text-sm font-medium text-white mb-1">Semantic Filter</h2>
            <p className="text-xs text-gray-400 mb-2">
              Only show posts matching these topics
            </p>
            <input
              type="text"
              value={semanticFilter}
              onChange={(e) => setSemanticFilter(e.target.value)}
              placeholder="arxiv papers and ML"
              className="w-full px-3 py-2 text-sm rounded-md bg-gray-800 border border-gray-700 text-gray-300 outline-none focus:ring-2 focus:ring-gray-600"
            />
          </div>

          {/* Keyword Exclusions Field */}
          <div>
            <h2 className="text-sm font-medium text-white mb-1">Excluded Keywords</h2>
            <p className="text-xs text-gray-400 mb-2">
              Skip posts containing these words
            </p>
            <input
              type="text"
              value={excludedKeywords}
              onChange={(e) => setExcludedKeywords(e.target.value)}
              placeholder="politics, Stanford, etc."
              className="w-full px-3 py-2 text-sm rounded-md bg-gray-800 border border-gray-700 text-gray-300 outline-none focus:ring-2 focus:ring-gray-600"
            />
          </div>
        </div>
      </div>
    </div>
  )

  return createPortal(content, document.body)
}