import { useDispatchWindows, useNavbar } from '@/components/pc/drives'
import { Button2 } from '@/components/pc/drives/UI/UI_Components.v1'
import React, { useEffect } from 'react'

const TetrisGame = () => {
  const { createDispatchWindow } = useDispatchWindows()
  const { setNavbarContent } = useNavbar()

  useEffect(() => {
    // Set custom navbar content when the window opens.
    setNavbarContent(
      <div className="flex items-center space-x-4">
        <span className="text-sm font-medium">Window Open</span>
        <button
          className="px-2 py-1 border rounded hover:bg-gray-700"
          onClick={() => {
            createDispatchWindow({
              title: 'My Window',
              content: <div>Window Content</div>,
              initialPosition: { x: 100, y: 50 },
              initialSize: { width: 200, height: 200 },
              onClose: () => console.log('Window closed'),
            })
          }}
        >
          More Info
        </button>
      </div>
    )

    // Clear the navbar content on unmount:
    return () => {
      setNavbarContent(null)
      return undefined // Ensure the return type is void
    }
  }, [setNavbarContent])

  return (
    <div>
      TetrisGame
      <Button2
        onClick={async () => {
          console.log('click')
          setNavbarContent(<div>THis is a 2 test</div>)
        }}
      >
        Test on chain
      </Button2>
    </div>
  )
}

export default TetrisGame
