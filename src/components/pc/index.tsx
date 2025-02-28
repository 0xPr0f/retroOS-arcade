'use client'

import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
  useContext,
  createContext,
} from 'react'

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
import { useLocalStorage, useMouse } from 'react-use'
import {
  defaultSettings,
  UserSettings,
} from '../apps/ControlPanel/components/Setting&Metrics'
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
import { useNotifications } from './drives/Extensions/ToastNotifs'
import { useDispatchWindows, useNavbar, useTypedValue } from './drives'
import RetroWelcome from './welcome'
import OnboardingTour from './onboarding'
import TimedPopup from './popupTimedComponent'
import usePopupManager from './popupTimedComponent'

const WindowComponent: React.FC<WindowProps> = ({
  window,
  onClose,
  onMinimize,
  onMaximize,
  isActive,
  onFocus,
  onBlur,
  updatePosition,
  updateSize,
}) => {
  const windowRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const dragStart = useRef({ x: 0, y: 0, offsetX: 0, offsetY: 0 })
  const [isClosing, setIsClosing] = useState(false)
  const [isOpening, setIsOpening] = useState(true)
  const [isMinimizing, setIsMinimizing] = useState(false)

  useEffect(() => {
    // Opening animation
    const timer = setTimeout(() => {
      setIsOpening(false)
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  const handleClose = (e: React.MouseEvent, id: number) => {
    e.stopPropagation()
    console.log(e)
    setIsClosing(true)
    setTimeout(() => {
      onClose(id)
    }, 100)
  }

  const handleMinimize = (e: React.MouseEvent, id: number) => {
    e.stopPropagation()
    setIsMinimizing(true)
    setTimeout(() => {
      onMinimize(id)
      setIsMinimizing(false)
    }, 100)
  }

  const handleMaximize = (e: React.MouseEvent, id: number) => {
    e.stopPropagation()
    if (window.isFixedSize) return
    onMaximize(id)
  }

  const handleMouseDown = (e: React.MouseEvent, type: 'drag' | 'resize') => {
    onFocus(window.id)
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
      className={`absolute bg-white rounded shadow-xl 
        ${window.minimized ? 'hidden' : 'block'}
        ${window.maximized ? 'inset-0' : ''}
        ${
          isClosing
            ? 'scale-0 opacity-0 transition-all duration-100 ease-in-out'
            : 'scale-100 opacity-100'
        }
        ${
          isOpening
            ? 'scale-0 opacity-0 transition-all duration-100 ease-in-out'
            : 'scale-100 opacity-100'
        }
        ${
          isMinimizing
            ? 'scale-75 opacity-50 translate-y-full transition-all duration-100 ease-in-out'
            : ''
        }
      `}
      style={
        window.maximized
          ? { zIndex: isActive ? 10 : 1, transition: 'none' }
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
        className="bg-gradient-to-r from-[#0a246a] to-[#2563eb] p-2 rounded-t flex items-center justify-between"
        onMouseDown={(e) => handleMouseDown(e, 'drag')}
      >
        <div className="flex items-center space-x-2 text-white">
          <Icon className="w-8 h-8" svgSrc={window.icon} keycon={window.key!} />
          <span className="text-sm font-semibold">{window.title}</span>
        </div>
        <div className="flex space-x-1">
          <button
            onClick={(e) => handleMinimize(e, window.id)}
            className="p-1 hover:bg-[#2563eb] rounded transition-colors"
          >
            <Minus className="w-4 h-4 text-white" />
          </button>
          <button
            onClick={(e) => handleMaximize(e, window.id)}
            className="p-1 hover:bg-[#2563eb] rounded transition-colors"
          >
            <Maximize2 className="w-4 h-4 text-white" />
          </button>
          <button
            onClick={(e) => handleClose(e, window.id)}
            className="p-1 hover:bg-red-500 rounded transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
      <div className="h-[calc(100%-2.5rem)] w-full text-black bg-white">
        {displayApp(window.key!, onBlur, onFocus)}
      </div>
      {!window.isFixedSize && (
        <div
          className="absolute bottom-0 right-0 w-4 h-4"
          onMouseDown={(e) => handleMouseDown(e, 'resize')}
        />
      )}
    </div>
  )
}

const WindowContext = createContext<{
  openWindow: (appId: string) => void
}>({ openWindow: () => {} })

export const useOpenWindow = () => {
  return useContext(WindowContext)
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
    'userControlSettings',
    defaultSettings
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
  const openWindow = useCallback(
    (appId: string) => {
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
    },
    [apps, windows.length, setWindows, setActiveWindow, setStartMenuOpen]
  )

  const filteredApps = useMemo(
    () => userApps.filter((app) => !app.isDisabled && app.onDesktop),
    [userApps]
  )

  const { isLoginPregenSession, setPregenWalletSession } = usePregenSession()
  const { notifications, openNotificationPanel } = useNotifications()

  const { isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  )
  const menuRef = useRef<HTMLDivElement>(null)
  const desktopRef = useRef<HTMLButtonElement>(null)

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        desktopRef.current &&
        menuRef.current &&
        !(desktopRef.current as HTMLButtonElement).contains(
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

  const { navbarContent, setActiveWindowId } = useNavbar()
  useEffect(() => {
    setUserControlSettingsValue(settings!)
  }, [])
  const [userControlSettingsValue, setUserControlSettingsValue] =
    useTypedValue<UserSettings>('userControlSettings')

  useEffect(() => {
    setBackgroundImage(userControlSettingsValue?.theme.backgroundUrl)
  }, [userControlSettingsValue])

  useEffect(() => {
    const activeWindowId = windows
      .filter((window) => window.id === activeWindow)
      .map((win) => Number(win.id))[0]
    setActiveWindowId(activeWindowId)
  }, [windows, activeWindow, setActiveWindowId])

  const { createDispatchWindow, closeDispatchWindow } = useDispatchWindows()

  const [onboardingTour, setOnboardingTour] = useTypedValue('onboardingTour')
  const [activeValueItem, setActiveValueItem] =
    useTypedValue<number>('wallet_active')

  useEffect(() => {
    const welcomed = localStorage.getItem('retro:welcome:window')
    setOnboardingTour(welcomed)
    if (!welcomed && (isConnected || isLoginPregenSession)) {
      const windowid = createDispatchWindow({
        title: 'Welcome to RetroOS',
        content: (
          <RetroWelcome
            closeWindow={() => {
              closeDispatchWindow(windowid)
            }}
          />
        ),
        initialSize: {
          width: 750,
          height: 640,
        },
        initialPosition: {
          x: 300,
          y: 100,
        },
      })
    }
  }, [isConnected, isLoginPregenSession])

  // Keep track of active popups and timers
  const activePopupRef = useRef<string | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const hasShownPopupRef = useRef<boolean>(false) // Track if popup has been shown already

  const handlePopupOpen = (popupId: string) => {}
  // Function to handle popup actions
  const handlePopupAction = (action: string, popupId: string) => {}
  const containerRef = useRef<HTMLDivElement>(null)

  const windowWidth = typeof window !== 'undefined' ? window.innerWidth : 0
  const windowHeight = typeof window !== 'undefined' ? window.innerHeight : 0
  const centeredX = windowWidth / 2 - 150
  const centeredY = windowHeight / 2 - 148.5

  useEffect(() => {
    const getPopupData = () => {
      try {
        const data = localStorage.getItem('app_popups_data')
        return data ? JSON.parse(data) : {}
      } catch (e) {
        console.error('Failed to get popup data', e)
        return {}
      }
    }

    const updatePopupData = (id: string, updates: any) => {
      try {
        const allData = getPopupData()
        allData[id] = { ...(allData[id] || {}), ...updates }
        localStorage.setItem('app_popups_data', JSON.stringify(allData))
      } catch (e) {
        console.error('Failed to update popup data', e)
      }
    }

    const popupId = 'claim_popup'
    // const delay10s = 10_000
    const remindLaterDelay = 24 * 60 * 60 * 1000 // 24 hours
    const oneHourDelay = (60 * 60 * 1000) / 6 // 1 hour (10 minutes)

    const popupData = getPopupData()[popupId] || {}
    if (popupData.dontShowAgain) return
    const shouldShowNow = popupData.nextTime && popupData.nextTime <= Date.now()

    const showPopup = () => {
      if (hasShownPopupRef.current || activePopupRef.current) return
      hasShownPopupRef.current = true
      const handleAction = (action: string) => {
        if (action === 'navigate') {
          openWindow('wallet')
          setActiveValueItem(4)
          updatePopupData(popupId, { dontShowAgain: true })
        } else if (action === 'later') {
          updatePopupData(popupId, {
            nextTime: Date.now() + 2 * remindLaterDelay,
          })
        } else if (action === 'never') {
          updatePopupData(popupId, { dontShowAgain: true })
        } else if (action === 'close') {
          updatePopupData(popupId, { nextTime: Date.now() + oneHourDelay })
        }
        closeDispatchWindow(activePopupRef.current!)
        handlePopupAction(action, popupId)
        activePopupRef.current = null
      }

      // Create the popup content
      const popupContent = (
        <div className="flex items-center justify-center">
          <div className="bg-white text-black px-4 py-3 rounded-lg shadow-xl animate-fadeIn">
            <p className="text-gray-700 mb-3 text-sm leading-relaxed">
              Claim your pregenerated wallet to protect assets, enable
              cross-device sync with enhanced security.
            </p>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-3 mb-3 rounded">
              <p className="text-blue-800 text-xs">
                Visit the Wallets app to claim and know more details about
                ownership benefits and enhanced security features.
              </p>
            </div>

            <div className="flex space-y-2 flex-col">
              <button
                onClick={() => handleAction('navigate')}
                className="w-full py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-md transition-all duration-200 shadow-sm hover:shadow-md text-sm"
              >
                Go to Wallet App
              </button>

              <div className="flex justify-between gap-2">
                <button
                  onClick={() => handleAction('never')}
                  className="flex-1 py-1 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors duration-200"
                >
                  Don't Show Again
                </button>
                <button
                  onClick={() => handleAction('later')}
                  className="flex-1 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-md transition-colors duration-200"
                >
                  Remind Later
                </button>
              </div>
            </div>
          </div>
        </div>
      )

      activePopupRef.current = createDispatchWindow({
        title: () => (
          <div className="flex items-center justify-start text-blue-600">
            <h3
              className="font-bold pt-1"
              style={{ lineHeight: '1', height: '19px' }}
            >
              Claim Wallet
            </h3>
          </div>
        ),
        content: () => popupContent,
        initialSize: {
          width: 300,
          height: 297,
        },
        initialPosition: {
          x: centeredX,
          y: centeredY,
        },
      })
      handlePopupOpen(popupId)
    }
    if (isLoginPregenSession) {
      if (!popupData.nextTime) {
        timerRef.current = setTimeout(() => {
          showPopup()
        }, oneHourDelay)
      } else if (shouldShowNow) {
        showPopup()
      } else {
        const timeRemaining = popupData.nextTime - Date.now()
        timerRef.current = setTimeout(() => {
          showPopup()
        }, timeRemaining)
      }
    }
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }
  }, [createDispatchWindow, windowWidth, windowHeight])

  if (!mounted) {
    // Render a static placeholder or nothing on the first render (SSR)
    return (
      <div className="static-placeholder">
        <Loading />
      </div>
    )
  }

  return (
    <WindowContext.Provider value={{ openWindow }}>
      {isConnected || isLoginPregenSession ? (
        <>
          <div ref={containerRef}>
            <div
              style={{
                backgroundImage:
                  backgroundImage &&
                  backgroundImage.length > 20 &&
                  !backgroundImage.includes('video')
                    ? `url(${backgroundImage})`
                    : `linear-gradient(to left,${lightRed},${lightBlue} )`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
              className="h-screen relative overflow-hidden select-none"
            >
              {backgroundImage &&
                backgroundImage.length > 20 &&
                backgroundImage.includes('video') && (
                  <video
                    key={backgroundImage}
                    autoPlay
                    loop
                    muted
                    playsInline
                    disablePictureInPicture
                    className="absolute top-0 left-0 w-full h-full object-cover"
                  >
                    <source src={backgroundImage} type="video/mp4" />
                    <source src={backgroundImage} type="video/webm" />
                    <source src={backgroundImage} type="video/ogg" />
                    <source src={backgroundImage} type="video/mov" />
                  </video>
                )}

              <div className="h-screen relative overflow-hidden">
                {/* **************  Desktop Icons ************** */}

                <div
                  id="app_drawer_dock"
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
                      id={app.id}
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
                <div>{!onboardingTour ? <OnboardingTour /> : null}</div>
                {(isConnected || isLoginPregenSession) && (
                  <div className="absolute top-0 w-full bg-gradient-to-r to-[#0a246a] from-[#2563eb] h-10">
                    <div
                      id="navbar-content"
                      className="flex h-full items-center justify-between ml-10"
                    >
                      <div className="flex h-full items-center ">
                        {navbarContent ? (
                          <>{navbarContent}</>
                        ) : (
                          <div className="text-lg font-extrabold">
                            {windows
                              .filter((window) => window.id === activeWindow)
                              .map((win) => win.title)}
                          </div>
                        )}
                      </div>

                      <div className="flex pr-8 flex-row-reverse justify-start gap-4 ">
                        <div
                          id="notifications_area"
                          className="flex relative items-center  w-fit"
                        >
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
                        <div
                          id="time_widget"
                          className="flex w-fit justify-end items-center h-full px-2"
                        >
                          <TimeWidget />
                        </div>
                        <div className="flex flex-row-reverse items-center justify-center">
                          <div
                            id="connected_address"
                            className="flex items-center h-full px-2"
                          >
                            <AddressWidget />
                          </div>
                          <div
                            id="chain_selector"
                            className="flex items-center h-full"
                          >
                            <ChainWidget />
                          </div>
                        </div>
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
                    onBlur={setActiveWindow}
                    updatePosition={updatePosition}
                    updateSize={updateSize}
                  />
                ))}

                {/* Taskbar */}
                <div className="absolute bottom-0 w-full bg-gradient-to-r from-[#0a246a] to-[#2563eb] h-12">
                  <div className="flex items-center h-full">
                    <button
                      id="start_menu"
                      ref={desktopRef}
                      onClick={() => setStartMenuOpen(!startMenuOpen)}
                      className={`px-4 h-full flex items-center space-x-2 text-white hover:bg-[#3a6ea5]`}
                    >
                      <div className="w-8 h-8">
                        <Icon svgSrc={StartIcon} keycon={'start'} />
                      </div>
                      <span className="font-bold">Start</span>
                    </button>

                    <div
                      id="start_menu_dock"
                      className="min-h-7 flex-1 flex space-x-1 px-2"
                    >
                      {windows.map((window: any) => (
                        <div
                          key={window.id}
                          className="h-full w-fit whitespace-nowrap"
                        >
                          <button
                            key={window.id}
                            onClick={() => {
                              if (window.minimized) {
                                minimizeWindow(window.id)
                              }
                              setActiveWindow(window.id)
                            }}
                            className={`flex w-fit h-full items-center space-x-2 px-3 rounded ${
                              activeWindow === window.id
                                ? 'bg-[#2563eb]'
                                : 'hover:bg-[#2563eb]/50'
                            }`}
                          >
                            <div className="p-1 w-8 h-8 flex-shrink-0">
                              <Icon
                                svgSrc={window.key!!.icon}
                                keycon={window.key}
                              />
                            </div>
                            <span className="text-white text-sm whitespace-nowrap">
                              {window.title}
                            </span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                  {startMenuOpen && (
                    <div
                      ref={menuRef}
                      className="z-[11] absolute bottom-12 left-0 w-60 bg-gradient-to-b from-[#0a246a] to-[#2563eb] rounded-t-lg shadow-xl p-4"
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
    </WindowContext.Provider>
  )
}

export default PcDesktop
