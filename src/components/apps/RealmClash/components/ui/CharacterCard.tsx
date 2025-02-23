import { useReadContract } from 'wagmi'
import { useChainId } from 'wagmi'
import { useAccount } from 'wagmi'
import { StatBar, ValueStat, InventoryItem } from './ui_components'
import { BooleanStat } from './ui_components'
import { usePregenSession } from '@/components/pc/drives'
import { CHARACTER_CARD_ABI } from '../deployments/abi'
import { CHARACTER_CARD_ADDRESS } from '../deployments/address'
import { useEffect, useState } from 'react'
import { useReadContracts } from 'wagmi'
import { getCharacterClassLabel } from './Character'
import { config } from '../deployments/config'

interface StatsPanelProps {
  strength?: number
  defense?: number
  agility?: number
  vitality?: number
  intelligence?: number
  magicPower?: number
  wins?: number
  losses?: number
  isVeteran?: boolean
}

const StatsPanel: React.FC<StatsPanelProps> = ({
  strength,
  defense,
  agility,
  vitality,
  intelligence,
  magicPower,
  wins,
  losses,
  isVeteran,
}) => (
  <div className="bg-gray-800/30 p-4 rounded-lg border border-gray-700/30">
    <h2 className="text-xl font-bold text-white mb-4">Combat Stats</h2>
    <div className="space-y-3">
      <StatBar label="Strength" value={strength ?? 0} />
      <StatBar label="Defense" value={defense ?? 0} />
      <StatBar label="Agility" value={agility ?? 0} />
      <StatBar label="Vitality" value={vitality ?? 0} />
      <StatBar label="Intelligence" value={intelligence ?? 0} />
      <StatBar label="Magic Power" value={magicPower ?? 0} />
      <ValueStat label="Wins" value={wins ?? 0} />
      <ValueStat label="Losses" value={losses ?? 0} />
      <BooleanStat label="Veteran Status" value={isVeteran ?? false} />
    </div>
  </div>
)
const InventoryPanel = () => (
  <div className="bg-gray-800/30 p-4 h-full rounded-lg border border-gray-700/30">
    <h2 className="text-xl font-bold text-white mb-4">Equipment</h2>
    <div className="flex items-center justify-center">
      <span className="text-gray-400">Equipments coming soon...</span>
    </div>
    {/*} 
    <div className="grid grid-cols-2 gap-2">
    <InventoryItem name="Dragon Sword" rarity="Legendary" />
      <InventoryItem name="Shadow Armor" rarity="Epic" /> 
    </div>
*/}
  </div>
)

export const CharacterCardUI: React.FC<{ tokenId: string }> = ({ tokenId }) => {
  const chainId = useChainId()

  const characterCardContract = {
    address: CHARACTER_CARD_ADDRESS,
    abi: CHARACTER_CARD_ABI,
  } as const

  const { isConnected, address: playerAddress } = useAccount()
  const { isLoginPregenSession, pregenActiveAddress, isSmartAccount } =
    usePregenSession()
  const [searchTokenId, setSearchTokenId] = useState<number>(Number(tokenId))

  const [_tokenId, setTokenId] = useState<number>(Number(tokenId))
  const address = isConnected
    ? playerAddress?.toLowerCase()
    : isLoginPregenSession
    ? pregenActiveAddress?.toLowerCase()
    : undefined

  const { data: statsResult } = useReadContracts({
    config: config,
    contracts: [
      {
        ...characterCardContract,
        functionName: 'getEffectiveStrength',
        args: [_tokenId],
      },
      {
        ...characterCardContract,
        functionName: 'getEffectiveDefense',
        args: [_tokenId],
      },
      {
        ...characterCardContract,
        functionName: 'getEffectiveAgility',
        args: [_tokenId],
      },
      {
        ...characterCardContract,
        functionName: 'getEffectiveVitality',
        args: [_tokenId],
      },
      {
        ...characterCardContract,
        functionName: 'getEffectiveIntelligence',
        args: [_tokenId],
      },
      {
        ...characterCardContract,
        functionName: 'getEffectiveMagicPower',
        args: [_tokenId],
      },
      {
        ...characterCardContract,
        functionName: 'getCharacterStats',
        args: [_tokenId],
      },
      {
        ...characterCardContract,
        functionName: 'tokenURI',
        args: [_tokenId],
      },
      {
        ...characterCardContract,
        functionName: '_tokenIdCounter',
      },
    ],
  })
  useEffect(() => {
    console.log(_tokenId)
  }, [_tokenId])
  const { data: characterStats, refetch: refetchCharacterStats } =
    useReadContract({
      address: CHARACTER_CARD_ADDRESS,
      abi: CHARACTER_CARD_ABI,
      functionName: 'getCharacterStats',
      args: [_tokenId],
      query: {
        enabled: !!_tokenId,
        refetchInterval: 3000,
      },
    })

  console.log(characterStats)
  if (!statsResult) return null
  const effectiveStats = statsResult.map((stat) => stat.result)
  const characterStatsData = effectiveStats[6] as any
  console.log(effectiveStats, statsResult)
  return (
    <div className="p-6">
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-lg p-6 backdrop-blur-sm border border-gray-700/50">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
              {String(characterStatsData.id).toUpperCase()}
            </div>
            <div className="ml-4">
              <h1 className="text-2xl font-bold text-white">
                {characterStatsData.name} #{characterStatsData.id}
              </h1>
              <p className="text-blue-400">
                Elite{' '}
                {getCharacterClassLabel(characterStatsData.characterClass)}
              </p>
            </div>
          </div>
          <div className="flex items-center">
            <input
              type="text"
              value={searchTokenId ?? _tokenId}
              onChange={(e) => {
                setSearchTokenId(Number(e.target.value))
              }}
              className="w-48 bg-gray-700/50 rounded px-3 py-2 text-white border border-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Search..."
              inputMode="numeric"
              pattern="[0-9]*"
              onInput={(event) => {
                const input = event.target as HTMLInputElement
                input.value = input.value.replace(/[^0-9]/g, '')
              }}
            />
            <button
              onClick={() => {
                if (Number(searchTokenId)! > Number(effectiveStats[8])) return
                setTokenId(searchTokenId!)
              }}
              className="ml-2 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
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
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <StatsPanel
            strength={Number(effectiveStats[0])}
            defense={Number(effectiveStats[1])}
            agility={Number(effectiveStats[2])}
            vitality={Number(effectiveStats[3])}
            intelligence={Number(effectiveStats[4])}
            magicPower={Number(effectiveStats[5])}
            wins={Number((effectiveStats[6] as any).wins)}
            losses={Number((effectiveStats[6] as any).losses)}
            isVeteran={Boolean((effectiveStats[6] as any).isVeteran)}
          />
          <InventoryPanel />
        </div>
      </div>
    </div>
  )
}
