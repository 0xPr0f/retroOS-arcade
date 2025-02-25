import { useState, useEffect, useRef } from 'react'
import { Alchemy, AssetTransfersCategory, Network } from 'alchemy-sdk'
import { useAccount, useChainId } from 'wagmi'
import { formatEther, zeroAddress } from 'viem'
import {
  copyToClipboard,
  shortenText,
  usePregenSession,
  useTypedValue,
} from '@/components/pc/drives'
import {
  Check,
  Copy,
  ChevronDown,
  ExternalLink,
  Wallet,
  Shield,
  Eye,
  Repeat,
  CreditCard,
  Github,
  Search,
} from 'lucide-react'

const NETWORK_CONFIG: Record<
  string,
  { name: string; color: string; icon: string }
> = {
  [Network.ETH_MAINNET]: { name: 'Ethereum', color: '#627EEA', icon: '' },
  [Network.BASE_SEPOLIA]: {
    name: 'Base Sepolia',
    color: '#0052FF',
    icon: '',
  },
  [Network.ETH_SEPOLIA]: { name: 'Sepolia', color: '#627EEA', icon: '' },
}

const AuraEffect = ({
  children,
  type = 'blue',
}: {
  children: React.ReactNode
  type?: 'blue' | 'purple' | 'green' | 'orange'
}) => {
  const auraColors = {
    blue: 'from-blue-500/20 to-blue-700/20',
    purple: 'from-purple-500/20 to-purple-700/20',
    green: 'from-green-500/20 to-green-700/20',
    orange: 'from-orange-500/20 to-red-500/20',
  }

  return (
    <div className="relative">
      <div
        className="absolute -inset-1 rounded-lg bg-gradient-to-r blur-sm animate-pulse"
        style={{
          backgroundImage: `linear-gradient(to right, ${
            type === 'blue'
              ? '#3b82f620, #1d4ed820'
              : type === 'purple'
              ? '#8b5cf620, #6d28d920'
              : type === 'green'
              ? '#10b98120, #04785720'
              : '#f59e0b20, #ef444420'
          })`,
        }}
      />
      <div className="relative">{children}</div>
    </div>
  )
}

export function HomeContent() {
  const [account, setAccount] = useState<string | null>(null)
  const [balance, setBalance] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [tLoading, setTLoading] = useState(false)
  const [nLoading, setNLoading] = useState(false)
  const [tokens, setTokens] = useState<any[]>([])
  const [nfts, setNfts] = useState<any[]>([])
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState('tokens')
  const [showNetworkDropdown, setShowNetworkDropdown] = useState(false)
  const [showAccountsDropdown, setShowAccountsDropdown] = useState(false)
  const [tokenMetrics, setTokenMetrics] = useState({
    totalValue: 0,
    tokenCount: 0,
  })
  const [transactionHistory, setTransactionHistory] = useState<any[]>([])
  const [tHistoryLoading, setTHistoryLoading] = useState(false)
  const [containerWidth, setContainerWidth] = useState(1200) // Default width
  const [searchAddress, setSearchAddress] = useState('')
  const [addressToSearch, setAddressToSearch] =
    useTypedValue<string>('searchAddress')

  const { address: UserAddress, isConnected } = useAccount()

  const [network, setNetwork] = useTypedValue('wallet_network')
  const [settings, setSettings] = useState({
    apiKey: 'y_eQkk-xNUDYHBLvXhoipyEWcrq04D3D',
    network: network as Network,
  })
  const [alchemy, setAlchemy] = useState(new Alchemy(settings))
  const chainId = useChainId()
  const {
    isLoginPregenSession,
    pregenActiveAddress,
    pregenSmartAccountAddress,
    pregenAddress,
    isSmartAccount,
  } = usePregenSession()

  useEffect(() => {
    if (!network) setNetwork(Network.BASE_SEPOLIA)
  }, [network])
  const accounts = isConnected
    ? [
        {
          address: UserAddress?.toLowerCase() || zeroAddress,
          name: 'Main Wallet',
          icon: <Wallet className="h-4 w-4" />,
          isActive: true,
        },
      ]
    : isLoginPregenSession
    ? [
        {
          address: pregenAddress?.toLowerCase() || zeroAddress,
          name: 'Main Wallet',
          icon: <Wallet className="h-4 w-4" />,
          isActive: true,
        },
        {
          address: pregenSmartAccountAddress?.toLowerCase() || zeroAddress,
          name: 'Smart Account',
          icon: <Shield className="h-4 w-4" />,
          isActive: isLoginPregenSession,
        },
      ]
    : [
        {
          address: zeroAddress,
          name: 'Main Wallet',
          icon: <Wallet className="h-4 w-4" />,
          isActive: true,
        },
      ]

  const [selectedAccount, setSelectedAccount] = useState(
    isConnected ? accounts[0] : isLoginPregenSession ? accounts[1] : accounts[0]
  )

  const address = selectedAccount.address
  useEffect(() => {
    const currentAddress = isConnected
      ? UserAddress?.toLowerCase()
      : isLoginPregenSession
      ? pregenActiveAddress?.toLowerCase()
      : undefined

    if (currentAddress && !addressToSearch) {
      setSearchAddress(currentAddress)
      setAddressToSearch(currentAddress)
      return
    }
    setSearchAddress(addressToSearch!)
    setAddressToSearch(addressToSearch!)
  }, [UserAddress, pregenActiveAddress, isConnected, isLoginPregenSession])

  useEffect(() => {
    const newSettings = {
      apiKey: settings.apiKey,
      network: network as Network,
    }
    setSettings(newSettings)
    setAlchemy(new Alchemy(newSettings))
  }, [network])

  useEffect(() => {
    if (!addressToSearch) return

    async function fetchAccount() {
      if (!addressToSearch) return
      try {
        const balance = await alchemy.core.getBalance(addressToSearch, 'latest')
        setBalance(formatEther(BigInt(balance.toString())))
        setAccount(addressToSearch)
        fetchTokens(addressToSearch)
        fetchNFTs(addressToSearch)
        fetchTransactionHistory(addressToSearch)
      } catch (error) {
        console.error('Error fetching account:', error)
      }
    }

    async function fetchTokens(address: string) {
      setTLoading(true)
      let tokenData = []
      let totalValue = 0
      try {
        const response = await alchemy.core.getTokenBalances(address)

        const nonZeroBalances = response.tokenBalances.filter((token) => {
          return token.tokenBalance !== '0'
        })

        for (let token of nonZeroBalances) {
          const balance = token.tokenBalance
          const metadata = await alchemy.core.getTokenMetadata(
            token.contractAddress
          )

          // Mock price between $0.01 and $2000
          const mockPrice = Math.random() * 2000 + 0.01

          const fbalance = balance
            ? (Number(balance) / Math.pow(10, metadata.decimals ?? 18)).toFixed(
                2
              )
            : '0'

          if (!metadata.name || !metadata.symbol) continue

          const tokenValue = parseFloat(fbalance) * mockPrice
          totalValue += tokenValue

          const data = {
            name: metadata.name,
            balance: fbalance,
            symbol: metadata.symbol,
            logo: metadata.logo || null,
            value: tokenValue.toFixed(2),
            price: mockPrice.toFixed(2),
            change: (Math.random() * 20 - 10).toFixed(2), // Random change between -10% and +10%
          }

          tokenData.push(data)
        }
        setTokenMetrics({
          totalValue: parseFloat(totalValue.toFixed(2)),
          tokenCount: tokenData.length,
        })

        setTokens(tokenData)
      } catch (error) {
        console.error('Error fetching tokens:', error)
      }
      setTLoading(false)
    }

    async function fetchNFTs(address: string) {
      setNLoading(true)
      try {
        const nfts = await alchemy.nft.getNftsForOwner(address)
        setNfts(nfts.ownedNfts)
      } catch (error) {
        console.error('Error fetching NFTs:', error)
      }
      setNLoading(false)
    }

    async function fetchTransactionHistory(address: string) {
      setTHistoryLoading(true)
      try {
        // Get the last 10 transactions
        const txs = await alchemy.core.getAssetTransfers({
          fromBlock: '0x0',
          fromAddress: address,
          category: [
            AssetTransfersCategory.EXTERNAL,
            AssetTransfersCategory.INTERNAL,
            AssetTransfersCategory.ERC20,
            AssetTransfersCategory.ERC721,
            AssetTransfersCategory.ERC1155,
          ],
          maxCount: 10,
        })

        setTransactionHistory(txs.transfers)
      } catch (error) {
        console.error('Error fetching transaction history:', error)
      }
      setTHistoryLoading(false)
    }

    fetchAccount()
  }, [addressToSearch, alchemy, chainId])

  const handleNetworkChange = (newNetwork: Network) => {
    setNetwork(newNetwork)
    setShowNetworkDropdown(false)
  }

  const handleAccountChange = (account: (typeof accounts)[0]) => {
    setSelectedAccount(account)
    setShowAccountsDropdown(false)
    setSearchAddress(account.address)
    setAddressToSearch(account.address)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchAddress && searchAddress.startsWith('0x')) {
      setAddressToSearch(searchAddress)
    }
  }

  const formatTimestamp = (timestamp: number) => {
    if (!timestamp) return ''
    const date = new Date(timestamp)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
  }

  const getTxTypeIcon = (category: string) => {
    switch (category) {
      case 'external':
        return <Repeat className="w-4 h-4" />
      case 'internal':
        return <Wallet className="w-4 h-4" />
      case 'erc20':
        return <CreditCard className="w-4 h-4" />
      case 'erc721':
      case 'erc1155':
        return <Eye className="w-4 h-4" />
      default:
        return <Repeat className="w-4 h-4" />
    }
  }

  // Add refs for handling outside clicks
  const networkDropdownRef = useRef<HTMLDivElement>(null)
  const accountsDropdownRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Handle outside clicks for dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        networkDropdownRef.current &&
        !networkDropdownRef.current.contains(event.target as Node)
      ) {
        setShowNetworkDropdown(false)
      }
      if (
        accountsDropdownRef.current &&
        !accountsDropdownRef.current.contains(event.target as Node)
      ) {
        setShowAccountsDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Monitor container width for responsive layout
  useEffect(() => {
    if (!containerRef.current) return

    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth)
      }
    }

    // Initial width
    updateWidth()

    // Set up resize observer
    const resizeObserver = new ResizeObserver(updateWidth)
    resizeObserver.observe(containerRef.current)

    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current)
      }
    }
  }, [])

  return (
    <div
      className="bg-gray-900 text-white p-4 md:p-6"
      ref={containerRef}
      data-resizable
    >
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex flex-col md:flex-row justify-end items-start md:items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="relative" ref={networkDropdownRef}>
              <button
                className="px-3 py-1.5 bg-gray-800 rounded-lg flex items-center gap-2 hover:bg-gray-700 transition-colors text-sm"
                onClick={() => setShowNetworkDropdown(!showNetworkDropdown)}
              >
                <span className="text-base">
                  {NETWORK_CONFIG[network as keyof typeof NETWORK_CONFIG]
                    ?.icon || '🌐'}
                </span>
                <span>
                  {NETWORK_CONFIG[network as keyof typeof NETWORK_CONFIG]
                    ?.name || 'Network'}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform ${
                    showNetworkDropdown ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {showNetworkDropdown && (
                <div className="absolute right-0 mt-1 w-52 bg-gray-800 rounded-lg shadow-xl z-10 overflow-hidden animate-slideIn">
                  {Object.entries(NETWORK_CONFIG).map(([netKey, netInfo]) => (
                    <button
                      key={netKey}
                      className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-gray-700 transition-colors text-sm"
                      onClick={() => handleNetworkChange(netKey as Network)}
                    >
                      <span className="text-base">{netInfo.icon}</span>
                      <span>{netInfo.name}</span>
                      {network === netKey && (
                        <Check className="w-3.5 h-3.5 ml-auto" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Accounts Dropdown */}
            <div className="relative" ref={accountsDropdownRef}>
              <AuraEffect type={isSmartAccount ? 'purple' : 'blue'}>
                <button
                  className="px-3 py-1.5 bg-gray-800 rounded-lg flex items-center gap-2 hover:bg-gray-700 transition-colors text-sm"
                  onClick={() => setShowAccountsDropdown(!showAccountsDropdown)}
                >
                  {selectedAccount.icon}
                  <span>{selectedAccount.name}</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform ${
                      showAccountsDropdown ? 'rotate-180' : ''
                    }`}
                  />
                </button>
              </AuraEffect>

              {showAccountsDropdown && (
                <div className="absolute right-0 mt-1 w-60 bg-gray-800 rounded-lg shadow-xl z-10 overflow-hidden animate-slideIn">
                  {accounts.map((acc, index) => (
                    <button
                      key={index}
                      className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-gray-700 transition-colors text-sm"
                      onClick={() => handleAccountChange(acc)}
                    >
                      {acc.icon}
                      <div className="flex flex-col">
                        <span className="font-medium">{acc.name}</span>
                        <span className="text-xs text-gray-400">
                          {shortenText(acc.address!, 6, 4)}
                        </span>
                      </div>
                      {acc.address === selectedAccount.address && (
                        <Check className="w-3.5 h-3.5 ml-auto" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="mb-5">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchAddress}
                onChange={(e) => setSearchAddress(e.target.value)}
                placeholder="Enter wallet address (0x...)"
                className="w-full pl-9 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white text-sm"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors text-sm"
            >
              Search
            </button>
          </form>
          {addressToSearch !== searchAddress && (
            <p className="text-xs text-gray-400 mt-1.5">
              Showing results for: {shortenText(addressToSearch!, 8, 8)}
            </p>
          )}
        </div>

        {/* Main Content - Responsive Grid */}
        <div
          className={`grid ${
            containerWidth < 750 ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-3'
          } gap-6`}
        >
          {/* Left Column - Account Overview */}
          <div className="col-span-1">
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-5 backdrop-blur-sm border border-gray-700/50 shadow-lg mb-6">
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-xl font-bold mb-3">
                  {selectedAccount.name.charAt(0)}
                </div>

                <h2 className="text-lg font-bold mb-1">
                  {selectedAccount.name}
                </h2>

                <div className="flex items-center mb-4 bg-gray-800/50 px-3 py-1.5 gap-2 rounded-full">
                  <span className="text-gray-300 text-sm">
                    {shortenText(address!, 8, 6)}
                  </span>
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-green-500" />
                  ) : (
                    <Copy
                      className="w-3.5 h-3.5 cursor-pointer text-gray-400 hover:text-white transition-colors"
                      onClick={() => {
                        copyToClipboard(address!)
                        setCopied(true)
                        setTimeout(() => setCopied(false), 2000)
                      }}
                    />
                  )}
                </div>

                <div className="w-full px-4 py-4 bg-gray-800/50 rounded-xl border border-gray-700/30 mb-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-gray-400 text-sm">Balance</span>
                    <span className="text-gray-400 text-xs">
                      {NETWORK_CONFIG[network as keyof typeof NETWORK_CONFIG]
                        ?.icon || '🌐'}{' '}
                      {
                        NETWORK_CONFIG[network as keyof typeof NETWORK_CONFIG]
                          ?.name
                      }
                    </span>
                  </div>
                  <div className="text-xl font-bold">
                    {balance
                      ? `${parseFloat(balance).toFixed(4)} ETH`
                      : 'Loading...'}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {balance
                      ? `$${(parseFloat(balance) * 3500).toFixed(2)} USD`
                      : ''}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 w-full">
                  <div className="bg-gray-800/30 rounded-lg p-3 border border-gray-700/30">
                    <div className="text-gray-400 text-xs mb-1">Tokens</div>
                    <div className="font-bold text-lg">
                      {tokenMetrics.tokenCount}
                    </div>
                  </div>
                  <div className="bg-gray-800/30 rounded-lg p-3 border border-gray-700/30">
                    <div className="text-gray-400 text-xs mb-1">NFTs</div>
                    <div className="font-bold text-lg">{nfts.length}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Transaction History */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-5 backdrop-blur-sm border border-gray-700/50 shadow-lg">
              <h2 className="text-lg font-bold mb-3 flex items-center">
                <Repeat className="mr-2 h-4 w-4 text-blue-400" />
                Recent Transactions
              </h2>

              {tHistoryLoading ? (
                <div className="flex justify-center py-6">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : transactionHistory.length > 0 ? (
                <div className="space-y-2 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                  {transactionHistory.map((tx, index) => (
                    <div
                      key={index}
                      className="bg-gray-800/30 rounded-lg p-2.5 border border-gray-700/30 flex items-center"
                    >
                      <div className="mr-2.5 p-1.5 bg-gray-700/50 rounded-lg">
                        {getTxTypeIcon(tx.category)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <div className="text-xs font-semibold truncate max-w-[150px]">
                            {tx.category.charAt(0).toUpperCase() +
                              tx.category.slice(1)}
                          </div>
                          <div className="text-xs text-gray-400">
                            {tx.asset && tx.value
                              ? `${parseFloat(tx.value).toFixed(4)} ${tx.asset}`
                              : ''}
                          </div>
                        </div>
                        <div className="text-xs text-gray-400 truncate">
                          {tx.hash ? shortenText(tx.hash, 8, 8) : ''}
                        </div>
                      </div>
                      <a
                        href={`https://sepolia.basescan.org/tx/${tx.hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 text-gray-400 hover:text-gray-100 transition-colors"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-center py-6 text-sm">
                  No recent transactions found
                </p>
              )}
            </div>
          </div>

          {/* Middle & Right Columns - Tokens & NFTs */}
          <div
            className={`${
              containerWidth < 750 ? 'col-span-1' : 'col-span-1 lg:col-span-2'
            }`}
          >
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl backdrop-blur-sm border border-gray-700/50 shadow-lg overflow-hidden">
              <div className="flex border-b border-gray-700/50">
                {['tokens', 'nfts'].map((tab) => (
                  <button
                    key={tab}
                    className={`flex-1 px-4 py-3 font-medium transition-colors ${
                      activeTab === tab
                        ? 'text-blue-400 border-b-2 border-blue-400 bg-gray-800/30'
                        : 'text-gray-400 hover:text-gray-200'
                    }`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab === 'tokens' ? (
                      <span className="flex items-center justify-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        Tokens
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <Eye className="h-4 w-4" />
                        NFTs
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <div className="p-4">
                {activeTab === 'tokens' && (
                  <div>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-4">
                      <h3 className="text-lg font-bold">Token Portfolio</h3>
                      <div className="bg-gray-800/50 px-3 py-1.5 rounded-lg border border-gray-700/30">
                        <span className="text-gray-400 text-xs">
                          Total Value:
                        </span>
                        <span className="ml-2 font-semibold">
                          ${tokenMetrics.totalValue}
                        </span>
                      </div>
                    </div>

                    {tLoading ? (
                      <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                      </div>
                    ) : tokens.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="text-gray-400 text-xs">
                            <tr>
                              <th className="text-left py-2 px-3">Token</th>
                              <th className="text-right py-2 px-3">Price</th>
                              <th className="text-right py-2 px-3">Balance</th>
                              <th className="text-right py-2 px-3">Value</th>
                              <th className="text-right py-2 px-3">Change</th>
                            </tr>
                          </thead>
                          <tbody>
                            {tokens.map((token, index) => (
                              <tr
                                key={index}
                                className="border-t border-gray-800 hover:bg-gray-800/30 transition-colors"
                              >
                                <td className="py-3 px-3">
                                  <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 bg-gray-700 rounded-full flex items-center justify-center overflow-hidden">
                                      {token.logo ? (
                                        <img
                                          src={token.logo}
                                          alt={token.symbol}
                                          className="w-full h-full object-cover"
                                        />
                                      ) : (
                                        <span className="text-xs font-bold">
                                          {token.symbol?.charAt(0)}
                                        </span>
                                      )}
                                    </div>
                                    <div>
                                      <div className="font-medium text-sm">
                                        {token.name}
                                      </div>
                                      <div className="text-gray-400 text-xs">
                                        {token.symbol}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-3 px-3 text-right text-sm">
                                  <div>${token.price}</div>
                                </td>
                                <td className="py-3 px-3 text-right text-sm">
                                  <div>{token.balance}</div>
                                  <div className="text-gray-400 text-xs">
                                    {token.symbol}
                                  </div>
                                </td>
                                <td className="py-3 px-3 text-right font-medium text-sm">
                                  ${token.value}
                                </td>
                                <td className="py-3 px-3 text-right text-sm">
                                  <span
                                    className={`${
                                      parseFloat(token.change) >= 0
                                        ? 'text-green-400'
                                        : 'text-red-400'
                                    }`}
                                  >
                                    {parseFloat(token.change) >= 0 ? '+' : ''}
                                    {token.change}%
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-12 text-gray-400">
                        <div className="mb-3">
                          <CreditCard className="h-10 w-10 mx-auto text-gray-500" />
                        </div>
                        <p className="text-base">
                          No tokens found for this account
                        </p>
                        <p className="text-xs mt-2">
                          Tokens will appear here once detected by Alchemy
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'nfts' && (
                  <div>
                    <h3 className="text-lg font-bold mb-4">NFT Gallery</h3>

                    {nLoading ? (
                      <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                      </div>
                    ) : nfts.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {nfts?.map((nft, index) => {
                          if (!nft) return null
                          return (
                            <div
                              key={index}
                              className="group relative bg-gray-800 rounded-xl overflow-hidden shadow-lg border border-gray-700/30"
                              style={{ height: '170px', width: '100%' }}
                              onMouseEnter={() => setHoveredIndex(index)}
                              onMouseLeave={() => setHoveredIndex(null)}
                            >
                              {nft.image?.pngUrl ? (
                                <img
                                  src={nft.image.pngUrl}
                                  alt={
                                    nft.name || nft.collection?.name || 'NFT'
                                  }
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800">
                                  <span className="text-3xl opacity-50">
                                    🖼️
                                  </span>
                                </div>
                              )}

                              {/* NFT info overlay on hover */}
                              <div
                                className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-3 flex flex-col justify-between transition-opacity duration-300 ${
                                  hoveredIndex === index
                                    ? 'opacity-100'
                                    : 'opacity-0 group-hover:opacity-100'
                                }`}
                              >
                                <div>
                                  {nft.collection?.name && (
                                    <div className="text-xs text-gray-400 mb-0.5">
                                      {nft.collection.name}
                                    </div>
                                  )}
                                  <h3 className="font-bold text-base truncate">
                                    {nft.name || 'Unnamed NFT'}
                                  </h3>
                                </div>

                                <div>
                                  <div className="flex justify-between text-xs text-gray-300">
                                    <span>Token ID:</span>
                                    <span className="font-mono">
                                      {nft.tokenId && nft.tokenId.length > 8
                                        ? '#' +
                                          nft.tokenId.substring(0, 4) +
                                          '...' +
                                          nft.tokenId.substring(
                                            nft.tokenId.length - 4
                                          )
                                        : '#' + nft.tokenId}
                                    </span>
                                  </div>
                                  {nft.tokenType && (
                                    <div className="flex justify-between text-xs text-gray-300 mt-0.5">
                                      <span>Type:</span>
                                      <span>{nft.tokenType}</span>
                                    </div>
                                  )}
                                  <button className="mt-2 w-full py-1.5 bg-blue-500/20 hover:bg-blue-500/40 border border-blue-500/40 rounded-lg text-blue-400 text-xs transition-colors flex items-center justify-center gap-1">
                                    <ExternalLink className="h-3 w-3" />
                                    View Details
                                  </button>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-gray-400">
                        <div className="mb-3">
                          <Eye className="h-10 w-10 mx-auto text-gray-500" />
                        </div>
                        <p className="text-base">
                          No NFTs found for this account
                        </p>
                        <p className="text-xs mt-2">
                          NFTs will appear here once detected by Alchemy
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(31, 41, 55, 0.5);
          border-radius: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.5);
          border-radius: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.7);
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slideIn {
          animation: slideIn 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  )
}
