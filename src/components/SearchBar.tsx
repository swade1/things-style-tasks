import { motion } from 'framer-motion'
import { Search, X } from 'lucide-react'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  onClose: () => void
  placeholder?: string
}

export function SearchBar({ value, onChange, onClose, placeholder = 'Search tasks...' }: SearchBarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="px-4 py-3"
    >
      <div className="things-surface flex items-center gap-2 px-3 py-2 rounded-xl border border-white/70 bg-white/75">
        <Search size={16} className="text-gray-400" />
        <input
          autoFocus
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
        />
        <button
          type="button"
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close search"
        >
          <X size={16} />
        </button>
      </div>
    </motion.div>
  )
}
