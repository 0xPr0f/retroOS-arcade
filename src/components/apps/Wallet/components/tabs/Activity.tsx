'use client'
import { useState, useEffect, useRef } from 'react'
import { useAccount, useChainId } from 'wagmi'
import { Alchemy, Network, AssetTransfersCategory } from 'alchemy-sdk'
import {
  Check,
  Copy,
  ExternalLink,
  ChevronDown,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  Repeat,
  Filter,
  Wallet,
  Shield,
  Search,
} from 'lucide-react'
import {
  copyToClipboard,
  shortenText,
  usePregenSession,
  useTypedValue,
} from '@/components/pc/drives'
import { zeroAddress } from 'viem'
import { useSmartAccount } from '@/components/pc/drives/Storage&Hooks/SmartAccountHook'

// Network Configuration
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
  [Network.MONAD_TESTNET]: {
    name: 'Monad Testnet',
    color: '#627EEA',
    icon: '',
  },
}

// Transaction category mapping
const TX_CATEGORY_CONFIG: Record<
  string,
  { name: string; icon: React.ReactNode; color: string }
> = {
  external: {
    name: 'External Transfer',
    icon: <ArrowUpRight className="h-4 w-4" />,
    color: 'bg-blue-500',
  },
  internal: {
    name: 'Internal Transfer',
    icon: <Repeat className="h-4 w-4" />,
    color: 'bg-green-500',
  },
  erc20: {
    name: 'Token Transfer',
    icon: <ArrowUpRight className="h-4 w-4" />,
    color: 'bg-purple-500',
  },
  erc721: {
    name: 'NFT Transfer',
    icon: <ArrowUpRight className="h-4 w-4" />,
    color: 'bg-orange-500',
  },
  erc1155: {
    name: 'Multi-Token Transfer',
    icon: <ArrowUpRight className="h-4 w-4" />,
    color: 'bg-pink-500',
  },
}

const settings = {
  apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY,
  network: Network.BASE_SEPOLIA as Network,
}

const AuraEffect = ({
  children,
  type = 'blue',
}: {
  children: React.ReactNode
  type?: string
}) => {
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

interface Transaction {
  hash?: string
  category: string
  direction: string
  value?: string
  asset?: string
  blockNum?: string
  metadata?: {
    blockTimestamp?: string
  }
}

interface Account {
  address: string
  name: string
  icon: React.ReactNode
  isActive: boolean
}

export function ActivityContent() {
  const [account, setAccount] = useState<string | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(false)
  const [copiedHash, setCopiedHash] = useState<string | null>(null)
  const [showNetworkDropdown, setShowNetworkDropdown] = useState(false)
  const [showAccountsDropdown, setShowAccountsDropdown] = useState(false)
  const [network, setNetwork] = useTypedValue('wallet_network')
  const [transactionType, setTransactionType] = useState<string | null>(null)
  const [alchemyClient, setAlchemyClient] = useState<Alchemy>(
    new Alchemy(settings)
  )
  const [searchAddress, setSearchAddress] = useState('')
  const [addressToSearch, setAddressToSearch] =
    useTypedValue<string>('searchAddress')

  const networkDropdownRef = useRef<HTMLDivElement>(null)
  const accountsDropdownRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!network) setNetwork(Network.BASE_SEPOLIA as Network)
  }, [network])
  const { address: UserAddress, isConnected } = useAccount()
  const chainId = useChainId()
  const {
    isGuestMode,
    smartAddress,
    baseAddress,
    activeAddress,
    isSmartAccountToggled,
  } = useSmartAccount()
  const accounts = !isGuestMode
    ? [
        {
          address: baseAddress?.toLowerCase() || zeroAddress,
          name: 'Main Wallet',
          icon: <Wallet className="h-4 w-4" />,
          isActive: true,
        },
      ]
    : isGuestMode
    ? [
        {
          address: baseAddress?.toLowerCase() || zeroAddress,
          name: 'Main Wallet',
          icon: <Wallet className="h-4 w-4" />,
          isActive: true,
        },
        {
          address: smartAddress?.toLowerCase() || zeroAddress,
          name: 'Smart Account',
          icon: <Shield className="h-4 w-4" />,
          isActive: isGuestMode,
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

  const [selectedAccount, setSelectedAccount] = useState<Account>(
    !isGuestMode ? accounts[0] : isGuestMode ? accounts[1] : accounts[0]
  )

  const [dropdownAddress, setDropdownAddress] =
    useTypedValue('dropdown_address')

  useEffect(() => {
    if (dropdownAddress) {
      const account = accounts.find((acc) => acc.address === dropdownAddress)
      if (account) {
        setSelectedAccount(account)
      }
    } else {
      setDropdownAddress(selectedAccount.address)
    }
  }, [])

  useEffect(() => {
    setDropdownAddress(selectedAccount.address)
  }, [selectedAccount])

  useEffect(() => {
    const currentAddress = isConnected
      ? activeAddress?.toLowerCase()
      : undefined

    if (currentAddress && !addressToSearch) {
      setSearchAddress(currentAddress)
      setAddressToSearch(currentAddress)
      return
    }
    setSearchAddress(addressToSearch!)
    setAddressToSearch(addressToSearch!)
  }, [baseAddress, activeAddress, isConnected, isGuestMode])

  useEffect(() => {
    const newSettings = {
      apiKey: settings.apiKey,
      network: network as Network,
    }
    setAlchemyClient(new Alchemy(newSettings))
  }, [network])

  useEffect(() => {
    if (typeof window === 'undefined' || !addressToSearch) return

    async function fetchTransactions(userAddress: string) {
      setLoading(true)
      try {
        const Txns = await alchemyClient.portfolio.getTransactionsByWallet([
          { address: userAddress, networks: [alchemyClient.config.network] },
        ])

        const sentTxns = (Txns as any).transactions.filter(
          (txs: any) =>
            txs?.toAddress.toLowerCase() !== userAddress.toLowerCase()
        )

        const receivedTxns = (Txns as any).transactions.filter(
          (txs: any) =>
            txs?.toAddress.toLowerCase() === userAddress.toLowerCase()
        )
        console.log('Transactions', Txns, sentTxns, receivedTxns)
        const sentWithDirection = sentTxns.map((tx: any) => ({
          ...tx,
          direction: 'out',
        }))

        const receivedWithDirection = receivedTxns.map((tx: any) => ({
          ...tx,
          direction: 'in',
        }))

        // Combine, sort by block number, and take latest 50
        const allTxns = [...sentWithDirection, ...receivedWithDirection]
          .sort(
            (a, b) => Number(b.blockNumber || 0) - Number(a.blockNumber || 0)
          )
          .slice(0, 50)

        setTransactions(
          allTxns!.map((tx) => ({
            ...tx,
            value: tx.value?.toString() || undefined,
            asset: tx.asset || undefined,
          }))
        )
        setAccount(userAddress)
      } catch (error) {
        console.error('Error fetching transactions:', error)
      }
      setLoading(false)
    }

    fetchTransactions(addressToSearch)
  }, [addressToSearch, alchemyClient])

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

  const handleNetworkChange = (newNetwork: Network) => {
    setNetwork(newNetwork)
    setShowNetworkDropdown(false)
  }

  const handleAccountChange = (account: Account) => {
    setSelectedAccount(account)
    setShowAccountsDropdown(false)
    setSearchAddress(account.address)
    setAddressToSearch(account.address)
  }

  // Handle search form submit
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchAddress && searchAddress.startsWith('0x')) {
      setAddressToSearch(searchAddress)
    }
  }

  const formatDate = (timestamp?: string) => {
    if (!timestamp) return 'Unknown'
    const date = new Date(parseInt(timestamp) * 1000)
    return (
      date.toLocaleDateString() +
      ' ' +
      date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    )
  }

  const getExplorerUrl = (hash: string) => {
    switch (network) {
      case Network.BASE_SEPOLIA:
        return `https://sepolia.basescan.org/tx/${hash}`
      case Network.ETH_SEPOLIA:
        return `https://sepolia.etherscan.io/tx/${hash}`
      case Network.BASE_MAINNET:
        return `https://basescan.org/tx/${hash}`
      case Network.MONAD_TESTNET:
        return `https://testnet.monadexplorer.com/tx/${hash}`
      default:
        return `https://etherscan.io/tx/${hash}`
    }
  }

  // Filter transactions by type
  const filteredTransactions = transactionType
    ? transactions.filter((tx) => tx.category === transactionType)
    : transactions

  return (
    <div className="min-h-full bg-gray-900 text-white p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
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

            <div className="relative" ref={accountsDropdownRef}>
              <AuraEffect type={isSmartAccountToggled ? 'purple' : 'blue'}>
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
                          {acc.address.length > 10
                            ? shortenText(acc.address, 8, 8)
                            : acc.address}
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

        {/* Search Bar */}
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

        {/* Main Content */}
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-4 md:p-5 backdrop-blur-sm border border-gray-700/50 shadow-lg">
          {/* Address Display */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-gray-800 rounded-lg">
                {selectedAccount.icon}
              </div>
              <div>
                <h2 className="font-medium text-sm">Account Address</h2>
                <div className="flex items-center bg-gray-800/70 px-2 py-0.5 gap-1.5 rounded-lg text-xs mt-0.5">
                  <span className="text-gray-300 truncate max-w-[180px] md:max-w-[300px]">
                    {shortenText(account!, 8, 8)}
                  </span>
                  {copiedHash === account ? (
                    <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                  ) : (
                    <Copy
                      className="w-3.5 h-3.5 cursor-pointer text-gray-400 hover:text-white transition-colors flex-shrink-0"
                      onClick={() => {
                        if (account) {
                          copyToClipboard(account)
                          setCopiedHash(account)
                          setTimeout(() => setCopiedHash(null), 2000)
                        }
                      }}
                    />
                  )}
                </div>
              </div>
            </div>

            <div className="relative">
              <button
                className="px-3 py-1.5 bg-gray-800 rounded-lg flex items-center gap-2 hover:bg-gray-700 transition-colors text-sm"
                onClick={() => setTransactionType(null)}
              >
                <Filter className="w-3.5 h-3.5" />
                <span>
                  {transactionType
                    ? TX_CATEGORY_CONFIG[
                        transactionType as keyof typeof TX_CATEGORY_CONFIG
                      ]?.name || transactionType
                    : 'All Transactions'}
                </span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              <div className="absolute right-0 mt-1 w-52 bg-gray-800 rounded-lg shadow-xl z-10 overflow-hidden hidden group-hover:block">
                <button
                  className="w-full px-3 py-2 text-left hover:bg-gray-700 transition-colors text-sm"
                  onClick={() => setTransactionType(null)}
                >
                  All Transactions
                </button>
                {Object.entries(TX_CATEGORY_CONFIG).map(([type, config]) => (
                  <button
                    key={type}
                    className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-gray-700 transition-colors text-sm"
                    onClick={() => setTransactionType(type)}
                  >
                    <div
                      className={`w-2.5 h-2.5 rounded-full ${config.color}`}
                    ></div>
                    <span>{config.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Transaction list */}
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredTransactions.length > 0 ? (
            <div className="space-y-2.5 max-h-[calc(100vh-280px)] overflow-y-auto pr-1 custom-scrollbar">
              {filteredTransactions.map((tx, index) => (
                <div
                  key={index}
                  className="bg-gray-800/30 hover:bg-gray-800/50 rounded-lg p-3 border border-gray-700/30 transition-colors"
                >
                  <div className="flex items-start gap-2.5">
                    {/* Transaction icon */}
                    <div
                      className={`p-1.5 rounded-lg ${
                        tx.direction === 'in'
                          ? 'bg-green-500/20'
                          : 'bg-blue-500/20'
                      }`}
                    >
                      {tx.direction === 'in' ? (
                        <ArrowDownLeft className="h-3.5 w-3.5 text-green-400" />
                      ) : (
                        <ArrowUpRight className="h-3.5 w-3.5 text-blue-400" />
                      )}
                    </div>

                    {/* Transaction details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-sm">
                            {tx.direction === 'in' ? 'Received' : 'Sent'}{' '}
                            {TX_CATEGORY_CONFIG[
                              tx.category as keyof typeof TX_CATEGORY_CONFIG
                            ]?.name || tx.category}
                          </h3>
                          <div className="text-xs text-gray-400 mt-0.5">
                            {formatDate(tx.metadata?.blockTimestamp)}
                          </div>
                        </div>

                        <div className="text-right">
                          <div
                            className={`font-medium text-sm ${
                              tx.direction === 'in'
                                ? 'text-green-400'
                                : 'text-gray-300'
                            }`}
                          >
                            {tx.direction === 'in' ? '+' : '-'} {tx.value}{' '}
                            {tx.asset}
                          </div>
                          <div className="flex items-center justify-end gap-1 mt-0.5">
                            <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                            <span className="text-xs text-gray-400">
                              Block #{tx.blockNum}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-2 pt-2 border-t border-gray-700/30 flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="text-xs text-gray-400 mr-1.5">
                            Tx:
                          </span>
                          <span className="text-xs text-gray-300 font-mono">
                            {tx.hash
                              ? tx.hash.substring(0, 8) +
                                '...' +
                                tx.hash.substring(tx.hash.length - 8)
                              : 'Unknown'}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {tx.hash && (
                            <>
                              <button
                                onClick={() => {
                                  copyToClipboard(tx.hash!)
                                  setCopiedHash(tx.hash!)
                                  setTimeout(() => setCopiedHash(null), 2000)
                                }}
                                className="p-1 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors"
                              >
                                {copiedHash === tx.hash ? (
                                  <Check className="h-3.5 w-3.5 text-green-400" />
                                ) : (
                                  <Copy className="h-3.5 w-3.5 text-gray-300" />
                                )}
                              </button>

                              <a
                                href={getExplorerUrl(tx.hash)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors"
                              >
                                <ExternalLink className="h-3.5 w-3.5 text-blue-400" />
                              </a>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Clock className="mx-auto h-10 w-10 text-gray-600 mb-3" />
              <h3 className="text-lg font-medium text-gray-400">
                No transactions found
              </h3>
              <p className="text-gray-500 mt-1.5 text-sm">
                Transactions will appear here once they are processed on the
                blockchain
              </p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
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
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slideIn {
          animation: slideIn 0.15s ease-out forwards;
        }
      `}</style>
    </div>
  )
}
