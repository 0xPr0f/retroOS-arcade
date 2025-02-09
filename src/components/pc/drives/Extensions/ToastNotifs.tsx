import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  memo,
  useRef,
} from 'react'
import {
  X,
  Bell,
  Trash2,
  Check,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  Eye,
  type LucideIcon,
} from 'lucide-react'

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

interface NotificationOptions {
  icon?: React.ReactNode
  customStyle?: React.CSSProperties
  className?: string
  persistent?: boolean
  showToast?: boolean
  theme?: 'light' | 'dark'
  duration?: number
  onClick?: () => void
  onClose?: () => void
  actions?: NotificationAction[]
}

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

const Toast = memo(
  ({
    notification,
    onClose,
    theme = DEFAULT_THEME,
  }: {
    notification: Notification
    onClose: () => void
    theme?: NotificationTheme
  }) => {
    const style = NOTIFICATION_STYLES[notification.type]
    const currentTheme =
      notification.theme === 'dark' ? theme.dark : theme.light

    return (
      <div
        className={`
        ${style.backgroundColor} 
        ${style.hoverBackground}
        rounded-sm shadow-lg max-w-md w-full animate-enter
        ${notification.className || ''}
      `}
        style={notification.customStyle}
        onClick={notification.onClick}
      >
        <div className="flex p-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 text-white">
              {notification.icon || style.icon}
              <p className="text-sm font-medium">{notification.title}</p>
            </div>
            <p className="mt-1 text-sm text-white/90">{notification.message}</p>
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
            className="text-white/80 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>
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
        id: Date.now().toString(),
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
              className="fixed inset-0 bg-black/20 z-50"
              onClick={() => setIsOpen(false)}
            />
            <div className="fixed right-4 top-16 z-50 w-full max-w-sm bg-white/10 rounded-sm shadow-xl">
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-medium">Notifications</h2>
                  {unreadCount > 0 && (
                    <span className="px-2 py-1 text-xs font-medium bg-blue-500 text-white rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={markAllAsRead}
                    className="p-2 text-gray-700 hover:text-gray-900 transition-colors"
                    title="Mark all as read"
                  >
                    <Check size={20} />
                  </button>

                  <button
                    onClick={clearNotifications}
                    className="p-2 text-gray-700 hover:text-gray-900 transition-colors"
                    title="Clear all"
                  >
                    <Trash2 size={20} />
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
              <div className="divide-y max-h-[calc(100vh-12rem)] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
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
  NotificationType,
  NotificationStyle,
  NotificationTheme,
}

// Constants export
export const STORAGE_KEY = 'notifications:storage'
export { NOTIFICATION_STYLES, DEFAULT_THEME }
