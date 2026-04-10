import { useState } from 'react'
import { motion } from 'framer-motion'

interface PreferenceConfigScreenProps {
  onContinue: (selectedPreferences: string[]) => void
  progress: number
}

const PREFERENCE_OPTIONS = [
  { id: 'work', label: 'Work tasks', emoji: '💼' },
  { id: 'personal', label: 'Personal to-dos', emoji: '🏠' },
  { id: 'home', label: 'Home projects', emoji: '🔨' },
  { id: 'health', label: 'Health & fitness', emoji: '💪' },
  { id: 'shopping', label: 'Shopping & errands', emoji: '🛒' },
  { id: 'ideas', label: 'Ideas & notes', emoji: '💡' },
  { id: 'learning', label: 'Learning goals', emoji: '📚' },
  { id: 'family', label: 'Family responsibilities', emoji: '👨‍👩‍👧' }
]

export function PreferenceConfigScreen({ onContinue, progress }: PreferenceConfigScreenProps) {
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([])

  const togglePreference = (prefId: string) => {
    setSelectedPreferences(prev =>
      prev.includes(prefId)
        ? prev.filter(id => id !== prefId)
        : [...prev, prefId]
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
          What types of things do you track?
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          This helps us personalize your experience.
        </p>
      </motion.div>

      {/* Preference options grid */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        {PREFERENCE_OPTIONS.map((option, index) => (
          <motion.button
            key={option.id}
            onClick={() => togglePreference(option.id)}
            className={`p-4 rounded-xl border-2 transition-all text-left ${
              selectedPreferences.includes(option.id)
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
              selectedPreferences.includes(option.id)
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
          onClick={() => onContinue(selectedPreferences)}
          disabled={selectedPreferences.length === 0}
          className="w-full bg-gradient-to-br from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed text-white font-semibold py-4 px-8 rounded-2xl shadow-lg transition-all"
        >
          Build my workspace
        </button>
      </div>
    </div>
  )
}
