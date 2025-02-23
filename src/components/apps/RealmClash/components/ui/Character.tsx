import {
  AutoGrid,
  GridItem,
  useAppRouter,
  useNotifications,
  usePregenSession,
  usePregenTransaction,
} from '@/components/pc/drives'
import { useEffect, useState } from 'react'
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
      console.log(logs)
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
    <div className="p-6 relative min-h-[800px]">
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-lg p-6 backdrop-blur-sm border border-gray-700/50">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Characters</h2>
        </div>

        <AutoGrid className="" minItemWidth={210} gap={14}>
          <GridItem
            onClick={handleCreateNewCard}
            className="bg-gray-800/30 rounded-lg border-2 border-dashed border-gray-600 
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

const CharacterCard: React.FC<{ characterId: number }> = ({ characterId }) => {
  const { navigate } = useAppRouter()

  const handleCardClick = () => {
    navigate(`/charactercard/${characterId}`)
  }

  console.log(characterId)

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    console.log('Edit character:', characterId)
  }

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
      onSuccess: (txHash: any) => {},
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
      onSuccess: (txHash: any) => {},
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
        refetchInterval: 3000,
      },
    })
  const characterStats = dataCharacterStats as any

  if (!characterStats) return null
  console.log(characterStats)
  console.log(getCharacterClassColor(characterStats.characterClass))
  return (
    <div
      onClick={handleCardClick}
      className="bg-gray-800/30 rounded-lg border border-gray-700/30 overflow-hidden 
                hover:border-gray-600/50 transition-all cursor-pointer
                hover:shadow-lg hover:shadow-gray-900/30 hover:-translate-y-1"
    >
      {/* Character Image or Placeholder */}
      <div
        className={cn(
          `h-48 bg-gradient-to-br`,

          getCharacterClassColor(characterStats.characterClass),
          `relative`
        )}
      >
        {characterStats.imageUrl ? (
          <img
            src={characterStats.imageUrl}
            alt={characterStats.name}
            className="w-full h-full object-cover"
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
            {characterStats && characterStats.experience}
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
export const getCharacterClassLabel = (value: CharacterClass): string => {
  const option = characterClassOptions.find((opt) => opt.value === value)
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
