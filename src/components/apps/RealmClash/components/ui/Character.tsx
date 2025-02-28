import {
  AutoGrid,
  GridItem,
  useAppRouter,
  useDispatchWindows,
  useNotifications,
  usePregenSession,
  usePregenTransaction,
} from '@/components/pc/drives'
import { useEffect, useRef, useState } from 'react'
import { CharacterCreation } from './ExtraUIProps'
import {
  useAccount,
  useChainId,
  useReadContract,
  useWatchContractEvent,
  useWriteContract,
} from 'wagmi'
import { CHARACTER_CARD_ADDRESS } from '../deployments/address'
import { CHARACTER_CARD_ABI } from '../deployments/abi'
import { cn } from '@/components/library/utils'
import { Slider } from './ui_components'
import { useMouse } from 'react-use'

interface CharacterCard {
  id: string
  name: string
  class: string
  level: number
  imageUrl?: string
}

const CharacterGrid: React.FC = () => {
  const { isLoginPregenSession, pregenActiveAddress, isSmartAccount } =
    usePregenSession()

  const chainId = useChainId()

  const { isConnected, address: playerAddress } = useAccount()
  const address = isConnected
    ? playerAddress?.toLowerCase()
    : isLoginPregenSession
    ? pregenActiveAddress?.toLowerCase()
    : undefined

  const { data: addressTokenIds, refetch: refetchAddressTokenIds } =
    useReadContract({
      address: CHARACTER_CARD_ADDRESS,
      abi: CHARACTER_CARD_ABI,
      functionName: 'getCharactersByOwner',
      args: [address],
      query: {
        enabled: !!address,
        refetchInterval: 3000,
      },
    })

  useWatchContractEvent({
    address: CHARACTER_CARD_ADDRESS,
    abi: CHARACTER_CARD_ABI,
    eventName: 'CharacterCreated',
    onLogs(logs: any) {
      console.log(logs[0].args)
      const { creator } = logs[0].args
      if (String(creator).toLowerCase() === String(address).toLowerCase()) {
        refetchAddressTokenIds()
      }
    },
  })
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const handleCreateNewCard = () => {
    setIsCreateModalOpen(true)
  }

  return (
    <div className="p-6 relative min-h-[700px]">
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-lg p-6 backdrop-blur-sm border border-gray-700/50">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Characters</h2>
        </div>

        <AutoGrid className="" minItemWidth={250} gap={14}>
          <GridItem
            onClick={handleCreateNewCard}
            className="min-h-[410px] bg-gray-800/30 rounded-lg border-2 border-dashed border-gray-600 
                     flex items-center justify-center p-8 cursor-pointer
                     hover:bg-gray-800/50 hover:border-gray-500 transition-all group"
          >
            <div className="text-center">
              <div
                className="w-16 h-16 rounded-full bg-gray-700/50 mx-auto mb-4 
                          flex items-center justify-center group-hover:bg-gray-700"
              >
                <span className="text-3xl text-gray-400 group-hover:text-white">
                  +
                </span>
              </div>
              <p className="text-gray-400 group-hover:text-white">
                Create New Character
              </p>
            </div>
          </GridItem>

          {Array.isArray(addressTokenIds) &&
            addressTokenIds.length > 0 &&
            addressTokenIds.map((characterId: bigint) => (
              <GridItem key={characterId}>
                <CharacterCard
                  key={characterId}
                  characterId={Number(characterId)}
                />
              </GridItem>
            ))}
        </AutoGrid>
      </div>
      {isCreateModalOpen && (
        <>
          <div
            onClick={() => setIsCreateModalOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
            <CreateCharacterModal onClose={() => setIsCreateModalOpen(false)} />
          </div>
        </>
      )}
    </div>
  )
}

const StatSliderWithBase: React.FC<{
  label: string
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  disabled?: boolean
  icon: string
  backwardOnly?: boolean
  baseValue: number
}> = ({
  label,
  value,
  onChange,
  min,
  max,
  disabled,
  icon,
  backwardOnly,
  baseValue,
}) => {
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-lg">{icon}</span>
          <span className="text-gray-300">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-400">{baseValue}</span>
          <span className="text-gray-400">+</span>
          <span className="text-white font-medium">{value}</span>
          <span className="text-gray-400">=</span>
          <span className="text-blue-400 font-medium">{baseValue + value}</span>
        </div>
      </div>
      <div className="w-full px-4">
        <Slider
          min={min}
          max={max}
          defaultValue={baseValue + value}
          onChange={(totalValue) => {
            const increment = totalValue - baseValue
            onChange(increment)
          }}
          disabled={disabled}
          backwardOnly={backwardOnly}
          viewValue={false}
          value={baseValue + value}
        />
      </div>
    </div>
  )
}

const CharacterEdit: React.FC<{
  characterId: number
  windowId: string
  characterStats: any
}> = ({ characterId, windowId, characterStats }) => {
  if (!characterStats) return null

  const baseStats = {
    strength: Number(characterStats.strength) || 0,
    defense: Number(characterStats.defense) || 0,
    agility: Number(characterStats.agility) || 0,
    vitality: Number(characterStats.vitality) || 0,
    intelligence: Number(characterStats.intelligence) || 0,
    magicPower: Number(characterStats.magicPower) || 0,
  }

  const [statIncreases, setStatIncreases] = useState({
    strength: 0,
    defense: 0,
    agility: 0,
    vitality: 0,
    intelligence: 0,
    magicPower: 0,
  })

  const { closeDispatchWindow } = useDispatchWindows()
  const TOTAL_POINTS = Number(characterStats.statPoints) || 0
  const MIN_STAT = 0
  const MAX_STAT = 255

  const totalPointsUsed = Object.values(statIncreases).reduce(
    (sum, value) => sum + value,
    0
  )

  const remainingPoints = TOTAL_POINTS - totalPointsUsed
  const backwardOnly = remainingPoints <= 0
  const handleStatChange = (
    stat: keyof typeof statIncreases,
    increment: number
  ) => {
    if (increment < 0) {
      increment = 0
    }

    const newTotal = baseStats[stat] + increment

    if (newTotal > MAX_STAT) {
      increment = MAX_STAT - baseStats[stat]
    }

    const currentIncrement = statIncreases[stat]
    const pointDifference = increment - currentIncrement

    if (remainingPoints >= pointDifference || pointDifference < 0) {
      setStatIncreases((prev) => ({
        ...prev,
        [stat]: increment,
      }))
    } else if (remainingPoints > 0) {
      setStatIncreases((prev) => ({
        ...prev,
        [stat]: currentIncrement + remainingPoints,
      }))
    }
  }
  const finalStats = {
    strength: baseStats.strength + statIncreases.strength,
    defense: baseStats.defense + statIncreases.defense,
    agility: baseStats.agility + statIncreases.agility,
    vitality: baseStats.vitality + statIncreases.vitality,
    intelligence: baseStats.intelligence + statIncreases.intelligence,
    magicPower: baseStats.magicPower + statIncreases.magicPower,
  }
  const chainId = useChainId()
  const { addNotification } = useNotifications()
  const availableChainIds = ['84532']
  const isChainUnavailable = !availableChainIds.some(
    (chain) => Number(chain) === chainId
  )
  const { isConnected, address: playerAddress } = useAccount()
  const { isLoginPregenSession, pregenActiveAddress, isSmartAccount } =
    usePregenSession()
  const {
    writeContract: writeIncreaseStats,
    data: increaseStatsData,
    isPending: isIncreasingStats,
    error: increaseStatsError,
  } = useWriteContract({
    mutation: {
      onError: (error: any) => {},
      onSuccess: (txHash: any) => {},
    },
  })

  // Pregen Join Queue Contract Write
  const {
    writeContract: writeIncreaseStatsPregen,
    data: increaseStatsDataPregen,
    isPending: isIncreasingStatsPregen,
  } = usePregenTransaction({
    mutation: {
      onError: (error: any) => {},
      onSuccess: (txHash: any) => {},
    },
  })

  const handleAllocateStatsPoints = async () => {
    if (isChainUnavailable) {
      addNotification({
        title: `Chain Unavailable`,
        message: `This chain is not available. Please use base sepolia.`,
        type: 'error',
        duration: 10000,
      })
      return
    }
    /*  uint256 _characterId,
        uint8 _strengthIncrease,
        uint8 _defenseIncrease,
        uint8 _agilityIncrease,
        uint8 _vitalityIncrease,
        uint8 _intelligenceIncrease,
        uint8 _magicPowerIncrease
*/
    if (isConnected) {
      await writeIncreaseStats({
        address: CHARACTER_CARD_ADDRESS,
        abi: CHARACTER_CARD_ABI,
        functionName: 'increaseStats',
        args: [
          characterId,
          statIncreases.strength,
          statIncreases.defense,
          statIncreases.agility,
          statIncreases.vitality,
          statIncreases.intelligence,
          statIncreases.magicPower,
        ],
      })
    } else if (isLoginPregenSession) {
      await writeIncreaseStatsPregen({
        address: CHARACTER_CARD_ADDRESS,
        abi: CHARACTER_CARD_ABI,
        functionName: 'increaseStats',
        args: [
          characterId,
          statIncreases.strength,
          statIncreases.defense,
          statIncreases.agility,
          statIncreases.vitality,
          statIncreases.intelligence,
          statIncreases.magicPower,
        ],
      })
    }
  }

  useWatchContractEvent({
    address: CHARACTER_CARD_ADDRESS,
    abi: CHARACTER_CARD_ABI,
    eventName: 'StatsIncreased',
    onLogs(logs: any) {
      closeDispatchWindow(windowId)
    },
  })

  const handleAllocate = () => {
    handleAllocateStatsPoints()
    //closeDispatchWindow(windowId)
  }

  return (
    <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg border border-gray-700/50 p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-300">Points Left:</span>
          <span
            className={`text-sm font-bold ${
              remainingPoints > 0 ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {remainingPoints}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <StatSliderWithBase
          label="Strength"
          value={statIncreases.strength}
          onChange={(value) => handleStatChange('strength', value)}
          min={MIN_STAT}
          max={MAX_STAT}
          icon="⚔️"
          backwardOnly={backwardOnly}
          baseValue={baseStats.strength}
        />
        <StatSliderWithBase
          label="Defense"
          value={statIncreases.defense}
          onChange={(value) => handleStatChange('defense', value)}
          min={MIN_STAT}
          max={MAX_STAT}
          icon="🛡️"
          backwardOnly={backwardOnly}
          baseValue={baseStats.defense}
        />
        <StatSliderWithBase
          label="Agility"
          value={statIncreases.agility}
          onChange={(value) => handleStatChange('agility', value)}
          min={MIN_STAT}
          max={MAX_STAT}
          icon="💨"
          backwardOnly={backwardOnly}
          baseValue={baseStats.agility}
        />
        <StatSliderWithBase
          label="Vitality"
          value={statIncreases.vitality}
          onChange={(value) => handleStatChange('vitality', value)}
          min={MIN_STAT}
          max={MAX_STAT}
          icon="❤️"
          backwardOnly={backwardOnly}
          baseValue={baseStats.vitality}
        />
        <StatSliderWithBase
          label="Intelligence"
          value={statIncreases.intelligence}
          onChange={(value) => handleStatChange('intelligence', value)}
          min={MIN_STAT}
          max={MAX_STAT}
          icon="✨"
          backwardOnly={backwardOnly}
          baseValue={baseStats.intelligence}
        />
        <StatSliderWithBase
          label="Magic Power"
          value={statIncreases.magicPower}
          onChange={(value) => handleStatChange('magicPower', value)}
          min={MIN_STAT}
          max={MAX_STAT}
          icon="🔮"
          backwardOnly={backwardOnly}
          baseValue={baseStats.magicPower}
        />
      </div>
      <div className="flex justify-between px-3 flex-row-reverse gap-3 mt-5">
        <button
          onClick={handleAllocate}
          disabled={totalPointsUsed === 0}
          className="h-10 px-6 rounded-md overflow-hidden
                 bg-gradient-to-r from-blue-500 to-blue-700 
                 hover:from-blue-600 hover:to-blue-800
                 disabled:opacity-50 disabled:cursor-not-allowed
                 transition-all duration-300"
        >
          <div className="relative z-10 flex items-center justify-center">
            <span className="font-medium">Allocate</span>
          </div>
        </button>

        <button
          onClick={() => {
            closeDispatchWindow(windowId)
          }}
          className="h-10 px-6 rounded-md overflow-hidden
                 bg-gradient-to-r from-gray-600 to-gray-700
                 hover:from-gray-700 hover:to-gray-800
                 transition-all duration-300"
        >
          <div className="relative z-10 flex items-center justify-center">
            <span className="font-medium">Cancel</span>
          </div>
        </button>
      </div>
    </div>
  )
}
export const truncateDescription = (description: string, maxLength = 100) => {
  if (!description || description.length <= maxLength) return description
  return description.substring(0, maxLength) + '...'
}

const CharacterCard: React.FC<{ characterId: number }> = ({ characterId }) => {
  const { navigate } = useAppRouter()
  const containerRef = useRef<HTMLDivElement>(null)
  const mouse = useMouse(containerRef as React.RefObject<Element>)
  const handleCardClick = () => {
    navigate(`/charactercard/${characterId}`)
  }

  const { createDispatchWindow } = useDispatchWindows()

  const { isLoginPregenSession, pregenActiveAddress, isSmartAccount } =
    usePregenSession()

  const { isConnected, address: playerAddress } = useAccount()
  const address = isConnected
    ? playerAddress?.toLowerCase()
    : isLoginPregenSession
    ? pregenActiveAddress?.toLowerCase()
    : undefined

  const chainId = useChainId()
  const { addNotification } = useNotifications()
  const availableChainIds = ['84532']
  const isChainUnavailable = !availableChainIds.some(
    (chain) => Number(chain) === chainId
  )

  const {
    writeContract: writeBurnCharacter,
    data: burnCharacterData,
    isPending: isBurningCharacter,
    error: burnCharacterError,
  } = useWriteContract({
    mutation: {
      onError: (error: any) => {},
      onSuccess: (txHash: any) => {
        refetchCharacterStats()
      },
    },
  })

  // Pregen Join Queue Contract Write
  const {
    writeContract: writeBurnCharacterPregen,
    data: burnCharacterDataPregen,
    isPending: isBurningCharacterPregen,
  } = usePregenTransaction({
    mutation: {
      onError: (error: any) => {},
      onSuccess: (txHash: any) => {
        refetchCharacterStats()
      },
    },
  })

  const handleBurnCharacter = async (e: React.MouseEvent) => {
    e.stopPropagation()
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
      await writeBurnCharacter({
        address: CHARACTER_CARD_ADDRESS,
        abi: CHARACTER_CARD_ABI,
        functionName: 'burn',
        args: [characterId],
      })
    } else if (isLoginPregenSession) {
      await writeBurnCharacterPregen({
        address: CHARACTER_CARD_ADDRESS,
        abi: CHARACTER_CARD_ABI,
        functionName: 'burn',
        args: [characterId],
      })
    }
  }

  const { data: dataCharacterStats, refetch: refetchCharacterStats } =
    useReadContract({
      address: CHARACTER_CARD_ADDRESS,
      abi: CHARACTER_CARD_ABI,
      functionName: 'getCharacterStats',
      args: [characterId],
      query: {
        enabled: !!characterId,
        refetchInterval: 5000,
      },
    })

  const { data: tokenUrl } = useReadContract({
    address: CHARACTER_CARD_ADDRESS,
    abi: CHARACTER_CARD_ABI,
    functionName: 'tokenURI',
    args: [characterId],
    query: {
      enabled: !!characterId,
    },
  })

  const characterStats = dataCharacterStats as any

  const ipfsOrigins = [
    'https://nftstorage.link',
    'https://gateway.pinata.cloud',
    'https://alchemy.mypinata.cloud',
    'https://dweb.link',
    'https://flk-ipfs.xyz',
    'https://ipfs.io',
    'https://brown-perfect-marlin-23.mypinata.cloud',
  ]

  const [currentOriginIndex, setCurrentOriginIndex] = useState(0)
  const [metadata, setMetadata] = useState<{
    name?: string
    description?: string
    image?: string
  } | null>(null)

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

  useEffect(() => {
    const fetchMetadata = async () => {
      if (!tokenUrl || typeof tokenUrl !== 'string' || tokenUrl.length < 25)
        return

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

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    console.log('Edit character:', characterId)
    const centeredX = mouse.docX - 300 / 2
    const centeredY = mouse.docY - 350 / 1.1
    const windowId = createDispatchWindow({
      title: 'Allocate Stats',
      content: () => {
        return (
          <CharacterEdit
            characterId={characterId}
            windowId={windowId}
            characterStats={characterStats}
          />
        )
      },
      initialPosition: {
        x: centeredX,
        y: centeredY,
      },
      initialSize: {
        width: 300,
        height: 350,
      },
      styles: {
        background: 'bg-gradient-to-b from-gray-900 via-blue-900 to-gray-900',
        rounded: 'rounded-lg',
        border: 'border-gray-700/50',
      },
    })
  }

  if (!characterStats) return null
  return (
    <div
      ref={containerRef}
      onClick={handleCardClick}
      className="bg-gray-800/30 rounded-lg border border-gray-700/30 overflow-hidden 
                hover:border-gray-600/50 transition-all cursor-pointer
                hover:shadow-lg hover:shadow-gray-900/30 hover:-translate-y-1"
    >
      {/* Character Image or Placeholder */}
      <div
        className={cn(
          `min-h-[231px]  bg-gradient-to-br`,

          getCharacterClassColor(characterStats.characterClass),
          `relative`
        )}
      >
        {metadata?.image ? (
          <img
            src={getUrlWithCurrentOrigin(metadata.image)}
            alt={characterStats.name}
            className="w-full h-full object-cover"
            onError={handleImageError}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-6xl text-white/20">
              {characterStats.name}
            </span>
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          <p className="text-lg font-bold text-white">{characterStats.name}</p>
          {metadata?.description && (
            <p className="text-xs text-gray-300 mt-1">
              {truncateDescription(metadata.description)}
            </p>
          )}
        </div>
      </div>

      {/* Character Info */}
      <div className="p-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Class</span>
          <span className="text-white">
            {getCharacterClassLabel(characterStats.characterClass)}
          </span>
        </div>
        <div className="flex justify-between items-center mt-2">
          <span className="text-gray-400">Level</span>
          <span className="text-white">
            {characterStats &&
              Math.max(0, Math.floor(Number(characterStats.experience) / 100))}
          </span>
        </div>
        <div className="flex justify-between items-center mt-2">
          <span className="text-gray-400">Stats Points</span>
          <span className="text-white">{characterStats.statPoints}</span>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex gap-2">
          <button
            onClick={handleEdit}
            className="flex-1 px-3 py-2 bg-gray-700/50 text-white rounded 
                     hover:bg-gray-700 transition-colors active:bg-gray-800
                     hover:shadow-md"
          >
            Edit
          </button>
          <button
            onClick={handleBurnCharacter}
            className="flex-1 px-3 py-2 bg-red-600/50 text-white rounded 
                     hover:bg-red-600 transition-colors active:bg-red-700
                     hover:shadow-md"
          >
            Burn
          </button>
        </div>
      </div>
    </div>
  )
}

const CreateCharacterModal: React.FC<{ onClose: () => void }> = ({
  onClose,
}) => {
  return (
    <>
      <div className="w-80 relative z-50">
        <CharacterCreation
          onClose={onClose}
          characterClassOptions={characterClassOptions}
        />
      </div>
    </>
  )
}

const CharacterUI: React.FC = () => {
  return (
    <div className="">
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-lg p-4 backdrop-blur-sm border border-gray-700/50">
        <CharacterGrid />
      </div>
    </div>
  )
}

// Define character class enum and options
enum CharacterClass {
  Human = 0, // Balanced, needs stat points to evolve
  King = 1, // High strength, high vitality, low magic, medium defense
  Mage = 2, // Low strength, high magic power, high intelligence, low defense
  Archer = 3, // High agility, medium strength, low defense, medium intelligence
  Knight = 4, // High strength, high defense, low magic, low intelligence
  Demon = 5, // High strength, high magic, low defense, low intelligence
  God = 6, // Balanced high stats, no weaknesses, overpowered
}

// Create options array for select dropdown
const characterClassOptions = [
  {
    value: CharacterClass.Human,
    label: 'Human',
    color: 'from-amber-200 to-amber-400',
  },
  {
    value: CharacterClass.King,
    label: 'King',
    color: 'from-yellow-500 to-yellow-700',
  },
  {
    value: CharacterClass.Mage,
    label: 'Mage',
    color: 'from-blue-500 to-blue-700',
  },
  {
    value: CharacterClass.Archer,
    label: 'Archer',
    color: 'from-green-500 to-green-700',
  },
  {
    value: CharacterClass.Knight,
    label: 'Knight',
    color: 'from-red-500 to-red-700',
  },
  {
    value: CharacterClass.Demon,
    label: 'Demon',
    color: 'from-purple-500 to-purple-700',
  },
  { value: CharacterClass.God, label: 'God', color: 'from-white to-gray-200' },
]

export const getCharacterClassColor = (
  identifier: CharacterClass | string
): string => {
  const option = characterClassOptions.find(
    (opt) => opt.value === identifier || opt.label === identifier
  )
  return option?.color || 'from-gray-500 to-gray-700' // Default color if not found
}

// Function to get class label from value
export const getCharacterClassLabel = (
  value: CharacterClass | number
): string => {
  const numericValue = typeof value === 'string' ? parseInt(value, 10) : value
  const option = characterClassOptions.find((opt) => opt.value === numericValue)
  return option?.label || 'Unknown'
}

// Example usage:
// In your select component:
// <select onChange={(e) => setCharacterClass(Number(e.target.value))}>
//   {characterClassOptions.map(option => (
//     <option key={option.value} value={option.value}>
//       {option.label}
//     </option>
//   ))}
// </select>

export default CharacterUI
