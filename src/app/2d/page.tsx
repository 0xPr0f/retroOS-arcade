'use client'

import GameCanvas from './components/GameCanvas'

export default function GamePage() {
  return (
    <div className="w-full h-screen flex items-center justify-center bg-gray-900">
      <GameCanvas />
    </div>
  )
}
