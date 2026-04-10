import { useState } from 'react'
import { motion } from 'framer-motion'

interface GoalQuestionScreenProps {
  onContinue: (selectedGoals: string[]) => void
  progress: number
}

const GOAL_OPTIONS = [
  { id: 'peace', label: 'Peace of mind', emoji: '🧘' },
  { id: 'forget', label: 'Stop forgetting things', emoji: '🎯' },
  { id: 'complete', label: 'Actually complete tasks', emoji: '✅' },
  { id: 'replace', label: 'Replace scattered systems', emoji: '🔄' },
  { id: 'organized', label: 'Feel organized', emoji: '📋' },
  { id: 'getdone', label: 'Get more done', emoji: '🚀' }
]

export function GoalQuestionScreen({ onContinue, progress }: GoalQuestionScreenProps) {
  const [selectedGoals, setSelectedGoals] = useState<string[]>([])

  const toggleGoal = (goalId: string) => {
    setSelectedGoals(prev =>
      prev.includes(goalId)
        ? prev.filter(id => id !== goalId)
        : [...prev, goalId]
    )
  }

  return (
    <div className="things-screen flex flex-col h-screen px-6 pt-12 pb-28">
      {/* Progress bar */}
      <div className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full mb-8">
        <motion.div
          className="h-full bg-blue-600 rounded-full"
          initial={{ width: 0 }}
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
          What matters most to you?
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Pick what you're looking for. (Select all that apply)
        </p>
      </motion.div>

      {/* Goal options grid */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        {GOAL_OPTIONS.map((option, index) => (
          <motion.button
            key={option.id}
            onClick={() => toggleGoal(option.id)}
            className={`p-4 rounded-xl border-2 transition-all text-left ${
              selectedGoals.includes(option.id)
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
              selectedGoals.includes(option.id)
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
          onClick={() => onContinue(selectedGoals)}
          disabled={selectedGoals.length === 0}
          className="w-full bg-gradient-to-br from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed text-white font-semibold py-4 px-8 rounded-2xl shadow-lg transition-all"
        >
          Continue
        </button>
      </div>
    </div>
  )
}
