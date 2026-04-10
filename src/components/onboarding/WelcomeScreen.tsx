import { motion } from 'framer-motion'
import { CheckCircle2, Calendar, Inbox } from 'lucide-react'

interface WelcomeScreenProps {
  onContinue: () => void
}

export function WelcomeScreen({ onContinue }: WelcomeScreenProps) {
  return (
    <div className="things-screen flex flex-col h-screen items-center justify-center px-6 pb-20">
      {/* App Preview Visual */}
      <motion.div
        className="w-full max-w-sm mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {/* Mock app preview showing organized views */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700">
          {/* Mock Today tab */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-gray-900 dark:text-gray-100">Today</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>Morning workout</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>Review project proposal</span>
              </div>
            </div>
          </div>
          {/* Mock Anytime tab preview */}
          <div className="p-4 bg-gray-50 dark:bg-gray-900">
            <div className="flex items-center gap-2 mb-2">
              <Inbox className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Anytime</span>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500">3 tasks waiting</div>
          </div>
        </div>
      </motion.div>

      {/* Headline */}
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Get things done. Feel organized.
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          One place for everything you need to do.
        </p>
      </motion.div>

      {/* CTA Button */}
      <motion.button
        onClick={onContinue}
        className="w-full max-w-sm bg-gradient-to-br from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold py-4 px-8 rounded-2xl shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        whileTap={{ scale: 0.98 }}
      >
        Let's get started
      </motion.button>
    </div>
  )
}
