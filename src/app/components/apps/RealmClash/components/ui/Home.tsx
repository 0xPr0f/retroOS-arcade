import { useMemo, useState } from 'react'
import { CHARACTER_CARD_ABI, CLASH_BATTLE_SYSTEM_ABI } from '../deployments/abi'
import {
  CHARACTER_CARD_ADDRESS,
  CLASH_BATTLE_SYSTEM_ADDRESS,
} from '../deployments/address'
import { StatCard } from './ui_components'
import {
  useAccount,
  useChainId,
  useReadContract,
  useReadContracts,
} from 'wagmi'
import { useAppRouter, usePregenSession } from '@/app/components/pc/drives'
import { config } from '../deployments/config'

const HomeUI: React.FC = () => {
  const { isConnected, address: playerAddress } = useAccount()
  const { isLoginPregenSession, pregenActiveAddress, isSmartAccount } =
    usePregenSession()
  const chainId = useChainId()
  const address = isConnected
    ? playerAddress?.toLowerCase()
    : isLoginPregenSession
    ? pregenActiveAddress?.toLowerCase()
    : undefined

  const availableChainIds = ['84532']

  const { data: allTokenIds } = useReadContract({
    address: CHARACTER_CARD_ADDRESS,
    abi: CHARACTER_CARD_ABI,
    functionName: 'getCharactersByOwner',
    args: [address],
  })

  const characterIds = (allTokenIds as bigint[]) || []

  const characterMaps = characterIds.map((id) => ({
    address: CHARACTER_CARD_ADDRESS as `0x${string}`,
    abi: CHARACTER_CARD_ABI as any,
    functionName: 'getCharacterStats',
    args: [id],
  }))

  const { data: characterQueries } = useReadContracts({
    contracts: characterMaps,
  })

  const POWER_TIERS = {
    E: { min: 0, max: 499 },
    D: { min: 500, max: 999 },
    C: { min: 1000, max: 1999 },
    B: { min: 2000, max: 3999 },
    A: { min: 4000, max: 5999 },
    S: { min: 6000, max: 7999 },
    'S+': { min: 8000, max: Infinity },
  } as const

  const RANK_TIERS = {
    'Bronze III': { min: 0, max: 149 },
    'Bronze II': { min: 150, max: 299 },
    'Bronze I': { min: 300, max: 499 },
    'Silver III': { min: 500, max: 749 },
    'Silver II': { min: 750, max: 999 },
    'Silver I': { min: 1000, max: 1249 },
    'Gold III': { min: 1250, max: 1649 },
    'Gold II': { min: 1650, max: 1999 },
    'Gold I': { min: 2000, max: 2499 },
    'Platinum III': { min: 2500, max: 3249 },
    'Platinum II': { min: 3250, max: 3999 },
    'Platinum I': { min: 4000, max: 4999 },
    'Diamond III': { min: 5000, max: 6249 },
    'Diamond II': { min: 6250, max: 7499 },
    'Diamond I': { min: 7500, max: 9999 },
    Master: { min: 10000, max: 14999 },
    Grandmaster: { min: 15000, max: 24999 },
    Legend: { min: 25000, max: Infinity },
  } as const

  const totalStats = useMemo(() => {
    if (!characterQueries) {
      return { wins: 0, losses: 0, totalGames: 0, experience: 0 }
    }

    return characterQueries.reduce(
      (acc, query: any) => {
        const stats = query.result
        return {
          wins: acc.wins + Number(stats?.wins || 0),
          losses: acc.losses + Number(stats?.losses || 0),
          totalGames:
            acc.totalGames +
            Number(stats?.wins || 0) +
            Number(stats?.losses || 0),
          experience: acc.experience + Number(stats?.experience || 0),
        }
      },
      { wins: 0, losses: 0, totalGames: 0, experience: 0 }
    )
  }, [characterQueries])

  const getTierFromValue = (
    value: number,
    tiers: typeof POWER_TIERS | typeof RANK_TIERS
  ) => {
    return (
      Object.entries(tiers).find(
        ([_, range]) => value >= range.min && value <= range.max
      )?.[0] || 'Unranked'
    )
  }

  const currentRank = useMemo(
    () => getTierFromValue(totalStats.experience, RANK_TIERS),
    [totalStats.experience]
  )

  const currentPowerRank = useMemo(() => {
    const avgExperience = characterIds.length
      ? totalStats.experience / characterIds.length
      : 0
    return getTierFromValue(avgExperience, POWER_TIERS)
  }, [totalStats.experience, characterIds.length])

  const [searchProfile, setSearchProfile] = useState({
    gameId: '',
    tokenId: '',
  })
  const { navigate } = useAppRouter()

  const clashBattleSystemContract = {
    address: CLASH_BATTLE_SYSTEM_ADDRESS,
    abi: CLASH_BATTLE_SYSTEM_ABI,
  } as const
  const characterCardContract = {
    address: CHARACTER_CARD_ADDRESS,
    abi: CHARACTER_CARD_ABI,
  } as const

  const { data: battleCounterResultandTokenCounter } = useReadContracts({
    config: config,
    contracts: [
      {
        ...clashBattleSystemContract,
        functionName: 'battleCounter',
        args: [],
      },
      {
        ...characterCardContract,
        functionName: '_tokenIdCounter',
        args: [],
      },
    ],
  })

  const BattleAndTokenCounters =
    (battleCounterResultandTokenCounter?.map(
      (counter) => counter.result
    ) as any) || []
  return (
    <div className="p-6">
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-lg p-6 backdrop-blur-sm border border-gray-700/50">
        <h1 className="text-3xl font-bold text-white mb-4 flex items-center">
          <span className="text-blue-400 mr-2">⚔️</span>
          Welcome, Clasher!
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <StatCard
            title="Player Level"
            value={String(
              Math.max(0, Math.floor(Number(totalStats.experience) / 100))
            )}
          />
          <StatCard title="Gold" value="0" />
          <StatCard title="Victories" value={String(totalStats.wins)} />
          <StatCard title="Defeats" value={String(totalStats.losses)} />
          <StatCard title="Guild Rank" value="Elite" />
          <StatCard title="Player Rank" value={currentRank} />
          <StatCard title="Avg Power Rank" value={currentPowerRank} />
        </div>
      </div>
      <div className="mt-8 space-y-6">
        {/* Game Search Section */}
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-lg p-6 backdrop-blur-sm border border-gray-700/50">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center">
            <span className="text-blue-400 mr-2">🕹️</span>
            Game Search
          </h2>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={searchProfile.gameId}
                onChange={(e) => {
                  setSearchProfile({ ...searchProfile, gameId: e.target.value })
                }}
                className="w-full bg-gray-700/50 rounded-lg px-4 py-3 text-white border border-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-gray-400"
                placeholder="Enter Game ID..."
                inputMode="numeric"
                pattern="[0-9]*"
                onInput={(event) => {
                  const input = event.target as HTMLInputElement
                  input.value = input.value.replace(/[^0-9]/g, '')
                }}
              />
            </div>
            <button
              onClick={() => {
                if (!searchProfile.gameId) return
                const gameId = Number(searchProfile.gameId)
                const maxGameId = Number(BattleAndTokenCounters[0])
                if (gameId <= 0 || gameId > maxGameId) return

                navigate(`/gameplay/${searchProfile.gameId}`)
              }}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-colors flex items-center gap-2 font-medium"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                />
              </svg>
              Find Game
            </button>
          </div>
        </div>

        {/* Character Search Section */}
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-lg p-6 backdrop-blur-sm border border-gray-700/50">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center">
            <span className="text-blue-400 mr-2">🎭</span>
            Character Search
          </h2>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={searchProfile.tokenId}
                onChange={(e) => {
                  setSearchProfile({
                    ...searchProfile,
                    tokenId: e.target.value,
                  })
                }}
                className="w-full bg-gray-700/50 rounded-lg px-4 py-3 text-white border border-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-gray-400"
                placeholder="Enter Token ID..."
                inputMode="numeric"
                pattern="[0-9]*"
                onInput={(event) => {
                  const input = event.target as HTMLInputElement
                  input.value = input.value.replace(/[^0-9]/g, '')
                }}
              />
            </div>
            <button
              onClick={() => {
                if (!searchProfile.tokenId) return
                const tokenId = Number(searchProfile.tokenId)
                const maxTokenId = Number(BattleAndTokenCounters[1])
                if (tokenId <= 0 || tokenId > maxTokenId) return

                navigate(`/charactercard/${searchProfile.tokenId}`)
              }}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-colors flex items-center gap-2 font-medium"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                />
              </svg>
              Find Character
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
export default HomeUI
