import {
  useNotifications,
  usePregenSession,
  usePregenTransaction,
  weirdBlue,
  darkBlue,
} from '@/components/pc/drives'
import { useEffect, useState } from 'react'
import { Slider } from './ui_components'
import {
  useAccount,
  useChainId,
  useWaitForTransactionReceipt,
  useWatchContractEvent,
  useWriteContract,
} from 'wagmi'
import { CHARACTER_CARD_ADDRESS } from '../deployments/address'
import { CHARACTER_CARD_ABI } from '../deployments/abi'
import { getCharacterClassLabel } from './Character'
import axios from 'axios'
import { pinata } from '@/components/pc/drives'

interface CharacterStats {
  strength: 0
  agility: 0
  intelligence: 0
  vitality: 0
  magicPower: 0
  defense: 0
}

export const CharacterCreation: React.FC<{
  onClose: () => void
  characterClassOptions: any
}> = ({ onClose, characterClassOptions }) => {
  const [activeTab, setActiveTab] = useState('basic') // 'basic' or 'stats'
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  const [selectedClass, setSelectedClass] = useState('')
  const [stats, setStats] = useState<CharacterStats>({
    strength: 0,
    agility: 0,
    intelligence: 0,
    vitality: 0,
    magicPower: 0,
    defense: 0,
  })
  const [characterInfo, setCharacterInfo] = useState<{
    name: string
    url: string
    image: File | null
    description: string
  }>({
    name: 'Neon Black',
    url: '',
    image: null,
    description: '',
  })

  const TOTAL_POINTS = 300
  const MIN_STAT = 0
  const MAX_STAT = 255
  const backwardOnly =
    stats.strength +
      stats.agility +
      stats.intelligence +
      stats.vitality +
      stats.magicPower +
      stats.defense >=
    TOTAL_POINTS

  const totalPointsUsed = Object.values(stats).reduce(
    (sum, stat) => sum + stat,
    0
  )
  const remainingPoints = TOTAL_POINTS - totalPointsUsed

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
    writeContract: writeCreateCharacter,
    data: createCharacterData,
    isPending: isCreatingCharacter,
    error: createCharacterError,
  } = useWriteContract({
    mutation: {
      onError: (error: any) => {},
      onSuccess: (txHash: any) => {},
    },
  })

  // Pregen Join Queue Contract Write
  const {
    writeContract: writeCreateCharacterPregen,
    data: createCharacterDataPregen,
    isPending: isCreatingCharacterPregen,
  } = usePregenTransaction({
    mutation: {
      onError: (error: any) => {},
      onSuccess: (txHash: any) => {},
    },
  })

  const handleCreateCharacter = async (tokenUri: string) => {
    if (!tokenUri) return
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
      await writeCreateCharacter({
        address: CHARACTER_CARD_ADDRESS,
        abi: CHARACTER_CARD_ABI,
        functionName: 'createCharacter',
        args: [
          characterInfo.name,
          tokenUri,
          stats.strength,
          stats.defense,
          stats.agility,
          stats.vitality,
          stats.intelligence,
          stats.magicPower,
          Number(selectedClass),
        ],
      })
    } else if (isLoginPregenSession) {
      await writeCreateCharacterPregen({
        address: CHARACTER_CARD_ADDRESS,
        abi: CHARACTER_CARD_ABI,
        functionName: 'createCharacter',
        args: [
          characterInfo.name,
          tokenUri,
          stats.strength,
          stats.defense,
          stats.agility,
          stats.vitality,
          stats.intelligence,
          stats.magicPower,
          Number(selectedClass),
        ],
      })
    }
  }

  useWatchContractEvent({
    address: CHARACTER_CARD_ADDRESS,
    abi: CHARACTER_CARD_ABI,
    eventName: 'CharacterCreated',
    onLogs(logs: any) {
      onClose()
    },
  })

  const { isLoading } = useWaitForTransactionReceipt({
    hash: isConnected ? createCharacterData : createCharacterDataPregen,
  })
  const isWaitingForCreate = isSmartAccount ? false : isLoading

  const handleStatChange = (stat: keyof CharacterStats, newValue: number) => {
    const totalPoints = Object.entries(stats).reduce((sum, [key, value]) => {
      return key !== stat ? sum + value : sum
    }, 0)

    // Ensure the new value doesn't exceed max or total points limit
    if (newValue >= 0 && newValue <= MAX_STAT) {
      if (totalPoints + newValue <= TOTAL_POINTS) {
        setStats((prev) => ({
          ...prev,
          [stat]: newValue,
        }))
      } else {
        // If exceeding total points, set to maximum possible value
        const maxPossibleValue = TOTAL_POINTS - totalPoints
        if (maxPossibleValue >= 0) {
          setStats((prev) => ({
            ...prev,
            [stat]: maxPossibleValue,
          }))
        }
      }
    }
  }

  useEffect(() => {
    if (selectedClass && characterInfo.description === '') {
      const className = getCharacterClassLabel(selectedClass as any)
      const article = ['A', 'E', 'I', 'O', 'U'].includes(className.charAt(0))
        ? 'An'
        : 'A'
      setCharacterInfo((prev) => ({
        ...prev,
        description: `${article} ${className} From The Realm Of Clash`,
      }))
    }
  }, [selectedClass])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setCharacterInfo({ ...characterInfo, image: file })

      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const isBasicInfoComplete =
    characterInfo.name && selectedClass && imagePreview

  const changeTab = (tab: string) => {
    setActiveTab(tab)
  }

  const handleNextOrCreate = async () => {
    if (activeTab === 'basic' && isBasicInfoComplete) {
      setActiveTab('stats')
    } else if (activeTab === 'stats' && isBasicInfoComplete) {
      if (!characterInfo.image) return
      setIsCreating(true)
      try {
        let tokenUriIpfsUrl = ''
        if (characterInfo.url.length < 26) {
          const keyRequest = await axios.get('/api/create/pinatakey')
          const keyData = keyRequest.data.data
          const upload = await pinata.upload
            .file(characterInfo.image!)
            .key(keyData.JWT)

          const imageIpfsUrl = await pinata.gateways.convert(upload.IpfsHash)

          const metadata = {
            name: characterInfo.name.trim(),
            description: characterInfo.description.trim(),
            image: imageIpfsUrl,
            raw_image_hash: upload.IpfsHash,
          }
          const tokenUri = await pinata.upload.json(metadata).key(keyData.JWT)

          tokenUriIpfsUrl = await pinata.gateways.convert(tokenUri.IpfsHash)
          setCharacterInfo({
            ...characterInfo,
            url: tokenUriIpfsUrl,
          })
        }
        /*  await handleCreateCharacter(
          tokenUriIpfsUrl.length < 10 ? characterInfo.url : tokenUriIpfsUrl
        ) */
      } catch (error) {
        console.error('Error creating character:', error)
        addNotification({
          title: `Error Creating Character`,
          message: `There was an error creating your character. Please try again.`,
          type: 'error',
          duration: 10000,
        })
      } finally {
        setIsCreating(false)
      }
    }
  }

  return (
    <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg border border-gray-700/50 shadow-2xl">
      <div
        className="p-3 border-b border-gray-700"
        style={{
          background: `linear-gradient(to right, ${weirdBlue}, ${darkBlue})`,
        }}
      >
        <div className="flex justify-between gap-3 items-center">
          <h2 className="text-lg font-bold text-white">Create New Character</h2>
          {activeTab === 'stats' && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-300">Points:</span>
              <span
                className={`text-sm font-bold ${
                  remainingPoints > 0 ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {remainingPoints}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-700">
        <button
          className={`flex-1 py-2 text-center ${
            activeTab === 'basic'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
          onClick={() => changeTab('basic')}
        >
          Basic Info
        </button>
        <button
          className={`flex-1 py-2 text-center ${
            activeTab === 'stats'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
          onClick={() => changeTab('stats')}
        >
          Stats
        </button>
      </div>

      <div className="px-4 py-2 space-y-2">
        {/* Basic Info Tab */}
        {activeTab === 'basic' && (
          <div className="space-y-3">
            <div>
              <label className="block text-gray-400 mb-1">Name</label>
              <input
                type="text"
                value={characterInfo.name}
                onChange={(e) =>
                  setCharacterInfo({ ...characterInfo, name: e.target.value })
                }
                className="w-full bg-gray-700/50 rounded px-3 py-2 text-white border border-gray-600 
                         focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="Character name"
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-1">Class</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full bg-gray-700/50 rounded px-3 py-2 text-white border border-gray-600 
                         focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Select a class</option>
                {characterClassOptions.map((option: any) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-gray-400 mb-1">
                Character Image
              </label>
              <div className="flex space-x-3">
                <div className="flex-1">
                  <div
                    className="w-full h-24 bg-gray-700/50 rounded border border-gray-600 flex items-center justify-center cursor-pointer hover:bg-gray-700 overflow-hidden relative"
                    onClick={() =>
                      document.getElementById('character-image')?.click()
                    }
                  >
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Character preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="text-gray-400 text-sm flex flex-col items-center">
                        <span className="text-xl mb-1">+</span>
                        <span>Upload Image</span>
                      </div>
                    )}
                    <input
                      id="character-image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>
                </div>
                {imagePreview && (
                  <button
                    onClick={() => {
                      setImagePreview(null)
                      setCharacterInfo({ ...characterInfo, image: null })
                    }}
                    className="px-2 text-sm text-red-400 hover:text-red-300 self-center"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>

            {/* Description (Optional) */}
            <div>
              <label className="block text-gray-400 mb-1">
                Description (Optional)
              </label>
              <textarea
                value={characterInfo.description}
                onChange={(e) =>
                  setCharacterInfo({
                    ...characterInfo,
                    description: e.target.value,
                  })
                }
                className="w-full min-h-16 max-h-24 bg-gray-700/50 rounded px-3 py-2 text-white border border-gray-600 
                         focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 h-20"
                placeholder="Character description"
              />
            </div>
          </div>
        )}

        {/* Stats Tab */}
        {activeTab === 'stats' && (
          <div className="space-y-2 pt-2">
            <div className="flex justify-between items-center">
              <h3 className="text-white font-semibold">Character Stats</h3>
              <button
                onClick={() =>
                  setStats({
                    strength: 0,
                    agility: 0,
                    intelligence: 0,
                    vitality: 0,
                    magicPower: 0,
                    defense: 0,
                  })
                }
                className="text-sm text-gray-400 hover:text-white"
              >
                Reset Stats
              </button>
            </div>

            <div className="space-y-2">
              <StatSlider
                label="Strength"
                value={stats.strength}
                onChange={(value) => handleStatChange('strength', value)}
                min={MIN_STAT}
                max={MAX_STAT}
                icon="⚔️"
                backwardOnly={backwardOnly}
              />
              <StatSlider
                label="Defense"
                value={stats.defense}
                onChange={(value) => handleStatChange('defense', value)}
                min={MIN_STAT}
                max={MAX_STAT}
                icon="🛡️"
                backwardOnly={backwardOnly}
              />
              <StatSlider
                label="Agility"
                value={stats.agility}
                onChange={(value) => handleStatChange('agility', value)}
                min={MIN_STAT}
                max={MAX_STAT}
                icon="💨"
                backwardOnly={backwardOnly}
              />
              <StatSlider
                label="Vitality"
                value={stats.vitality}
                onChange={(value) => handleStatChange('vitality', value)}
                min={MIN_STAT}
                max={MAX_STAT}
                icon="❤️"
                backwardOnly={backwardOnly}
              />
              <StatSlider
                label="Intelligence"
                value={stats.intelligence}
                onChange={(value) => handleStatChange('intelligence', value)}
                min={MIN_STAT}
                max={MAX_STAT}
                icon="✨"
                backwardOnly={backwardOnly}
              />
              <StatSlider
                label="Magic Power"
                value={stats.magicPower}
                onChange={(value) => handleStatChange('magicPower', value)}
                min={MIN_STAT}
                max={MAX_STAT}
                icon="🔮"
                backwardOnly={backwardOnly}
              />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-700/50 text-white rounded-lg
                     hover:bg-gray-600 border border-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={handleNextOrCreate}
            disabled={
              (activeTab === 'basic'
                ? !isBasicInfoComplete
                : !isBasicInfoComplete) || isCreating
            }
            className={`
              flex-1 px-4 py-2 rounded-lg
              ${
                (activeTab === 'basic' && !isBasicInfoComplete) ||
                (activeTab === 'stats' && !isBasicInfoComplete) ||
                isCreating
                  ? 'bg-gray-600 cursor-not-allowed border-gray-500'
                  : 'bg-gradient-to-r border-blue-600 from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
              }
              text-white font-medium border flex justify-center items-center
            `}
          >
            {isCreating ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                Creating...
              </>
            ) : activeTab === 'basic' ? (
              'Next'
            ) : (
              'Create'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// Enhanced StatSlider component wrapping the existing Slider
const StatSlider: React.FC<{
  label: string
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  disabled?: boolean
  icon: string
  backwardOnly?: boolean
}> = ({ label, value, onChange, min, max, disabled, icon, backwardOnly }) => {
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-lg">{icon}</span>
          <span className="text-gray-300">{label}</span>
        </div>
        <span className="text-white font-medium">{value}</span>
      </div>
      <div className="w-full px-4">
        <Slider
          min={min}
          max={max}
          defaultValue={value}
          onChange={onChange}
          disabled={disabled}
          backwardOnly={backwardOnly}
          viewValue={false}
          value={value}
        />
      </div>
    </div>
  )
}
