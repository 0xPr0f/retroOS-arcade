'use client'

import React, { useState, useRef, useEffect, useMemo } from 'react'

import { Bell, LogOut, Maximize2, Minus, X } from 'lucide-react'
import { Window, WindowProps } from './types'
import './styles.css'
import { displayApp } from '../apps/appMap'
import Icon, { StartIcon } from './drives/Icon'
import LoginScreen from './drives/Authentication/LoginScreen'
import StorageUserApps from './drives/Storage&Hooks'
import { cn } from '../library/utils'
import { parseAsInteger, parseAsJson, parseAsNumberLiteral } from 'nuqs'
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
import { Button } from './drives/UI/UI_Components.v1'
import { useNotifications } from './drives/Extensions/ToastNotifs'

const WindowComponent: React.FC<WindowProps> = ({
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
  const dragStart = useRef({ x: 0, y: 0, offsetX: 0, offsetY: 0 })

  const handleMouseDown = (e: React.MouseEvent, type: 'drag' | 'resize') => {
    if (type === 'drag') {
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
        const newX = e.clientX - dragStart.current.x
        const newY = e.clientY - dragStart.current.y
        updatePosition(window.id, newX, newY)
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

    const handleMouseUp = () => {
      setIsDragging(false)
      setIsResizing(false)
    }

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, isResizing, updatePosition, updateSize, window.id])

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
          <Icon className="w-8 h-8" svgSrc={window.icon} keycon={window.key!} />
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

const PcDesktop: React.FC = () => {
  const { useSaveState } = useExperimentalFeatures()
  const validateWindows = (value: unknown): Window[] => {
    if (!Array.isArray(value)) {
      return []
    }
    return value as Window[]
  }
  const windowsParser = parseAsJson<Window[]>(validateWindows).withDefault([])
  const [windows, setWindows] = useSaveState<Window[]>(
    'windows',
    windowsParser,
    []
  )
  const [activeWindow, setActiveWindow] = useSaveState<number | null>(
    'pcactivewindow',
    parseAsInteger,
    null
  )
  const [startMenuOpen, setStartMenuOpen] = useState(false)
  const [settings, setSettings] = useLocalStorage<UserSettings>(
    'userControlSettings'
  )
  const [backgroundImage, setBackgroundImage] = useState<string | undefined>()

  // Use top-level hooks
  const userApps = StorageUserApps().flat()

  const closeWindow = (windowId: number) => {
    setWindows((prev) => prev.filter((w) => w.id !== windowId))
    if (activeWindow === windowId) {
      setActiveWindow(null)
    }
  }

  const minimizeWindow = (windowId: number) => {
    setWindows((prev) =>
      prev.map((w) =>
        w.id === windowId ? { ...w, minimized: !w.minimized } : w
      )
    )
  }

  const maximizeWindow = (windowId: number) => {
    setWindows((prev) =>
      prev.map((w) =>
        w.id === windowId ? { ...w, maximized: !w.maximized } : w
      )
    )
  }

  const updatePosition = (windowId: number, x: number, y: number) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === windowId ? { ...w, position: { x, y } } : w))
    )
  }

  const updateSize = (windowId: number, width: number, height: number) => {
    setWindows((prev) =>
      prev.map((w) =>
        w.id === windowId ? { ...w, size: { width, height } } : w
      )
    )
  }

  const openWindow = (appId: string) => {
    const app = apps.find((a) => a.id === appId)
    if (!app || app.isDisabled) return

    const newWindow: Window = {
      id: Date.now(),
      title: app.title,
      key: app.id,
      icon: app.icon,
      minimized: false,
      maximized: false,
      position: {
        x: windows.length * 30 + (app.openingPosition?.x ?? 0),
        y: windows.length * 30 + (app.openingPosition?.y ?? 0),
      },
      size: {
        width: app.openingDimensions?.width ?? 450,
        height: app.openingDimensions?.height ?? 400,
      },
      isFixedSize: app.fixed,
      greater: app.greater,
      originalDimension: app.openingDimensions,
    }

    setWindows((prev) => [...prev, newWindow])
    setActiveWindow(newWindow.id)
    setStartMenuOpen(false)
  }

  useEffect(() => {
    setBackgroundImage(settings?.theme.backgroundUrl)
  }, [settings])

  const filteredApps = useMemo(
    () => userApps.filter((app) => !app.isDisabled && app.onDesktop),
    [userApps]
  )
  const { isLoginPregenSession, setPregenWalletSession } = usePregenSession()
  const {
    notifications,
    addNotification,
    addSilentNotification,
    openNotificationPanel,
  } = useNotifications()

  const { isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  )
  const menuRef = useRef<HTMLDivElement>(null)

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
        <>
          <div>
            <div
              style={{
                backgroundImage:
                  backgroundImage && backgroundImage.length > 20
                    ? `url(${backgroundImage})`
                    : `linear-gradient(to left,${lightRed},${lightBlue} )`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
              className="h-screen relative overflow-hidden select-none"
            >
              <div className="h-screen relative overflow-hidden">
                {/* **************  Desktop Icons ************** */}

                <div
                  //This on it own caused quite some issues with re-render and resets
                  // onClick={closeContextMenu}
                  // onContextMenu={handleContextMenu}
                  className="items-center dynamic-grid"
                >
                  {filteredApps.map((app) => (
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
                  <div className="absolute flex pr-8 flex-row-reverse justify-start gap-4 top-0 w-full bg-gradient-to-r p-2 to-[#0a246a] from-[#2563eb] h-10">
                    <div className="border relative border-white w-fit">
                      <button
                        onClick={() => {
                          openNotificationPanel()
                        }}
                        className="rounded-full text-white  shadow-lg hover:text-gray-400"
                      >
                        <Bell size={20} />
                        {unreadCount > 0 && (
                          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {unreadCount}
                          </span>
                        )}
                      </button>
                    </div>
                    <div className="flex border border-white  w-fit justify-end items-center h-full px-2">
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

                {/********************* Windows *********************/}
                {windows.map((window) => (
                  <WindowComponent
                    key={window.id}
                    window={window}
                    onClose={closeWindow}
                    onMinimize={minimizeWindow}
                    onMaximize={maximizeWindow}
                    isActive={window.id === activeWindow}
                    onFocus={setActiveWindow}
                    updatePosition={updatePosition}
                    updateSize={updateSize}
                  />
                ))}

                {/* Taskbar */}
                <div className="absolute bottom-0 w-full bg-gradient-to-r from-[#0a246a] to-[#2563eb] h-12">
                  <div className="flex items-center h-full">
                    <button
                      //ref={desktopRef}
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
                              svgSrc={window.key!!.icon}
                              keycon={window.key}
                            />
                          </div>
                          <span className="text-white text-sm">
                            {window.title}
                          </span>
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
            </div>
          </div>
        </>
      ) : (
        <>
          <LoginScreen />
        </>
      )}
    </>
  )
}

export default PcDesktop
