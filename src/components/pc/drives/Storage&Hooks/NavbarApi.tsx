import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from 'react'

interface NavbarItem {
  id: string
  content: ReactNode
  persistent?: boolean
  position?: 'left' | 'center' | 'right'
}

interface NavbarContextType {
  // Simple content access
  navbarContent: ReactNode

  // Content status
  hasNavbarContent: boolean

  // Advanced content management
  setNavbarContent: (
    content: ReactNode,
    options?: Partial<Omit<NavbarItem, 'content' | 'id'>>
  ) => string
  removeNavbarContent: (id: string) => void
  clearNavbarContent: () => void

  // History
  history: NavbarItem[]
  goBack: () => void
  clearHistory: () => void

  // Visibility
  isVisible: boolean
  show: () => void
  hide: () => void
  toggle: () => void
}

const NavbarContext = createContext<NavbarContextType | undefined>(undefined)

interface NavbarProviderProps {
  children: ReactNode
  maxHistorySize?: number
}

export const NavbarProvider: React.FC<NavbarProviderProps> = ({
  children,
  maxHistorySize = 10,
}) => {
  const [items, setItems] = useState<NavbarItem[]>([])
  const [history, setHistory] = useState<NavbarItem[]>([])
  const [isVisible, setIsVisible] = useState(true)

  // Calculate if there's any content
  const hasNavbarContent = items.length > 0

  // Generate unique ID for content items
  const generateId = useCallback(() => {
    return `nav-${Date.now().toString(36)}-${Math.random()
      .toString(36)
      .substr(2, 5)}`
  }, [])

  const setNavbarContent = useCallback(
    (
      content: ReactNode,
      options?: Partial<Omit<NavbarItem, 'content' | 'id'>>
    ) => {
      const id = generateId()
      const newItem: NavbarItem = {
        id,
        content,
        ...options,
      }

      setItems((prev) => {
        // Keep persistent items and add new item
        const persistentItems = prev.filter((item) => item.persistent)
        const newItems = [...persistentItems, newItem]

        // Add to history
        const nonPersistentItems = prev.filter((item) => !item.persistent)
        if (nonPersistentItems.length > 0) {
          setHistory((prevHistory) =>
            [...nonPersistentItems, ...prevHistory].slice(0, maxHistorySize)
          )
        }

        return newItems
      })

      return id
    },
    [generateId, maxHistorySize]
  )

  const removeNavbarContent = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }, [])

  const clearNavbarContent = useCallback(() => {
    setItems((prev) => prev.filter((item) => item.persistent))
  }, [])

  const goBack = useCallback(() => {
    if (history.length > 0) {
      const [latestItem, ...remainingHistory] = history
      setItems((prev) => {
        const persistentItems = prev.filter((item) => item.persistent)
        return [...persistentItems, latestItem]
      })
      setHistory(remainingHistory)
    }
  }, [history])

  const clearHistory = useCallback(() => {
    setHistory([])
  }, [])

  // Visibility controls
  const show = useCallback(() => setIsVisible(true), [])
  const hide = useCallback(() => setIsVisible(false), [])
  const toggle = useCallback(() => setIsVisible((prev) => !prev), [])

  // Compute the final navbarContent based on items and their positions
  const navbarContent = (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center space-x-4">
        {items
          .filter((item) => item.position === 'left')
          .map((item) => (
            <div key={item.id}>{item.content}</div>
          ))}
      </div>
      <div className="flex items-center space-x-4">
        {items
          .filter((item) => item.position === 'center')
          .map((item) => (
            <div key={item.id}>{item.content}</div>
          ))}
      </div>
      <div className="flex items-center space-x-4">
        {items
          .filter((item) => item.position === 'right')
          .map((item) => (
            <div key={item.id}>{item.content}</div>
          ))}
        {items
          .filter((item) => !item.position)
          .map((item) => (
            <div key={item.id}>{item.content}</div>
          ))}
      </div>
    </div>
  )

  return (
    <NavbarContext.Provider
      value={{
        navbarContent,
        hasNavbarContent,
        setNavbarContent,
        removeNavbarContent,
        clearNavbarContent,
        history,
        goBack,
        clearHistory,
        isVisible,
        show,
        hide,
        toggle,
      }}
    >
      {children}
    </NavbarContext.Provider>
  )
}

export const useNavbar = (): NavbarContextType => {
  const context = useContext(NavbarContext)
  if (!context) {
    throw new Error('useNavbar must be used within a NavbarProvider')
  }
  return context
}

interface NavbarProps {
  appName: string
  className?: string
}

export const Navbar: React.FC<NavbarProps> = ({
  appName,
  className = 'flex items-center justify-between p-4 bg-gray-800 text-white',
}) => {
  const { navbarContent, isVisible, hasNavbarContent } = useNavbar()

  if (!isVisible) return null

  return (
    <nav className={className}>
      <div className="text-xl font-bold">{appName}</div>
      {hasNavbarContent && navbarContent}
    </nav>
  )
}
