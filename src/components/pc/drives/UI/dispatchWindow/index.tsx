import {
  useState,
  useCallback,
  useRef,
  useEffect,
  createContext,
  useContext,
} from 'react'
import { X } from 'lucide-react'

interface WindowPosition {
  x: number
  y: number
}

interface WindowConfig {
  title: string
  initialPosition?: WindowPosition
  initialSize?: { width: number; height: number }
  minWidth?: number
  minHeight?: number
  content: React.ReactNode
  onClose?: () => void
}

interface ActiveWindow extends WindowConfig {
  id: string
  zIndex: number
  position: WindowPosition
  size: { width: number; height: number }
}

interface WindowContextType {
  createDispatchWindow: (config: WindowConfig) => string
  closeDispatchWindow: (id: string) => void
  focusDispatchWindow: (id: string) => void
  activeDispatchWindowId: string | null
  Dispatchwindows: ActiveWindow[]
}

const WindowContext = createContext<WindowContextType | null>(null)

export const DispatchWindowProvider: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  const [Dispatchwindows, setDispatchWindows] = useState<ActiveWindow[]>([])
  const [activeDispatchWindowId, setActiveDispatchWindowId] = useState<
    string | null
  >(null)
  const dragRef = useRef<{ isDragging: boolean; startPos: WindowPosition }>({
    isDragging: false,
    startPos: { x: 0, y: 0 },
  })
  const [maxZIndex, setMaxZIndex] = useState(1000)
  const windowIdCounterRef = useRef(0)

  const generateWindowId = useCallback(() => {
    windowIdCounterRef.current += 1
    const timestamp = Date.now().toString(36)
    const random = Math.random().toString(36).substr(2, 5)
    return `w-${timestamp}-${random}-${windowIdCounterRef.current}`
  }, [])

  const createDispatchWindow = useCallback(
    (config: WindowConfig) => {
      const newZIndex = maxZIndex + 1
      setMaxZIndex(newZIndex)

      const newWindow: ActiveWindow = {
        ...config,
        id: generateWindowId(),
        position: config.initialPosition || { x: 50, y: 50 },
        size: config.initialSize || { width: 400, height: 300 },
        zIndex: newZIndex,
      }

      setDispatchWindows((prev) => [...prev, newWindow])
      setActiveDispatchWindowId(newWindow.id)

      return newWindow.id
    },
    [maxZIndex, generateWindowId]
  )

  const closeDispatchWindow = useCallback(
    (id: string) => {
      setDispatchWindows((prev) => {
        const window = prev.find((w) => w.id === id)
        if (window?.onClose) {
          window.onClose()
        }
        return prev.filter((w) => w.id !== id)
      })

      if (activeDispatchWindowId === id) {
        const remainingWindows = Dispatchwindows.filter((w) => w.id !== id)
        setActiveDispatchWindowId(
          remainingWindows.length > 0
            ? remainingWindows[remainingWindows.length - 1].id
            : null
        )
      }
    },
    [activeDispatchWindowId, Dispatchwindows]
  )

  const focusDispatchWindow = useCallback(
    (id: string) => {
      setDispatchWindows((prev) => {
        const newZIndex = maxZIndex + 1
        setMaxZIndex(newZIndex)
        return prev.map((window) =>
          window.id === id ? { ...window, zIndex: newZIndex } : window
        )
      })
      setActiveDispatchWindowId(id)
    },
    [maxZIndex]
  )

  const startDragging = useCallback(
    (e: React.MouseEvent, id: string, currentPosition: WindowPosition) => {
      e.preventDefault()
      dragRef.current = {
        isDragging: true,
        startPos: {
          x: e.clientX - currentPosition.x,
          y: e.clientY - currentPosition.y,
        },
      }
      focusDispatchWindow(id)
    },
    [focusDispatchWindow]
  )

  const handleDragging = useCallback((e: MouseEvent, id: string) => {
    if (!dragRef.current.isDragging) return

    const newPosition = {
      x: e.clientX - dragRef.current.startPos.x,
      y: e.clientY - dragRef.current.startPos.y,
    }

    setDispatchWindows((prev) =>
      prev.map((window) =>
        window.id === id ? { ...window, position: newPosition } : window
      )
    )
  }, [])

  const stopDragging = useCallback(() => {
    dragRef.current.isDragging = false
  }, [])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (activeDispatchWindowId) {
        handleDragging(e, activeDispatchWindowId)
      }
    }

    const handleMouseUp = () => {
      stopDragging()
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [activeDispatchWindowId, handleDragging, stopDragging])

  return (
    <WindowContext.Provider
      value={{
        createDispatchWindow,
        closeDispatchWindow,
        focusDispatchWindow,
        activeDispatchWindowId,
        Dispatchwindows,
      }}
    >
      {children}
      {Dispatchwindows.map((window) => (
        <div
          key={window.id}
          className="fixed bg-white rounded-lg shadow-lg border border-gray-200"
          style={{
            left: window.position.x,
            top: window.position.y,
            width: window.size.width,
            height: window.size.height,
            zIndex: window.zIndex,
            minWidth: window.minWidth || 200,
            minHeight: window.minHeight || 100,
          }}
        >
          <div
            className="flex items-center justify-between px-2 py-1 bg-gray-100 rounded-t-lg"
            onMouseDown={(e) => startDragging(e, window.id, window.position)}
          >
            <h3 className="font-medium text-gray-800">{window.title}</h3>
            <button
              onClick={() => closeDispatchWindow(window.id)}
              className="p-1 hover:bg-gray-200 rounded-full transition-colors"
            >
              <X className="h-4 w-4 text-gray-600" />
            </button>
          </div>
          <div
            className="h-[calc(100%-2.5rem)] overflow-auto"
            onClick={() => focusDispatchWindow(window.id)}
          >
            {window.content}
          </div>
        </div>
      ))}
    </WindowContext.Provider>
  )
}

export const useDispatchWindows = () => {
  const context = useContext(WindowContext)
  if (!context) {
    throw new Error(
      'useDispatchWindows must be used within a DispatchWindowProvider'
    )
  }
  return context
}
