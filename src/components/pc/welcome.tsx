import React, { useState } from 'react'
import {
  Github,
  Terminal,
  GamepadIcon,
  LayoutGrid,
  Coffee,
  ExternalLink,
  Wallet,
  Users,
  Coins,
  Shield,
} from 'lucide-react'
import Link from 'next/link'

const RetroWelcome = ({ closeWindow }: { closeWindow: () => void }) => {
  const [activeTab, setActiveTab] = useState('welcome')

  const apps = [
    {
      name: 'Arcade Hub',
      icon: <GamepadIcon className="w-6 h-6" />,
      description:
        'Classic arcade games reimagined with blockchain achievements and NFT rewards.',
      color: 'bg-purple-100 text-purple-600',
    },
    {
      name: 'Smart Wallet',
      icon: <Wallet className="w-6 h-6" />,
      description:
        'Manage your crypto assets and smart account with our intuitive interface.',
      color: 'bg-green-100 text-green-600',
    },
    {
      name: 'Multiplayer Arena',
      icon: <Users className="w-6 h-6" />,
      description:
        'Compete in blockchain-verified tournaments and earn rewards.',
      color: 'bg-blue-100 text-blue-600',
    },
    {
      name: 'Asset Manager',
      icon: <Coins className="w-6 h-6" />,
      description:
        'Track and trade your in-game assets, NFTs, and cryptocurrencies.',
      color: 'bg-orange-100 text-orange-600',
    },
    {
      name: 'Dev Corner',
      icon: <Coffee className="w-6 h-6" />,
      description:
        'Tools and utilities for Web3 developers to extend the RetroOS experience.',
      color: 'bg-pink-100 text-pink-600',
    },
    {
      name: 'Security Center',
      icon: <Shield className="w-6 h-6" />,
      description: 'Manage permissions and secure your Web3 interactions.',
      color: 'bg-red-100 text-red-600',
    },
  ]

  return (
    <div className="bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white">
          <h1 className="text-4xl font-bold mb-4">Welcome to RetroOS</h1>
          <p className="text-lg opacity-90">
            A Web3-powered arcade gaming platform that combines retro computing
            with blockchain technology.
          </p>
        </div>

        <div className="border-b border-gray-200">
          <nav className="flex space-x-4 px-6">
            {['welcome', 'apps', 'web3', 'about'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-2 font-medium transition-colors ${
                  activeTab === tab
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'welcome' && (
            <div className="space-y-6">
              <div className="text-center max-w-2xl mx-auto mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  Where Retro Gaming Meets Web3 Innovation
                </h2>
                <p className="text-gray-600">
                  Experience classic gaming enhanced with blockchain technology,
                  smart accounts, and decentralized multiplayer features. Play
                  classic games, use familiar interfaces, and enjoy the best of
                  both worlds.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg bg-indigo-50">
                  <h3 className="font-semibold text-indigo-800 mb-2">
                    🎮 Gaming Excellence
                  </h3>
                  <p className="text-gray-600">
                    Enjoy perfectly recreated classic games with modern touches.
                  </p>
                </div>
                <div className="p-4 border rounded-lg bg-rose-50">
                  <h3 className="font-semibold text-rose-800 mb-2">
                    💎 Smart Accounts
                  </h3>
                  <p className="text-gray-600">
                    Secure wallet integration with easy-to-use interfaces.
                  </p>
                </div>
                <div className="p-4 border rounded-lg bg-emerald-50">
                  <h3 className="font-semibold text-emerald-800 mb-2">
                    🏆 Multiplayer
                  </h3>
                  <p className="text-gray-600">
                    Blockchain-verified games and leaderboards.
                  </p>
                </div>
                <div className="p-4 border rounded-lg bg-amber-50">
                  <h3 className="font-semibold text-amber-800 mb-2">
                    🔗 Asset Management
                  </h3>
                  <p className="text-gray-600">
                    Full control over your digital assets and currencies.
                  </p>
                </div>
                <div className="p-4 border rounded-lg bg-sky-50">
                  <h3 className="font-semibold text-sky-800 mb-2">
                    🚀 Modern Tech
                  </h3>
                  <p className="text-gray-600">
                    Built with NextJS | TypeScript for reliable, smooth
                    performance.
                  </p>
                </div>
                <div className="p-4 border rounded-lg bg-violet-50">
                  <h3 className="font-semibold text-violet-800 mb-2">
                    🛠️ Open Source
                  </h3>
                  <p className="text-gray-600">
                    Contribute and help shape the future of RetroOS.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'web3' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Web3 Features
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 border rounded-lg bg-gradient-to-br from-blue-50 to-purple-50">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    Smart Account Integration
                  </h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Easy wallet creation and management</li>
                    <li>• Social recovery options</li>
                    <li>• Gasless transactions for better UX</li>
                    <li>• Multi-chain support</li>
                  </ul>
                </div>

                <div className="p-6 border rounded-lg bg-gradient-to-br from-green-50 to-blue-50">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    Blockchain Gaming
                  </h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• NFT-based achievements</li>
                    <li>• Verifiable game scores</li>
                    <li>• Cross-game asset usage</li>
                    <li>• Play-to-earn mechanics</li>
                  </ul>
                </div>

                <div className="p-6 border rounded-lg bg-gradient-to-br from-yellow-50 to-orange-50">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    Asset Management
                  </h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• In-game item marketplace</li>
                    <li>• NFT collection viewer</li>
                    <li>• Token swapping</li>
                    <li>• Portfolio tracking</li>
                  </ul>
                </div>

                <div className="p-6 border rounded-lg bg-gradient-to-br from-pink-50 to-red-50">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    Multiplayer Features
                  </h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Decentralized matchmaking</li>
                    <li>• Tournament smart contracts</li>
                    <li>• On-chain leaderboards</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'apps' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {apps.map((app) => (
                <div
                  key={app.name}
                  className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                >
                  <div
                    className={`inline-block p-3 rounded-lg ${app.color} mb-3`}
                  >
                    {app.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {app.name}
                  </h3>
                  <p className="text-gray-600">{app.description}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'about' && (
            <div className="space-y-6">
              <div className="prose max-w-none">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  About RetroOS
                </h2>
                <p className="text-gray-600">
                  RetroOS reimagines classic computing for the Web3 era. We
                  combine the nostalgia of retro gaming with blockchain
                  technology, creating a unique platform where players can truly
                  own their gaming experiences, compete in decentralized
                  tournaments, and manage their digital assets seamlessly.
                </p>
                <div className="mt-6 flex flex-col space-y-4">
                  <Link
                    href="https://github.com/0xPr0f/retroOS-arcade"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800"
                  >
                    <Github className="w-5 h-5" />
                    <span>View Source Code</span>
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-gray-50 px-6 py-4 border-t">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">
              Made with ❤️ by the RetroOS Team
            </p>
            <div className="flex space-x-4">
              <button
                onClick={closeWindow}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RetroWelcome
