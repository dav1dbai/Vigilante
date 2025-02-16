import React from "react"
import { createPortal } from "react-dom"
import { useStorage } from "@plasmohq/storage/hook"

type SettingsPanelProps = {
  onClose: () => void
}

export default function SettingsPanel({ onClose }: SettingsPanelProps) {
  const [isEnabled, setIsEnabled] = useStorage<boolean>("vigilante-enabled", true)
  const [semanticFilter, setSemanticFilter] = useStorage<string>("vigilante-semantic-filter", "")
  const [excludedKeywords, setExcludedKeywords] = useStorage<string>("vigilante-excluded-keywords", "")

  const content = (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay for closing when clicking outside */}
      <div onClick={onClose} className="absolute inset-0 bg-black opacity-50" />
      {/* The actual settings panel remains fully styled */}
      <div className="relative w-[400px] bg-zinc-950 text-zinc-100 p-6 shadow-lg rounded-md">
        <button onClick={onClose} className="absolute top-2 right-2 text-white">
          Close
        </button>
        <header className="mb-6">
          <h1 className="text-xl font-semibold mb-2">Vigilante Settings</h1>
          <p className="text-sm text-zinc-400">
            Configure how Vigilante analyzes your feed
          </p>
        </header>
        <div className="space-y-6">
          {/* Enable/Disable Toggle Switch */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-medium">Extension Status</h2>
              <p className="text-xs text-zinc-400">
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
            <h2 className="text-sm font-medium mb-1">Semantic Filter</h2>
            <p className="text-xs text-zinc-400 mb-2">
              Only show posts matching these topics
            </p>
            <input
              type="text"
              value={semanticFilter}
              onChange={(e) => setSemanticFilter(e.target.value)}
              placeholder="machine learning"
              className="w-[70%] px-3 py-2 text-sm rounded-md bg-zinc-900 border border-zinc-800 text-zinc-100 outline-none focus:ring-2 focus:ring-zinc-700"
            />
          </div>

          {/* Keyword Exclusions Field */}
          <div>
            <h2 className="text-sm font-medium mb-1">Excluded Keywords</h2>
            <p className="text-xs text-zinc-400 mb-2">
              Skip posts containing these words
            </p>
            <input
              type="text"
              value={excludedKeywords}
              onChange={(e) => setExcludedKeywords(e.target.value)}
              placeholder="coding, meme"
              className="w-[70%] px-3 py-2 text-sm rounded-md bg-zinc-900 border border-zinc-800 text-zinc-100 outline-none focus:ring-2 focus:ring-zinc-700"
            />
          </div>
        </div>
      </div>
    </div>
  )

  return createPortal(content, document.body)
}