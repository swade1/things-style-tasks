import { useState, useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface QuickEntryProjectProps {
  onAddProject: (title: string, notes?: string) => void
}

export function QuickEntryProject({ onAddProject }: QuickEntryProjectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [notes, setNotes] = useState('')
  const titleInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen && titleInputRef.current) {
      titleInputRef.current.focus()
    }
  }, [isOpen])

  const handleSubmit = () => {
    if (title.trim()) {
      onAddProject(title.trim(), notes.trim() || undefined)
      setTitle('')
      setNotes('')
      setIsOpen(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && title.trim()) {
      e.preventDefault()
      handleSubmit()
    } else if (e.key === 'Escape') {
      setIsOpen(false)
      setTitle('')
      setNotes('')
    }
  }

  return (
    <>
      {/* Floating + button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="things-fab fixed bottom-24 right-4 z-40 w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-full flex items-center justify-center ring-4 ring-white/70"
        aria-label="Add new project"
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
                setNotes('')
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
                  <h2 className="text-lg font-semibold text-gray-900">New Project</h2>
                  <button
                    onClick={() => {
                      setIsOpen(false)
                      setTitle('')
                      setNotes('')
                    }}
                    className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 active:scale-95 transition-all"
                    aria-label="Close"
                  >
                    <X size={24} />
                  </button>
                </motion.div>

                {/* Title Input */}
                <motion.input
                  ref={titleInputRef}
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Project title..."
                  className="w-full px-4 py-3 text-base border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors mb-3"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                />

                {/* Notes Input */}
                <motion.textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Notes (optional)..."
                  className="w-full px-4 py-3 text-base border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors resize-none"
                  rows={3}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                />

                {/* Action button */}
                <motion.button
                  onClick={handleSubmit}
                  disabled={!title.trim()}
                  className={cn(
                    'w-full px-4 py-3 rounded-lg font-medium transition-all active:scale-98 mt-4',
                    title.trim()
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  )}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                >
                  Create Project
                </motion.button>

                {/* Help text */}
                <motion.p
                  className="text-xs text-gray-500 text-center mt-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  Press Enter to create • Esc to close
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
