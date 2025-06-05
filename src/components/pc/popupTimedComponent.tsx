'use client'
import React from 'react'

interface PopupData {
  nextTime?: number
  dontShowAgain?: boolean
}

interface PopupOptions {
  popupId: string
  delay?: number
  remindLaterDelay?: number
  title?: string
  message?: string
  onOpen?: ((id: string) => void) | null
  onAction?: ((action: string, id: string) => void) | null
}

const usePopupManager = (createDispatchWindow: any) => {
  const activePopupRef = React.useRef<string | null>(null)
  const timerRef = React.useRef<NodeJS.Timeout | null>(null)

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

  const setupPopup = (options: PopupOptions) => {
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

    const popupData = getPopupData()[popupId] || {}

    if (popupData.dontShowAgain) return

    const showPopup = () => {
      if (activePopupRef.current) return

      const handleAction = (action: string) => {
        if (action === 'later') {
          updatePopupData(popupId, { nextTime: Date.now() + remindLaterDelay })
        } else if (action === 'never') {
          updatePopupData(popupId, { dontShowAgain: true })
        }

        if (onAction) onAction(action, popupId)

        activePopupRef.current = null
      }

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

      activePopupRef.current = createDispatchWindow({
        title: 'Popup',
        content: () => popupContent,
        onClose: () => {
          activePopupRef.current = null
        },
      })

      if (onOpen) onOpen(popupId)
    }

    const nextTime = popupData.nextTime

    if (nextTime) {
      const timeRemaining = nextTime - Date.now()

      if (timeRemaining <= 0) {
        showPopup()
      } else {
        timerRef.current = setTimeout(showPopup, timeRemaining)
      }
    } else {
      timerRef.current = setTimeout(showPopup, delay)
    }
  }

  const cleanupPopups = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    activePopupRef.current = null
  }

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
