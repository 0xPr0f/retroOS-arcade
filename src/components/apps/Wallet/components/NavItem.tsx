// NavItem.tsx
import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'

interface NavItemProps {
  icon: LucideIcon
  label: string
  isActive: boolean
  isExpanded: boolean
  onClick: () => void
}

export function NavItem({
  icon: Icon,
  label,
  isActive,
  isExpanded,
  onClick,
}: NavItemProps) {
  return (
    <motion.button
      onClick={onClick}
      className={`flex items-center gap-4 rounded-lg px-3 py-2.5 transition-colors ${
        isActive
          ? 'bg-blue-600 text-white'
          : 'text-gray-400 hover:bg-gray-700/50 hover:text-gray-200'
      }`}
      whileTap={{ scale: 0.98 }}
    >
      <Icon size={20} />
      {isExpanded && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="text-sm font-medium"
        >
          {label}
        </motion.span>
      )}
    </motion.button>
  )
}
