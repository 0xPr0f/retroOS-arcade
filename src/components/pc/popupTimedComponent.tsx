'use client'

import React from 'react'

// Define the PopupData interface
interface PopupData {
  nextTime?: number
  dontShowAgain?: boolean
}

// Define the PopupOptions interface
interface PopupOptions {
  popupId: string
  delay?: number
  remindLaterDelay?: number
  title?: string
  message?: string
  onOpen?: ((id: string) => void) | null
  onAction?: ((action: string, id: string) => void) | null
}

// PopupManager utility for parent component
const usePopupManager = (createDispatchWindow: any) => {
  // Keep track of active popups
  const activePopupRef = React.useRef<string | null>(null)
  const timerRef = React.useRef<NodeJS.Timeout | null>(null)

  // Storage helpers
  const getPopupData = (): Record<string, PopupData> => {
    try {
      const data = localStorage.getItem('app_popups_data')
      return data ? JSON.parse(data) : {}
    } catch (e) {
      console.error('Failed to get popup data', e)
      return {}
    }
  }

  const updatePopupData = (id: string, updates: Partial<PopupData>): void => {
    try {
      const allData = getPopupData()
      allData[id] = { ...(allData[id] || {}), ...updates }
      localStorage.setItem('app_popups_data', JSON.stringify(allData))
    } catch (e) {
      console.error('Failed to update popup data', e)
    }
  }

  // Set up a popup with timer
  const setupPopup = (options: PopupOptions) => {
    // Clear any existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }

    const {
      popupId,
      delay = 30000,
      remindLaterDelay = 24 * 60 * 60 * 1000,
      title = 'Important Message',
      message = 'This is your important popup message.',
      onOpen,
      onAction,
    } = options

    // Check if we should show popup
    const popupData = getPopupData()[popupId] || {}

    // Don't show if user opted out
    if (popupData.dontShowAgain) return

    // Function to create and show the popup
    const showPopup = () => {
      // Don't create another popup if one is already active
      if (activePopupRef.current) return

      // Create action handlers
      const handleAction = (action: string) => {
        if (action === 'later') {
          updatePopupData(popupId, { nextTime: Date.now() + remindLaterDelay })
        } else if (action === 'never') {
          updatePopupData(popupId, { dontShowAgain: true })
        }

        // Call custom function if provided
        if (onAction) onAction(action, popupId)

        // Clear the active popup reference
        activePopupRef.current = null
      }

      // Create the popup content
      const popupContent = (
        <div
          className="popup-container text-black"
          style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '8px',
          }}
        >
          <h3>{title}</h3>
          <p>{message}</p>
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '10px',
              marginTop: '1.5rem',
            }}
          >
            <button
              onClick={() => handleAction('close')}
              style={{
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer',
                backgroundColor: '#f1f1f1',
                border: '1px solid #ddd',
              }}
            >
              Close
            </button>
            <button
              onClick={() => handleAction('later')}
              style={{
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer',
                backgroundColor: '#f1f1f1',
                border: '1px solid #ddd',
              }}
            >
              Remind Later
            </button>
            <button
              onClick={() => handleAction('never')}
              style={{
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer',
                backgroundColor: '#ff6b6b',
                color: 'white',
                border: 'none',
              }}
            >
              Don't Show Again
            </button>
          </div>
        </div>
      )

      // Create the window and store the ID
      activePopupRef.current = createDispatchWindow({
        title: 'Popup',
        content: () => popupContent,
        onClose: () => {
          activePopupRef.current = null
        },
      })

      // Call onOpen function if provided
      if (onOpen) onOpen(popupId)
    }

    // Check next scheduled time
    const nextTime = popupData.nextTime

    if (nextTime) {
      const timeRemaining = nextTime - Date.now()

      if (timeRemaining <= 0) {
        // Show immediately
        showPopup()
      } else {
        // Set timer for remaining time
        timerRef.current = setTimeout(showPopup, timeRemaining)
      }
    } else {
      // First visit - set timer for delay
      timerRef.current = setTimeout(showPopup, delay)
    }
  }

  // Clean up function to call when component unmounts
  const cleanupPopups = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    activePopupRef.current = null
  }

  // Reset function for testing
  const resetPopup = (popupId: string) => {
    const allData = getPopupData()
    if (allData[popupId]) {
      delete allData[popupId]
      localStorage.setItem('app_popups_data', JSON.stringify(allData))
      return true
    }
    return false
  }

  return {
    setupPopup,
    cleanupPopups,
    resetPopup,
  }
}

export default usePopupManager
