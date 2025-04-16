'use client'
import { useEffect, useState } from 'react'
import { Home, Wallet, Clock, ChevronRight, Trophy, Lock } from 'lucide-react'
import { NavItem } from './NavItem'
import { motion, AnimatePresence } from 'framer-motion'
import { HomeContent } from './tabs/Portfolio'
import { ProfileContent } from './tabs/Transfer'
import { parseAsInteger } from 'nuqs'
import useExperimentalFeatures from '@/app/components/pc/drives/Experiment'
import { ActivityContent } from './tabs/Activity'
import GameScoreContent from './tabs/Scores'
import { useTypedValue } from '@/app/components/pc/drives'
import PregenWalletContent from './tabs/PregenWallet'
import { usePregenSession } from '@/app/components/pc/drives'

interface NavigationProps {
  className?: string
}

function ModernTabbedInterface({ className = '' }: NavigationProps) {
  const { isLoginPregenSession } = usePregenSession()
  const navItems = [
    { icon: Home, label: 'Portfolio', content: HomeContent },
    { icon: Wallet, label: 'Transfer', content: ProfileContent },
    { icon: Clock, label: 'Activity', content: ActivityContent },
    { icon: Trophy, label: 'Scores', content: GameScoreContent },
    ...(isLoginPregenSession
      ? [{ icon: Lock, label: 'Pregen Wallet', content: PregenWalletContent }]
      : []),
  ]

  const { useSaveState } = useExperimentalFeatures()

  const [isExpanded, setIsExpanded] = useState(true)
  const [activeValueItem, setActiveValueItem] = useTypedValue<number>(
    'wallet_active',
    0
  )
  const [activeItem, setActiveItem] = useSaveState(
    'wallet_active',
    parseAsInteger.withDefault(activeValueItem!),
    activeValueItem
  )

  useEffect(() => {
    setActiveItem(activeValueItem!)
  }, [activeValueItem])

  const ActiveContent = navItems[activeItem].content

  return (
    <div className={`flex ${className} bg-gray-900 text-white h-full`}>
      <motion.nav
        initial={false}
        animate={{ width: isExpanded ? 180 : 75 }}
        className="relative flex flex-col gap-4 border-r border-gray-700/50 bg-gray-800/50 p-4 h-full"
      >
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="absolute -right-3 top-6 flex h-6 w-6 items-center justify-center rounded-full border border-gray-700 bg-gray-800 shadow-md hover:bg-gray-700 transition-colors z-10"
        >
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronRight className="h-4 w-4 text-blue-400" />
          </motion.div>
        </button>
        <div className="h-4" />
        <div className="flex flex-col gap-1">
          {navItems.map((item, index) => (
            <NavItem
              key={item.label}
              icon={item.icon}
              label={item.label}
              isActive={activeItem === index}
              isExpanded={isExpanded}
              onClick={() => setActiveValueItem(index)}
            />
          ))}
        </div>
      </motion.nav>

      <main className="flex-1 overflow-auto">
        <ActiveContent />
      </main>
    </div>
  )
}

export default ModernTabbedInterface
