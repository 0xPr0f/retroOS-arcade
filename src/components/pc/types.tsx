interface App {
  id: string
  title: string
  icon?: string
  startMenu?: boolean
  fixed?: boolean
  greater?: boolean
  openingDimensions?: {
    width?: number
    height?: number
  }
  /*
To find the best opening for you app, you need to know which coordinates move what
X is horizontal, Y is vertical
X-> Y
    ↓   */
  openingPosition?: {
    x?: number
    y?: number
  }
  onDesktop?: boolean
  isDisabled?: boolean
  game?: boolean
}

interface userAppCustom extends App {
  IconBGcolor?: string
  hasIconBG?: boolean
  IconImage?: string
  BorderColor?: string
  hasIconBorder?: boolean
}
interface MenuItem {
  label: string
  icon: React.ReactNode
}
interface ContextMenuState {
  show: boolean
  x: number
  y: number
}

interface Window {
  id: number
  key?: string
  title: string
  icon?: string
  minimized: boolean
  maximized: boolean
  position: {
    x: number
    y: number
  }
  size: {
    width: number
    height: number
  }
  originalDimension?: {
    width?: number
    height?: number
  }
  /*
To find the best opening for you app, you need to know which coordinates move what
X is horizontal, Y is vertical
X-> Y
    ↓   */
  orignalPosition?: {
    x?: number
    y?: number
  }
  isFixedSize?: boolean
  greater?: boolean
}
interface ContextMenuProps {
  x: number
  y: number
  onClose: () => void
  selectedIcon: string | null
}

interface WindowProps {
  window: Window
  onClose: (id: number) => void
  onMinimize: (id: number) => void
  onMaximize: (id: number) => void
  isActive: boolean
  onFocus: (id: number) => void
  updatePosition: (id: number, x: number, y: number) => void
  updateSize: (id: number, width: number, height: number) => void
}

export type {
  App,
  MenuItem,
  ContextMenuState,
  Window,
  ContextMenuProps,
  WindowProps,
  userAppCustom,
}
