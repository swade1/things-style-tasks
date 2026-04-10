import { motion } from 'framer-motion'
import { Calendar, Inbox, Clock } from 'lucide-react'
import type { Task } from '@/types'

interface ValueDeliveryScreenProps {
  createdTasks: Task[]
  onContinue: () => void
  progress: number
}

export function ValueDeliveryScreen({ createdTasks, onContinue, progress }: ValueDeliveryScreenProps) {
  // Group tasks by status
  const todayTasks = createdTasks.filter(t => t.status === 'today')
  const anytimeTasks = createdTasks.filter(t => t.status === 'anytime')
  const upcomingTasks = createdTasks.filter(t => t.status === 'upcoming')

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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          You're organized.
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Your tasks are automatically organized. Here's how they look.
        </p>
      </motion.div>

      {/* Organized views preview */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-8">
        {/* Today section */}
        {todayTasks.length > 0 && (
          <motion.div
            className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Today</h3>
              <span className="text-sm text-gray-500 dark:text-gray-400">({todayTasks.length})</span>
            </div>
            <div className="space-y-2">
              {todayTasks.map((task, index) => (
                <motion.div
                  key={task.id}
                  className="flex items-center gap-3 text-gray-700 dark:text-gray-300"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                >
                  <div className="w-4 h-4 rounded-full border-2 border-gray-400 dark:border-gray-500" />
                  <span className="text-sm">{task.title}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Anytime section */}
        {anytimeTasks.length > 0 && (
          <motion.div
            className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Inbox className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Anytime</h3>
              <span className="text-sm text-gray-500 dark:text-gray-400">({anytimeTasks.length})</span>
            </div>
            <div className="space-y-2">
              {anytimeTasks.map((task, index) => (
                <motion.div
                  key={task.id}
                  className="flex items-center gap-3 text-gray-700 dark:text-gray-300"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  <div className="w-4 h-4 rounded-full border-2 border-gray-400 dark:border-gray-500" />
                  <span className="text-sm">{task.title}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Upcoming section */}
        {upcomingTasks.length > 0 && (
          <motion.div
            className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Upcoming</h3>
              <span className="text-sm text-gray-500 dark:text-gray-400">({upcomingTasks.length})</span>
            </div>
            <div className="space-y-2">
              {upcomingTasks.map((task, index) => (
                <motion.div
                  key={task.id}
                  className="flex items-center gap-3 text-gray-700 dark:text-gray-300"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                >
                  <div className="w-4 h-4 rounded-full border-2 border-gray-400 dark:border-gray-500" />
                  <span className="text-sm">{task.title}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Secondary text */}
      <motion.p
        className="text-center text-sm text-gray-600 dark:text-gray-400 mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        In the app, you'll be able to tap tasks to complete them and swipe to reorder.
      </motion.p>

      {/* Continue button */}
      <div className="mt-auto">
        <button
          onClick={onContinue}
          className="w-full bg-gradient-to-br from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold py-4 px-8 rounded-2xl shadow-lg"
        >
          Continue
        </button>
      </div>
    </div>
  )
}
