import React from 'react'
import RealmClashGame from './components/RealmClashInterface'
import { AppRouterProvider } from '@/app/components/pc/drives'

const RealmClash = () => {
  return (
    <div className="h-full w-full overflow-y-auto">
      <AppRouterProvider>
        <RealmClashGame />
      </AppRouterProvider>
    </div>
  )
}

export default RealmClash
