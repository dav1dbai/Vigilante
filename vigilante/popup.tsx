import { useState, useEffect } from "react"
import { useStorage } from "@plasmohq/storage/hook"
import { sendToContentScript } from "@plasmohq/messaging"


function IndexPopup() {

  useEffect(() => {
    async function toggleSettingsPanel() {
      await sendToContentScript({
        name: "toggle-settings-panel",
      })
      window.close()
    }
    toggleSettingsPanel()
  }, [])
  
  return null;
}

export default IndexPopup;