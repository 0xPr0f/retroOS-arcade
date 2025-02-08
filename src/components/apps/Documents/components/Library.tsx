import React, { useState, useRef, useEffect } from 'react'
import {
  Monitor,
  Download,
  Image,
  Settings,
  RefreshCcw,
  PaintBucket,
  Square,
} from 'lucide-react'
import { App, userAppCustom } from '@/components/pc/types'
import { Button, Switch } from '@/components/pc/drives/UI/UI_Components.v1'

import { useLocalStorage } from 'react-use'

import Icon from '@/components/pc/drives/Icon'
import StorageUserApps from '@/components/pc/drives/Storage&Hooks'
import apps from '@/components/apps/appDrawer'

const InstalledAppsPanel = () => {
  // const [installedApps, setInstalledApps] = useState<App[]>([...apps])
  const defaultInstalledApps: App[] = [...apps]

  //build local storage schema
  //user_installed_apps = app that the user can modify
  const [userInstalledApps, setUserInstalledApps] = useLocalStorage(
    'user_installed_apps'
  )
  const Apps: userAppCustom[] = StorageUserApps().flat()
  //design choice to not have a default selected app
  const [selectedApp, setSelectedApp] = useState<userAppCustom | null>(null)
  const [userApps, setUserApps] = useState<userAppCustom[]>(() => {
    try {
      const savedApps = userInstalledApps as string
      return savedApps ? JSON.parse(savedApps) : defaultInstalledApps
    } catch (error) {
      console.error('Error parsing saved apps:', error)
      return defaultInstalledApps
    }
  })
  const iconInputRef = useRef<HTMLInputElement>(null)
  const backgroundInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    try {
      setUserInstalledApps(JSON.stringify(userApps))
    } catch (error) {
      console.error('Error saving apps to localStorage:', error)
    }
  }, [userApps])

  const handleAppIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && selectedApp) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result
        const updatedApps = userApps?.map((app: any) =>
          app.id === selectedApp.id
            ? {
                ...app,
                icon: base64String,
              }
            : app
        )
        setUserApps(updatedApps)
        setSelectedApp(
          updatedApps.find((app: any) => app.id === selectedApp.id) || null
        )
      }
      reader.readAsDataURL(file)
    }
  }

  const handleBackgroundChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && selectedApp) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result
        const updatedApps = userApps.map((app) =>
          app.id === selectedApp.id
            ? { ...app, backgroundImage: base64String }
            : app
        )
        setUserApps(updatedApps)
        setSelectedApp(
          updatedApps.find((app) => app.id === selectedApp.id) || null
        )
      }
      reader.readAsDataURL(file)
    }
  }

  const setSelectedAppWithReset = (app: App) => {
    setSelectedApp(app)
    // Reset file inputs when switching apps
    if (iconInputRef.current) iconInputRef.current.value = ''
    if (backgroundInputRef.current) backgroundInputRef.current.value = ''
  }
  const disableApp = (appId: string) => {
    const updatedApps = userApps.map((app: userAppCustom) =>
      app.id === appId ? { ...app, isDisabled: !app.isDisabled } : app
    )
    setUserApps(updatedApps)
    setSelectedApp(
      updatedApps.find((app: userAppCustom) => app.id === appId) || null
    )
  }

  const toggleAppIconDetails = (task: string, appId: string) => {
    switch (task) {
      case 'icon_border_toggle_change':
        {
          const updatedApps = userApps.map((app: userAppCustom) =>
            app.id === appId
              ? { ...app, hasIconBorder: !app.hasIconBorder }
              : app
          )
          setUserApps(updatedApps)
          setSelectedApp(
            updatedApps.find((app: userAppCustom) => app.id === appId) || null
          )
        }
        break
      case 'icon_background_toggle_change':
        {
          const updatedApps = userApps.map((app: userAppCustom) =>
            app.id === appId ? { ...app, hasIconBG: !app.hasIconBG } : app
          )
          setUserApps(updatedApps)
          setSelectedApp(
            updatedApps.find((app: userAppCustom) => app.id === appId) || null
          )
        }
        break
    }
  }

  const onChangeColorChange = (
    task: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const updatedApps = userApps.map((app: userAppCustom) =>
      app.id === selectedApp!.id ? { ...app, IconBGcolor: e.target.value } : app
    )
    switch (task) {
      case 'icon_background_color_change':
        {
          setBG_BorderColor({
            icon_background_color_change: e.target.value,
            icon_border_color_change: BG_BorderColor.icon_border_color_change,
          })
          const updatedApps = userApps.map((app: userAppCustom) =>
            app.id === selectedApp!.id
              ? { ...app, IconBGcolor: e.target.value }
              : app
          )
          setUserApps(updatedApps)
        }
        break

      case 'icon_border_color_change':
        {
          setBG_BorderColor({
            icon_background_color_change:
              BG_BorderColor.icon_background_color_change,
            icon_border_color_change: e.target.value,
          })
          const updatedApps = userApps.map((app: userAppCustom) =>
            app.id === selectedApp!.id
              ? { ...app, BorderColor: e.target.value }
              : app
          )
          setUserApps(updatedApps)
        }
        break
    }
  }
  const removeKeysById = (data: any, id: any, keysToRemove: any) => {
    return data.map((item: any) => {
      if (item.id === id) {
        // Remove specified keys
        keysToRemove.forEach((key: any) => {
          delete item[key]
        })
      }
      return item
    })
  }

  const refresh = () => {
    window.location.reload()
  }
  useEffect(() => {
    const updatedApps = userApps.map((app: userAppCustom) => ({
      ...app,
      hasIconBG: app.hasIconBG === undefined ? true : app.hasIconBG,
      hasIconBorder: app.hasIconBorder === undefined ? true : app.hasIconBorder,
    }))
    setUserApps(updatedApps)
  }, [])
  const resetApp = (appId: string) => {
    const data = removeKeysById(userApps, appId, [
      'hasIconBG',
      'hasIconBorder',
      'isDisabled',
      'IconImage',
      'IconBGcolor',
      'BorderColor',
      'icon',
    ])
    setUserApps(data)
    setSelectedApp(data.find((app: userAppCustom) => app.id === appId) || null)
  }

  const [BG_BorderColor, setBG_BorderColor] = useState({
    icon_background_color_change: selectedApp?.IconBGcolor,
    icon_border_color_change: selectedApp?.BorderColor,
  })
  useEffect(() => {
    setBG_BorderColor({
      icon_background_color_change: selectedApp?.IconBGcolor,
      icon_border_color_change: selectedApp?.BorderColor,
    })
  }, [selectedApp])
  return (
    <div className="flex h-[400px] border rounded-lg shadow-lg">
      <div className="w-1/3 border-r p-4 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Installed Apps</h2>
        {userApps &&
          userApps.map((app: any) => (
            <button
              key={app.id}
              onClick={() => setSelectedAppWithReset(app)}
              className={`flex items-center w-full p-2 mb-2 rounded 
              ${
                selectedApp?.id === app.id ? 'bg-blue-100' : 'hover:bg-gray-100'
              }
              ${app.isDisabled ? 'opacity-50' : ''}`}
            >
              <div className="w-5 h-5">
                <Icon svgSrc={app.icon} keycon={app.id} />
              </div>
              <span className="ml-2">{app.title}</span>
            </button>
          ))}
      </div>

      {selectedApp && (
        <div className="w-2/3 p-4 overflow-y-auto">
          <div className="flex flex-row mb-4 ">
            <h3 className="text-lg font-semibold mr-2">
              App Settings: {selectedApp.title}
            </h3>
            <div className="">
              <RefreshCcw onClick={refresh} className=" cursor-pointer" />
            </div>
          </div>
          <p className="ml-4 pb-1">Icon Appearance</p>
          <div className="border rounded-lg p-4 shadow-lg space-y-4">
            <div>
              <label className="flex items-center mb-2">
                <Image className="mr-2" />
                App Icon
              </label>
              <input
                ref={iconInputRef}
                type="file"
                accept="image/*,image/svg+xml"
                onChange={handleAppIconChange}
                className="w-full"
              />
            </div>
            <div className="flex justify-between items-center">
              <label className="flex items-center">
                <Square className="mr-2" />
                Icon Background
              </label>
              <Switch
                checked={selectedApp.hasIconBG}
                onCheckedChange={() =>
                  toggleAppIconDetails(
                    'icon_background_toggle_change',
                    selectedApp.id
                  )
                }
              />
            </div>
            <div>
              <label className="flex items-center mb-2">
                <PaintBucket className=" mr-2" />
                Icon Background Color
              </label>
              <input
                type="color"
                value={BG_BorderColor.icon_background_color_change ?? '#000000'}
                onChange={(e) =>
                  onChangeColorChange('icon_background_color_change', e)
                }
                className="w-full"
              />
            </div>
            <div className="flex justify-between items-center">
              <label className="flex items-center">
                <Square className="mr-2" />
                Icon Border
              </label>
              <Switch
                checked={selectedApp.hasIconBorder}
                onCheckedChange={() => {
                  toggleAppIconDetails(
                    'icon_border_toggle_change',
                    selectedApp.id
                  )
                }}
              />
            </div>
            <div>
              <label className="flex items-center mb-2">
                <PaintBucket className=" mr-2" />
                Icon Border Color
              </label>
              <input
                value={BG_BorderColor.icon_border_color_change ?? '#000000'}
                onChange={(e) =>
                  onChangeColorChange('icon_border_color_change', e)
                }
                type="color"
                className="w-full"
              />
            </div>
          </div>
          <div className="border mt-4 rounded-lg p-4 shadow-lg space-y-4">
            <div>
              <label className="flex items-center mb-2">
                <Image className="mr-2" />
                App Background Image
              </label>
              <input
                ref={backgroundInputRef}
                type="file"
                accept="image/*"
                onChange={handleBackgroundChange}
                className="w-full"
              />
            </div>
          </div>
          <div className="border mt-4 rounded-lg p-4 shadow-lg space-y-4">
            <div className="flex justify-between items-center">
              <label className="flex items-center">
                <Settings className="mr-2" />
                App Disabled
              </label>
              <Switch
                checked={selectedApp.isDisabled}
                onCheckedChange={() => disableApp(selectedApp.id)}
              />
            </div>
            <div>
              <div className="flex justify-between items-center">
                <Button
                  onClick={() => {
                    resetApp(selectedApp.id)
                  }}
                  className=" bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-md transition duration-200"
                >
                  Reset
                </Button>
              </div>
            </div>
          </div>
          <div className="border mt-4 rounded-lg p-4 shadow-lg space-y-4">
            <p>Perform a Page Reload</p>
            <Button
              onClick={refresh}
              className=" bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-md transition duration-200"
            >
              Refresh
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default InstalledAppsPanel
