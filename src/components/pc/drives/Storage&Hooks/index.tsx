'use client'
import { useState } from 'react'
import { useLocalStorage } from 'react-use'
import { userAppCustom } from '../../types'
import apps from '@/components/apps/appDrawer'
//we will use what we want from /*react-use*/

const StorageUserApps = () => {
  const [userInstalledApps, setUserInstalledApps] = useLocalStorage(
    'user_installed_apps'
  )
  const [userApps, setUserApps] = useState<userAppCustom[]>(() => {
    try {
      const savedApps = userInstalledApps as string
      return savedApps ? JSON.parse(savedApps) : apps
    } catch (error) {
      console.error('Error parsing saved apps:', error)
      return apps
    }
  })
  return userApps.map(
    ({
      id,
      title,
      IconImage,
      isDisabled = false,
      icon,
      hasIconBG = true,
      hasIconBorder = true,
      BorderColor = '#FFFFFF',
      IconBGcolor = '#0a246a',
      onDesktop = true,
      startMenu = false,
    }) => [
      {
        id,
        title,
        IconImage,
        isDisabled,
        icon,
        hasIconBG,
        hasIconBorder,
        BorderColor,
        IconBGcolor,
        onDesktop,
        startMenu,
      },
    ]
  )
}

export default StorageUserApps

// All the storage states are stored in the local storage
/*
 const [experimentalFlag, setExperimentalFlag] = useLocalStorage(
    'retro_experimental_flag',
    JSON.stringify(false)
  )

 const [userInstalledApps, setUserInstalledApps] = useLocalStorage(
    'user_installed_apps'
  )

 const [settings, setSettings] = useLocalStorage<UserSettings>(
    'userControlSettings',
    defaultSettings
  )
*/
