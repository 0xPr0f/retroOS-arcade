import React, { useState } from 'react'
import {
  Settings,
  Search,
  Clock,
  Star,
  X,
  ChevronDown,
  Info,
  Zap,
} from 'lucide-react'

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
    <div className="absolute top-16 right-0 w-80 bg-white rounded-2xl shadow-lg border border-gray-200 z-50">
      <div className="p-4 space-y-6">
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Zap className="text-blue-600" size={20} />
            <span className="text-blue-600 text-lg">UniswapX</span>
          </div>
          <p className="text-gray-600 text-sm">
            When available, aggregates liquidity sources for better prices and
            gas free swaps.
            <a href="#" className="text-blue-600 ml-1 hover:text-blue-700">
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
              <span className="text-gray-700">Max. slippage</span>
              <Info size={14} className="text-gray-500" />
            </div>
            <button className="flex items-center space-x-1 bg-gray-100 rounded-full px-3 py-1 text-gray-700 hover:bg-gray-200">
              <span>Auto</span>
              <ChevronDown size={16} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-gray-700">Transaction deadline</span>
              <Info size={14} className="text-gray-500" />
            </div>
            <button className="flex items-center space-x-1 bg-gray-100 rounded-full px-3 py-1 text-gray-700 hover:bg-gray-200">
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
        address: '0x4200...0006',
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
      { name: 'Ethereum', symbol: 'ETH', address: '', iconBg: 'bg-blue-600' },
      {
        name: 'USDC',
        symbol: 'USDC',
        address: '0xA0b8...eB48',
        iconBg: 'bg-blue-600',
      },
      { name: 'Base ETH', symbol: 'ETH', address: '', iconBg: 'bg-blue-600' },
      { name: 'Tether', symbol: 'USDT', address: '', iconBg: 'bg-red-600' },
    ],
  }

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-sm max-h-[75vh] overflow-auto mx-4 shadow-xl border border-gray-200">
        <div className="p-4 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">Select a token</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full p-1.5 transition-all"
            >
              <X size={20} />
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-3 flex items-center">
              <Search size={16} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by name or paste address"
              className="w-full bg-gray-50 text-gray-900 rounded-xl pl-10 pr-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
            />
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex items-center text-gray-600 mb-3">
                <Clock size={16} className="mr-2" />
                <span className="text-base font-medium">Recent searches</span>
              </div>
              <div className="space-y-1.5">
                {tokens.recent.map((token) => (
                  <button
                    key={token.address}
                    onClick={() => onSelect(token)}
                    className="flex items-center w-full p-3 hover:bg-gray-50 rounded-xl transition-all group"
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center mr-3 text-white group-hover:scale-105 transition-transform">
                      {token.iconText}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-gray-900 text-base font-medium">
                        {token.name}
                      </div>
                      <div className="text-gray-500 text-xs flex items-center space-x-2">
                        {token.symbol && <span>{token.symbol}</span>}
                        <span className="font-mono">{token.address}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center text-gray-600 mb-3">
                <Star size={16} className="mr-2" />
                <span className="text-base font-medium">Popular tokens</span>
              </div>
              <div className="space-y-1.5">
                {tokens.volume.map((token) => (
                  <button
                    key={token.name + token.address}
                    onClick={() => onSelect(token)}
                    className="flex items-center w-full p-3 hover:bg-gray-50 rounded-xl transition-all group"
                  >
                    <div
                      className={`w-10 h-10 rounded-full ${token.iconBg} flex items-center justify-center mr-3 text-white text-lg font-bold group-hover:scale-105 transition-transform`}
                    >
                      {token.symbol.charAt(0)}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-gray-900 text-base font-medium">
                        {token.name}
                      </div>
                      <div className="text-gray-500 text-xs flex items-center space-x-2">
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
    address: '',
  })
  const [buyToken, setBuyToken] = useState<Token | null>(null)
  const [showTokenModal, setShowTokenModal] = useState<boolean>(false)
  const [modalType, setModalType] = useState<'sell' | 'buy' | null>(null)
  const [showSettings, setShowSettings] = useState(false)

  const tabs = ['Swap', 'Limit', 'Send', 'Buy']

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

  const renderContent = () => {
    switch (activeTab) {
      case 'Swap':
        return (
          <div className="space-y-3">
            <div className="bg-white rounded-2xl p-4 shadow-md">
              <div className="text-gray-600 mb-2 text-sm font-medium">Sell</div>
              <div className="flex justify-between items-center">
                <input
                  type="text"
                  value={sellAmount}
                  onChange={(e) => setSellAmount(e.target.value)}
                  className="bg-transparent text-3xl w-28 focus:outline-none text-gray-900 font-medium"
                  placeholder="0"
                />
                <button
                  onClick={() => handleOpenModal('sell')}
                  className="flex items-center bg-blue-600 rounded-full px-4 py-2 space-x-2 hover:bg-blue-700 transition-all text-white"
                >
                  <div className="w-6 h-6 bg-white rounded-full"></div>
                  <span className="text-sm font-medium">
                    {sellToken.symbol}
                  </span>
                  <span>▼</span>
                </button>
              </div>
              <div className="text-gray-500 mt-1 text-sm">
                ${(parseFloat(sellAmount || '0') * 2000).toFixed(2)}
              </div>
            </div>

            <div className="flex justify-center">
              <div className="bg-white p-2 rounded-lg shadow-md">
                <span className="text-blue-600">↓</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-md">
              <div className="text-gray-600 mb-2 text-sm font-medium">Buy</div>
              <div className="flex justify-between items-center">
                <input
                  type="text"
                  className="bg-transparent text-3xl w-28 focus:outline-none text-gray-900 font-medium"
                  placeholder="0"
                  readOnly
                />
                <button
                  onClick={() => handleOpenModal('buy')}
                  className="bg-blue-600 hover:bg-blue-700 transition-all text-white rounded-full px-4 py-2 text-sm font-medium"
                >
                  {buyToken ? buyToken.symbol : 'Select token'} ▼
                </button>
              </div>
            </div>

            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl py-3 mt-3 transition-all shadow-lg shadow-blue-500/20">
              Connect wallet
            </button>
          </div>
        )
      case 'Limit':
        return (
          <div className="text-gray-600 p-3 text-sm">
            Limit order interface coming soon
          </div>
        )
      case 'Send':
        return (
          <div className="text-gray-600 p-3 text-sm">
            Send cryptocurrency interface coming soon
          </div>
        )
      case 'Buy':
        return (
          <div className="text-gray-600 p-3 text-sm">
            Buy cryptocurrency interface coming soon
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="px-6 pt-6">
      <h1 className="text-2xl font-semibold text-[#2563eb]">
        Asset Management
      </h1>
      <div className="max-w-md mx-auto bg-white text-gray-900 p-4 rounded-2xl shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex space-x-4">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-full transition-colors ${
                  activeTab === tab
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="relative">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="text-gray-600 hover:text-gray-800 p-2 rounded-full hover:bg-gray-100 transition-colors"
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

        <TokenSelectionModal
          isOpen={showTokenModal}
          onClose={() => setShowTokenModal(false)}
          onSelect={handleTokenSelect}
        />
      </div>
    </div>
  )
}
