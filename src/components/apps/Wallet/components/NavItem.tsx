'use client'

import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'

interface NavItemProps {
  icon: LucideIcon
  label: string
  isActive?: boolean
  isExpanded?: boolean
  onClick?: () => void
}

export function NavItem({
  icon: Icon,
  label,
  isActive = false,
  isExpanded = false,
  onClick,
}: NavItemProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`group flex w-full items-center gap-4 rounded-lg px-3 py-2 transition-colors
        ${isActive ? 'bg-[#2563eb] text-white' : 'hover:bg-[#2563eb]/10'}`}
    >
      <Icon
        className={`h-5 w-5 flex-shrink-0 transition-colors ${
          isActive ? 'text-white' : 'text-[#2563eb]'
        }`}
      />

      {isExpanded && (
        <motion.span
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: 'auto' }}
          exit={{ opacity: 0, width: 0 }}
          className="whitespace-nowrap text-sm font-medium"
        >
          {label}
        </motion.span>
      )}
    </motion.button>
  )
}
