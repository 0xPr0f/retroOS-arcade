import React, { useState } from 'react'
import { useAccount, useReadContract } from 'wagmi'
import { Button } from '@/components/pc/drives/UI/UI_Components.v1'
import {
  Trophy,
  Medal,
  User,
  Clock,
  Loader2,
  RefreshCw,
  Users,
} from 'lucide-react'
import { shortenText } from '@/components/pc/drives/Extensions/utils'
import { usePregenSession } from '@/components/pc/drives/Storage&Hooks/PregenSession'
import { keccak256, encodePacked } from 'viem'
import { LEADERBOARD_CONTRACT_ABI } from './onchain'
import { LEADERBOARD_CONTRACT_ADDRESS } from './onchain'

// Types
enum GameType {
  SNAKE = 0,
  TETRIS = 1,
}

interface LeaderboardEntry {
  player: string
  highScore: number
  lastPlayed: number
}

interface GameDetails {
  title: string
  icon: React.ReactNode
  color: string
}

const GameLeaderboard: React.FC = () => {
  const { address: playerAddress, isConnected } = useAccount()
  const { isLoginPregenSession, pregenActiveAddress } = usePregenSession()
  const [activeGame, setActiveGame] = useState<GameType>(GameType.SNAKE)
  const [leaderboardLimit, setLeaderboardLimit] = useState<number>(20)

  const address = isConnected
    ? playerAddress?.toLowerCase()
    : isLoginPregenSession
    ? pregenActiveAddress?.toLowerCase()
    : undefined

  const {
    data: leaderboardRawData = [],
    isLoading,
    refetch,
  } = useReadContract({
    address: LEADERBOARD_CONTRACT_ADDRESS,
    abi: LEADERBOARD_CONTRACT_ABI,
    functionName: 'getLeaderboard',
    args: [activeGame, leaderboardLimit],
    query: {
      enabled: true,
      refetchInterval: 60000, // Refetch every minute
    },
  })

  const leaderboardData = leaderboardRawData ? (leaderboardRawData as any) : []
  console.log(leaderboardData)

  const gameDetails: Record<GameType, GameDetails> = {
    [GameType.SNAKE]: {
      title: 'Snake',
      icon: <span className="text-lg">🐍</span>,
      color: 'from-green-500 to-green-700',
    },
    [GameType.TETRIS]: {
      title: 'Tetris',
      icon: <span className="text-lg">🧩</span>,
      color: 'from-purple-500 to-purple-700',
    },
  }

  // Helper function to format timestamp
  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor(Date.now() / 1000 - timestamp)
    if (seconds < 60) return 'just now'
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    return `${Math.floor(hours / 24)}d ago`
  }

  return (
    <div className="min-h-full h-fit bg-white rounded-lg shadow-xl ">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-blue-600 to-blue-800">
        <div className="flex justify-end items-center gap-2">
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full hover:bg-white/30 transition-all"
          >
            <RefreshCw className="w-4 h-4 text-white/80" />
            <span className="text-white/90 text-sm font-medium">Refresh</span>
          </button>
          <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
            <Users className="w-4 h-4 text-white/80" />
            <span className="text-white/90 text-sm font-medium">
              {isLoading ? 'Loading...' : `${leaderboardData.length} Players`}
            </span>
          </div>
        </div>
      </div>

      <div className="flex border-b">
        {Object.values(GameType)
          .filter((value) => typeof value === 'number')
          .map((gameType) => (
            <button
              key={gameType}
              onClick={() => setActiveGame(gameType as GameType)}
              className={`
                px-6 py-4 transition-all
                flex items-center gap-2 relative font-medium
                ${
                  activeGame === gameType
                    ? 'text-blue-600'
                    : 'text-gray-600 hover:text-blue-500 hover:bg-blue-50'
                }
              `}
            >
              {gameDetails[gameType as GameType].icon}
              <span>{gameDetails[gameType as GameType].title}</span>
              <div
                className={`
                  absolute bottom-0 left-0 right-0 h-0.5
                  transform transition-transform origin-left
                  ${
                    activeGame === gameType
                      ? `scale-x-100 bg-gradient-to-r ${
                          gameDetails[gameType as GameType].color
                        }`
                      : 'scale-x-0 bg-blue-400'
                  }
                `}
              />
            </button>
          ))}
      </div>

      <div className="p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        ) : leaderboardData.length > 0 ? (
          <div className="space-y-3">
            <div className="grid grid-cols-12 gap-2 px-4 py-2 text-gray-500 text-sm font-medium">
              <div className="col-span-1 text-center">Rank</div>
              <div className="col-span-6">Player</div>
              <div className="col-span-3 text-right">Score</div>
              <div className="col-span-2 text-right">Time</div>
            </div>

            {leaderboardData.map((entry: LeaderboardEntry, index: number) => {
              const isCurrentPlayer = entry.player.toLowerCase() === address

              return (
                <div
                  key={`${entry.player}-${index}`}
                  className={`
                    grid items-center grid-cols-12 gap-2 px-4 py-3 rounded-xl
                    ${
                      isCurrentPlayer
                        ? 'bg-blue-50 border-2 border-blue-200'
                        : index < 3
                        ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border border-amber-200'
                        : 'bg-gray-50 border border-gray-100'
                    }
                    ${index < 3 ? 'animate-once-pulse' : ''}
                    transition-all hover:transform hover:scale-[1.01]
                  `}
                >
                  {/* Rank */}
                  <div className="col-span-1 flex justify-center">
                    {index === 0 ? (
                      <Trophy className="w-5 h-5 text-yellow-500" />
                    ) : index === 1 ? (
                      <Medal className="w-5 h-5 text-gray-400" />
                    ) : index === 2 ? (
                      <Medal className="w-5 h-5 text-amber-600" />
                    ) : (
                      <span className="text-gray-600 font-medium">
                        {index + 1}
                      </span>
                    )}
                  </div>

                  {/* Player */}
                  <div className="col-span-6 flex items-center gap-3">
                    <div
                      className={`
                      w-8 h-8 rounded-full 
                      flex items-center justify-center
                      ${
                        isCurrentPlayer
                          ? 'bg-gradient-to-br from-blue-500 to-blue-600'
                          : index < 3
                          ? 'bg-gradient-to-br from-amber-400 to-amber-500'
                          : 'bg-gradient-to-br from-gray-500 to-gray-600'
                      }
                    `}
                    >
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <span
                      className={`
                      font-mono text-sm truncate
                      ${
                        isCurrentPlayer
                          ? 'text-blue-700 font-semibold'
                          : 'text-gray-700'
                      }
                    `}
                    >
                      {isCurrentPlayer
                        ? 'You'
                        : shortenText(entry.player, 6, 4)}
                    </span>
                  </div>

                  <div className="col-span-3 text-right font-bold text-gray-900">
                    {entry.highScore.toLocaleString()}
                  </div>

                  <div className="col-span-2 text-right text-gray-500 text-sm flex items-center justify-end gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{formatTimeAgo(Number(entry.lastPlayed))}</span>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <Trophy className="w-16 h-16 text-gray-300 mb-4" />
            <p className="text-gray-600 font-medium">No scores yet</p>
            <p className="text-sm mt-1 text-gray-500">Time to make history!</p>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes once-pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
        }
        .animate-once-pulse {
          animation: once-pulse 2s ease-in-out 1;
        }
      `}</style>
    </div>
  )
}

export default GameLeaderboard
