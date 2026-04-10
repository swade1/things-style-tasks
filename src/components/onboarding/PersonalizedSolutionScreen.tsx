import { motion } from 'framer-motion'

interface PersonalizedSolutionScreenProps {
  selectedPains: string[]
  onContinue: () => void
  progress: number
}

const PAIN_SOLUTIONS: Record<string, { title: string; description: string; emoji: string }> = {
  scattered: {
    emoji: '✨',
    title: 'Everything in one place',
    description: 'No more post-it notes, calendars, and scattered apps'
  },
  fallthrough: {
    emoji: '📱',
    title: 'Always on your phone',
    description: 'Quick capture whenever something comes to mind'
  },
  incomplete: {
    emoji: '📅',
    title: 'Clear daily focus',
    description: "See what's today, what's upcoming, what's anytime"
  },
  tools: {
    emoji: '🎨',
    title: 'One simple app',
    description: 'Clean, fast, and gets out of your way'
  },
  unclear: {
    emoji: '🎯',
    title: 'Clear priorities',
    description: 'Know exactly what to focus on today'
  },
  track: {
    emoji: '🔔',
    title: 'Never forget again',
    description: 'Everything captured and organized automatically'
  }
}

export function PersonalizedSolutionScreen({
  selectedPains,
  onContinue,
  progress
}: PersonalizedSolutionScreenProps) {
  // Get solutions for selected pains, fallback to default solutions if none selected
  const solutions = selectedPains.length > 0
    ? selectedPains.map(painId => PAIN_SOLUTIONS[painId]).filter(Boolean)
    : [PAIN_SOLUTIONS.scattered, PAIN_SOLUTIONS.incomplete, PAIN_SOLUTIONS.tools]

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
          Here's how we help
        </h1>
      </motion.div>

      {/* Solutions list */}
      <div className="space-y-6 mb-8 flex-1 overflow-y-auto">
        {solutions.map((solution, index) => (
          <motion.div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex items-start gap-4">
              <div className="text-3xl">{solution.emoji}</div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  {solution.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {solution.description}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Continue button */}
      <div className="mt-auto">
        <button
          onClick={onContinue}
          className="w-full bg-gradient-to-br from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold py-4 px-8 rounded-2xl shadow-lg"
        >
          I like this
        </button>
      </div>
    </div>
  )
}
