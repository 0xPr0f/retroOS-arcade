import PcDesktop from '@/components/pc'
import React, { useEffect } from 'react'
import { useTypedValue } from '@/components/pc/drives'
import FileExplorer from './components/Computer'
const MyComputer = () => {
  return (
    <div className="text-black w-full h-full overflow-y-auto">
      <FileExplorer />
    </div>
  )
}

export default MyComputer
