import React, { useState, useEffect } from 'react'
import {
  Settings,
  Search,
  Clock,
  Star,
  X,
  ChevronDown,
  Info,
  Zap,
  ArrowDownUp,
  Send,
  CreditCard,
  ArrowDown,
} from 'lucide-react'
import { useAccount } from 'wagmi'
import { NotWorking } from '@/app/components/apps/ControlPanel/components/Setting&Metrics'

interface Token {
  name: string
  symbol: string
  address: string
  iconText?: string
  iconBg?: string
}

interface TokenSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (token: Token) => void
}

interface SettingsPanelProps {
  isOpen: boolean
  onClose: () => void
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null

  return (
    <div className="absolute top-16 right-0 w-80 bg-gray-800 rounded-xl shadow-lg border border-gray-700/50 z-50 text-white backdrop-blur-sm">
      <div className="p-4 space-y-6">
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Zap className="text-blue-400" size={20} />
            <span className="text-blue-400 text-lg">RouteX</span>
          </div>
          <p className="text-gray-300 text-sm">
            When available, aggregates liquidity sources for better prices and
            gas free swaps.
            <a href="#" className="text-blue-400 ml-1 hover:text-blue-300">
              Learn more
            </a>
          </p>
          <div className="flex justify-end">
            <div className="w-14 h-7 flex items-center bg-blue-600 rounded-full p-1 cursor-pointer">
              <div className="bg-white w-5 h-5 rounded-full shadow-md transform translate-x-7"></div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-gray-300">Max. slippage</span>
              <Info size={14} className="text-gray-400" />
            </div>
            <button className="flex items-center space-x-1 bg-gray-700 rounded-full px-3 py-1 text-gray-300 hover:bg-gray-600 transition-colors">
              <span>Auto</span>
              <ChevronDown size={16} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-gray-300">Transaction deadline</span>
              <Info size={14} className="text-gray-400" />
            </div>
            <button className="flex items-center space-x-1 bg-gray-700 rounded-full px-3 py-1 text-gray-300 hover:bg-gray-600 transition-colors">
              <span>10m</span>
              <ChevronDown size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const TokenSelectionModal: React.FC<TokenSelectionModalProps> = ({
  isOpen,
  onClose,
  onSelect,
}) => {
  if (!isOpen) return null

  const tokens = {
    recent: [
      {
        name: 'Wrapped Ether',
        symbol: 'WETH',
        address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        iconText: 'WE',
      },
      {
        name: 'Alchemix ETH',
        symbol: 'ALETH',
        address: '0x3E29...5f04',
        iconText: 'AE',
      },
      {
        name: 'Wrapped Pulse from PulseChain',
        symbol: 'WPLS',
        address: '0xA882...d68A',
        iconText: 'WPL',
      },
      {
        name: '0xA107...9a27',
        symbol: '',
        address: '0xA107...9a27',
        iconText: '0x',
      },
    ],
    volume: [
      {
        name: 'Ethereum',
        symbol: 'ETH',
        address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
        iconBg: 'bg-blue-600',
      },
      {
        name: 'USDC',
        symbol: 'USDC',
        address: '0xA0b8...eB48',
        iconBg: 'bg-blue-500',
      },
      {
        name: 'Base ETH',
        symbol: 'ETH',
        address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
        iconBg: 'bg-blue-600',
      },
      { name: 'Tether', symbol: 'USDT', address: '', iconBg: 'bg-green-600' },
      {
        name: 'DAI',
        symbol: 'DAI',
        address: '0x6b175474e89094c44da98b954eedeac495271d0f',
        iconBg: 'bg-yellow-500',
      },
    ],
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-xl w-full max-w-sm max-h-[75vh] overflow-auto mx-4 shadow-xl border border-gray-700/50 text-white">
        <div className="p-4 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Select a token</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-200 hover:bg-gray-800 rounded-full p-1.5 transition-all"
            >
              <X size={20} />
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by name or paste address"
              className="w-full bg-gray-800 text-white rounded-xl pl-10 pr-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 border border-gray-700/50 transition-all"
            />
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex items-center text-gray-300 mb-3">
                <Clock size={16} className="mr-2" />
                <span className="text-base font-medium">Recent searches</span>
              </div>
              <div className="space-y-1.5">
                {tokens.recent.map((token) => (
                  <button
                    key={token.address}
                    onClick={() => onSelect(token)}
                    className="flex items-center w-full p-3 hover:bg-gray-800/70 rounded-xl transition-all group"
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center mr-3 text-white group-hover:scale-105 transition-transform">
                      {token.iconText}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-white text-base font-medium">
                        {token.name}
                      </div>
                      <div className="text-gray-400 text-xs flex items-center space-x-2">
                        {token.symbol && <span>{token.symbol}</span>}
                        <span className="font-mono">{token.address}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center text-gray-300 mb-3">
                <Star size={16} className="mr-2" />
                <span className="text-base font-medium">Popular tokens</span>
              </div>
              <div className="space-y-1.5">
                {tokens.volume.map((token) => (
                  <button
                    key={token.name + token.address}
                    onClick={() => onSelect(token)}
                    className="flex items-center w-full p-3 hover:bg-gray-800/70 rounded-xl transition-all group"
                  >
                    <div
                      className={`w-10 h-10 rounded-full ${token.iconBg} flex items-center justify-center mr-3 text-white text-lg font-bold group-hover:scale-105 transition-transform`}
                    >
                      {token.symbol.charAt(0)}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-white text-base font-medium">
                        {token.name}
                      </div>
                      <div className="text-gray-400 text-xs flex items-center space-x-2">
                        <span>{token.symbol}</span>
                        {token.address && (
                          <span className="font-mono">{token.address}</span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export const ProfileContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('Swap')
  const [sellAmount, setSellAmount] = useState<string>('0')
  const [sellToken, setSellToken] = useState<Token>({
    name: 'Ethereum',
    symbol: 'ETH',
    address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
  })
  const [buyToken, setBuyToken] = useState<Token | null>(null)
  const [showTokenModal, setShowTokenModal] = useState<boolean>(false)
  const [modalType, setModalType] = useState<'sell' | 'buy' | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const { address, chainId, isConnected } = useAccount()

  const tabs = [
    { id: 'Swap', icon: <ArrowDownUp size={18} /> },
    { id: 'Limit', icon: <Clock size={18} /> },
    { id: 'Send', icon: <Send size={18} /> },
    { id: 'Buy', icon: <CreditCard size={18} /> },
  ]

  const handleOpenModal = (type: 'sell' | 'buy') => {
    setModalType(type)
    setShowTokenModal(true)
  }

  const handleTokenSelect = (token: Token) => {
    if (modalType === 'sell') {
      setSellToken(token)
    } else {
      setBuyToken(token)
    }
    setShowTokenModal(false)
  }

  useEffect(() => {
    async function getPrice() {
      if (
        !isConnected ||
        sellAmount == undefined ||
        '' ||
        buyToken?.address == undefined
      )
        return
      console.log(buyToken, sellToken)

      const dParams = {
        chainId: chainId,
        sellToken: sellToken.address,
        buyToken: buyToken?.address,
        sellAmount: sellAmount,
        taker: address,
      }
      try {
        // const response = await fetch(`/api/price/route?${qs.stringify(dParams)}`);
        const response = await fetch(
          `/api/price/route?chainId=${chainId}&sellToken=${sellToken.address}&buyToken=${buyToken?.address}&sellAmount=${sellAmount}&taker=${address}`
        )

        const data = await response.json()
        console.log(data)
      } catch (error) {
        console.error('Error fetching price:', error)
      }
    }
    getPrice()
  }, [buyToken, sellToken, sellAmount, isConnected])

  const renderContent = () => {
    switch (activeTab) {
      case 'Swap':
        return (
          <div className="space-y-3">
            <div className="bg-gray-800/40 rounded-xl p-4 border border-gray-700/30">
              <div className="text-gray-400 mb-2 text-sm font-medium">Sell</div>
              <div className="flex justify-between items-center">
                <input
                  type="text"
                  value={sellAmount}
                  onChange={(e) => setSellAmount(e.target.value)}
                  className="bg-transparent text-3xl w-28 focus:outline-none text-white font-medium"
                  placeholder="0"
                />
                <button
                  onClick={() => handleOpenModal('sell')}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 transition-all text-white rounded-full px-4 py-2"
                >
                  <div className="w-6 h-6 bg-blue-800 rounded-full flex items-center justify-center text-xs">
                    {sellToken.symbol.charAt(0)}
                  </div>
                  <span className="text-sm font-medium">
                    {sellToken.symbol}
                  </span>
                  <ChevronDown size={16} />
                </button>
              </div>
              <div className="text-blue-400 mt-1 text-sm font-medium">
                ${(parseFloat(sellAmount || '0') * 2000).toFixed(2)}
              </div>
            </div>

            <div className="flex justify-center -my-2 z-10 relative">
              <button className="bg-gray-700 hover:bg-gray-600 transition-colors p-2 rounded-full border border-gray-600 shadow-lg">
                <ArrowDown size={20} className="text-blue-400" />
              </button>
            </div>

            <div className="bg-gray-800/40 rounded-xl p-4 border border-gray-700/30">
              <div className="text-gray-400 mb-2 text-sm font-medium">Buy</div>
              <div className="flex justify-between items-center">
                <input
                  type="text"
                  className="bg-transparent text-3xl w-28 focus:outline-none text-white font-medium"
                  placeholder="0"
                  readOnly
                />
                <button
                  onClick={() => handleOpenModal('buy')}
                  className="bg-blue-600 hover:bg-blue-700 transition-all text-white rounded-full px-4 py-2 text-sm font-medium flex items-center gap-2"
                >
                  {buyToken ? (
                    <>
                      <div className="w-6 h-6 bg-blue-800 rounded-full flex items-center justify-center text-xs">
                        {buyToken.symbol.charAt(0)}
                      </div>
                      <span>{buyToken.symbol}</span>
                    </>
                  ) : (
                    'Select token'
                  )}
                  <ChevronDown size={16} />
                </button>
              </div>
            </div>

            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl py-3 mt-3 transition-all shadow-lg shadow-blue-500/10">
              {isConnected ? 'Swap' : 'Connect wallet'}
            </button>
          </div>
        )
      case 'Limit':
        return (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <Clock size={48} className="text-gray-600 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Coming Soon</h3>
            <p className="text-gray-400 max-w-xs">
              Limit order functionality will be available in a future update.
              Stay tuned!
            </p>
          </div>
        )
      case 'Send':
        return (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <Send size={48} className="text-gray-600 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Coming Soon</h3>
            <p className="text-gray-400 max-w-xs">
              Send cryptocurrency functionality will be available in a future
              update. Stay tuned!
            </p>
          </div>
        )
      case 'Buy':
        return (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <CreditCard size={48} className="text-gray-600 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Coming Soon</h3>
            <p className="text-gray-400 max-w-xs">
              Buy cryptocurrency functionality will be available in a future
              update. Stay tuned!
            </p>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-full bg-gray-900 text-white p-6">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-6">
          Asset Management
        </h1>

        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-6 backdrop-blur-sm border border-gray-700/50 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div className="flex bg-gray-800 rounded-lg p-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  {tab.icon}
                  <span className="text-sm font-medium">{tab.id}</span>
                </button>
              ))}
            </div>
            <div className="relative">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <Settings size={20} />
              </button>
              <SettingsPanel
                isOpen={showSettings}
                onClose={() => setShowSettings(false)}
              />
            </div>
          </div>

          {renderContent()}
        </div>
        <div className="mt-6">
          <NotWorking isDarkMode={true} />
        </div>

        {/*}
        <div className="mt-6 bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-xl p-4 backdrop-blur-sm border border-gray-700/30 shadow-lg text-sm">
          <div className="flex justify-between items-center mb-3">
            <span className="text-gray-400">Route</span>
            <span className="text-blue-400 font-medium">Best price</span>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="flex -space-x-2 mr-3">
                <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-xs text-white border-2 border-gray-900 z-10">
                  U
                </div>
                <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-xs text-white border-2 border-gray-900">
                  S
                </div>
              </div>
              <span className="text-gray-300">Uniswap + SushiSwap</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-white font-medium">~$1,990.50</span>
              <span className="text-green-400 text-xs">Save $5.20 (0.26%)</span>
            </div>
          </div>

          <div className="border-t border-gray-700/50 mt-3 pt-3">
            <div className="flex justify-between text-gray-400">
              <span>Network fee</span>
              <span className="font-medium">~$2.50</span>
            </div>
          </div>
        </div>
*/}
        <TokenSelectionModal
          isOpen={showTokenModal}
          onClose={() => setShowTokenModal(false)}
          onSelect={handleTokenSelect}
        />
      </div>
    </div>
  )
}
