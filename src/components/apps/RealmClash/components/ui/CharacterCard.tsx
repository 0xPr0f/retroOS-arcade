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
  <div className="bg-gray-800/30 p-4 h-fit mt-3 rounded-lg border border-gray-700/30">
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

  const { data: statsResult, isLoading } = useReadContracts({
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
  const [currentOriginIndex, setCurrentOriginIndex] = useState(0)
  const [metadata, setMetadata] = useState<{
    name?: string
    description?: string
    image?: string
  } | null>(null)

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

  useEffect(() => {
    const fetchMetadata = async () => {
      if (!statsResult || !statsResult[7] || !statsResult[7].result) return

      try {
        const tokenUrl = statsResult[7].result as string
        if (typeof tokenUrl !== 'string' || tokenUrl.length < 25) return

        const metadataUrl = getUrlWithCurrentOrigin(tokenUrl)
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
  }, [statsResult, currentOriginIndex])

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-lg p-6 backdrop-blur-sm border border-gray-700/50">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <div className="w-20 h-20 rounded-full bg-gray-700/50 animate-pulse"></div>
              <div className="ml-4">
                <div className="h-8 w-48 bg-gray-700/50 rounded animate-pulse mb-2"></div>
                <div className="h-5 w-32 bg-gray-700/50 rounded animate-pulse"></div>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-48 h-10 bg-gray-700/50 rounded animate-pulse"></div>
              <div className="ml-2 w-10 h-10 bg-gray-700/50 rounded animate-pulse"></div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-800/30 p-4 rounded-lg border border-gray-700/30">
              <div className="h-8 w-40 bg-gray-700/50 rounded animate-pulse mb-4"></div>
              <div className="space-y-3">
                {[...Array(9)].map((_, i) => (
                  <div
                    key={i}
                    className="h-6 bg-gray-700/50 rounded animate-pulse"
                  ></div>
                ))}
              </div>
            </div>
            <div className="bg-gray-800/30 p-4 h-full rounded-lg border border-gray-700/30">
              <div className="h-8 w-40 bg-gray-700/50 rounded animate-pulse mb-4"></div>
              <div className="space-y-4">
                {/* Image placeholder */}
                <div className="flex justify-center">
                  <div className="h-48 w-48 bg-gray-700/50 rounded animate-pulse"></div>
                </div>
                {/* Description placeholder */}
                <div className="mt-4">
                  <div className="h-5 w-24 bg-gray-700/50 rounded animate-pulse mb-2"></div>
                  <div className="space-y-2">
                    <div className="h-4 w-full bg-gray-700/50 rounded animate-pulse"></div>
                    <div className="h-4 w-full bg-gray-700/50 rounded animate-pulse"></div>
                    <div className="h-4 w-3/4 bg-gray-700/50 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!statsResult || !statsResult[6] || !statsResult[6].result) {
    return (
      <div className="p-6">
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-lg p-6 backdrop-blur-sm border border-gray-700/50">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 mx-auto text-gray-500 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h2 className="text-xl font-bold text-white mb-2">
                No Data Found
              </h2>
              <p className="text-gray-400">
                This character does not exist or has no data available.
              </p>
              <div className="mt-6 flex justify-center">
                <input
                  type="text"
                  value={searchTokenId ?? _tokenId}
                  onChange={(e) => {
                    setSearchTokenId(Number(e.target.value))
                  }}
                  className="w-48 bg-gray-700/50 rounded px-3 py-2 text-white border border-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Search token ID..."
                  inputMode="numeric"
                  pattern="[0-9]*"
                  onInput={(event) => {
                    const input = event.target as HTMLInputElement
                    input.value = input.value.replace(/[^0-9]/g, '')
                  }}
                />
                <button
                  onClick={() => {
                    if (
                      statsResult &&
                      statsResult[8] &&
                      Number(searchTokenId)! > Number(statsResult[8].result)
                    )
                      return
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
          </div>
        </div>
      </div>
    )
  }

  const effectiveStats = (statsResult as any).map((stat: any) => stat.result)
  const characterStatsData = effectiveStats[6]

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
          <div>
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

          <div className="bg-gray-800/30 p-4 h-full rounded-lg border border-gray-700/30">
            <h3 className="text-xl font-semibold text-white mb-4">
              Character Details
            </h3>
            <div className="space-y-4">
              {metadata?.image && (
                <div className="flex justify-center">
                  <img
                    src={getUrlWithCurrentOrigin(metadata.image)}
                    alt={characterStatsData.name}
                    className="max-h-48 object-contain rounded-md"
                    onError={handleImageError}
                  />
                </div>
              )}
              {metadata?.description && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-400 mb-1">
                    Description
                  </h4>
                  <p className="text-sm text-gray-300">
                    {metadata.description}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
