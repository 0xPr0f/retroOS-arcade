import { cn } from '@/components/library/utils'
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Eye,
  Info,
  Trash2,
  X,
} from 'lucide-react'
import React, {
  createContext,
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

// Make all theme properties optional with defaults
interface NotificationTheme {
  light?: {
    background?: string
    text?: string
    border?: string
  }
  dark?: {
    background?: string
    text?: string
    border?: string
  }
}

const DEFAULT_THEME: Required<NotificationTheme> = {
  light: {
    background: 'bg-white',
    text: 'text-gray-900',
    border: 'border-gray-200',
  },
  dark: {
    background: 'bg-gray-800',
    text: 'text-white',
    border: 'border-gray-700',
  },
}

// Make style properties optional
interface NotificationStyleOptions {
  icon?: React.ReactNode
  backgroundColor?: string
  iconColor?: string
  hoverBackground?: string
  activeBackground?: string
}

// Define required style properties with defaults
interface NotificationStyle extends Required<NotificationStyleOptions> {}

type NotificationType = 'success' | 'error' | 'info' | 'warning'

const DEFAULT_NOTIFICATION_STYLE: NotificationStyle = {
  icon: <Info size={20} />,
  backgroundColor: 'bg-blue-600',
  iconColor: 'text-blue-400',
  hoverBackground: 'hover:bg-blue-700',
  activeBackground: 'active:bg-blue-800',
}

const NOTIFICATION_STYLES: Record<NotificationType, NotificationStyle> = {
  success: {
    icon: <CheckCircle2 size={20} />,
    backgroundColor: 'bg-emerald-600',
    iconColor: 'text-emerald-400',
    hoverBackground: 'hover:bg-emerald-700',
    activeBackground: 'active:bg-emerald-800',
  },
  error: {
    icon: <AlertCircle size={20} />,
    backgroundColor: 'bg-red-600',
    iconColor: 'text-red-400',
    hoverBackground: 'hover:bg-red-700',
    activeBackground: 'active:bg-red-800',
  },
  warning: {
    icon: <AlertTriangle size={20} />,
    backgroundColor: 'bg-amber-600',
    iconColor: 'text-amber-400',
    hoverBackground: 'hover:bg-amber-700',
    activeBackground: 'active:bg-amber-800',
  },
  info: {
    ...DEFAULT_NOTIFICATION_STYLE,
  },
}

// Make most notification properties optional
interface BaseNotification {
  id: string
  title: string
  message: string
  type: NotificationType
  timestamp: number
  read: boolean
}

interface NotificationAction {
  label: string
  onClick: () => void
  icon?: React.ReactNode
  className?: string
}
type NotificationPosition =
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right'
  | 'top-center'
  | 'bottom-center'
  | {
      top?: number | string
      bottom?: number | string
      left?: number | string
      right?: number | string
    }

interface NotificationOptions {
  icon?: React.ReactNode
  customStyle?: React.CSSProperties
  customComponent?: React.ReactNode
  className?: string
  persistent?: boolean
  showToast?: boolean
  theme?: 'light' | 'dark'
  duration?: number
  onClick?: () => void
  onClose?: () => void
  actions?: NotificationAction[]
  position?: NotificationPosition
}

const DEFAULT_POSITION: NotificationPosition = 'top-right'

type Notification = BaseNotification & Partial<NotificationOptions>

interface NotificationContextType {
  notifications: Notification[]
  addNotification: (
    notification: Omit<BaseNotification, 'id' | 'timestamp' | 'read'> &
      Partial<NotificationOptions>
  ) => void
  addSilentNotification: (
    notification: Omit<
      BaseNotification,
      'id' | 'timestamp' | 'read' | 'showToast'
    > &
      Omit<Partial<NotificationOptions>, 'showToast'>
  ) => void
  clearNotifications: () => void
  clearAllExceptPersistent: () => void
  markAllAsRead: () => void
  markAsRead: (id: string) => void
  removeNotification: (id: string) => void
  openNotificationPanel: () => void
  unreadCount: number
}

interface NotificationProviderProps {
  children: React.ReactNode
  theme?: NotificationTheme
  defaultDuration?: number
  storageKey?: string
  toastDelay?: number
}

class NotificationEmitter {
  private listeners: Set<(notification: Notification) => void> = new Set()
  private lastToastTime: number = 0
  private queuedNotifications: Notification[] = []
  private processingQueue: boolean = false
  private readonly toastDelay: number

  constructor(toastDelay: number = 1500) {
    this.toastDelay = toastDelay
  }

  emit(notification: Notification) {
    if (!notification.showToast) {
      this.listeners.forEach((listener) => {
        if (listener.name !== 'toastListener') {
          listener(notification)
        }
      })
      return
    }

    this.listeners.forEach((listener) => {
      if (listener.name !== 'toastListener') {
        listener(notification)
        return
      }

      const now = Date.now()
      if (now - this.lastToastTime >= this.toastDelay) {
        this.lastToastTime = now
        listener(notification)
      } else {
        this.queuedNotifications.push(notification)
        if (!this.processingQueue) {
          this.processQueue()
        }
      }
    })
  }

  private async processQueue() {
    if (this.processingQueue || this.queuedNotifications.length === 0) return

    this.processingQueue = true

    while (this.queuedNotifications.length > 0) {
      const now = Date.now()
      const timeSinceLastToast = now - this.lastToastTime

      if (timeSinceLastToast >= this.toastDelay) {
        const notification = this.queuedNotifications.shift()
        if (notification) {
          this.lastToastTime = now
          this.listeners.forEach((listener) => {
            if (listener.name === 'toastListener') {
              listener(notification)
            }
          })
        }
      }

      await new Promise((resolve) =>
        setTimeout(resolve, Math.max(0, this.toastDelay - timeSinceLastToast))
      )
    }

    this.processingQueue = false
  }

  subscribe(listener: (notification: Notification) => void): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }
}

const DEFAULT_STORAGE_KEY = 'notifications:storage'
const DEFAULT_TOAST_DURATION = 5000
const DEFAULT_TOAST_DELAY = 1500
const NOTIFICATION_SPACING = 8 // Space between notifications in pixels
const useNotificationPosition = (
  index: number,
  position: NotificationPosition,
  onHeightChange: (index: number, height: number) => void
) => {
  const notificationRef = useRef(null)
  const [height, setHeight] = useState(0)
  const spacing = NOTIFICATION_SPACING

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const newHeight = entry.contentRect.height
        setHeight(newHeight)
        onHeightChange(index, newHeight)
      }
    })

    if (notificationRef.current) {
      observer.observe(notificationRef.current)
    }

    return () => observer.disconnect()
  }, [index, onHeightChange])

  const calculateOffset = (heights: number[]) => {
    const previousHeights = heights
      .slice(0, index)
      .reduce((sum: number, h: number) => sum + h + spacing, 0)
    return String(position)?.startsWith('top')
      ? 46 + previousHeights
      : 16 + previousHeights
  }

  return { notificationRef, height, calculateOffset }
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
)

const NotificationItem = memo(
  ({
    notification,
    onRemove,
    onMarkAsRead,
    theme = DEFAULT_THEME,
  }: {
    notification: Notification
    onRemove: (id: string) => void
    onMarkAsRead: (id: string) => void
    theme?: NotificationTheme
  }) => {
    const style = NOTIFICATION_STYLES[notification.type]
    const currentTheme =
      notification.theme === 'dark' ? theme.dark : theme.light

    return (
      <div
        className={`
        p-4 
        ${
          notification.read
            ? currentTheme?.background || DEFAULT_THEME.light.background
            : 'bg-blue-50/20'
        }
        transition-colors duration-200 hover:bg-opacity-25
        ${notification.className || ''}
      `}
        style={notification.customStyle}
        onClick={() => !notification.read && onMarkAsRead(notification.id)}
      >
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <span className={style.iconColor}>
              {notification.icon || style.icon}
            </span>
            <h3
              className={`font-medium ${
                currentTheme?.text || DEFAULT_THEME.light.text
              }`}
            >
              {notification.title}
            </h3>
          </div>
          {!notification.persistent && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onRemove(notification.id)
              }}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>
        <p
          className={`mt-1 text-sm ${
            currentTheme?.text || DEFAULT_THEME.light.text
          }`}
        >
          {notification.message}
        </p>
        <p className="mt-1 text-xs text-gray-900">
          {new Date(notification.timestamp).toLocaleString()}
        </p>
        {notification.actions && (
          <div className="mt-2 flex gap-2">
            {notification.actions.map((action, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation()
                  action.onClick()
                }}
                className={`
                flex items-center gap-1 px-2 py-1 rounded-sm 
                text-sm hover:opacity-80 transition-opacity
                ${action.className || 'text-blue-500 hover:text-blue-600'}
              `}
              >
                {action.icon}
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }
)
interface NotificationGroup {
  [key: string]: Notification[]
}

//const DEFAULT_POSITION: NotificationPosition = 'top-right'

const MAX_NOTIFICATIONS = 8 // Maximum number of notifications to show at once

const Toast = memo(
  ({
    notification,
    onClose,
    index,
    theme = DEFAULT_THEME,
    heights,
    onHeightChange,
  }: {
    notification: Notification
    onClose: () => void
    index: number
    theme?: NotificationTheme
    heights?: {}
    onHeightChange?: (index: number, height: number) => void
  }) => {
    const style = NOTIFICATION_STYLES[notification.type]
    const currentTheme =
      notification.theme === 'dark' ? theme.dark : theme.light

    // Get position styles with stacking
    const getPositionStyle = (
      pos?: NotificationPosition
    ): React.CSSProperties => {
      const offset = calculateOffset(Object.values(heights!))

      if (!pos || typeof pos === 'string') {
        switch (pos || DEFAULT_POSITION) {
          case 'top-left':
            return { top: `${30 + offset}px`, left: '1rem' }
          case 'top-right':
            return { top: `${30 + offset}px`, right: '1rem' } // Adjusted to be slightly lower
          case 'bottom-left':
            return { bottom: `${16 + offset}px`, left: '1rem' }
          case 'bottom-right':
            return { bottom: `${16 + offset}px`, right: '1rem' }
          case 'top-center':
            return {
              top: `${8 + offset}px`, // Adjusted to be slightly lower
              left: '50%',
              transform: 'translateX(-50%)',
            }
          case 'bottom-center':
            return {
              bottom: `${16 + offset}px`,
              left: '50%',
              transform: 'translateX(-50%)',
            }
        }
      }
      return pos as React.CSSProperties
    }

    const getAnimationClass = (pos?: NotificationPosition): string => {
      if (!pos || typeof pos === 'string') {
        const position = pos || DEFAULT_POSITION
        if (position.startsWith('top')) {
          return 'animate-slide-in-down'
        }
        return 'animate-slide-in-up'
      }
      return 'animate-fade-in'
    }

    const { notificationRef, calculateOffset } = useNotificationPosition(
      index,
      notification.position!,
      onHeightChange!
    )

    return (
      <div
        ref={notificationRef}
        className={cn(
          `fixed z-50
          ${style.backgroundColor} 
          ${style.hoverBackground}
          rounded-md shadow-lg w-72 max-w-xs`,
          `${getAnimationClass(notification.position)}`,
          `${notification.className || ''}
          transition-all duration-300 ease-in-out
         border border-black 
        `
        )}
        style={{
          ...notification.customStyle,
          ...getPositionStyle(notification.position),
        }}
        onClick={notification.onClick}
      >
        {notification.customComponent || (
          <div className="flex gap-1 p-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 text-white">
                {notification.icon || style.icon}
                <p className="text-sm font-medium">{notification.title}</p>
              </div>
              <p className="mt-1 text-sm text-white/90">
                {notification.message}
              </p>
              {notification.actions && (
                <div className="mt-2 flex gap-2">
                  {notification.actions.map((action, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation()
                        action.onClick()
                      }}
                      className={`
                      flex items-center gap-1 px-2 py-1 rounded-sm 
                      text-sm text-white/90 hover:text-white transition-colors
                      ${action.className || ''}
                    `}
                    >
                      {action.icon}
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onClose()
                notification.onClose?.()
              }}
              className="text-white/50 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        )}
      </div>
    )
  }
)

const emitter = new NotificationEmitter(DEFAULT_TOAST_DELAY)

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
  theme = DEFAULT_THEME,
  defaultDuration = DEFAULT_TOAST_DURATION,
  storageKey = DEFAULT_STORAGE_KEY,
  toastDelay = DEFAULT_TOAST_DELAY,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isInitialized, setIsInitialized] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const isInternalUpdate = useRef(false)

  useEffect(() => {
    const stored = localStorage.getItem(storageKey)
    if (stored) {
      try {
        setNotifications(JSON.parse(stored))
      } catch (error) {
        console.error('Failed to parse stored notifications:', error)
      }
    }
    setIsInitialized(true)
  }, [storageKey])

  useEffect(() => {
    if (isInitialized && !isInternalUpdate.current) {
      localStorage.setItem(storageKey, JSON.stringify(notifications))
    }
  }, [notifications, isInitialized, storageKey])

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (
        event.key === storageKey &&
        event.newValue &&
        event.oldValue !== event.newValue
      ) {
        try {
          const newNotifications = JSON.parse(event.newValue)
          isInternalUpdate.current = true
          setNotifications(newNotifications)
          setTimeout(() => {
            isInternalUpdate.current = false
          }, 0)
        } catch (error) {
          console.error('Failed to parse notifications from storage:', error)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [storageKey])

  const addNotification = useCallback(
    (
      notification: Omit<BaseNotification, 'id' | 'timestamp' | 'read'> &
        Partial<NotificationOptions>
    ) => {
      const newNotification: Notification = {
        ...notification,
        id: (Math.random() * Date.now()).toString(),
        timestamp: Date.now(),
        read: false,
        showToast: true,
        duration: notification.duration || defaultDuration,
      }

      setNotifications((prev) => [newNotification, ...prev])
      emitter.emit(newNotification)
    },
    [defaultDuration]
  )

  const addSilentNotification = useCallback(
    (
      notification: Omit<
        BaseNotification,
        'id' | 'timestamp' | 'read' | 'showToast'
      > &
        Omit<Partial<NotificationOptions>, 'showToast'>
    ) => {
      const newNotification: Notification = {
        ...notification,
        id: Date.now().toString(),
        timestamp: Date.now(),
        read: false,
        showToast: false,
      }

      setNotifications((prev) => [newNotification, ...prev])
      emitter.emit(newNotification)
    },
    []
  )

  const clearNotifications = useCallback(() => {
    setNotifications([])
  }, [])

  const clearAllExceptPersistent = useCallback(() => {
    setNotifications((prev) => prev.filter((n) => n.persistent))
  }, [])

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }, [])

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }, [])

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  const openNotificationPanel = useCallback(() => {
    setIsOpen(true)
  }, [])

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  )

  const contextValue = useMemo(
    () => ({
      notifications,
      addNotification,
      addSilentNotification,
      clearNotifications,
      clearAllExceptPersistent,
      markAllAsRead,
      markAsRead,
      removeNotification,
      openNotificationPanel,
      unreadCount,
    }),
    [
      notifications,
      addNotification,
      addSilentNotification,
      clearNotifications,
      clearAllExceptPersistent,
      markAllAsRead,
      markAsRead,
      removeNotification,
      openNotificationPanel,
      unreadCount,
    ]
  )

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      <ToastContainer />
      <NotificationCenter isOpen={isOpen} setIsOpen={setIsOpen} />
    </NotificationContext.Provider>
  )
}
/*
export const ToastContainer = memo(
  ({ theme = DEFAULT_THEME }: { theme?: NotificationTheme }) => {
    const [toasts, setToasts] = useState<Notification[]>([])

    useEffect(() => {
      function toastListener(notification: Notification) {
        if (notification.showToast) {
          setToasts((prev) => [...prev, notification])

          if (!notification.persistent) {
            setTimeout(() => {
              setToasts((prev) => prev.filter((t) => t.id !== notification.id))
            }, notification.duration || DEFAULT_TOAST_DURATION)
          }
        }
      }

      const unsubscribe = emitter.subscribe(toastListener)
      return () => unsubscribe()
    }, [])

    return (
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            notification={toast}
            onClose={() =>
              setToasts((prev) => prev.filter((t) => t.id !== toast.id))
            }
            theme={theme}
          />
        ))}
      </div>
    )
  }
)
*/
export const ToastContainer = memo(
  ({ theme = DEFAULT_THEME }: { theme?: NotificationTheme }) => {
    const [toasts, setToasts] = useState<Notification[]>([])

    useEffect(() => {
      function toastListener(notification: Notification) {
        if (notification.showToast) {
          setToasts((prev) => {
            // Remove oldest notification if we exceed max
            const newToasts = [...prev]
            if (newToasts.length >= MAX_NOTIFICATIONS) {
              newToasts.pop() // Remove oldest
            }
            return [notification, ...newToasts]
          })

          if (!notification.persistent) {
            setTimeout(() => {
              setToasts((prev) => prev.filter((t) => t.id !== notification.id))
            }, notification.duration || DEFAULT_TOAST_DURATION)
          }
        }
      }

      const unsubscribe = emitter.subscribe(toastListener)
      return () => unsubscribe()
    }, [])

    // Group notifications by position
    const groupedToasts = useMemo(() => {
      return toasts.reduce((acc: NotificationGroup, toast) => {
        const position = toast.position || DEFAULT_POSITION
        const key = typeof position === 'string' ? position : 'custom'
        if (!acc[key]) {
          acc[key] = []
        }
        acc[key].push(toast)
        return acc
      }, {})
    }, [toasts])

    const [heights, setHeights] = useState({})

    const handleHeightChange = (index: any, height: any) => {
      setHeights((prev) => ({ ...prev, [index]: height }))
    }

    return (
      <>
        {Object.entries(groupedToasts).map(([position, groupToasts]) => (
          <div key={position} className="notification-group">
            {groupToasts.map((toast, index) => (
              <Toast
                key={toast.id}
                notification={toast}
                index={index}
                heights={heights}
                onHeightChange={handleHeightChange}
                onClose={() =>
                  setToasts((prev) => prev.filter((t) => t.id !== toast.id))
                }
                theme={theme}
              />
            ))}
          </div>
        ))}
      </>
    )
  }
)

// Updated NotificationCenter with better sizing and styling
const NotificationCenter = memo(
  ({
    isOpen,
    setIsOpen,
  }: {
    isOpen: boolean
    setIsOpen: (isOpen: boolean) => void
  }) => {
    const {
      notifications,
      clearNotifications,
      clearAllExceptPersistent,
      markAllAsRead,
      markAsRead,
      removeNotification,
      unreadCount,
    } = useNotifications()

    return (
      <>
        {isOpen && (
          <>
            <div
              className={cn(
                'fixed inset-0 z-50' /*"bg-black/20 backdrop-blur-sm "*/
              )}
              onClick={() => setIsOpen(false)}
            />
            <div className="fixed right-4 top-12 z-50 w-full max-w-xs bg-white rounded-lg shadow-xl">
              <div className="flex items-center justify-between p-3 border-b">
                <div className="flex items-center gap-2">
                  <h2 className="text-base text-black font-medium">
                    Notifications
                  </h2>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 text-xs font-medium bg-blue-500 text-white rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={markAllAsRead}
                    className="p-1.5 text-gray-500 hover:text-gray-700 transition-colors rounded-md hover:bg-gray-100"
                    title="Mark all as read"
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    onClick={clearNotifications}
                    className="p-1.5 text-gray-500 hover:text-gray-700 transition-colors rounded-md hover:bg-gray-100"
                    title="Clear all"
                  >
                    <Trash2 size={16} />
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 text-gray-500 hover:text-gray-700 transition-colors rounded-md hover:bg-gray-100"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
              <div className="divide-y max-h-[calc(100vh-12rem)] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 text-sm">
                    No notifications
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onRemove={removeNotification}
                      onMarkAsRead={markAsRead}
                    />
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </>
    )
  }
)

// Hook to use notifications
export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error(
      'useNotifications must be used within a NotificationProvider'
    )
  }
  return context
}

// Example usage and types export
export type {
  Notification,
  NotificationStyle,
  NotificationTheme,
  NotificationType,
}

// Constants export
export const STORAGE_KEY = 'notifications:storage'
export { DEFAULT_THEME, NOTIFICATION_STYLES }
