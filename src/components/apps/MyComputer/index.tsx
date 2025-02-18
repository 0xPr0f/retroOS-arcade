import PcDesktop from '@/components/pc'
import React, { useEffect } from 'react'
import { useTypedValue } from '@/components/pc/drives'

const MyComputer = () => {
  const [userInstalledApps, setUserInstalledApps] = useTypedValue(
    'user_installed_apps'
  )
  useEffect(() => {
    setUserInstalledApps('20')
    console.log(userInstalledApps)
  }, [userInstalledApps])
  return <div className="text-black">MyComputer</div>
}

export default MyComputer
