import React from 'react'
import { useToaster } from 'react-hot-toast/headless'
import { toast } from 'react-hot-toast'

interface ToastOptions {
  message: string
  type?: 'success' | 'error' | 'info'
  title?: string
  duration?: number
}

// Background color helper
const getBackgroundColor = (type: ToastOptions['type']) => {
  switch (type) {
    case 'success':
      return 'bg-[#2563eb]'
    case 'error':
      return 'bg-[#dc2626]'
    default:
      return 'bg-[#3a6ea5]'
  }
}

// Toast Content Component
const ToastContent = ({
  message,
  type = 'info',
  title,
  t,
}: ToastOptions & { t: any }) => (
  <div
    className={`${getBackgroundColor(type)} flex w-full rounded-sm shadow-lg`}
  >
    <div className="flex-1 w-0 p-4">
      <div className="flex items-start">
        <div className="ml-3 flex-1">
          {title && <p className="text-sm font-medium text-white">{title}</p>}
          <p className={`${title ? 'mt-1' : ''} text-sm text-white`}>
            {message}
          </p>
        </div>
      </div>
    </div>
    <div className="flex border-l border-white/10">
      <button
        onClick={() => toast.dismiss(t.id)}
        className="w-full border border-transparent rounded-none rounded-r-sm p-4 flex items-center justify-center text-sm font-medium text-white hover:bg-white/10 focus:outline-none"
      >
        Close
      </button>
    </div>
  </div>
)

export const NotificationContainer = () => {
  const { toasts, handlers } = useToaster()
  const { startPause, endPause, calculateOffset, updateHeight } = handlers

  return (
    <div
      className="fixed top-4 right-4 w-full max-w-md z-50"
      onMouseEnter={startPause}
      onMouseLeave={endPause}
    >
      {toasts.map((t) => {
        const offset = calculateOffset(t, {
          reverseOrder: false,
          gutter: 8,
        })

        const ref = (el: HTMLDivElement | null) => {
          if (el && typeof t.height !== 'number') {
            const height = el.getBoundingClientRect().height
            updateHeight(t.id, height)
          }
        }

        return (
          <div
            key={t.id}
            ref={ref}
            className={`${
              t.visible ? 'animate-enter' : 'animate-leave'
            } pointer-events-auto`}
            style={{
              position: 'absolute',
              width: '100%',
              transition: 'all 0.3s ease-out',
              opacity: t.visible ? 1 : 0,
              transform: `translateY(${offset}px)`,
            }}
            {...t.ariaProps}
          >
            <ToastContent {...(t.message as ToastOptions)} t={t} />
          </div>
        )
      })}
    </div>
  )
}

export const showToast = ({
  message,
  type = 'info',
  title,
  duration = 7000,
}: ToastOptions) => {
  toast({ message, type, title }, { duration })
}

// Helper functions
export const showSuccessToast = (message: string, title?: string) => {
  showToast({
    message,
    type: 'success',
    title,
  })
}

export const showErrorToast = (message: string, title?: string) => {
  showToast({
    message,
    type: 'error',
    title,
  })
}

export const showInfoToast = (message: string, title?: string) => {
  showToast({
    message,
    type: 'info',
    title,
  })
}
