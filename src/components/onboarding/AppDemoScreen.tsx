import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { QuickEntry } from '@/components/QuickEntry'
import type { Task } from '@/types'

interface AppDemoScreenProps {
  onComplete: (createdTasks: Task[]) => void
  progress: number
  userId: string
}

export function AppDemoScreen({ onComplete, progress, userId }: AppDemoScreenProps) {
  const [demoTasks, setDemoTasks] = useState<Task[]>([])
  const [showHelper, setShowHelper] = useState(false)

  // Show helper text after 5 seconds if no tasks created
  useEffect(() => {
    const timer = setTimeout(() => {
      if (demoTasks.length === 0) {
        setShowHelper(true)
      }
    }, 5000)

    return () => clearTimeout(timer)
  }, [demoTasks.length])

  // Auto-advance after 3 tasks created
  useEffect(() => {
    if (demoTasks.length === 3) {
      // Small delay before advancing to show the 3rd task was added
      const timer = setTimeout(() => {
        onComplete(demoTasks)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [demoTasks, onComplete])

  const handleAddTask = async (title: string, status: 'today' | 'anytime' | 'upcoming', scheduledDate?: string | null) => {
    // Create task object without actually saving to database (demo mode)
    const newTask: Task = {
      id: `demo-${Date.now()}-${Math.random()}`,
      user_id: userId,
      title,
      notes: null,
      status,
      scheduled_date: scheduledDate || null,
      deadline_date: null,
      project_id: null,
      tags: [],
      checklist_items: [],
      recurrence_rule: null,
      recurrence_end_date: null,
      recurrence_parent_id: null,
      position: demoTasks.length,
      completed_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    setDemoTasks(prev => [...prev, newTask])
  }

  const tasksRemaining = 3 - demoTasks.length

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
          Add 3 things you need to do
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Try it out. This is your actual workspace.
        </p>
      </motion.div>

      {/* Task counter */}
      <motion.div
        className="text-center mb-8"
        key={tasksRemaining}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300 }}
      >
        {tasksRemaining > 0 ? (
          <div className="inline-block bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100 px-4 py-2 rounded-full font-semibold">
            {tasksRemaining === 1 ? 'Add 1 more...' : `Add ${tasksRemaining} more...`}
          </div>
        ) : (
          <div className="inline-block bg-green-100 dark:bg-green-900/30 text-green-900 dark:text-green-100 px-4 py-2 rounded-full font-semibold">
            Perfect! ✓
          </div>
        )}
      </motion.div>

      {/* Demo task list */}
      <div className="flex-1 overflow-y-auto space-y-2 mb-8">
        {demoTasks.map((task, index) => (
          <motion.div
            key={task.id}
            className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-600" />
              <div className="flex-1">
                <div className="font-medium text-gray-900 dark:text-gray-100">{task.title}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {task.status === 'today' ? '📅 Today' : task.status === 'upcoming' ? '📆 Upcoming' : '📥 Anytime'}
                </div>
              </div>
              <div className="text-green-600 dark:text-green-400 text-xl">✓</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Helper text */}
      {showHelper && demoTasks.length === 0 && (
        <motion.p
          className="text-center text-sm text-gray-500 dark:text-gray-400 mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          Tap the blue + button to add your first task
        </motion.p>
      )}

      {/* QuickEntry component (floating + button) */}
      <QuickEntry onAddTask={handleAddTask} />
    </div>
  )
}
