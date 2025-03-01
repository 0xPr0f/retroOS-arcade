import {
  AppRouteRenderer,
  useAppRouter,
  AppRouteRegistrar,
} from '@/components/pc/drives'
import React, { useEffect, useState } from 'react'
import HomeUI from './ui/Home'
import CharacterUI from './ui/Character'
import SettingsUI from './ui/Settings'
import GameUI from './ui/Game'
import { CharacterCardUI } from './ui/CharacterCard'
import GamePlayUI from './ui/GamePlay'

// Color constants
const lightBlue = '#2563eb'
const weirdBlue = '#3a6ea5'
const lightRed = '#dc2626'
const darkBlue = '#0a246a'

// Example components
const Home: React.FC = () => {
  return <HomeUI />
}

const Settings: React.FC = () => {
  return <SettingsUI />
}

const Character: React.FC = () => {
  return <CharacterUI />
}
const Game: React.FC = () => {
  return <GameUI />
}
const GamePlay: React.FC<{ gameId: string }> = ({ gameId }) => {
  return <GamePlayUI gameId={gameId} />
}
const CharacterProfile: React.FC<{ tokenId: string }> = ({ tokenId }) => {
  return <CharacterCardUI tokenId={tokenId} />
}

const RealmClashGame = () => {
  const { navigate, back } = useAppRouter()
  const [activeTab, setActiveTab] = useState('/game')

  const routes = [
    { path: '/userprofile', component: Home },
    { path: '/game', component: Game },
    { path: '/gameplay/:gameId', component: GamePlay },
    { path: '/character', component: Character },
    { path: '/settings', component: Settings },
    { path: '/charactercard/:tokenId', component: CharacterProfile },
  ]

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/game')
      setActiveTab('/game')
    }, 10)

    return () => clearTimeout(timer)
  }, [])

  const handleTabClick = (path: string) => {
    navigate(path)
    setActiveTab(path)
  }

  return (
    <div className="min-h-full h-fit bg-gradient-to-b from-gray-900 via-blue-900 to-gray-900 flex flex-col">
      <div className="flex-1">
        <div className="w-full rounded-lg overflow-hidden shadow-2xl border border-gray-700/50">
          <div
            className="relative"
            style={{
              background: `linear-gradient(to right, ${weirdBlue}, ${darkBlue})`,
            }}
          >
            <div className="flex  items-center justify-between px-4">
              <div className="flex my-2 gap-1 flex-1">
                <TabButton
                  onClick={() => handleTabClick('/game')}
                  label="Game"
                  icon="🕹️"
                  isActive={activeTab === '/game'}
                />
                <TabButton
                  onClick={() => handleTabClick('/character')}
                  label="Characters"
                  icon="🎭"
                  isActive={activeTab === '/character'}
                />
                <TabButton
                  onClick={() => handleTabClick('/userprofile')}
                  label="Profile"
                  icon="👤"
                  isActive={activeTab === '/userprofile'}
                />
                <TabButton
                  onClick={() => handleTabClick('/settings')}
                  label="Settings"
                  icon="⚙️"
                  isActive={activeTab === '/settings'}
                />
              </div>

              <button
                onClick={back}
                className="px-4 py-2 rounded-lg
                 bg-gradient-to-r from-blue-500 to-blue-700
                 hover:from-red-600 hover:to-red-800
                 text-white font-medium
                 flex items-center gap-2
                 shadow-sm"
              >
                <span>←</span>
                <span>Back</span>
              </button>
            </div>
            <div
              className="h-1 w-full"
              style={{
                background: `linear-gradient(to right, ${lightRed}, ${weirdBlue}, ${darkBlue})`,
              }}
            />
          </div>
          <div
            style={{
              background: ` h-full
              linear-gradient(to bottom right, 
                rgba(37, 99, 235, 0.1),
                rgba(220, 38, 38, 0.05),
                rgba(30, 58, 138, 0.1)
              ),
              linear-gradient(to bottom, #111827, #1f2937)
            `,
            }}
          >
            <AppRouteRegistrar routes={routes} />
            <AppRouteRenderer />
          </div>
        </div>
      </div>
    </div>
  )
}

// Enhanced Tab Button Component
const TabButton: React.FC<{
  onClick: () => void
  label: string
  icon: string
  isActive: boolean
}> = ({ onClick, label, icon, isActive }) => (
  <button
    onClick={onClick}
    className={`
      px-4 py-2 text-white rounded-t-lg transition-all
      flex items-center gap-2 relative group
      ${
        isActive
          ? 'bg-gradient-to-b from-gray-800 to-gray-900'
          : 'hover:bg-gray-800/30'
      }
    `}
    style={{
      background: isActive
        ? `linear-gradient(to bottom, ${darkBlue}, ${darkBlue})`
        : `linear-gradient(to bottom, ${darkBlue}99, ${darkBlue}66)`,
      boxShadow: isActive ? 'inset 0 1px 0 0 rgba(255,255,255,0.1)' : 'none',
    }}
  >
    <span className="text-lg">{icon}</span>
    {label}
    <div
      className={`
        absolute bottom-0 left-0 right-0 h-1
        transform transition-transform origin-left
        ${
          isActive
            ? 'scale-x-100 bg-gradient-to-r from-lightRed to-blue-500'
            : 'scale-x-0 bg-blue-400'
        }
      `}
    />
  </button>
)

export default RealmClashGame
