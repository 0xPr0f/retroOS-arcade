import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from 'react'

interface NavbarContextType {
  // Current navbar content for active window
  navbarContent: ReactNode | null

  // Content management
  setNavbarContent: (content: ReactNode) => void
  clearNavbarContent: () => void

  // Window focus management
  activeWindowId: number | null
  setActiveWindowId: (windowId: number | null) => void

  // Visibility
  isVisible: boolean
  show: () => void
  hide: () => void
  toggle: () => void
}

const NavbarContext = createContext<NavbarContextType | undefined>(undefined)

interface NavbarProviderProps {
  children: ReactNode
}

export const NavbarProvider: React.FC<NavbarProviderProps> = ({ children }) => {
  // Track content per window ID
  const [contentMap, setContentMap] = useState<Map<number, ReactNode>>(
    new Map()
  )
  const [activeWindowId, setActiveWindowId] = useState<number | null>(null)
  const [isVisible, setIsVisible] = useState(true)

  // Set content for current active window
  const setNavbarContent = useCallback(
    (content: ReactNode) => {
      if (activeWindowId !== null) {
        setContentMap((prev) => {
          const newMap = new Map(prev)
          newMap.set(activeWindowId, content)
          return newMap
        })
      }
    },
    [activeWindowId]
  )

  const clearNavbarContent = useCallback(() => {
    if (activeWindowId !== null) {
      setContentMap((prev) => {
        const newMap = new Map(prev)
        newMap.delete(activeWindowId)
        return newMap
      })
    }
  }, [activeWindowId])

  // Visibility controls
  const show = useCallback(() => setIsVisible(true), [])
  const hide = useCallback(() => setIsVisible(false), [])
  const toggle = useCallback(() => setIsVisible((prev) => !prev), [])

  // Get current content based on active window
  const navbarContent =
    activeWindowId !== null ? contentMap.get(activeWindowId) : null

  return (
    <NavbarContext.Provider
      value={{
        navbarContent,
        setNavbarContent,
        clearNavbarContent,
        activeWindowId,
        setActiveWindowId,
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
  const { navbarContent, isVisible } = useNavbar()

  if (!isVisible) return null

  return (
    <nav className={className}>
      <div className="text-xl font-bold">{appName}</div>
      {navbarContent}
    </nav>
  )
}
