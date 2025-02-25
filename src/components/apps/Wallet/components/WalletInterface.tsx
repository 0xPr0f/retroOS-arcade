'use client'
import { useState } from 'react'
import { Home, Wallet, Clock, ChevronRight } from 'lucide-react'
import { NavItem } from './NavItem'
import { motion, AnimatePresence } from 'framer-motion'
import { HomeContent } from './tabs/Portfolio'
import { ProfileContent } from './tabs/Transfer'
import { parseAsInteger } from 'nuqs'
import useExperimentalFeatures from '@/components/pc/drives/Experiment'
import { ActivityContent } from './tabs/Activity'

const navItems = [
  { icon: Home, label: 'Portfolio', content: HomeContent },
  { icon: Wallet, label: 'Transfer', content: ProfileContent },
  { icon: Clock, label: 'Activity', content: ActivityContent },
]

interface NavigationProps {
  className?: string
}

function ModernTabbedInterface({ className = '' }: NavigationProps) {
  const { useSaveState } = useExperimentalFeatures()

  const [isExpanded, setIsExpanded] = useState(true)
  const [activeItem, setActiveItem] = useSaveState(
    'wallet_active',
    parseAsInteger.withDefault(0),
    0
  )

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
              onClick={() => setActiveItem(index)}
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
