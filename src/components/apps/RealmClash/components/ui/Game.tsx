import { useEffect, useMemo, useRef, useState } from 'react'
import {
  darkBlue,
  useAppRouter,
  useDispatchWindows,
  useHookTransaction,
  useNotifications,
  usePregenSession,
  useTypedValue,
  weirdBlue,
} from '@/components/pc/drives'
import {
  X_CHARACTER_CARD_ADDRESS,
  X_CLASH_BATTLE_SYSTEM_ADDRESS,
} from '../deployments/address'
import { CHARACTER_CARD_ABI, CLASH_BATTLE_SYSTEM_ABI } from '../deployments/abi'
import {
  useAccount,
  useChainId,
  useReadContract,
  useReadContracts,
  useWaitForTransactionReceipt,
  useWatchContractEvent,
  useWriteContract,
} from 'wagmi'
import { getCharacterClassLabel } from './Character'
import { config } from '../deployments/config'
import { shortenText } from '@/components/pc/drives'
import { useMouse } from 'react-use'
import { useWindowState } from '@/components/pc/drives/UI/dispatchWindow'
import { useSmartAccount } from '@/components/pc/drives/Storage&Hooks/SmartAccountHook'

const GameUI: React.FC = () => {
  return (
    <div className="">
      <div className="bg-gradient-to-br  from-gray-800/50 to-gray-900/50 rounded-lg p-6 backdrop-blur-sm border border-gray-700/50">
        <GameHome />
      </div>
    </div>
  )
}
export default GameUI

const LoadingSpinner: React.FC<{ size?: string; color?: string }> = ({
  size = 'w-8 h-8',
  color = 'text-blue-500',
}) => (
  <div className="flex justify-center items-center">
    <div
      className={`${size} ${color} animate-spin rounded-full border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]`}
      role="status"
    >
      <span className="sr-only">Loading...</span>
    </div>
  </div>
)

const ShimmerEffect: React.FC<{ className?: string }> = ({
  className = 'h-6 w-full',
}) => (
  <div
    className={`${className} bg-gray-700/30 animate-pulse rounded overflow-hidden relative before:absolute before:inset-0 before:-translate-x-full before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent before:animate-[shimmer_1.5s_infinite]`}
  ></div>
)

const GameStats: React.FC<{
  characterIds: number[]
  activeGameDataArr: number[]
}> = ({ characterIds, activeGameDataArr }) => {
  if (!characterIds?.length) return null
  const chainId = useChainId()
  const CHARACTER_CARD_ADDRESS = X_CHARACTER_CARD_ADDRESS[
    chainId.toString()
  ] as `0x${string}`
  const characterMaps = characterIds.map((id) => ({
    address: CHARACTER_CARD_ADDRESS as `0x${string}`,
    abi: CHARACTER_CARD_ABI as any,
    functionName: 'getCharacterStats',
    args: [id],
  }))

  const { data: characterQueries, isLoading: isCharacterQueriesLoading } =
    useReadContracts({
      contracts: characterMaps,
    })
  /*
  const powerTierMapping = {
    E: { min: 0, max: 499 },
    D: { min: 500, max: 999 },
    C: { min: 1000, max: 1999 },
    B: { min: 2000, max: 3999 },
    A: { min: 4000, max: 5999 },
    S: { min: 6000, max: 7999 },
    'S+': { min: 8000, max: Infinity },
  } as const
*/
  const rankMapping = {
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
    if (!characterQueries)
      return { wins: 0, losses: 0, totalGames: 0, experience: 0 }

    const gameRankDetails = characterQueries.map((stat: any) => stat.result)
    return gameRankDetails.reduce(
      (
        acc: {
          wins: number
          losses: number
          totalGames: number
          experience: number
        },
        char: any
      ) => {
        return {
          wins: acc.wins + Number(char.wins || 0),
          losses: acc.losses + Number(char.losses || 0),
          totalGames:
            acc.totalGames + Number(char.wins || 0) + Number(char.losses || 0),
          experience: acc.experience + Number(char.experience || 0),
        }
      },
      { wins: 0, losses: 0, totalGames: 0, experience: 0 }
    )
  }, [characterQueries])

  const winRate = useMemo(() => {
    return totalStats.totalGames > 0
      ? (totalStats.wins / totalStats.totalGames) * 100
      : 0
  }, [totalStats])

  const currentRank = useMemo(() => {
    return (
      Object.entries(rankMapping).find(
        ([_, range]) =>
          totalStats.experience >= range.min &&
          totalStats.experience <= range.max
      )?.[0] || 'Unranked'
    )
  }, [totalStats.experience])

  return (
    <div className="grid grid-cols-3 gap-4">
      <GameStatCard
        title="Active Games"
        value={activeGameDataArr.length.toString()}
        icon="🎮"
        isLoading={false}
      />
      <GameStatCard
        title="Rank"
        value={characterQueries ? currentRank : 'Loading...'}
        icon="🏆"
        isLoading={isCharacterQueriesLoading}
      />
      <GameStatCard
        title="Win Rate"
        value={characterQueries ? `${winRate.toFixed(2)}%` : 'Loading...'}
        icon="📈"
        isLoading={isCharacterQueriesLoading}
      />
    </div>
  )
}

const GameHome: React.FC = () => {
  const { navigate, currentRoute } = useAppRouter()
  const [activeTab, setActiveTab] = useState('active')
  const [showChallengeModal, setShowChallengeModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const handleGameClick = (gameId: string) => {
    navigate(`/gameplay/${gameId}`)
  }
  const { isConnected, address: playerAddress } = useAccount()
  const { activeAddress, isGuestMode } = useSmartAccount()
  const chainId = useChainId()
  const address = isConnected ? activeAddress?.toLowerCase() : undefined

  const { addNotification } = useNotifications()
  const availableChainIds = ['84532', '10143']
  const isChainUnavailable = !availableChainIds.some(
    (chain) => Number(chain) === chainId
  )
  const CLASH_BATTLE_SYSTEM_ADDRESS = X_CLASH_BATTLE_SYSTEM_ADDRESS[
    chainId.toString()
  ] as `0x${string}`

  useWatchContractEvent({
    address: CLASH_BATTLE_SYSTEM_ADDRESS,
    abi: CLASH_BATTLE_SYSTEM_ABI,
    eventName: 'ChallengeIssued',
    config: config,
    onLogs(logs: any) {
      const { challenger, challenged } = logs[0].args
      if (String(challenger).toLowerCase() === String(address).toLowerCase()) {
        refetchChallengesData()
      }
      if (String(challenged).toLowerCase() === String(address).toLowerCase()) {
        refetchChallengesData()
      }
    },
  })
  useWatchContractEvent({
    address: CLASH_BATTLE_SYSTEM_ADDRESS,
    abi: CLASH_BATTLE_SYSTEM_ABI,
    eventName: 'ChallengeAccepted',
    config: config,
    onLogs(logs: any) {
      const { challenger, challenged } = logs[0].args
      if (String(challenger).toLowerCase() === String(address).toLowerCase()) {
        refetchChallengesData()
      }
      if (String(challenged).toLowerCase() === String(address).toLowerCase()) {
        refetchChallengesData()
      }
    },
  })
  useWatchContractEvent({
    address: CLASH_BATTLE_SYSTEM_ADDRESS,
    abi: CLASH_BATTLE_SYSTEM_ABI,
    eventName: 'ChallengeRejected',
    config: config,
    onLogs(logs: any) {
      const { challenger, challenged } = logs[0].args
      if (String(challenger).toLowerCase() === String(address).toLowerCase()) {
        refetchChallengesData()
      }
      if (String(challenged).toLowerCase() === String(address).toLowerCase()) {
        refetchChallengesData()
      }
    },
  })

  const CHARACTER_CARD_ADDRESS = X_CHARACTER_CARD_ADDRESS[
    chainId.toString()
  ] as `0x${string}`

  const { data: allTokenIds, isLoading: isTokenIdsLoading } = useReadContract({
    config: config,
    address: CHARACTER_CARD_ADDRESS,
    abi: CHARACTER_CARD_ABI,
    functionName: 'getCharactersByOwner',
    args: [address],
    query: {
      enabled: !!address,
      refetchInterval: 3000,
    },
  })

  const realmClashSystemContract = {
    address: CLASH_BATTLE_SYSTEM_ADDRESS,
    abi: CLASH_BATTLE_SYSTEM_ABI,
  } as const
  const {
    data: challengesResult,
    refetch: refetchChallengesData,
    isLoading: isChallengesLoading,
  } = useReadContracts({
    contracts: [
      {
        ...realmClashSystemContract,
        functionName: 'getPlayerChallenges',
        args: [address],
      },
      {
        ...realmClashSystemContract,
        functionName: 'getPlayerChallengers',
        args: [address],
      },
      {
        ...realmClashSystemContract,
        functionName: 'getActiveBattle',
        args: [address],
      },
    ],
  })

  useEffect(() => {
    setIsLoading(isTokenIdsLoading || isChallengesLoading)
  }, [isTokenIdsLoading, isChallengesLoading])

  if (isLoading) {
    return (
      <div className="min-h-full h-fit p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-lg border border-gray-700/50 shadow-xl overflow-hidden">
            <div
              className="p-6 border-b border-gray-700"
              style={{
                background: `linear-gradient(to right, ${weirdBlue}, ${darkBlue})`,
              }}
            >
              <div className="flex justify-between items-center">
                <div>
                  <ShimmerEffect className="h-8 w-64 mb-2" />
                  <ShimmerEffect className="h-4 w-40" />
                </div>
                <div className="flex gap-3">
                  <ShimmerEffect className="h-10 w-28 rounded-lg" />
                  <ShimmerEffect className="h-10 w-32 rounded-lg" />
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 border-b border-gray-700/50 p-4">
              <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="bg-gray-900/30 rounded-lg p-3 border border-gray-700/30"
                  >
                    <div className="flex items-center gap-2">
                      <ShimmerEffect className="h-8 w-8 rounded-full" />
                      <div className="w-full">
                        <ShimmerEffect className="h-4 w-16 mb-1" />
                        <ShimmerEffect className="h-6 w-20" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex border-b border-gray-700 bg-gray-800/30 px-2 pt-2">
              <ShimmerEffect className="h-12 w-36 rounded-t-lg mr-2" />
              <ShimmerEffect className="h-12 w-36 rounded-t-lg" />
            </div>

            <div className="p-6 flex justify-center items-center min-h-[300px]">
              <div className="text-center">
                <LoadingSpinner size="w-16 h-16" />
                <p className="mt-4 text-gray-400">Loading game data...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!challengesResult) return null

  const effectiveChallengesData = challengesResult.map(
    (stat) => stat.result
  ) as any

  const allChallenges = [
    ...(effectiveChallengesData[0] || ([] as any)).map((challenge: any) => ({
      address: challenge,
      isChallenger: true,
    })),
    ...(effectiveChallengesData[1] || ([] as any)).map((challenge: any) => ({
      address: challenge,
      isChallenger: false,
    })),
  ]
  const activeGameDataArr =
    Number(effectiveChallengesData[2]) > 0 ? [effectiveChallengesData[2]] : []
  if (!effectiveChallengesData) return null

  return (
    <div className="min-h-full h-fit p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-lg border border-gray-700/50 shadow-xl overflow-hidden">
          <div
            className="p-6 border-b border-gray-700"
            style={{
              background: `linear-gradient(to right, ${weirdBlue}, ${darkBlue})`,
            }}
          >
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Welcome back, Clasher!
                </h1>
                <p className="text-blue-300 mt-1">Clash on!</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowChallengeModal(true)}
                  className="px-4 py-2 bg-gradient-to-r from-lightRed to-red-700 
                           text-white rounded-lg hover:from-red-600 hover:to-red-800 
                           transition-all duration-200 flex items-center gap-2
                           shadow-lg hover:shadow-red-500/20"
                >
                  <span>⚔️</span>
                  Challenge
                </button>
                <button
                  onClick={() => {
                    addNotification({
                      title: 'Coming Soon',
                      message:
                        'This feature is on the contracts and coming soon to the UI!',
                      type: 'info',
                      duration: 10000,
                    })
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-700
                           text-white rounded-lg hover:from-blue-600 hover:to-blue-800
                           transition-all duration-200 flex items-center gap-2
                           shadow-lg hover:shadow-blue-500/20"
                >
                  <span>🎮</span>
                  Quick Match
                </button>
              </div>
            </div>
          </div>
          <div className="bg-gray-800/50 border-b border-gray-700/50 p-4">
            <GameStats
              activeGameDataArr={activeGameDataArr}
              characterIds={allTokenIds as any}
            />
          </div>

          <div className="flex border-b border-gray-700 bg-gray-800/30 px-2 pt-2">
            <TabButton
              label="Active Games"
              icon="⚔️"
              isActive={activeTab === 'active'}
              onClick={() => setActiveTab('active')}
              badge={activeGameDataArr.length}
            />
            <TabButton
              label="Challenges"
              icon="🏆"
              isActive={activeTab === 'challenges'}
              onClick={() => setActiveTab('challenges')}
              badge={allChallenges.length}
            />
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'active' && (
              <div className="space-y-4">
                {activeGameDataArr.length === 0 ? (
                  <EmptyState
                    icon="⚔️"
                    title="No Active Games"
                    description="You don't have any active games. Challenge someone or join a quick match!"
                  />
                ) : (
                  activeGameDataArr.map((gameId: any) => (
                    <GameCard
                      key={gameId}
                      gameId={gameId}
                      onClick={() => handleGameClick(String(gameId))}
                    />
                  ))
                )}
              </div>
            )}

            {activeTab === 'challenges' && (
              <div className="space-y-4">
                {allChallenges.length === 0 ? (
                  <EmptyState
                    icon="🏆"
                    title="No Challenges"
                    description="You have no pending challenges. Challenge someone to start playing!"
                  />
                ) : (
                  allChallenges.map((challenge) => (
                    <ChallengeCard
                      key={Number(challenge.address) * Math.random()}
                      challenge={challenge.address}
                      challenger={challenge.isChallenger}
                    />
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {showChallengeModal && (
        <ChallengeModal onClose={() => setShowChallengeModal(false)} />
      )}
    </div>
  )
}

const GameCard: React.FC<{ gameId?: string; onClick: () => void }> = ({
  gameId,
  onClick,
}) => {
  const chainId = useChainId()
  const CLASH_BATTLE_SYSTEM_ADDRESS = X_CLASH_BATTLE_SYSTEM_ADDRESS[
    chainId.toString()
  ] as `0x${string}`

  const { data: gameData, isLoading } = useReadContract({
    config: config,
    address: CLASH_BATTLE_SYSTEM_ADDRESS,
    abi: CLASH_BATTLE_SYSTEM_ABI,
    functionName: 'getBattleDetails',
    args: [gameId],
  })

  const { activeAddress } = useSmartAccount()
  const { isConnected, address: playerAddress } = useAccount()
  const address = isConnected ? activeAddress?.toLowerCase() : undefined

  if (isLoading) {
    return (
      <div className="bg-gray-800/30 border border-gray-700/30 rounded-lg p-4 hover:bg-gray-800/50 hover:border-gray-600/50 transition-all">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <ShimmerEffect className="w-12 h-12 rounded-full" />
            <div>
              <ShimmerEffect className="h-5 w-40 mb-2" />
              <ShimmerEffect className="h-4 w-24" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <ShimmerEffect className="h-6 w-16 rounded-lg" />
            <ShimmerEffect className="h-4 w-4 rounded-full" />
          </div>
        </div>
      </div>
    )
  }

  if (!gameData) return null

  const battleGameData = gameData as any
  const battleDetails = {
    player1: battleGameData[0],
    player2: battleGameData[1],
    characterId1: battleGameData[2],
    characterId2: battleGameData[3],
    state: battleGameData[4],
    startTime: battleGameData[5],
    winner: battleGameData[6],
    currentTurnPlayer: battleGameData[7],
    turnState: battleGameData[8],
    turnNumber: battleGameData[9],
  }
  return (
    <div
      onClick={onClick}
      className="bg-gray-800/30 border border-gray-700/30 rounded-lg p-4
                 hover:bg-gray-800/50 hover:border-gray-600/50 transition-all
                 cursor-pointer group"
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 
                        flex items-center justify-center text-white text-xl font-bold"
          >
            {String(gameId).slice(0, 2)}
          </div>
          <div>
            <h3 className="text-white font-semibold group-hover:text-blue-400 transition-colors">
              Game vs{' '}
              {shortenText(
                String(battleDetails.player1).toLowerCase() !==
                  address?.toLowerCase()
                  ? battleDetails.player1
                  : battleDetails.player2
              )}
            </h3>
            <p className="text-gray-400 text-sm">
              {formatTimeAgoUnix(Number(battleDetails.startTime))}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Badge type={'ranked'} color={'red'} />
          {battleDetails.currentTurnPlayer.toLowerCase() ===
            address?.toLowerCase() && (
            <span className="text-green-400 flex items-center gap-1">
              <span className="animate-pulse">●</span> Your Turn
            </span>
          )}
          <span className="text-gray-400 group-hover:text-white transition-colors">
            →
          </span>
        </div>
      </div>
    </div>
  )
}
export const CharacterOption = ({ characterId }: { characterId: bigint }) => {
  const chainId = useChainId()
  const CHARACTER_CARD_ADDRESS = X_CHARACTER_CARD_ADDRESS[
    chainId.toString()
  ] as `0x${string}`
  const loadCharacterDetails = (_characterId: string) => {
    const {
      data: characterStats,
      refetch: refetchCharacterStats,
      isLoading,
    } = useReadContract({
      config: config,
      address: CHARACTER_CARD_ADDRESS,
      abi: CHARACTER_CARD_ABI,
      functionName: 'getCharacterStats',
      args: [_characterId],
    })
    return { characterStats, isLoading }
  }

  const { characterStats, isLoading } = loadCharacterDetails(
    String(characterId)
  )
  const selectorCharacterStats = characterStats as any

  if (isLoading) {
    return <option value={String(characterId)}>Loading character...</option>
  }

  if (!selectorCharacterStats) return null

  return (
    <option value={String(characterId)}>
      {selectorCharacterStats.name} :{' '}
      {getCharacterClassLabel(selectorCharacterStats.characterClass)}
    </option>
  )
}

// Challenge Modal Component
const ChallengeModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { activeAddress, isGuestMode } = useSmartAccount()
  const chainId = useChainId()

  const { isConnected, address: playerAddress } = useAccount()
  const address = isConnected ? activeAddress?.toLowerCase() : undefined

  const { addNotification } = useNotifications()
  const availableChainIds = ['84532', '10143']
  const isChainUnavailable = !availableChainIds.some(
    (chain) => Number(chain) === chainId
  )

  const [challengeDetails, setChallengeDetails] = useState<{
    opponent: string
    characterId: string
    gameType: string
  }>({
    opponent: '',
    characterId: '',
    gameType: 'ranked',
  })

  const {
    writeContract: writeGameChallenge,
    data: gameChallengeData,
    isPending: isGameChallengePending,
    error: gameChallengeError,
  } = useWriteContract({
    mutation: {
      onError: (error: any) => {},
      onSuccess: (txHash: any) => {},
    },
  })

  // Pregen Join Queue Contract Write
  const {
    writeContract: writeGameChallengePregen,
    data: gameChallengeDataPregen,
    isPending: isGameChallengePendingPregen,
  } = useHookTransaction({
    mutation: {
      onError: (error: any) => {},
      onSuccess: (txHash: any) => {},
    },
  })

  const CLASH_BATTLE_SYSTEM_ADDRESS = X_CLASH_BATTLE_SYSTEM_ADDRESS[
    chainId.toString()
  ] as `0x${string}`

  const handleChallengeOpponent = async () => {
    if (isChainUnavailable) {
      addNotification({
        title: `Chain Unavailable`,
        message: `This chain is not available. Please use base sepolia.`,
        type: 'error',
        duration: 10000,
      })
      return
    }
    if (!isGuestMode) {
      await writeGameChallenge({
        address: CLASH_BATTLE_SYSTEM_ADDRESS,
        abi: CLASH_BATTLE_SYSTEM_ABI,
        functionName: 'challengePlayer',
        args: [challengeDetails.opponent, challengeDetails.characterId],
      })
    } else {
      await writeGameChallengePregen({
        address: CLASH_BATTLE_SYSTEM_ADDRESS,
        abi: CLASH_BATTLE_SYSTEM_ABI,
        functionName: 'challengePlayer',
        args: [challengeDetails.opponent, challengeDetails.characterId],
      })
    }
  }

  useWatchContractEvent({
    address: CLASH_BATTLE_SYSTEM_ADDRESS,
    abi: CLASH_BATTLE_SYSTEM_ABI,
    eventName: 'ChallengeIssued',
    onLogs(logs: any) {
      const { challenger, challenged } = logs[0].args
      if (String(challenger).toLowerCase() === String(address).toLowerCase()) {
        onClose()
      }
    },
  })

  const { isLoading } = useWaitForTransactionReceipt({
    hash: isConnected ? gameChallengeData : gameChallengeDataPregen,
  })
  const isWaitingForGameChallengeTx = isGuestMode ? false : isLoading

  const CHARACTER_CARD_ADDRESS = X_CHARACTER_CARD_ADDRESS[
    chainId.toString()
  ] as `0x${string}`

  const { data: addressTokenIds, isLoading: isTokenIdsLoading } =
    useReadContract({
      config: config,
      address: CHARACTER_CARD_ADDRESS,
      abi: CHARACTER_CARD_ABI,
      functionName: 'getCharactersByOwner',
      args: [address],
      query: {
        enabled: !!address,
        refetchInterval: 3000,
      },
    })

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40">
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50 px-4">
        <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg border border-gray-700/50 shadow-2xl">
          <div
            className="p-4 border-b border-gray-700"
            style={{
              background: `linear-gradient(to right, ${weirdBlue}, ${darkBlue})`,
            }}
          >
            <h2 className="text-2xl font-bold text-white">Challenge Player</h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-gray-400 mb-1">Player Address</label>
              <input
                value={challengeDetails.opponent}
                onChange={(e) =>
                  setChallengeDetails({
                    ...challengeDetails,
                    opponent: e.target.value,
                  })
                }
                type="text"
                className="w-full bg-gray-700/50 rounded px-3 py-2 text-white border border-gray-600"
                placeholder="0x..."
              />
            </div>
            <div>
              <label className="block text-gray-400 mb-1">Character</label>
              <select
                value={challengeDetails.characterId}
                onChange={(e) =>
                  setChallengeDetails({
                    ...challengeDetails,
                    characterId: e.target.value,
                  })
                }
                className="w-full bg-gray-700/50 rounded px-3 py-2 text-white border border-gray-600"
              >
                <option value="">Select a character</option>
                {Array.isArray(addressTokenIds) &&
                  addressTokenIds.length > 0 &&
                  addressTokenIds.map((characterId: bigint) => (
                    <CharacterOption
                      key={characterId}
                      characterId={characterId}
                    />
                  ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-400 mb-1">Game Type</label>
              <select
                value={challengeDetails.gameType}
                onChange={(e) =>
                  setChallengeDetails({
                    ...challengeDetails,
                    gameType: e.target.value,
                  })
                }
                className="w-full bg-gray-700/50 rounded px-3 py-2 text-white border border-gray-600"
              >
                <option value="ranked">Ranked Match</option>
                <option value="casual">Casual Match</option>
              </select>
            </div>
            <div className="flex gap-3 pt-4">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-gray-700/50 text-white rounded-lg
                         hover:bg-gray-600 border border-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (
                    challengeDetails.characterId === '' ||
                    challengeDetails.opponent === ''
                  )
                    return
                  handleChallengeOpponent()
                }}
                className="flex-1 px-4 py-2 rounded-lg
                             bg-gradient-to-r from-lightRed to-red-700
                             hover:from-red-600 hover:to-red-800
                             text-white font-medium border border-red-600"
              >
                Send Challenge
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Utility Components
const GameStatCard: React.FC<{
  title: string
  value: string
  icon: string
  isLoading: boolean
}> = ({ title, value, icon, isLoading }) => (
  <div className="bg-gray-900/30 rounded-lg p-3 border border-gray-700/30">
    <div className="flex items-center gap-2">
      <span className="text-2xl">{icon}</span>
      <div>
        <p className="text-gray-400 text-sm">{title}</p>
        {isLoading ? (
          <div className="h-5 w-20 bg-gray-700 animate-pulse rounded"></div>
        ) : (
          <p className="text-white font-bold">{value}</p>
        )}
      </div>
    </div>
  </div>
)

const Badge: React.FC<{ type: string; color: 'red' | 'blue' }> = ({
  type = 'ranked',
  color,
}) => (
  <span
    className={`px-2 py-1 rounded text-sm font-medium
    ${
      color === 'red'
        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
        : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
    }`}
  >
    {type.charAt(0).toUpperCase() + type.slice(1)}
  </span>
)

const TabButton: React.FC<{
  label: string
  icon: string
  isActive: boolean
  onClick: () => void
  badge?: number
}> = ({ label, icon, isActive, onClick, badge }) => (
  <button
    onClick={onClick}
    className={`
      px-6 py-3 text-white rounded-t-lg transition-all
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
    }}
  >
    <span className="text-lg">{icon}</span>
    {label}
    {badge !== undefined && badge > 0 && (
      <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
        {badge}
      </span>
    )}
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

const EmptyState: React.FC<{
  icon: string
  title: string
  description: string
}> = ({ icon, title, description }) => (
  <div className="text-center py-12">
    <span className="text-6xl mb-4 block">{icon}</span>
    <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
    <p className="text-gray-400">{description}</p>
  </div>
)

export const formatTimeAgoUnix = (unixSeconds: number) => {
  const timestampMs = unixSeconds * 1000
  const nowMs = Date.now()
  const diffInSeconds = Math.max(0, Math.floor((nowMs - timestampMs) / 1000))

  if (diffInSeconds < 60) return 'just now'
  const minutes = Math.floor(diffInSeconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months}mo ago`
  const years = Math.floor(months / 12)
  return `${years}y ago`
}

const AcceptModal = ({
  windowId,
  handleAcceptChallenge,
  addressTokenIds,
}: {
  windowId: string
  handleAcceptChallenge: any
  addressTokenIds: any
}) => {
  const { closeDispatchWindow } = useDispatchWindows()
  const [challengeDetails, setChallengeDetails] = useState<{
    characterId: string
  }>({
    characterId: '',
  })

  return (
    <div className="w-full h-full bg-gray-800/30 border border-gray-700/30 rounded-lg p-6 hover:bg-gray-800/50 hover:border-gray-600/50 transition-all">
      <div className="space-y-6">
        {/* Character Selection */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            Select Your Character
          </label>
          <select
            value={challengeDetails.characterId}
            onChange={(e) => {
              const newValue = e.target.value
              console.log('Selected value:', newValue)

              setChallengeDetails((prevState) => ({
                ...prevState,
                characterId: newValue,
              }))
            }}
            className="w-full bg-gray-700/50 rounded px-3 py-2 text-white border border-gray-600"
          >
            <option value="">Select a character</option>
            {Array.isArray(addressTokenIds) &&
              addressTokenIds.length > 0 &&
              addressTokenIds.map((characterId: bigint) => {
                return (
                  <CharacterOption
                    key={characterId}
                    characterId={characterId}
                  />
                )
              })}
          </select>
        </div>

        {/* Accept Button */}
        <div className="flex flex-col gap-3">
          <button
            onClick={async () => {
              if (!challengeDetails.characterId) return
              await handleAcceptChallenge(challengeDetails.characterId)
              closeDispatchWindow(windowId)
            }}
            className="h-10 px-6 rounded-lg overflow-hidden
                 bg-gradient-to-r from-blue-500 to-blue-700 
                 hover:from-blue-600 hover:to-blue-800
                 disabled:opacity-50 disabled:cursor-not-allowed
                 transition-all duration-300"
          >
            <div className="relative z-10 flex items-center justify-center gap-3">
              <span className="text-2xl">⚔️</span>
              <span className="font-medium">Accept</span>
            </div>
          </button>

          <button
            onClick={() => {
              closeDispatchWindow(windowId)
            }}
            className="h-10 px-6 rounded-lg overflow-hidden
                 bg-gradient-to-r from-gray-600 to-gray-700
                 hover:from-gray-700 hover:to-gray-800
                 transition-all duration-300"
          >
            <div className="relative z-10 flex items-center justify-center gap-3">
              <span className="text-2xl">❌</span>
              <span className="font-medium">Cancel</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}

const ChallengeCard: React.FC<{ challenge: string; challenger?: boolean }> = ({
  challenge,
  challenger = false,
}) => {
  const { address: playerAddress } = useAccount()
  const { activeAddress, isGuestMode, baseAddress } = useSmartAccount()
  const chainId = useChainId()
  const address = isGuestMode
    ? activeAddress?.toLowerCase()
    : baseAddress?.toLowerCase()

  const { addNotification } = useNotifications()
  const availableChainIds = ['84532', '10143']
  const isChainUnavailable = !availableChainIds.some(
    (chain) => Number(chain) === chainId
  )

  const {
    writeContract: writeGameChallenge,
    data: gameChallengeData,
    isPending: isGameChallengePending,
    error: gameChallengeError,
  } = useWriteContract({
    mutation: {
      onError: (error: any) => {
        console.log(error)
      },
      onSuccess: (txHash: any) => {},
    },
  })

  // Pregen Join Queue Contract Write
  const {
    writeContract: writeGameChallengePregen,
    data: gameChallengeDataPregen,
    isPending: isGameChallengePendingPregen,
  } = useHookTransaction({
    mutation: {
      onError: (error: any) => {
        console.log(error)
      },
      onSuccess: (txHash: any) => {},
    },
  })
  const CLASH_BATTLE_SYSTEM_ADDRESS = X_CLASH_BATTLE_SYSTEM_ADDRESS[
    chainId.toString()
  ] as `0x${string}`

  const handleRejectChallenge = async () => {
    if (isChainUnavailable) {
      addNotification({
        title: `Chain Unavailable`,
        message: `This chain is not available. Please use base sepolia.`,
        type: 'error',
        duration: 10000,
      })
      return
    }
    if (!isGuestMode) {
      await writeGameChallenge({
        address: CLASH_BATTLE_SYSTEM_ADDRESS,
        abi: CLASH_BATTLE_SYSTEM_ABI,
        functionName: 'rejectChallenge',
        args: [challenge],
      })
    } else {
      await writeGameChallengePregen({
        address: CLASH_BATTLE_SYSTEM_ADDRESS,
        abi: CLASH_BATTLE_SYSTEM_ABI,
        functionName: 'rejectChallenge',
        args: [challenge],
      })
    }
  }

  const handleAcceptChallengeIntermidary = async (characterId: string) => {
    handleAcceptChallenge(characterId)
  }
  const handleAcceptChallenge = async (characterId: string) => {
    if (!characterId) return
    if (isChainUnavailable) {
      addNotification({
        title: `Chain Unavailable`,
        message: `This chain is not available. Please use base sepolia.`,
        type: 'error',
        duration: 10000,
      })
      return
    }
    if (!isGuestMode) {
      await writeGameChallenge({
        address: CLASH_BATTLE_SYSTEM_ADDRESS,
        abi: CLASH_BATTLE_SYSTEM_ABI,
        functionName: 'acceptChallenge',
        args: [challenge, characterId],
      })
    } else {
      await writeGameChallengePregen({
        address: CLASH_BATTLE_SYSTEM_ADDRESS,
        abi: CLASH_BATTLE_SYSTEM_ABI,
        functionName: 'acceptChallenge',
        args: [challenge, characterId],
      })
    }
  }

  const { createDispatchWindow, closeDispatchWindow } = useDispatchWindows()
  const containerRef = useRef<HTMLDivElement>(null)

  const mouse = useMouse(containerRef as React.RefObject<Element>)
  const CHARACTER_CARD_ADDRESS = X_CHARACTER_CARD_ADDRESS[
    chainId.toString()
  ] as `0x${string}`
  const { data: addressTokenIds, refetch: refetchAddressTokenIds } =
    useReadContract({
      config: config,
      address: CHARACTER_CARD_ADDRESS,
      abi: CHARACTER_CARD_ABI,
      functionName: 'getCharactersByOwner',
      args: [address],
      query: {
        enabled: !!address,
        refetchInterval: 3000,
      },
    })

  const handleAccept = async () => {
    const centeredX = mouse.docX - 200 / 2
    const centeredY = mouse.docY - 250 / 2
    const windowId = createDispatchWindow({
      title: 'Accept Challenge',
      content: () => {
        return (
          <AcceptModal
            windowId={windowId}
            handleAcceptChallenge={handleAcceptChallengeIntermidary}
            addressTokenIds={addressTokenIds}
          />
        )
      },
      initialPosition: {
        x: centeredX,
        y: centeredY,
      },
      initialSize: {
        width: 200,
        height: 250,
      },
      styles: {
        background: 'bg-gradient-to-b from-gray-900 via-blue-900 to-gray-900',
        rounded: 'rounded-lg',
        border: 'border-gray-700/50',
      },
    })
  }

  const handleDecline = async () => {
    await handleRejectChallenge()
  }

  return (
    <div
      ref={containerRef}
      className="bg-gray-800/30 border border-gray-700/30 rounded-lg p-4
                   hover:bg-gray-800/50 hover:border-gray-600/50 transition-all"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-red-700 
                        flex items-center justify-center text-white text-xl font-bold"
          >
            {challenge.slice(2, 4)}
          </div>
          <div>
            <h3 className="text-white font-semibold">
              {challenger ? 'Challenge to ' : 'Challenge from '}{' '}
              {shortenText(challenge)}
            </h3>
            <p className="text-gray-400 text-sm">
              {formatTimeAgoUnix(Date.now())} • Stake: {0}
            </p>
          </div>
        </div>

        {!challenger ? (
          <div className="flex gap-2">
            <button
              onClick={handleDecline}
              className="px-4 py-2 bg-gray-700/50 text-white rounded-lg
                       hover:bg-gray-600 transition-all duration-200
                       border border-gray-600/30"
            >
              Decline
            </button>
            <button
              onClick={handleAccept}
              className="px-4 py-2 rounded-lg transition-all duration-200
                       bg-gradient-to-r from-lightRed to-red-700
                       hover:from-red-600 hover:to-red-800
                       text-white font-medium
                       border border-red-600/30
                       flex items-center gap-2"
            >
              <span>⚔️</span>
              Accept
            </button>
          </div>
        ) : (
          <div
            className="px-3 py-1 rounded-full text-sm font-medium
                      bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
          >
            Pending Response
          </div>
        )}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4">
        <DetailBox icon="⚔️" label="Game Type" value="Ranked" />
        <DetailBox icon="💰" label="Stake" value={'0'} />
        <DetailBox icon="⏱️" label="Expires In" value="00:00" />
      </div>
    </div>
  )
}

const DetailBox: React.FC<{
  icon: string
  label: string
  value: string
}> = ({ icon, label, value }) => (
  <div className="bg-gray-900/30 rounded-lg p-3 border border-gray-700/30">
    <div className="flex items-center gap-2">
      <span className="text-lg">{icon}</span>
      <div>
        <p className="text-gray-400 text-xs">{label}</p>
        <p className="text-white font-medium">{value}</p>
      </div>
    </div>
  </div>
)
