import { CHARACTER_CARD_ABI } from '../deployments/abi'
import { CHARACTER_CARD_ADDRESS } from '../deployments/address'
import {
  useAccount,
  useReadContracts,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi'
import { useChainId, useReadContract } from 'wagmi'
import { useWatchContractEvent } from 'wagmi'
import AuraEffect from './AuraEffect'
import { StatCard } from './ui_components'
import React, { useRef, useEffect, useMemo, useState } from 'react'
import { CLASH_BATTLE_SYSTEM_ADDRESS } from '../deployments/address'
import { CLASH_BATTLE_SYSTEM_ABI } from '../deployments/abi'
import {
  shortenText,
  useAppRouter,
  useNotifications,
  usePregenSession,
  usePregenTransaction,
} from '@/app/components/pc/drives'
import { config } from '../deployments/config'
import { formatTimeAgoUnix } from './Game'
import { getCharacterClassLabel, truncateDescription } from './Character'
import { parseGwei, zeroAddress } from 'viem'

const lightBlue = '#2563eb'
const weirdBlue = '#3a6ea5'
const lightRed = '#dc2626'
const darkBlue = '#0a246a'

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

interface StatBarProps {
  label?: string
  value?: number
  maxValue?: number
  color?: string
  size?: 'small' | 'medium' | 'large'
  animated?: boolean
  icon?: string
  type?: 'attack' | 'defense'
}

const StatBar: React.FC<StatBarProps> = ({
  label,
  value,
  maxValue,
  color = 'rgb(239 68 68), rgb(185 28 28)', // Default red gradient
  size = 'medium',
  animated = true,
  icon,
  type = 'attack',
}) => {
  // Calculate percentage, ensuring it doesn't exceed 100%
  const percentage =
    maxValue && maxValue > 0 ? Math.min((value! / maxValue) * 100, 100) : 100

  const sizeClasses = {
    small: {
      bar: 'h-1.5',
      text: 'text-xs',
      padding: 'py-0.5',
    },
    medium: {
      bar: 'h-2',
      text: 'text-sm',
      padding: 'py-1',
    },
    large: {
      bar: 'h-3',
      text: 'text-base',
      padding: 'py-1.5',
    },
  }

  const getBarColor = () => {
    if (maxValue) {
      return `linear-gradient(to right, rgb(59, 130, 246), rgb(37, 99, 235), rgb(239, 68, 68))`
    }
    return type === 'attack'
      ? `linear-gradient(to right, rgb(239, 68, 68), rgb(185, 28, 28))`
      : `linear-gradient(to right, rgb(59, 130, 246), rgb(37, 99, 235))`
  }

  return (
    <div className={`${sizeClasses[size].padding}`}>
      {/* Label and Value */}
      <div className="flex justify-between items-center mb-1.5">
        <div className="flex items-center gap-1.5">
          {icon && <span className="text-gray-400">{icon}</span>}
          <span className={`${sizeClasses[size].text} text-gray-400`}>
            {label}
          </span>
        </div>
        <span className={`${sizeClasses[size].text} text-white font-medium`}>
          {maxValue ? `${value}/${maxValue}` : value}
        </span>
      </div>

      {/* Progress Bar Container */}
      <div className="relative w-full bg-gray-700 rounded-full overflow-hidden">
        {/* Background pulse for low health warning */}
        {percentage < 20 && animated && maxValue && (
          <div className="absolute inset-0 bg-red-500/50 rounded-full animate-pulse" />
        )}

        {/* Main progress bar */}
        <div
          className={`
            ${sizeClasses[size].bar}
            rounded-full
            transition-all duration-500 ease-out
            relative
          `}
          style={{
            width: `${percentage}%`,
            background: getBarColor(),
          }}
        >
          {/* Shine effect */}
          {animated && (
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0" />
          )}
        </div>

        {/* Critical health animation */}
        {percentage < 200 && animated && maxValue && (
          <div
            className={`
              absolute inset-0
              ${sizeClasses[size].bar}
              bg-red-500/50
              animate-pulse
            `}
          />
        )}
      </div>
    </div>
  )
}
interface CharacterClass {
  type: 'Human' | 'King' | 'Mage' | 'Archer' | 'Knight' | 'Demon' | 'God'
  primaryColor: string
  secondaryColor: string
  auraEffect: string
}

const classStylesCustom: Record<string | number, CharacterClass> = {
  Human: {
    type: 'Human',
    primaryColor: 'from-yellow-600/80 via-yellow-700/50 to-yellow-800/80',
    secondaryColor: 'from-yellow-500 via-yellow-600 to-yellow-700',
    auraEffect: 'balanced-aura',
  },
  King: {
    type: 'King',
    primaryColor: 'from-amber-500/80 via-amber-600/50 to-amber-700/80',
    secondaryColor: 'from-amber-400 via-amber-500 to-amber-600',
    auraEffect: 'royal-aura',
  },
  Mage: {
    type: 'Mage',
    primaryColor: 'from-slate-700/80 via-slate-800/50 to-slate-900/80',
    secondaryColor: 'from-slate-600 via-slate-700 to-slate-800',
    auraEffect: 'magical-aura',
  },
  Archer: {
    type: 'Archer',
    primaryColor: 'from-emerald-500/80 via-emerald-600/50 to-emerald-700/80',
    secondaryColor: 'from-emerald-400 via-emerald-500 to-emerald-600',
    auraEffect: 'swift-aura',
  },
  Knight: {
    type: 'Knight',
    primaryColor: 'from-zinc-500/80 via-zinc-600/50 to-zinc-700/80',
    secondaryColor: 'from-zinc-400 via-zinc-500 to-zinc-600',
    auraEffect: 'guardian-aura',
  },
  Demon: {
    type: 'Demon',
    primaryColor: 'from-red-600/80 via-red-700/50 to-red-800/80',
    secondaryColor: 'from-red-500 via-red-600 to-red-700',
    auraEffect: 'demon-aura',
  },
  God: {
    type: 'God',
    primaryColor: 'from-neutral-300/80 via-neutral-400/50 to-neutral-500/80',
    secondaryColor: 'from-neutral-200 via-neutral-300 to-neutral-400',
    auraEffect: 'divine-aura',
  },
}

interface BattleCardProps {
  character: any
  address?: string
  isActive: boolean
  isAttacking: boolean
  attackType?: 'special2' | 'special1' | 'normal'
  powerPoints?: number
}

const BattleCard: React.FC<BattleCardProps> = ({
  character,
  address,
  isActive = false,
  isAttacking = false,
  attackType,
  powerPoints,
}) => {
  const defaultClass = classStylesCustom.Human
  const [currentOriginIndex, setCurrentOriginIndex] = useState(0)
  const [metadata, setMetadata] = useState<{
    name?: string
    description?: string
    image?: string
  } | null>(null)
  const [imageLoading, setImageLoading] = useState(true)

  const ipfsOrigins = [
    'https://nftstorage.link',
    'https://gateway.pinata.cloud',
    'https://alchemy.mypinata.cloud',
    'https://dweb.link',
    'https://flk-ipfs.xyz',
    'https://ipfs.io',
    'https://brown-perfect-marlin-23.mypinata.cloud',
  ]

  const getIpfsPath = (url: string | undefined) => {
    if (!url) return ''
    const ipfsMatch = url.match(/\/ipfs\/[^/]+/)
    return ipfsMatch ? ipfsMatch[0] : ''
  }

  const getUrlWithCurrentOrigin = (url: string | undefined) => {
    if (!url) return ''
    const ipfsPath = getIpfsPath(url)
    if (!ipfsPath) return url // Return original if no IPFS path found
    return `${ipfsOrigins[currentOriginIndex]}${ipfsPath}`
  }

  const handleImageError = () => {
    if (currentOriginIndex < ipfsOrigins.length - 1) {
      setCurrentOriginIndex((prev) => prev + 1)
    }
  }

  const { data: characterStats, refetch: refetchCharacterStats } =
    useReadContract({
      address: CHARACTER_CARD_ADDRESS,
      abi: CHARACTER_CARD_ABI,
      functionName: 'getCharacterStats',
      args: [character?.characterId],
      query: {
        enabled: !!character?.characterId,
        refetchInterval: 3000,
      },
    })

  const { data: tokenUrl } = useReadContract({
    address: CHARACTER_CARD_ADDRESS,
    abi: CHARACTER_CARD_ABI,
    functionName: 'tokenURI',
    args: [character?.characterId],
    query: {
      enabled: !!character?.characterId,
    },
  })

  useEffect(() => {
    const fetchMetadata = async () => {
      if (!tokenUrl) return

      try {
        const metadataUrl = getUrlWithCurrentOrigin(tokenUrl as string)
        const response = await fetch(metadataUrl)

        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`)

        const text = await response.text()
        if (!text || text.trim().length === 0) throw new Error('Empty response')

        try {
          const data = JSON.parse(text)
          setMetadata(data)
          setImageLoading(true)
        } catch (parseError) {
          console.error('Invalid JSON format:', parseError)
        }
      } catch (error) {
        console.error('Error fetching metadata:', error)
        if (currentOriginIndex < ipfsOrigins.length - 1) {
          setCurrentOriginIndex((prev) => prev + 1)
        }
      }
    }

    fetchMetadata()
  }, [tokenUrl, currentOriginIndex])

  if (!characterStats) return null
  const characterStatsData = characterStats as any
  const classStyle = characterStatsData?.characterClass
    ? classStylesCustom[
        getCharacterClassLabel(Number(characterStatsData.characterClass))
      ]
    : defaultClass

  return (
    <div
      className={`
        relative w-full max-w-[320px] aspect-[3/4] rounded-2xl
        transition-all duration-500 ease-out
        ${isAttacking ? 'scale-110 z-20' : 'scale-100 z-10'}
        ${isActive ? 'hover:scale-105' : 'opacity-90'}
      `}
    >
      {/* Card Background with Character Art */}
      <div
        className={`
          absolute inset-0 rounded-2xl overflow-hidden
          transition-all duration-300
          ${isAttacking ? 'shadow-2xl shadow-current' : ''}
        `}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-800">
          {metadata?.image ? (
            <>
              <img
                src={getUrlWithCurrentOrigin(metadata.image)}
                alt={metadata.name || 'Character'}
                className={`w-full h-full object-cover ${
                  imageLoading ? 'hidden' : 'block'
                }`}
                onLoad={() => setImageLoading(false)}
                onError={handleImageError}
              />
              {imageLoading && (
                <div className="w-full h-full flex items-center justify-center bg-gray-800 animate-pulse">
                  <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[8vw]">
              👤
            </div>
          )}
        </div>

        {/* Aura Effects */}
        {isAttacking && (
          <div
            className={`
              absolute inset-0 
              animate-pulse
              bg-gradient-to-br ${classStyle.primaryColor}
              ${attackType === 'special2' ? 'opacity-20' : 'opacity-10'}
            `}
          />
        )}

        {/* Card Content */}
        <div className="absolute inset-0 p-4 flex flex-col justify-between">
          {/* Header */}
          <div className="space-y-2">
            <div className="flex justify-between items-start">
              <h3 className="text-xl font-bold text-white">
                {metadata?.name || character?.name || 'Unknown'}
              </h3>
              <span
                className={`
                  px-2 py-1 rounded-full text-xs
                  bg-gradient-to-r ${classStyle.secondaryColor}
                  text-white font-medium
                `}
              >
                {getCharacterClassLabel(
                  Number(characterStatsData.characterClass)
                ) || 'Unknown'}
              </span>
            </div>
            <p className="text-gray-400 font-mono text-xs truncate">
              {address || '0x...'}
            </p>
          </div>

          {/* Stats */}
          <div className="space-y-2">
            <StatBar
              label="HP"
              value={Number(character?.currentHealth) || 0}
              maxValue={Number(character?.maxHealth) || 500}
              color={classStyle.secondaryColor}
              size="medium"
            />
            <StatBar
              label="DEF"
              value={Number(character?.defense) || 0}
              color={classStyle.secondaryColor}
              size="medium"
              type="defense"
            />
            <StatBar
              label="ATK"
              value={Number(character?.attack) || 0}
              color={classStyle.secondaryColor}
              size="medium"
              type="attack"
            />
          </div>
        </div>
      </div>

      {/* Active Turn Indicator */}
      {isActive && (
        <div
          className={`
            absolute -inset-px rounded-2xl border-2
            bg-gradient-to-br ${classStyle.primaryColor} opacity-0
            animate-pulse duration-1000
          `}
        />
      )}

      {/* Attack Effects */}
      {isAttacking && (
        <AttackEffect type={attackType} classStyle={classStyle} />
      )}
    </div>
  )
}

const AttackEffect: React.FC<{
  type?: 'special2' | 'special1' | 'normal'
  classStyle: CharacterClass
}> = ({ type, classStyle }) => {
  if (!type) return null

  const effects = {
    normal: (
      <div
        className="absolute -right-1/4 top-1/2 -translate-y-1/2
                    w-32 h-32 animate-attack-quick"
      >
        <div
          className={`
          w-full h-full transform rotate-45
          bg-gradient-to-r ${classStyle.secondaryColor}
          animate-slash
        `}
        />
      </div>
    ),
    special1: (
      <div
        className="absolute -right-1/2 top-1/2 -translate-y-1/2
                    w-48 h-48 animate-attack-power"
      >
        <div
          className={`
          absolute inset-0 rounded-full
          bg-gradient-to-r ${classStyle.primaryColor}
          animate-pulse-fast
        `}
        />
        <div
          className={`
          absolute inset-4 rounded-full
          bg-gradient-to-r ${classStyle.secondaryColor}
          animate-pulse-delayed
        `}
        />
      </div>
    ),
    special2: (
      <div className="absolute inset-0 z-30">
        <div
          className={`
          absolute inset-0 
          bg-gradient-to-r ${classStyle.secondaryColor}
          animate-ultimate-charge
        `}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className={`
            w-full h-full transform 
            bg-gradient-to-r ${classStyle.primaryColor}
            animate-ultimate-release
          `}
          />
        </div>
      </div>
    ),
  }

  return effects[type as keyof typeof effects] || null
}

const AttackButton: React.FC<{
  icon: string
  label: string
  type: 'quick' | 'power' | 'ultimate'
  powerCost: number
  onClick: () => void
  disabled?: boolean
  isLoading?: boolean
}> = ({ icon, label, type, powerCost, onClick, disabled, isLoading }) => {
  const styles = {
    quick: 'from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800',
    power:
      'from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800',
    ultimate: 'from-rose-500 to-rose-700 hover:from-rose-600 hover:to-rose-800',
  }

  const [displayText, setDisplayText] = useState(label)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!buttonRef.current) return

    // Find the resizable parent container
    const container = buttonRef.current.closest('[data-resizable]')
    if (!container) return
    const updateText = () => {
      const { width } = container.getBoundingClientRect()

      if (width < 750) {
        setDisplayText(
          label
            .split(' ')
            .map((word) => word[0].toUpperCase())
            .join('')
        )
      } else {
        setDisplayText(label)
      }
    }

    updateText()

    const observer = new ResizeObserver(updateText)
    observer.observe(container)
    return () => observer.disconnect()
  }, [label, buttonRef])

  return (
    <div className="group relative w-full">
      <button
        ref={buttonRef}
        onClick={onClick}
        disabled={disabled || isLoading}
        className={`
          relative h-10 w-full px-2 rounded-lg overflow-hidden
          bg-gradient-to-r ${styles[type]}
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-all duration-300
        `}
      >
        <div className="relative z-10 flex items-center justify-center gap-1">
          <span className="text-2xl flex-shrink-0">{icon}</span>
          <span className="font-medium whitespace-nowrap">{displayText}</span>
          {isLoading && (
            <svg
              className="animate-spin h-5 w-5 text-white ml-1"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          )}
        </div>

        <div
          className="absolute inset-0 bg-white/10 translate-y-full
                     group-hover:translate-y-0 transition-transform"
        />
      </button>

      <div
        className="absolute -top-12 left-1/2 -translate-x-1/2
                    bg-gray-900 px-2 py-2 rounded-lg
                    text-white text-sm whitespace-nowrap
                    opacity-0 group-hover:opacity-100
                    transition-opacity pointer-events-none
                    border border-gray-700"
      >
        Power Cost: {powerCost} PP
      </div>
    </div>
  )
}

const EndTurnButton: React.FC<{
  onClick: () => void
  powerPoints: number
  isPlayerTurn: boolean
  isLoading: boolean
  disabled?: boolean
}> = ({ onClick, powerPoints, isPlayerTurn, isLoading, disabled }) => {
  const canMakeMove = powerPoints >= 2
  return (
    <div className="relative">
      <button
        onClick={onClick}
        disabled={!isPlayerTurn || isLoading || disabled}
        className={`cursor-pointer whitespace-nowrap w-fit px-2 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-all duration-200 ${
          isPlayerTurn && !isLoading
            ? 'bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-blue-400 border border-blue-500/30 hover:from-blue-500/30 hover:to-blue-600/30 animate-pulse'
            : 'bg-gray-700/20 text-gray-500 border border-gray-600/30 cursor-not-allowed'
        }`}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <svg
              className="animate-spin h-4 w-4 text-blue-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Ending Turn...
          </span>
        ) : (
          '🔄 End Turn'
        )}
      </button>
      {isPlayerTurn && !canMakeMove && !isLoading && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-sm text-gray-400 whitespace-nowrap bg-gray-900/80 px-2 py-1 rounded">
          No moves available
        </div>
      )}
    </div>
  )
}
// Add to your styles.css or equivalent
const styles = `
@keyframes attack-quick {
  0% { transform: translateX(0) translateY(-50%); opacity: 0; }
  50% { transform: translateX(50%) translateY(-50%); opacity: 1; }
  100% { transform: translateX(100%) translateY(-50%); opacity: 0; }
}

@keyframes attack-power {
  0% { transform: scale(0) translateX(0) translateY(-50%); opacity: 0; }
  50% { transform: scale(1.2) translateX(50%) translateY(-50%); opacity: 1; }
  100% { transform: scale(0) translateX(100%) translateY(-50%); opacity: 0; }
}

@keyframes ultimate-charge {
  0% { transform: scale(0); opacity: 0; }
  50% { transform: scale(1.2); opacity: 0.7; }
  100% { transform: scale(0); opacity: 0; }
}

@keyframes ultimate-release {
  0% { transform: scaleX(0); opacity: 0; }
  50% { transform: scaleX(1.2); opacity: 1; }
  100% { transform: scaleX(0); opacity: 0; }
}

.animate-attack-quick {
  animation: attack-quick 0.5s ease-out forwards;
}

.animate-attack-power {
  animation: attack-power 0.8s ease-out forwards;
}

.animate-ultimate-charge {
  animation: ultimate-charge 1s ease-in-out forwards;
}

.animate-ultimate-release {
  animation: ultimate-release 1.5s ease-in-out forwards;
}

.animate-pulse-fast {
  animation: pulse 0.5s ease-in-out infinite;
}

.animate-pulse-delayed {
  animation: pulse 0.5s ease-in-out infinite 0.25s;
}

.magical-aura {
  background: radial-gradient(circle at center, 
    rgba(59, 130, 246, 0.5) 0%,
    rgba(37, 99, 235, 0.3) 50%,
    transparent 70%
  );
}

.battle-aura {
  background: radial-gradient(circle at center, 
    rgba(239, 68, 68, 0.5) 0%,
    rgba(220, 38, 38, 0.3) 50%,
    transparent 70%
  );
}

.shadow-aura {
  background: radial-gradient(circle at center, 
    rgba(147, 51, 234, 0.5) 0%,
    rgba(126, 34, 206, 0.3) 50%,
    transparent 70%
  );
}

.demon-aura {
  background: radial-gradient(circle at center, 
    rgba(225, 29, 72, 0.5) 0%,
    rgba(190, 18, 60, 0.3) 50%,
    transparent 70%
  );
}
`

const BattleGame: React.FC<{ gameId: string }> = ({ gameId }) => {
  const { isLoginPregenSession, pregenActiveAddress, isSmartAccount } =
    usePregenSession()
  const chainId = useChainId()

  const { isConnected, address: playerAddress } = useAccount()
  const address = isConnected
    ? playerAddress?.toLowerCase()
    : isLoginPregenSession
    ? pregenActiveAddress?.toLowerCase()
    : undefined

  const { data: battleDetails, refetch: refetchBattleDetails } =
    useReadContract({
      address: CLASH_BATTLE_SYSTEM_ADDRESS,
      abi: CLASH_BATTLE_SYSTEM_ABI,
      functionName: 'getBattleDetails',
      args: [gameId],
      query: {
        enabled: !!gameId,
        refetchInterval: 3000,
      },
    })
  const realmClashSystemContract = {
    address: CLASH_BATTLE_SYSTEM_ADDRESS,
    abi: CLASH_BATTLE_SYSTEM_ABI,
  } as const
  const { data: battleSnapshots, refetch: refetchBattleSnapshots } =
    useReadContracts({
      config: config,
      contracts: [
        {
          ...realmClashSystemContract,
          functionName: 'getBattleSnapshots',
          args: [gameId],
        },
      ],
      query: {
        enabled: !!gameId,
        refetchInterval: 3000,
      },
    })

  const [winnerPlayer, setWinnerPlayer] = useState<string>()
  const [isAttacking, setIsAttacking] = useState(false)
  const [attackType, setAttackType] = useState<string>()
  const [powerPoints, setPowerPoints] = useState(0)
  const [isViewingBattle, setIsViewingBattle] = useState(false)
  const [battleDetailsData, setBattleDetailsData] = useState<{
    player1: string
    player2: string
    characterId1: bigint
    characterId2: bigint
    state: number
    startTime: bigint
    winner: string
    currentTurnPlayer: string
    turnState: number
    turnNumber: number
    player1PowerPoints: number
    player2PowerPoints: number
  } | null>(null)
  const [battleSnapshotsStateData, setBattleSnapshotsStateData] = useState<{
    player1Snapshot: {
      name: string
      intelligence: number
      hasForfeit: boolean
      attack: number
      characterId: bigint
      currentHealth: number
      defense: number
      dodgeChance: number
      maxHealth: number
    }
    player2Snapshot: {
      name: string
      intelligence: number
      hasForfeit: boolean
      attack: number
      characterId: bigint
      currentHealth: number
      defense: number
      dodgeChance: number
      maxHealth: number
    }
  } | null>(null)
  const { addNotification } = useNotifications()
  const { navigate } = useAppRouter()

  const availableChainIds = ['84532']
  const isChainUnavailable = !availableChainIds.some(
    (chain) => Number(chain) === chainId
  )
  const {
    writeContract: writeBattle,
    data: battleData,
    isPending: isBattle,
    error: battleError,
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
    writeContract: writeBattlePregen,
    data: battleDataPregen,
    isPending: isBattlePregen,
  } = usePregenTransaction({
    mutation: {
      onError: (error: any) => {
        console.log(error)
      },
      onSuccess: (txHash: any) => {},
    },
  })

  const handleForfeitBattle = async () => {
    if (isChainUnavailable) {
      addNotification({
        title: `Chain Unavailable`,
        message: `This chain is not available. Please use base sepolia.`,
        type: 'error',
        duration: 10000,
      })
      return
    }
    if (isConnected) {
      await writeBattle({
        address: CLASH_BATTLE_SYSTEM_ADDRESS,
        abi: CLASH_BATTLE_SYSTEM_ABI,
        functionName: 'forfeitBattle',
        args: [gameId],
      })
    } else if (isLoginPregenSession) {
      await writeBattlePregen({
        address: CLASH_BATTLE_SYSTEM_ADDRESS,
        abi: CLASH_BATTLE_SYSTEM_ABI,
        functionName: 'forfeitBattle',
        args: [gameId],
      })
    }
  }
  const { isLoading: isWaitingForForfeitBattleT } =
    useWaitForTransactionReceipt({
      hash: isConnected ? battleData : battleDataPregen,
    })
  const isWaitingForForfeitBattle = isSmartAccount
    ? false
    : isWaitingForForfeitBattleT

  const handleForfeitBattleAction = async () => {
    await handleForfeitBattle()
  }

  const {
    writeContract: writeBattlePerformAttack,
    data: battleDataPerformAttack,
    isPending: isBattlePerformAttack,
    error: battleErrorPerformAttack,
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
    writeContract: writeBattlePerformAttackPregen,
    data: battleDataPerformAttackPregen,
    isPending: isBattlePerformAttackPregen,
  } = usePregenTransaction({
    mutation: {
      onError: (error: any) => {
        console.log(error)
      },
      onSuccess: (txHash: any) => {},
    },
  })

  const handleAttackInBattle = async (attackType: number) => {
    if (isChainUnavailable) {
      addNotification({
        title: `Chain Unavailable`,
        message: `This chain is not available. Please use base sepolia.`,
        type: 'error',
        duration: 10000,
      })
      return
    }
    if (isConnected) {
      await writeBattlePerformAttack({
        address: CLASH_BATTLE_SYSTEM_ADDRESS,
        abi: CLASH_BATTLE_SYSTEM_ABI,
        functionName: 'performAttack',
        args: [gameId, attackType],
      })
    } else if (isLoginPregenSession) {
      await writeBattlePerformAttackPregen({
        address: CLASH_BATTLE_SYSTEM_ADDRESS,
        abi: CLASH_BATTLE_SYSTEM_ABI,
        functionName: 'performAttack',
        args: [gameId, attackType],
      })
    }
  }
  const { isLoading: isWaitingForAttackT } = useWaitForTransactionReceipt({
    hash: isConnected ? battleDataPerformAttack : battleDataPerformAttackPregen,
  })
  const isWaitingForAttack = isSmartAccount ? false : isWaitingForAttackT

  const handleAttack = async (
    type: 'quick' | 'power' | 'ultimate',
    cost: number
  ) => {
    if (powerPoints < cost) return
    setIsAttacking(true)
    await handleAttackInBattle(cost)
    setPowerPoints((prev) => prev - cost)
  }

  const handleEndTurn = async () => {
    if (isChainUnavailable) {
      addNotification({
        title: `Chain Unavailable`,
        message: `This chain is not available. Please use base sepolia.`,
        type: 'error',
        duration: 10000,
      })
      return
    }
    if (isConnected) {
      writeBattle({
        address: CLASH_BATTLE_SYSTEM_ADDRESS,
        abi: CLASH_BATTLE_SYSTEM_ABI,
        functionName: 'endTurn',
        args: [gameId],
      })
    } else if (isLoginPregenSession) {
      await writeBattlePregen({
        address: CLASH_BATTLE_SYSTEM_ADDRESS,
        abi: CLASH_BATTLE_SYSTEM_ABI,
        functionName: 'endTurn',
        args: [gameId],
      })
    }
  }

  useWatchContractEvent({
    address: CLASH_BATTLE_SYSTEM_ADDRESS,
    abi: CLASH_BATTLE_SYSTEM_ABI,
    eventName: 'AttackPerformed',
    onLogs(logs: any) {
      console.log('AttackPerformed', logs[0].args)
      const { battleId, attacker, attackType } = logs[0].args
      if (Number(battleId) === Number(gameId)) {
        refetchBattleSnapshots()
        refetchBattleDetails()
      }
      if (attacker.toLowerCase() === address?.toLowerCase()) {
        setAttackType(attackType)
        setTimeout(() => {
          setIsAttacking(false)
          setAttackType(undefined)
        }, 2000)
      }
    },
  })
  useWatchContractEvent({
    address: CLASH_BATTLE_SYSTEM_ADDRESS,
    abi: CLASH_BATTLE_SYSTEM_ABI,
    eventName: 'BattleCompleted',
    onLogs(logs: any) {
      const { battleId } = logs[0].args
      if (Number(battleId) === Number(gameId)) {
        refetchBattleSnapshots()
        refetchBattleDetails()
      }
    },
  })

  useEffect(() => {
    setPowerPoints(
      battleDetailsData?.player1.toLowerCase() === address?.toLowerCase()
        ? Number(battleDetailsData?.player1PowerPoints)
        : Number(battleDetailsData?.player2PowerPoints)
    )
  }, [battleDetailsData])

  useEffect(() => {
    if (!battleDetailsData) return
    if (battleDetailsData?.winner !== zeroAddress) {
      setWinnerPlayer(battleDetailsData?.winner)
    }
  }, [battleDetailsData])

  useEffect(() => {
    if (!battleDetails || !battleSnapshots) return
    const battleDetailsData = battleDetails as any
    setBattleDetailsData({
      player1: battleDetailsData[0],
      player2: battleDetailsData[1],
      characterId1: battleDetailsData[2],
      characterId2: battleDetailsData[3],
      state: battleDetailsData[4],
      startTime: battleDetailsData[5],
      winner: battleDetailsData[6],
      currentTurnPlayer: battleDetailsData[7],
      turnState: battleDetailsData[8],
      turnNumber: battleDetailsData[9],
      player1PowerPoints: battleDetailsData[10],
      player2PowerPoints: battleDetailsData[11],
    })
    if (
      String((battleDetails as any)[0]).toLowerCase() ===
        address?.toLowerCase() ||
      String((battleDetails as any)[1]).toLowerCase() === address?.toLowerCase()
    ) {
      setIsViewingBattle(false)
    } else {
      setIsViewingBattle(true)
    }
  }, [battleDetails, battleSnapshots])

  useEffect(() => {
    if (!battleDetails || !battleSnapshots) return
    const effectiveBattleSnapshots = (battleSnapshots as any).map(
      (snapshot: any) => snapshot.result
    )
    const battleSnapshotsData = {
      player1Snapshot: {
        name: effectiveBattleSnapshots[0][0].name,
        intelligence: effectiveBattleSnapshots[0][0].intelligence,
        hasForfeit: effectiveBattleSnapshots[0][0].hasForfeit,
        attack: effectiveBattleSnapshots[0][0].attack,
        characterId: effectiveBattleSnapshots[0][0].characterId,
        currentHealth: effectiveBattleSnapshots[0][0].currentHealth,
        defense: effectiveBattleSnapshots[0][0].defense,
        dodgeChance: effectiveBattleSnapshots[0][0].dodgeChance,
        maxHealth: effectiveBattleSnapshots[0][0].maxHealth,
      },
      player2Snapshot: {
        name: effectiveBattleSnapshots[0][1].name,
        intelligence: effectiveBattleSnapshots[0][1].intelligence,
        hasForfeit: effectiveBattleSnapshots[0][1].hasForfeit,
        attack: effectiveBattleSnapshots[0][1].attack,
        characterId: effectiveBattleSnapshots[0][1].characterId,
        currentHealth: effectiveBattleSnapshots[0][1].currentHealth,
        defense: effectiveBattleSnapshots[0][1].defense,
        dodgeChance: effectiveBattleSnapshots[0][1].dodgeChance,
        maxHealth: effectiveBattleSnapshots[0][1].maxHealth,
      },
    }
    setBattleSnapshotsStateData(battleSnapshotsData)
  }, [battleDetails, battleSnapshots])

  return (
    <div className="bg-gradient-to-b overflow-x-auto from-gray-900 via-blue-900 to-gray-900">
      <div className="h-full w-full">
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-700/50 shadow-2xl h-full w-full">
          {/* Header Bar */}
          <div
            className="px-4 py-3 border-b border-gray-700/50"
            style={{
              background: `linear-gradient(to right, ${weirdBlue}, ${darkBlue})`,
            }}
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <h1
                  onClick={() => {
                    refetchBattleDetails()
                    refetchBattleSnapshots()
                  }}
                  className="text-xl font-bold text-white"
                >
                  Battle Arena #{gameId}
                </h1>
                <Badge type="ranked" color="red" />
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-gray-900/30 px-3 py-1.5 rounded-lg border border-gray-700/30">
                  <span className="text-yellow-500">⚡</span>
                  {!isViewingBattle ? (
                    <>
                      <span className="text-gray-300 text-sm">
                        Power Points:
                      </span>
                      <span className="text-white font-bold">
                        {address?.toLowerCase() ===
                        battleDetailsData?.player1.toLowerCase()
                          ? battleDetailsData?.player1PowerPoints
                          : battleDetailsData?.player2PowerPoints}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-gray-300 text-sm">P1:</span>
                      <span className="text-white font-bold">
                        {battleDetailsData?.player1PowerPoints}
                      </span>
                      <span className="text-gray-300 text-sm">P2:</span>
                      <span className="text-white font-bold">
                        {battleDetailsData?.player2PowerPoints}
                      </span>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2 bg-gray-900/30 px-3 py-1.5 rounded-lg border border-gray-700/30">
                  <span className="text-blue-400">⏱️</span>
                  <span className="text-gray-300 text-sm">Start Time:</span>
                  <span className="text-white font-bold">
                    {formatTimeAgoUnix(Number(battleDetailsData?.startTime))}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Battle Area */}
          <div className="grid grid-cols-[1fr,auto,1fr] gap-6 p-6">
            {/* Player Card */}
            <div className="flex justify-center items-center">
              <BattleCard
                character={
                  isViewingBattle
                    ? battleSnapshotsStateData?.player1Snapshot
                    : address?.toLowerCase() ===
                      battleDetailsData?.player1.toLowerCase()
                    ? battleSnapshotsStateData?.player1Snapshot
                    : battleSnapshotsStateData?.player2Snapshot
                }
                address={shortenText(
                  isViewingBattle
                    ? battleDetailsData?.player1!
                    : address?.toLowerCase() ===
                      battleDetailsData?.player1.toLowerCase()
                    ? battleDetailsData?.player1!
                    : battleDetailsData?.player2!
                )}
                isActive={
                  // Check if it's the player's turn by comparing addresses
                  !isViewingBattle &&
                  address?.toLowerCase() ===
                    battleDetailsData?.currentTurnPlayer?.toLowerCase()
                }
                isAttacking={isAttacking}
                attackType={attackType as any}
              />
            </div>

            {/* Center VS Section */}
            <div className="flex flex-col items-center justify-center gap-6">
              <div
                className="text-5xl font-bold bg-gradient-to-br from-red-500/20 to-red-700/20 
                           text-transparent bg-clip-text select-none"
              >
                VS
              </div>
              {/* Turn Indicator */}

              {winnerPlayer ? (
                <div className="bg-gray-800/50 px-3 py-1.5 rounded-lg border border-gray-700/30 whitespace-nowrap">
                  <div className="text-gray-400 text-sm">
                    <span
                      className={`${
                        !isViewingBattle &&
                        (winnerPlayer.toLowerCase() === address?.toLowerCase()
                          ? 'text-green-400'
                          : 'text-red-400')
                      }`}
                    >
                      {winnerPlayer === battleDetailsData?.player1
                        ? truncateDescription(
                            battleSnapshotsStateData?.player1Snapshot.name!,
                            17
                          )
                        : truncateDescription(
                            battleSnapshotsStateData?.player2Snapshot.name!,
                            17
                          )}
                    </span>
                    {''} Won
                  </div>
                </div>
              ) : isViewingBattle ? (
                <div className="bg-gray-800/50 px-3 py-1.5 rounded-lg border border-gray-700/30 whitespace-nowrap">
                  <div className="text-gray-400 text-sm">
                    {battleDetailsData?.currentTurnPlayer ===
                    battleDetailsData?.player1
                      ? truncateDescription(
                          battleSnapshotsStateData?.player1Snapshot.name!,
                          17
                        )
                      : truncateDescription(
                          battleSnapshotsStateData?.player2Snapshot.name!,
                          17
                        )}
                    's Turn
                  </div>
                </div>
              ) : (
                <div className="bg-gray-800/50 px-3 py-1.5 rounded-lg border border-gray-700/30 whitespace-nowrap">
                  {address?.toLowerCase() ===
                  battleDetailsData?.currentTurnPlayer?.toLowerCase() ? (
                    <div className="text-green-400 flex items-center gap-2 text-sm">
                      <span className="animate-pulse">●</span>
                      Your Turn
                    </div>
                  ) : (
                    <div className="text-gray-400 text-sm">Opponent's Turn</div>
                  )}
                </div>
              )}
            </div>

            {/* Opponent Card */}
            <div className="flex justify-center items-center">
              <BattleCard
                character={
                  isViewingBattle
                    ? battleSnapshotsStateData?.player2Snapshot
                    : address?.toLowerCase() ===
                      battleDetailsData?.player1.toLowerCase()
                    ? battleSnapshotsStateData?.player2Snapshot
                    : battleSnapshotsStateData?.player1Snapshot
                }
                address={shortenText(
                  isViewingBattle
                    ? battleDetailsData?.player2!
                    : address?.toLowerCase() ===
                      battleDetailsData?.player1.toLowerCase()
                    ? battleDetailsData?.player2!
                    : battleDetailsData?.player1!
                )}
                isActive={
                  // Check if it's opponent's turn by comparing addresses
                  !isViewingBattle &&
                  address?.toLowerCase() !==
                    battleDetailsData?.currentTurnPlayer?.toLowerCase()
                }
                isAttacking={false}
                attackType={undefined}
              />
              {/* <AuraEffect type="shadow" intensity={4}>
                <div className="w-52 border border-black h-60"></div>
              </AuraEffect> */}
            </div>
          </div>

          {/* Controls Section */}
          <div
            data-resizable
            className=" bg-gray-800/30 border-t border-gray-700/50"
          >
            <div className="container mx-auto px-6 py-4">
              <div className="flex items-center justify-between w-full">
                <div className="flex gap-10">
                  <div className="flex gap-2">
                    <AttackButton
                      icon="⚔️"
                      label="Quick Strike"
                      type="quick"
                      powerCost={2}
                      onClick={() => handleAttack('quick', 1)}
                      disabled={
                        address?.toLowerCase() !==
                          battleDetailsData?.currentTurnPlayer?.toLowerCase() ||
                        powerPoints < 2 ||
                        isWaitingForAttack
                      }
                      isLoading={
                        (isConnected
                          ? isBattlePerformAttack
                          : isBattlePerformAttackPregen) || isWaitingForAttack
                      }
                    />
                    <AttackButton
                      icon="🗡️"
                      label="Power Slash"
                      type="power"
                      powerCost={3}
                      onClick={() => handleAttack('power', 2)}
                      disabled={
                        address?.toLowerCase() !==
                          battleDetailsData?.currentTurnPlayer?.toLowerCase() ||
                        powerPoints < 3 ||
                        isWaitingForAttack
                      }
                      isLoading={
                        (isConnected
                          ? isBattlePerformAttack
                          : isBattlePerformAttackPregen) || isWaitingForAttack
                      }
                    />
                    <AttackButton
                      icon="⚡"
                      label="Ultimate"
                      type="ultimate"
                      powerCost={4}
                      onClick={() => handleAttack('ultimate', 3)}
                      disabled={
                        address?.toLowerCase() !==
                          battleDetailsData?.currentTurnPlayer?.toLowerCase() ||
                        powerPoints < 4 ||
                        isWaitingForAttack
                      }
                      isLoading={
                        (isConnected
                          ? isBattlePerformAttack
                          : isBattlePerformAttackPregen) || isWaitingForAttack
                      }
                    />
                  </div>
                  <EndTurnButton
                    onClick={() => {
                      handleEndTurn()
                    }}
                    powerPoints={powerPoints}
                    isPlayerTurn={
                      address?.toLowerCase() ===
                      battleDetailsData?.currentTurnPlayer?.toLowerCase()
                    }
                    isLoading={
                      (isConnected ? isBattle : isBattlePregen) ||
                      isWaitingForForfeitBattle
                    }
                    disabled={
                      (isConnected ? isBattle : isBattlePregen) ||
                      isWaitingForForfeitBattle
                    }
                  />
                </div>

                {battleDetailsData?.winner === zeroAddress ? (
                  <button
                    onClick={handleForfeitBattleAction}
                    disabled={isWaitingForForfeitBattle}
                    className={`px-4 py-2 bg-gradient-to-r from-red-500/20 to-red-600/20 
                  text-red-400 rounded-lg hover:from-red-500/30 hover:to-red-600/30 
                  transition-colors border border-red-500/30 font-medium text-sm
                  ${
                    isWaitingForForfeitBattle
                      ? 'opacity-50 cursor-not-allowed'
                      : ''
                  }`}
                  >
                    {(isConnected ? isBattle : isBattlePregen) ||
                    isWaitingForForfeitBattle ? (
                      <span className="flex items-center gap-2">
                        <svg
                          className="animate-spin h-4 w-4 text-red-400"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Surrendering...
                      </span>
                    ) : (
                      'Surrender Battle'
                    )}
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      navigate('/game')
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-red-500/20 to-red-600/20 
                  text-red-400 rounded-lg hover:from-red-500/30 hover:to-red-600/30 
                  transition-colors border border-red-500/30 font-medium text-sm"
                  >
                    Leave Battle
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const GamePlayUI: React.FC<{ gameId: string }> = ({ gameId }) => {
  return (
    <div className="p-6">
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-lg p-6 backdrop-blur-sm border border-gray-700/50">
        <BattleGame gameId={gameId} />
      </div>
    </div>
  )
}
export default GamePlayUI
