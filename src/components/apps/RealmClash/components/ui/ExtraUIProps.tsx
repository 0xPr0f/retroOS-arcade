import {
  useNotifications,
  usePregenSession,
  usePregenTransaction,
  weirdBlue,
  darkBlue,
} from '@/components/pc/drives'
import { useState } from 'react'
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
  const [characterInfo, setCharacterInfo] = useState<{
    name: string
    url: string
  }>({ name: 'Neon Black', url: 'This is a test' })

  const [selectedClass, setSelectedClass] = useState('')
  const [stats, setStats] = useState<CharacterStats>({
    strength: 0,
    agility: 0,
    intelligence: 0,
    vitality: 0,
    magicPower: 0,
    defense: 0,
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

  const handleCreateCharacter = async () => {
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
          characterInfo.url,
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
          characterInfo.url,
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
        </div>
      </div>

      <div className="px-4 py-2 space-y-2">
        {/* Basic Info */}
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
        </div>

        {/* Stats Section */}
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
            onClick={() => {
              console.log(characterInfo.name, selectedClass)
              handleCreateCharacter()
            }}
            disabled={!characterInfo.name || !selectedClass}
            className={`
              flex-1 px-4 py-2 rounded-lg
              ${
                !characterInfo.name || !selectedClass
                  ? 'bg-gray-600 cursor-not-allowed border-gray-500'
                  : 'bg-gradient-to-r border-blue-600 from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
              }
              text-white font-medium border
       
            `}
          >
            Create
          </button>
        </div>
      </div>
    </div>
  )
}

// Enhanced StatSlider component wrapping your existing Slider
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

/*
<div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg border border-gray-700/50 shadow-2xl w-[320px]">
          <div
            className="p-4 border-b border-gray-700"
            style={{
              background: linear-gradient(to right, ${weirdBlue}, ${darkBlue}),
            }}
          >
            <h2 className="text-lg font-bold text-white">
              Create New Character
            </h2>
          </div>

          <div className="p-4 space-y-3">
            <div>
              <label className="block text-gray-400 mb-1">Name</label>
              <input
                type="text"
                className="w-full bg-gray-700/50 rounded px-3 py-2 text-white border border-gray-600 
                             focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="Character name"
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-1">Class</label>
              <select
                onChange={(e) => console.log(Number(e.target.value))}
                className="w-full bg-gray-700/50 rounded px-3 py-2 text-white border border-gray-600 
                                   focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                {characterClassOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3 pt-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-gray-700/50 text-white rounded-lg
                             hover:bg-gray-600 border border-gray-600"
              >
                Cancel
              </button>
              <button
                className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600
                                   hover:from-blue-600 hover:to-blue-700 text-white font-medium border border-blue-600"
              >
                Create
              </button>
            </div>
          </div>
*/
