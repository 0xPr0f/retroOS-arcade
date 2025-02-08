'use client'
import React, { useState, useRef, useEffect } from 'react'
import { LogOut, Maximize2, Minus, X } from 'lucide-react'
import { ContextMenuState, Window, WindowProps, userAppCustom } from './types'
import './styles.css'
import { displayApp } from '../apps/appMap'
import Icon, { StartIcon } from './drives/Icon'
import LoginScreen from './drives/Authentication/LoginScreen'
import StorageUserApps from './drives/Storage&Hooks'
import { cn } from '../library/utils'
import { parseAsJson } from 'nuqs'
import useExperimentalFeatures from './drives/Experiment'
import { useLocalStorage } from 'react-use'
import { UserSettings } from '../apps/ControlPanel/components/Setting&Metrics'
import apps from '@/components/apps/appDrawer'
import TimeWidget from './drives/Extensions/TimeWidget'

import '@getpara/react-sdk/styles.css'

import { mainnet, sepolia } from 'wagmi/chains'
import { lightBlue, weirdBlue } from './drives/Extensions/colors'
import { lightRed } from './drives/Extensions/colors'
import { useAccount } from 'wagmi'
import { useDisconnect } from 'wagmi'
import AddressWidget from './drives/Extensions/AddressWidget'
import ChainWidget from './drives/Extensions/ChainWidgets'
import { usePregenSession } from './drives/Storage&Hooks/PregenSession'
import Loading from './drives/UI/Loading'

const PcDesktop: React.FC = () => {
  const { useSaveState } = useExperimentalFeatures()
  const validateWindows = (value: unknown): Window[] => {
    if (!Array.isArray(value)) {
      return []
    }
    return value as Window[]
  }
  const windowsParser = parseAsJson<Window[]>(validateWindows).withDefault([])
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false)
  const [startMenuOpen, setStartMenuOpen] = useState<boolean>(false)
  const [windows, setWindows] = useSaveState('windows', windowsParser, [])
  const [activeWindow, setActiveWindow] = useState<number | null>(null)
  const desktopRef = useRef(null)
  const [backgroundImage, setBackgroundImage] = useState<string[]>([
    './assets/ai.jpg',
    './assets/bgimage.jpg',
  ])
  const [settings, setSettings] = useLocalStorage<UserSettings>(
    'userControlSettings'
  )
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    show: false,
    x: 0,
    y: 0,
  })
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null)

  const handleLogin = (): void => {
    setIsLoggedIn(true)
  }
  const handleContextMenu = (
    e: React.MouseEvent,
    iconId: string | null = null
  ): void => {
    e.preventDefault()
    setContextMenu({
      show: true,
      x: e.pageX,
      y: e.pageY,
    })
    setSelectedIcon(iconId)
  }

  /*const closeContextMenu = (): void => {
    setContextMenu({ show: false, x: 0, y: 0 })
    setSelectedIcon(null)
  } */

  //const userApps : userAppCustom = StorageUserApps()
  const userApps: userAppCustom[] = StorageUserApps().flat()

  const openWindow = (appId: string): void => {
    const app = apps.find((app) => app.id === appId)
    if (app!.isDisabled ?? false)
      throw new Error(`${app!.id} - ${app!.title} is Disabled`)

    const newWindow: Window = {
      id: Date.now(),
      title: app!.title,
      key: app!.id,
      icon: app!.icon,
      minimized: false,
      maximized: false,
      position: {
        x: windows.length * 30 + (app!.openingPosition?.x! ?? 0),
        y: windows.length * 30 + (app!.openingPosition?.y! ?? 0),
      },
      size: {
        width: app!.openingDimensions?.width! ?? 450,
        height: app!.openingDimensions?.height! ?? 400,
      },
      isFixedSize: app!.fixed,
      greater: app!.greater,
      orignalPosition: {
        x: app!.openingPosition?.x,
        y: app!.openingPosition?.y,
      },
      originalDimension: {
        width: app!.openingDimensions?.width,
        height: app!.openingDimensions?.height,
      },
    }
    setWindows([...windows, newWindow])
    setActiveWindow(newWindow.id)
    setStartMenuOpen(false)
  }

  const closeWindow = (windowId: number): void => {
    setWindows(windows.filter((w: any) => w.id !== windowId))
    if (activeWindow === windowId) {
      setActiveWindow(null)
    }
  }
  const changeBackground = (newImageUrl: string) => {
    //  setBackgroundImage(newImageUrl)
  }

  const minimizeWindow = (windowId: number): void => {
    setWindows(
      windows.map((w: any) =>
        w.id === windowId ? { ...w, minimized: !w.minimized } : w
      )
    )
  }

  const maximizeWindow = (windowId: number): void => {
    setWindows(
      windows.map((w: any) =>
        w.id === windowId ? { ...w, maximized: !w.maximized } : w
      )
    )
  }

  const updateWindowPosition = (
    windowId: number,
    x: number,
    y: number
  ): void => {
    setWindows(
      windows.map((w: any) =>
        w.id === windowId ? { ...w, position: { x, y } } : w
      )
    )
  }

  const updateWindowSize = (
    windowId: number,
    width: number,
    height: number
  ): void => {
    setWindows(
      windows.map((w: any) =>
        w.id === windowId ? { ...w, size: { width, height } } : w
      )
    )
  }
  const Window: React.FC<WindowProps> = ({
    window,
    onClose,
    onMinimize,
    onMaximize,
    isActive,
    onFocus,
    updatePosition,
    updateSize,
  }) => {
    const windowRef = useRef<HTMLDivElement>(null)
    const [isDragging, setIsDragging] = useState(false)
    const [isResizing, setIsResizing] = useState(false)
    const [windowToAppMap, setWindowToAppMap] = useState<userAppCustom>()

    const dragStart = useRef<{
      x: number
      y: number
      offsetX: number
      offsetY: number
    }>({ x: 0, y: 0, offsetX: 0, offsetY: 0 })

    const handleMouseDown = (e: React.MouseEvent, type: 'drag' | 'resize') => {
      if (type === 'drag') {
        //   e.stopPropagation()
        setIsDragging(true)
        dragStart.current = {
          x: e.clientX - window.position.x,
          y: e.clientY - window.position.y,
          offsetX: window.position.x,
          offsetY: window.position.y,
        }
      } else {
        setIsResizing(true)
        dragStart.current = {
          x: e.clientX - window.size.width,
          y: e.clientY - window.size.height,
          offsetX: 0,
          offsetY: 0,
        }
      }
    }

    useEffect(() => {
      const handleMouseMove = (e: MouseEvent) => {
        if (isDragging) {
          updateWindowPositionOnDrag(window.id, e.clientX, e.clientY)
        } else if (isResizing && !window.isFixedSize!) {
          updateSize(
            window.id,
            Math.max(
              window.greater ? window.originalDimension?.width! : 450,
              e.clientX - dragStart.current.x
            ),
            Math.max(
              window.greater ? window.originalDimension?.height! : 400,
              e.clientY - dragStart.current.y
            )
          )
        }
      }
      const updateWindowPositionOnDrag = (id: number, x: number, y: number) => {
        const newX = x - dragStart.current.x
        const newY = y - dragStart.current.y
        setWindows(
          windows.map((w: any) =>
            w.id === id ? { ...w, position: { x: newX, y: newY } } : w
          )
        )
      }

      const handleMouseUp = () => {
        setIsDragging(false)
        setIsResizing(false)
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }

      if (isDragging || isResizing) {
        document.addEventListener('mousemove', handleMouseMove)
        document.addEventListener('mouseup', handleMouseUp)
      }
    }, [isDragging, isResizing, updateSize, window.id])

    useEffect(() => {
      setWindowToAppMap(
        userApps.find((app) => app.id === window.key?.toString())
      )
    }, [userApps])

    useEffect(() => {
      document.addEventListener('storage', (e) => {
        console.log(e)
      })
    }, [])

    return (
      <div
        ref={windowRef}
        className={`absolute bg-white rounded shadow-xl ${
          window.minimized ? 'hidden' : 'block'
        } ${window.maximized ? 'inset-0' : ''}`}
        style={
          window.maximized
            ? { zIndex: isActive ? 10 : 1 }
            : {
                width: window.size.width,
                height: window.size.height,
                top: window.position.y,
                left: window.position.x,
                zIndex: isActive ? 10 : 1,
              }
        }
        onClick={() => onFocus(window.id)}
      >
        <div
          className="bg-gradient-to-r from-[#0a246a] to-[#2563eb] p-2 rounded-t flex items-center justify-between cursor-move"
          onMouseDown={(e) => handleMouseDown(e, 'drag')}
        >
          <div className="flex items-center space-x-2 text-white">
            <div className=" w-8 h-8">
              {windowToAppMap && (
                <Icon
                  svgSrc={windowToAppMap!.icon}
                  keycon={windowToAppMap!.id}
                />
              )}
            </div>
            <span className="text-sm font-semibold">{window.title}</span>
          </div>
          <div className="flex space-x-1">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onMinimize(window.id)
              }}
              className="p-1 hover:bg-[#2563eb] rounded"
            >
              <Minus className="w-4 h-4 text-white" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                if (window.isFixedSize) return
                onMaximize(window.id)
              }}
              className="p-1 hover:bg-[#2563eb] rounded"
            >
              <Maximize2 className="w-4 h-4 text-white" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()

                onClose(window.id)
              }}
              className="p-1 hover:bg-red-500 rounded"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
        <div className="h-[calc(100%-2.5rem)] text-black bg-white">
          {displayApp(window.key!)}
        </div>
        {!window.isFixedSize && (
          <div
            className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
            onMouseDown={(e) => handleMouseDown(e, 'resize')}
          />
        )}
      </div>
    )
  }
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        desktopRef.current &&
        menuRef.current &&
        !(desktopRef.current as HTMLDivElement).contains(
          event.target as Node
        ) &&
        !menuRef.current?.contains(event.target as Node)
      ) {
        setStartMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])
  const Desktop: React.FC = () => {
    const windowsToApp = (windowsKey: string) => {
      return userApps.find((app) => app.id === windowsKey?.toString())
    }
    const { isLoginPregenSession, setPregenWalletSession } = usePregenSession()

    return (
      <div
        style={{
          backgroundImage:
            settings?.theme.backgroundUrl &&
            settings?.theme.backgroundUrl.length > 20
              ? `url(${settings.theme.backgroundUrl})`
              : `linear-gradient(to left,${lightRed},${lightBlue} )`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
        className="h-screen relative overflow-hidden select-none"
      >
        <div
          //This on it own caused quite some issues with re-render and resets
          // onClick={closeContextMenu}
          // onContextMenu={handleContextMenu}
          className="items-center dynamic-grid"
        >
          {userApps
            .filter((a) => (!a.isDisabled && a.onDesktop) ?? true)
            .map((app) => (
              <div
                key={app.id}
                onClick={(e) => {
                  // e.stopPropagation()
                  openWindow(app.id)
                }}
                onContextMenu={(e) => {
                  // e.stopPropagation()
                  // handleContextMenu(e, app.id)
                }}
                style={{ zIndex: 1 }}
                className="flex justify-center p-0 flex-col text-white cursor-pointer  rounded group"
              >
                <div className="flex justify-center items-center  group-hover:scale-110 transition-transform">
                  <div
                    className={cn(
                      'flex items-center w-14 h-14 justify-center p-1 rounded-[5px]',
                      app.hasIconBorder ? 'border-2' : ''
                    )}
                    style={{
                      backgroundColor: app.hasIconBG
                        ? app.IconBGcolor
                        : undefined,
                      borderColor: app.hasIconBorder
                        ? app.BorderColor
                        : undefined,
                    }}
                  >
                    <Icon svgSrc={app.icon} keycon={app.id} />
                  </div>
                </div>
                <span className="font-light text-center pt-[0.15rem] text-sm text-shadow">
                  {app.title}
                </span>
              </div>
            ))}
        </div>
        {(isConnected || isLoginPregenSession) && (
          <div className="absolute flex pr-5 flex-row-reverse justify-start gap-4 top-0 w-full bg-gradient-to-r p-2 to-[#0a246a] from-[#2563eb] h-10">
            <div className="flex  w-fit justify-end items-center h-full px-2">
              <TimeWidget />
            </div>
            <div className="flex flex-row-reverse items-center justify-center">
              <div className="flex items-center h-full px-2">
                <AddressWidget />
              </div>
              <div className="flex items-center h-full">
                <ChainWidget />
              </div>
            </div>
          </div>
        )}

        {windows.map((window: any) => (
          <Window
            key={window.id}
            window={window}
            onClose={closeWindow}
            onMinimize={minimizeWindow}
            onMaximize={maximizeWindow}
            isActive={window.id === activeWindow}
            onFocus={setActiveWindow}
            updatePosition={updateWindowPosition}
            updateSize={updateWindowSize}
          />
        ))}
        {/*} {contextMenu.show && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={closeContextMenu}
          selectedIcon={selectedIcon}
        />
      )} */}
        <div className="absolute bottom-0 w-full bg-gradient-to-r from-[#0a246a] to-[#2563eb] h-12">
          <div className="flex items-center h-full">
            <button
              ref={desktopRef}
              onClick={() => setStartMenuOpen(!startMenuOpen)}
              className={`px-4 h-full flex items-center space-x-2 text-white hover:bg-[#3a6ea5]`}
            >
              <div className="w-8 h-8">
                <Icon svgSrc={StartIcon} keycon={'start'} />
              </div>
              <span className="font-bold">Start</span>
            </button>

            <div className="flex space-x-1 px-2 overflow-x-scroll">
              {windows.map((window: any) => (
                <button
                  key={window.id}
                  onClick={() => {
                    if (window.minimized) {
                      minimizeWindow(window.id)
                    }
                    setActiveWindow(window.id)
                  }}
                  className={`flex items-center space-x-2 px-3 h-8 rounded ${
                    activeWindow === window.id
                      ? 'bg-[#2563eb]'
                      : 'hover:bg-[#2563eb]/50'
                  }`}
                >
                  <div className="p-1 w-8 h-8">
                    <Icon
                      svgSrc={windowsToApp(window.key!)!.icon}
                      keycon={window.key}
                    />
                  </div>
                  <span className="text-white text-sm">{window.title}</span>
                </button>
              ))}
            </div>
          </div>

          {startMenuOpen && (
            <div
              ref={menuRef}
              className=" z-[3] absolute bottom-12 left-0 w-60 bg-gradient-to-b from-[#0a246a] to-[#2563eb] rounded-t-lg shadow-xl p-4"
            >
              <div className="space-y-2">
                {userApps
                  .filter((e) => e.startMenu ?? false)
                  .filter((a) => !a.isDisabled)
                  .map((app) => (
                    <button
                      key={app.id}
                      onClick={() => openWindow(app.id)}
                      className="w-full flex items-center space-x-2 p-2 text-white hover:bg-[#2563eb] rounded"
                    >
                      <div className="w-8 h-8">
                        <Icon svgSrc={app.icon!} keycon={app.id} />
                      </div>
                      <span>{app.title}</span>
                    </button>
                  ))}
              </div>
              <div className="flex flex-row items-center justify-end">
                <button
                  onClick={() => {
                    setStartMenuOpen(false)
                    disconnect()
                    setPregenWalletSession(null)
                  }}
                  className="flex items-center justify-center space-x-2 p-2 text-white hover:bg-[#2563eb] rounded"
                >
                  <div className="w-4 h-4">
                    <LogOut size={16} />
                  </div>
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const { isLoginPregenSession, setPregenWalletSession } = usePregenSession()
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
    console.log(isLoginPregenSession, 'Login pregen')
  }, [])

  if (!mounted) {
    // Render a static placeholder or nothing on the first render (SSR)
    return (
      <div className="static-placeholder">
        <Loading />
      </div>
    )
  }
  return (
    <>
      {isConnected || isLoginPregenSession ? (
        <Desktop />
      ) : (
        <>
          <LoginScreen login={handleLogin} />
        </>
      )}
    </>
  )
}

export default PcDesktop
