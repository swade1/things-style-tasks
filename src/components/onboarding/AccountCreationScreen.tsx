import { motion } from 'framer-motion'
import { Mail } from 'lucide-react'
import type { Task } from '@/types'

interface AccountCreationScreenProps {
  createdTasks: Task[]
  onContinue: () => void
  onSkip: () => void
  progress: number
}

export function AccountCreationScreen({
  createdTasks,
  onContinue,
  onSkip,
  progress
}: AccountCreationScreenProps) {
  // Note: This is a placeholder UI. Actual auth logic handled by existing AuthScreen
  // For the onboarding flow, we'll assume user is already authenticated

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
          Sync across all your devices
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Create a free account to keep your tasks everywhere.
        </p>
      </motion.div>

      {/* Task preview */}
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700 mb-8"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Your workspace
        </div>
        <div className="space-y-2">
          {createdTasks.slice(0, 3).map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
            >
              <div className="w-3 h-3 rounded-full border border-gray-400 dark:border-gray-500" />
              <span className="truncate">{task.title}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Sign-in options */}
      <div className="space-y-3 mb-6">
        <motion.button
          onClick={onContinue}
          className="w-full bg-black dark:bg-white text-white dark:text-black font-semibold py-4 px-6 rounded-2xl flex items-center justify-center gap-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileTap={{ scale: 0.98 }}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
          </svg>
          Continue with Apple
        </motion.button>

        <motion.button
          onClick={onContinue}
          className="w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-semibold py-4 px-6 rounded-2xl border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center gap-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileTap={{ scale: 0.98 }}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </motion.button>

        <motion.button
          onClick={onContinue}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-2xl flex items-center justify-center gap-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          whileTap={{ scale: 0.98 }}
        >
          <Mail className="w-5 h-5" />
          Continue with Email
        </motion.button>
      </div>

      {/* Skip option */}
      <motion.button
        onClick={onSkip}
        className="text-center text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 mb-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        Skip for now
      </motion.button>

      {/* Footer */}
      <motion.p
        className="text-center text-xs text-gray-500 dark:text-gray-400"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        Already have an account? <button className="text-blue-600 dark:text-blue-400" onClick={onContinue}>Log in</button>
      </motion.p>
    </div>
  )
}
