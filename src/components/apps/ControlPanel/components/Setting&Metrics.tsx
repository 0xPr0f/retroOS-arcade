'use client'
import React, { useState, useRef, useEffect } from 'react'
import {
  Monitor,
  Palette,
  Type,
  Moon,
  Zap,
  Sun,
  Gauge,
  Database,
  User,
  FlaskConical,
  Rat,
  RefreshCcw,
  Network,
  Battery,
  MemoryStick,
  CreditCard,
  Wallet,
} from 'lucide-react'
import UAParser from 'ua-parser-js'
import { useBattery, useLocalStorage } from 'react-use'

import { Button, Switch } from '@/components/pc/drives/UI/UI_Components.v1'
import { cn } from '@/components/library/utils'
import { parseAsBoolean, parseAsString } from 'nuqs'
import useExperimentalFeatures from '@/components/pc/drives/Experiment'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  lightRed,
  defaultBlueBG,
  lightBlue,
} from '@/components/pc/drives/Extensions/colors'
import { useAccount, useDisconnect } from 'wagmi'
import { usePregenSession, useTypedValue } from '@/components/pc/drives'

const hideFirstP = '[&>p:first-child]:hidden'
const DeviceInfo = ({ isDarkMode }: { isDarkMode: boolean }) => {
  const parser = new UAParser(navigator.userAgent)
  const result = parser.getResult()

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">
        RetroOS Arcade{' '}
        <a
          href="https://github.com/0xpr0f/retroos-arcade"
          target="_blank"
          rel="noopener noreferrer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="inline-block ml-2"
          >
            <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
          </svg>
        </a>
      </h2>
      <div className="bg-gray-100 rounded-lg p-3">
        <p
          className={`${
            isDarkMode ? 'text-black' : 'text-gray-600'
          } font-medium`}
        >
          Designed by <span className=" font-bold font-serif">PHEA</span> ©{' '}
          {new Date().getFullYear()}
        </p>
        <p className="text-sm  font-serif  text-gray-600">
          retroOS v-{process.env.NEXT_PUBLIC_RETRO_OS_VERSION}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <p className="text-sm font-semibold">Browser</p>
          <p>
            {result.browser.name} v-{result.browser.major}
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold">Language</p>
          <p>{navigator.language}</p>
        </div>
        <div>
          <div className="pb-2">
            <p className="text-sm font-semibold">Operating System</p>
            <p>
              {result.os.name} v-{result.os.version}
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold">Host Device</p>
            <p>
              {result.device.vendor} {result.device.model}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
export const NotWorking = ({ isDarkMode }: { isDarkMode: boolean }) => {
  return (
    <>
      <div
        className={`${
          isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-black'
        }  rounded-lg p-3`}
      >
        <p className={`font-medium`}>Note</p>
        <p className="text-sm ">Some features may not be working as intended</p>
      </div>
    </>
  )
}
const NB = ({
  isDarkMode,
  details,
  className,
}: {
  isDarkMode: boolean
  details: string
  className?: string
}) => {
  return (
    <>
      <div
        className={cn(
          `rounded-lg p-3`,
          isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-black',
          className
        )}
      >
        <p className={`font-medium`}>Note</p>
        <p className="text-sm ">{details}</p>
      </div>
    </>
  )
}

const NBCustom = ({
  isDarkMode,
  details,
  className,
}: {
  isDarkMode: boolean
  details: React.ReactNode
  className?: string
}) => {
  return (
    <>
      <div
        className={cn(
          `rounded-lg p-3`,
          isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-black',
          className
        )}
      >
        {details}
      </div>
    </>
  )
}

interface SystemMetrics {
  cpuUsage: number
  memoryUsage: number
  browserFPS: number
  networkLatency: number
}

const calculateMetrics = (
  setMetrics: React.Dispatch<React.SetStateAction<SystemMetrics>>
) => {
  let frameCount = 0
  let lastTime = performance.now()
  let animationFrameId: number

  // Calculate FPS
  const updateFPS = () => {
    const currentTime = performance.now()
    frameCount++

    if (currentTime - lastTime >= 1000) {
      setMetrics((prev) => ({
        ...prev,
        browserFPS: Math.round(frameCount),
      }))
      frameCount = 0
      lastTime = currentTime
    }

    animationFrameId = requestAnimationFrame(updateFPS)
  }

  updateFPS()

  // Calculate memory usage and CPU load
  const updateMemory = async () => {
    if (performance && (performance as any).memory) {
      const memory = (performance as any).memory
      const usedMemory = memory.usedJSHeapSize
      const totalMemory = memory.jsHeapSizeLimit
      const memoryPercentage = (usedMemory / totalMemory) * 100

      // Get actual CPU usage if possible
      let cpuUsage = 0
      try {
        const t1 = performance.now()
        for (let i = 0; i < 1000000; i++) {
          Math.random()
        }
        const t2 = performance.now()
        cpuUsage = Math.min(100, Math.round((t2 - t1) / 10))
      } catch (e) {
        cpuUsage = Math.round(Math.random() * 30) + 20 // Fallback
      }

      setMetrics((prev) => ({
        ...prev,
        memoryUsage: Math.min(100, Math.round(memoryPercentage)),
        cpuUsage,
      }))
    }
  }

  const memoryInterval = setInterval(updateMemory, 2000)

  return () => {
    cancelAnimationFrame(animationFrameId)
    clearInterval(memoryInterval)
  }
}

const checkNetworkLatency = async (
  setMetrics: React.Dispatch<React.SetStateAction<SystemMetrics>>
) => {
  const start = performance.now()
  try {
    await fetch('/api/create/ping', {
      method: 'HEAD', // Lighter request
      cache: 'no-cache', // Prevent caching
    })
    const latency = performance.now() - start
    setMetrics((prev) => ({
      ...prev,
      networkLatency: Math.round(latency),
    }))
  } catch (e) {
    console.error('Network latency measurement failed:', e)
    setMetrics((prev) => ({
      ...prev,
      networkLatency: -1,
    }))
  }
}

const PerformanceInfo = ({ isDarkMode }: { isDarkMode: boolean }) => {
  const batteryState = useBattery()
  const [metrics, setMetrics] = useState<SystemMetrics>({
    cpuUsage: 0,
    memoryUsage: 0,
    browserFPS: 0,
    networkLatency: 0,
  })

  useEffect(() => {
    const cleanup = calculateMetrics(setMetrics)
    checkNetworkLatency(setMetrics) // Initial check

    const networkInterval = setInterval(() => {
      checkNetworkLatency(setMetrics)
    }, 5000)

    return () => {
      cleanup()
      clearInterval(networkInterval)
    }
  }, [])

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Performance Insights</h2>
      <div className="grid grid-cols-2 gap-4">
        {[
          {
            icon: <Zap />,
            title: 'CPU Usage',
            value: metrics.cpuUsage > 0 ? `${metrics.cpuUsage}%` : 'N/A',
            display: true,
          },
          {
            icon: <Monitor />,
            title: 'Browser FPS',
            value:
              metrics.browserFPS > 0 ? metrics.browserFPS.toString() : 'N/A',
            display: true,
          },
          {
            icon: <MemoryStick />,
            title: 'Memory Usage',
            value: metrics.memoryUsage > 0 ? `${metrics.memoryUsage}%` : 'N/A',
            display: true,
          },
          {
            icon: <Battery />,
            title: 'Battery',
            value:
              batteryState.isSupported &&
              batteryState.fetched &&
              batteryState.dischargingTime !== Infinity
                ? `${(batteryState.level * 100).toFixed(0)}%`
                : 'N/A',
            display:
              batteryState.isSupported &&
              batteryState.fetched &&
              batteryState.dischargingTime !== Infinity,
          },
          {
            icon: <Network />,
            title: 'Network Latency',
            value:
              metrics.networkLatency > 0
                ? `${metrics.networkLatency}ms`
                : 'N/A',
            display: true,
          },
        ]
          .filter((info) => info.display)
          .map((metric, index) => (
            <div
              key={index}
              className={`${
                isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-black'
              } rounded-lg p-3 flex items-center`}
            >
              <div className="mr-3 w-8 h-8 flex items-center justify-center ">
                {metric.icon}
              </div>
              <div>
                <p className="text-sm">{metric.title}</p>
                <p className="font-bold">{metric.value}</p>
              </div>
            </div>
          ))}
      </div>

      <NotWorking isDarkMode={isDarkMode} />
    </div>
  )
}

const AppearanceSettings = ({
  isDarkMode,
  setIsDarkMode,
  setBackgroundImage,
}: {
  isDarkMode: boolean
  setIsDarkMode: (value: boolean) => void
  setBackgroundImage: (url: string) => void
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [settings, setSettings] = useLocalStorage<UserSettings>(
    'userControlSettings',
    defaultSettings
  )

  const [, setBackgroundDesktop] = useState<string | undefined>(
    settings?.theme.backgroundUrl
  )
  const [name, setName] = useState('')
  const [, setUserControlSettingsValue] = useTypedValue<UserSettings>(
    'userControlSettings'
  )
  useEffect(() => {
    setUserControlSettingsValue(settings!)
  }, [settings])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setName(file?.name!)
    if (file) {
      if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = () => {
          const backgroundUrl = reader.result as string
          setBackgroundDesktop(backgroundUrl)
          setBackgroundImage(backgroundUrl)
          setSettings({
            ...settings!,
            theme: {
              ...settings!.theme,
              backgroundUrl,
            },
          })
        }
      }
    }
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex gap-2 items-center">
        <h2 className="text-xl font-bold">Themes</h2>
        <div className="">
          <RefreshCcw
            onClick={() => {
              window.location.reload()
            }}
            className=" cursor-pointer"
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span>Dark Mode</span>
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className={`w-12 h-6 rounded-full transition-colors ${
            isDarkMode
              ? 'bg-blue-500 hover:bg-blue-700'
              : 'bg-gray-300 hover:bg-gray-400'
          }`}
        >
          {isDarkMode ? (
            <Moon className="w-4 h-4 text-white ml-6" />
          ) : (
            <Sun className="w-4 h-4 text-black ml-1" />
          )}
        </button>
      </div>
      <div className="flex flex-col">
        <label>Background Image</label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <div className="flex items-center justify-between">
          <button
            onClick={() => fileInputRef.current?.click()}
            className={`px-4 py-2 rounded ${
              isDarkMode
                ? 'bg-gray-700 text-white hover:bg-gray-800'
                : 'bg-gray-200 text-black hover:bg-gray-400'
            }`}
          >
            Choose Image
          </button>
          <button
            onClick={() => {
              setBackgroundDesktop(undefined)
              setBackgroundImage('')
              setSettings({
                ...settings!,
                theme: { ...settings!.theme, backgroundUrl: '' },
              })
              // window.location.reload()
            }}
            className={`px-4 py-2 rounded ${
              isDarkMode
                ? 'bg-gray-700 text-white hover:bg-gray-800'
                : 'bg-gray-200 text-black hover:bg-gray-400'
            }`}
          >
            Reset
          </button>
        </div>
        {name && name.length > 0 && (
          <span className=" text-green-600">Selected Image: {name}</span>
        )}
      </div>
      <NBCustom
        isDarkMode={isDarkMode}
        details={
          <>
            <p className={`font-medium`}>Note</p>
            <p className="text-sm ">- Max Background Image Size: 3MB</p>
            <p className="text-sm ">
              - Some features may not be working as intended
            </p>
          </>
        }
      />
    </div>
  )
}

const TextSettings = ({
  isDarkMode,
  fontSize,
  setFontSize,
}: {
  isDarkMode: boolean
  fontSize: number
  setFontSize: (value: number) => void
}) => (
  <div className="p-4 space-y-4">
    <h2 className="text-xl font-bold">Font Properties</h2>
    <div>
      <label>Font Size</label>
      <input
        type="range"
        min="12"
        max="24"
        value={fontSize}
        onChange={(e) => setFontSize(Number(e.target.value))}
        className="w-full mt-2"
      />
      <p>{fontSize}px</p>
    </div>
    <div>
      <label>Font Family</label>
      <select
        className={`w-full mt-2 p-2 border rounded ${
          isDarkMode ? 'text-black' : 'text-gray-600'
        }`}
      >
        <option>Inter</option>
        <option>Roboto</option>
        <option>System Default</option>
      </select>
    </div>
    <NotWorking isDarkMode={isDarkMode} />
  </div>
)

const StorageSettings = ({
  isDarkMode,
  clearAppStorage,
  clearUserStorage,
}: {
  isDarkMode: boolean
  clearAppStorage: () => void
  clearUserStorage: () => void
}) => (
  <div className="p-4 space-y-4">
    <div className="flex gap-2 items-center">
      <h2 className="text-xl font-bold">Storage</h2>
      <div className="">
        <RefreshCcw
          onClick={() => {
            window.location.reload()
          }}
          className=" cursor-pointer"
        />
      </div>
    </div>

    <div className="space-y-1">
      <NB
        className={cn(`mb-0`, hideFirstP, 'p-0')}
        isDarkMode={isDarkMode}
        details="Clear modifications made to installed apps"
      />

      <Button
        type="submit"
        onClick={clearAppStorage}
        className="w-full text-white py-2 mb-0 rounded-md transition duration-200"
        style={{
          backgroundColor: lightBlue,
          transition: 'background-color 0.2s', // Optional: to ensure smooth transition
        }}
        onMouseEnter={(e) =>
          ((e.target as HTMLButtonElement).style.backgroundColor =
            defaultBlueBG)
        }
        onMouseLeave={(e) =>
          ((e.target as HTMLButtonElement).style.backgroundColor = lightBlue)
        }
      >
        Clear App Storage
      </Button>
    </div>
    <div className="space-y-1">
      <NB
        className={cn(`mb-0`, hideFirstP, 'p-0')}
        isDarkMode={isDarkMode}
        details="Clear modifications made to user settings"
      />

      <Button
        type="submit"
        onClick={clearUserStorage}
        className="w-full text-white py-2 mb-0 rounded-md transition duration-200"
        style={{
          backgroundColor: lightBlue,
          transition: 'background-color 0.2s', // Optional: to ensure smooth transition
        }}
        onMouseEnter={(e) =>
          ((e.target as HTMLButtonElement).style.backgroundColor =
            defaultBlueBG)
        }
        onMouseLeave={(e) =>
          ((e.target as HTMLButtonElement).style.backgroundColor = lightBlue)
        }
      >
        Clear User Storage
      </Button>
    </div>
    <div>
      <NB
        isDarkMode={isDarkMode}
        details="Clicking any button will trigger immediate page reload"
      />
    </div>
  </div>
)

// Type for our user settings/ too tiring to keep types in new file
export interface UserSettings {
  name: string
  profileImage?: string
  theme: {
    backgroundUrl?: string
    fontSize: 'small' | 'medium' | 'large'
    darkMode: boolean
  }
  use_smart_account: boolean
}

export const defaultSettings: UserSettings = {
  name: 'User',
  theme: {
    backgroundUrl: '',
    fontSize: 'medium',
    darkMode: false,
  },
  use_smart_account: true,
}
const UserInfoSettings = ({ isDarkMode }: { isDarkMode: boolean }) => {
  const [settings, setSettings] = useLocalStorage<UserSettings>(
    'userControlSettings',
    defaultSettings
  )
  const [, setUserControlSettingsValue] = useTypedValue<UserSettings>(
    'userControlSettings'
  )
  const [imagePreview, setImagePreview] = useState<string | undefined>(
    settings?.profileImage
  )
  // Handle image upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result as string
        setImagePreview(base64String)
        setSettings({
          ...settings!,
          profileImage: base64String,
        })
      }
      reader.readAsDataURL(file)
    }
  }

  useEffect(() => {
    setUserControlSettingsValue(settings!)
  }, [settings])
  // Handle name change
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings({
      ...settings!,
      name: e.target.value,
    })
  }

  // Handle theme changes
  const handleThemeChange = (key: keyof UserSettings['theme'], value: any) => {
    setSettings({
      ...settings!,
      theme: {
        ...settings!.theme,
        [key]: value,
      },
    })
  }

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">User Info</h2>
      <div
        className={cn(
          'p-4 space-y-4 max-w-md mx-auto bg-gray-100 rounded-lg shadow',
          isDarkMode ? 'bg-gray-800' : ''
        )}
      >
        {/* Profile Section */}
        <div className="flex flex-col items-center space-y-3">
          <div className="relative">
            <div className="w-44 h-44 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-16 h-16 text-gray-400" />
              )}
            </div>
            <label
              className={cn(
                ` absolute bottom-0 right-0 bg-[${lightBlue}] p-2 rounded-full cursor-pointer `,
                'hover:bg-[var(--dark-blue-cm)]'
              )}
            >
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleImageChange}
              />
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </label>
          </div>

          {/* Name Input */}
          <input
            type="text"
            value={settings!.name}
            onChange={handleNameChange}
            className={cn(
              isDarkMode ? ' text-gray-800' : '',
              'px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
            )}
            placeholder="Enter your name"
          />
        </div>
      </div>
    </div>
  )
}

const ExperimentalSettings = ({ isDarkMode }: { isDarkMode: boolean }) => {
  const { isExperimentalFlag, setStorageExperimentalFlag } =
    useExperimentalFeatures()
  const router = useRouter()
  return (
    <div>
      <div className="p-4 space-y-4">
        <h2 className="text-xl font-bold">Experimental Settings</h2>
        <div className="flex justify-between items-center">
          <label className="flex items-center">
            <Rat className="mr-2" />
            Become a Lab Rat
          </label>
          <Switch
            checked={isExperimentalFlag()}
            onCheckedChange={() => {
              if (isExperimentalFlag()) {
                router.replace('/')
              }
              setStorageExperimentalFlag()
            }}
          />
        </div>

        <div className="text-sm text-gray-500">
          <span className="font-bold">Persistent state management</span>
          <ul className="list-disc list-inside">
            <li>
              Using{' '}
              <Link
                href="https://www.npmjs.com/package/nuqs"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                nuqs
              </Link>{' '}
              for type-safe URL search params state manager
            </li>
            <li>URL-synchronized state with automatic serialization</li>
            <li>Built-in SSR compatibility</li>
            <li>Enables possible deep linking capabilities.</li>
            <li>Zero-config query param persistence</li>
          </ul>
        </div>
        <NB
          className={cn(`mb-0`, hideFirstP, 'p-2')}
          isDarkMode={isDarkMode}
          details="These are experimental features that may result in unexpected behaviours, simple issues can be resolved by clearing the storage"
        />
        <NB
          className={cn(`mb-0`, hideFirstP, 'p-2')}
          isDarkMode={isDarkMode}
          details="Reload to load experimental features"
        />
      </div>
    </div>
  )
}

const WalletSettings = ({ isDarkMode }: { isDarkMode: boolean }) => {
  const [settings, setSettings] = useLocalStorage<UserSettings>(
    'userControlSettings',
    defaultSettings
  )
  const [userControlSettingsValue, setUserControlSettingsValue] =
    useTypedValue<UserSettings>('userControlSettings')
  useEffect(() => {
    setUserControlSettingsValue(settings!)
  }, [settings])

  const handleSmartAccountChange = () => {
    setSettings({
      ...settings!,
      use_smart_account: !settings?.use_smart_account,
    })
  }

  return (
    <div>
      <div className="p-4 space-y-4">
        <div className="flex gap-2 items-center">
          <h2 className="text-xl font-bold">Wallet Settings</h2>
          <div className="">
            <RefreshCcw
              onClick={() => {
                window.location.reload()
              }}
              className=" cursor-pointer"
            />
          </div>
        </div>

        <div className="flex justify-between items-center">
          <label className="flex items-center">
            <CreditCard className="mr-2" />
            Smart Account Management
          </label>
          <Switch
            checked={Boolean(settings?.use_smart_account)}
            onCheckedChange={handleSmartAccountChange}
          />
        </div>

        <div className="text-sm text-gray-500">
          <span className="font-bold">Smart Account Management</span>

          <ul className="list-disc list-inside">
            <li>
              Gasless transactions with{' '}
              <Link
                href="https://www.alchemy.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                Alchemy
              </Link>{' '}
              smart accounts
            </li>
            <li>Sponsored gas fees for improved onboarding</li>
            <li>Streamlined on-chain interactions for dApps</li>
            <li>Account abstraction for simplified user experience</li>
            <li>Batched transactions for optimized execution</li>
          </ul>
        </div>
        <NBCustom
          className={cn(`mb-0`, 'p-2')}
          isDarkMode={isDarkMode}
          details={
            <>
              <p className={`font-medium`}>Note</p>
              <p className="text-sm ">
                - This feature is only available for pregenerated wallets.
              </p>
              <p className="text-sm ">
                - Switching this feature off will disable gasless transactions
                and sponsored gas fees.
              </p>
              <p className="text-sm ">
                - Switching this feature off will stop usage of smart account
                and will revert to using the default account.
              </p>
            </>
          }
        />
      </div>
    </div>
  )
}

const SettingsPanel = () => {
  const { useSaveState } = useExperimentalFeatures()
  const { isLoginPregenSession } = usePregenSession()

  const [activeTab, setActiveTab] = useSaveState(
    'tab',
    parseAsString.withDefault('device'),
    'device'
  ) as [
    (
      | 'device'
      | 'performance'
      | 'appearance'
      | 'font'
      | 'user'
      | 'storage'
      | 'experiments'
      | 'wallet'
    ),
    (value: any) => void
  ]
  const [isDarkMode, setIsDarkMode] = useSaveState(
    'isdarkmode',
    parseAsBoolean.withDefault(false),
    false
  )
  const [fontSize, setFontSize] = useState(16)
  const [backgroundImage, setBackgroundImage] = useState('')
  const [, , removeUserInstalledAppsKey] = useLocalStorage(
    'user_installed_apps'
  )
  const [, , removeSettingsKey] = useLocalStorage<UserSettings>(
    'userControlSettings',
    defaultSettings
  )
  const { disconnect } = useDisconnect()
  const { isConnected } = useAccount()
  const clearAppStorage = () => {
    removeUserInstalledAppsKey()
    window.location.reload()
  }
  const clearUserStorage = () => {
    removeSettingsKey()
    if (isConnected) {
      disconnect()
    }
    window.location.reload()
  }

  const tabContent = {
    device: <DeviceInfo isDarkMode={isDarkMode} />,
    performance: <PerformanceInfo isDarkMode={isDarkMode} />,
    appearance: (
      <AppearanceSettings
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        setBackgroundImage={setBackgroundImage}
      />
    ),
    font: (
      <TextSettings
        isDarkMode={isDarkMode}
        fontSize={fontSize}
        setFontSize={setFontSize}
      />
    ),
    storage: (
      <StorageSettings
        isDarkMode={isDarkMode}
        clearAppStorage={clearAppStorage}
        clearUserStorage={clearUserStorage}
      />
    ),
    user: <UserInfoSettings isDarkMode={isDarkMode} />,
    experiments: <ExperimentalSettings isDarkMode={isDarkMode} />,
    ...(isLoginPregenSession && {
      wallet: <WalletSettings isDarkMode={isDarkMode} />,
    }),
  }

  const tabIcons = {
    device: <Monitor className="w-5 h-5" />,
    performance: <Gauge className="w-5 h-5" />,
    appearance: <Palette className="w-5 h-5" />,
    font: <Type className="w-5 h-5" />,
    storage: <Database className="w-5 h-5" />,
    user: <User className="w-5 h-5" />,
    experiments: <FlaskConical className="w-5 h-5" />,
    ...(isLoginPregenSession && { wallet: <Wallet className="w-5 h-5" /> }),
  }

  return (
    <div
      style={{ backgroundImage: `url(${backgroundImage})` }}
      className={`flex p-4 h-[450px] border rounded-lg shadow-lg 
        ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-black'}`}
    >
      <div
        className={`w-40 border-r flex flex-col p-2 
        ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-100'}`}
      >
        {(
          [
            'device',
            'performance',
            'appearance',
            'font',
            'user',
            'storage',
            ...(isLoginPregenSession ? ['wallet'] : []),
            'experiments',
          ] as const
        ).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex items-center p-2 rounded mb-2 transition-colors 
              ${
                activeTab === tab
                  ? `bg-${isDarkMode ? 'gray-700' : 'blue-100'} text-${
                      isDarkMode ? 'white' : 'blue-600'
                    }`
                  : `hover:bg-${isDarkMode ? 'gray-700' : 'gray-200'}`
              }`}
          >
            {tabIcons[tab as keyof typeof tabIcons]}
            <span className="ml-2 text-sm">
              {tab.charAt(0)?.toUpperCase() + tab.slice(1)}
            </span>
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-auto">{tabContent[activeTab]}</div>
    </div>
  )
}

export default SettingsPanel
