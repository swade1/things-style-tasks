import { useState, useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus, X } from 'lucide-react'
import { cn, getTodayLocalDate } from '@/lib/utils'
import { DatePicker } from './DatePicker'

type QuickEntryStatus = 'today' | 'anytime' | 'upcoming'

interface QuickEntryProps {
  onAddTask: (title: string, status: QuickEntryStatus, scheduledDate?: string | null) => void
  defaultStatus?: QuickEntryStatus
}

const getTomorrowLocalDate = () => {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const year = tomorrow.getFullYear()
  const month = String(tomorrow.getMonth() + 1).padStart(2, '0')
  const day = String(tomorrow.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function QuickEntry({ onAddTask, defaultStatus = 'anytime' }: QuickEntryProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [scheduledDate, setScheduledDate] = useState<string | null>(getTomorrowLocalDate())
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
      setScheduledDate(defaultStatus === 'upcoming' ? getTomorrowLocalDate() : null)
    }
  }, [isOpen, defaultStatus])

  const handleSubmit = (status: QuickEntryStatus) => {
    if (title.trim()) {
      const resolvedDate = status === 'today'
        ? getTodayLocalDate()
        : status === 'upcoming'
          ? (scheduledDate || getTomorrowLocalDate())
          : null

      onAddTask(title.trim(), status, resolvedDate)
      setTitle('')
      setScheduledDate(getTomorrowLocalDate())
      setIsOpen(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && title.trim()) {
      handleSubmit(defaultStatus)
    } else if (e.key === 'Escape') {
      setIsOpen(false)
      setTitle('')
    }
  }

  return (
    <>
      {/* Floating + button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="things-fab fixed bottom-24 right-4 z-40 w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-full flex items-center justify-center ring-4 ring-white/70"
        aria-label="Add new task"
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.05 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      >
        <Plus size={28} strokeWidth={2.5} />
      </motion.button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/40 z-50"
              onClick={() => {
                setIsOpen(false)
                setTitle('')
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />

            {/* Modal content */}
            <motion.div
              className="things-sheet fixed inset-x-0 bottom-0 z-50 rounded-t-[28px] shadow-2xl border-t border-white/70"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            >
              <div className="px-4 py-3">
                <div className="w-10 h-1 rounded-full bg-gray-300/80 mx-auto mb-4" />
                {/* Header */}
                <motion.div
                  className="flex items-center justify-between mb-4"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">New Task</h2>
                  <button
                    onClick={() => {
                      setIsOpen(false)
                      setTitle('')
                    }}
                    className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 active:scale-95 transition-all"
                    aria-label="Close"
                  >
                    <X size={24} />
                  </button>
                </motion.div>

                {/* Input */}
                <motion.input
                  ref={inputRef}
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Task title..."
                  className="w-full px-4 py-3 text-base border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                />

                {defaultStatus === 'upcoming' && (
                  <motion.div
                    className="mt-4"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.18 }}
                  >
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Schedule for
                    </label>
                    <DatePicker value={scheduledDate} onChange={setScheduledDate} />
                  </motion.div>
                )}

                {/* Action buttons */}
                {defaultStatus === 'upcoming' ? (
                  <motion.div
                    className="mt-4"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <button
                      onClick={() => handleSubmit('upcoming')}
                      disabled={!title.trim()}
                      className={cn(
                        'w-full px-4 py-3 rounded-lg font-medium transition-all active:scale-98',
                        title.trim()
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      )}
                    >
                      Add to Upcoming
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    className="grid grid-cols-3 gap-3 mt-4"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <button
                      onClick={() => handleSubmit('today')}
                      disabled={!title.trim()}
                      className={cn(
                        'px-4 py-3 rounded-lg font-medium transition-all active:scale-98',
                        title.trim()
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      )}
                    >
                      Today
                    </button>
                    <button
                      onClick={() => handleSubmit('anytime')}
                      disabled={!title.trim()}
                      className={cn(
                        'px-4 py-3 rounded-lg font-medium transition-all active:scale-98',
                        title.trim()
                          ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600'
                          : 'bg-gray-50 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                      )}
                    >
                      Anytime
                    </button>
                    <button
                      onClick={() => handleSubmit('upcoming')}
                      disabled={!title.trim()}
                      className={cn(
                        'px-4 py-3 rounded-lg font-medium transition-all active:scale-98',
                        title.trim()
                          ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600'
                          : 'bg-gray-50 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                      )}
                    >
                      Upcoming
                    </button>
                  </motion.div>
                )}

                {/* Help text */}
                <motion.p
                  className="text-xs text-gray-500 text-center mt-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.25 }}
                >
                  {defaultStatus === 'upcoming'
                    ? 'Pick a date, then add to Upcoming • Esc to close'
                    : `Press Enter to add to ${defaultStatus === 'today' ? 'Today' : 'Anytime'} • Esc to close`}
                </motion.p>
              </div>

              {/* Safe area spacing for devices with notch */}
              <div className="h-6 safe-area-inset-bottom" />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
