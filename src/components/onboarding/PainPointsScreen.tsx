import { useState } from 'react'
import { motion } from 'framer-motion'

interface PainPointsScreenProps {
  onContinue: (selectedPains: string[]) => void
  progress: number
}

const PAIN_OPTIONS = [
  { id: 'incomplete', label: 'Too many incomplete tasks', emoji: '📚' },
  { id: 'scattered', label: 'Scattered systems (post-its, calendars, apps)', emoji: '🗂️' },
  { id: 'fallthrough', label: 'Things fall through the cracks', emoji: '💭' },
  { id: 'unclear', label: 'Hard to know what to do today', emoji: '🤷' },
  { id: 'tools', label: 'Too many tools', emoji: '🛠️' },
  { id: 'track', label: "Can't keep track", emoji: '😰' }
]

export function PainPointsScreen({ onContinue, progress }: PainPointsScreenProps) {
  const [selectedPains, setSelectedPains] = useState<string[]>([])

  const togglePain = (painId: string) => {
    setSelectedPains(prev =>
      prev.includes(painId)
        ? prev.filter(id => id !== painId)
        : [...prev, painId]
    )
  }

  return (
    <div className="things-screen flex flex-col h-screen px-6 pt-12 pb-28">
      {/* Progress bar */}
      <div className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full mb-8">
        <motion.div
          className="h-full bg-blue-600 rounded-full"
          initial={{ width: `${progress - 10}%` }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Header */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          What's holding you back right now?
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          We've all been there. (Select all that apply)
        </p>
      </motion.div>

      {/* Pain options grid */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        {PAIN_OPTIONS.map((option, index) => (
          <motion.button
            key={option.id}
            onClick={() => togglePain(option.id)}
            className={`p-4 rounded-xl border-2 transition-all text-left ${
              selectedPains.includes(option.id)
                ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
            }`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="text-2xl mb-2">{option.emoji}</div>
            <div className={`text-sm font-medium ${
              selectedPains.includes(option.id)
                ? 'text-blue-900 dark:text-blue-100'
                : 'text-gray-900 dark:text-gray-100'
            }`}>
              {option.label}
            </div>
          </motion.button>
        ))}
      </div>

      {/* Continue button */}
      <div className="mt-auto">
        <button
          onClick={() => onContinue(selectedPains)}
          disabled={selectedPains.length === 0}
          className="w-full bg-gradient-to-br from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed text-white font-semibold py-4 px-8 rounded-2xl shadow-lg transition-all"
        >
          Continue
        </button>
      </div>
    </div>
  )
}
