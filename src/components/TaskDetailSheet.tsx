import { useState, useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, Plus, Tag, X, Calendar, AlignLeft, ListChecks, Trash2, FolderKanban, Repeat } from 'lucide-react'
import { cn, getTodayLocalDate } from '@/lib/utils'
import { useProjects } from '@/hooks'
import { DatePicker } from '@/components'
import type { ChecklistItem, Task } from '@/types'

interface TaskDetailSheetProps {
  task: Task | null
  isOpen: boolean
  onClose: () => void
  onUpdate: (taskId: string, updates: Partial<Task>) => void
  onDelete: (taskId: string) => void
}

export function TaskDetailSheet({ task, isOpen, onClose, onUpdate, onDelete }: TaskDetailSheetProps) {
  const [title, setTitle] = useState('')
  const [notes, setNotes] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState('')
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([])
  const [newChecklistItem, setNewChecklistItem] = useState('')
  const titleInputRef = useRef<HTMLInputElement>(null)
  
  // Fetch active projects for assignment
  const { projects } = useProjects('active')

  useEffect(() => {
    if (task) {
      setTitle(task.title)
      setNotes(task.notes || '')
      setTags(task.tags || [])
      setChecklistItems(task.checklist_items || [])
    }
  }, [task])

  useEffect(() => {
    if (isOpen && titleInputRef.current) {
      titleInputRef.current.focus()
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return

    const previousOverflow = document.body.style.overflow
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleEscape)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  const handleTitleBlur = () => {
    if (task && title.trim() !== task.title) {
      onUpdate(task.id, { title: title.trim() })
    }
  }

  const handleNotesBlur = () => {
    if (task && notes !== (task.notes || '')) {
      onUpdate(task.id, { notes })
    }
  }

  const handleProjectAssign = (projectId: string | null) => {
    if (task) {
      onUpdate(task.id, { project_id: projectId })
    }
  }

  const handleRecurrenceChange = (rule: string | null) => {
    if (task) {
      onUpdate(task.id, { recurrence_rule: rule })
    }
  }

  const handleScheduledDateChange = (date: string | null) => {
    if (task) {
      const isToday = date === getTodayLocalDate()
      onUpdate(task.id, {
        scheduled_date: date,
        status: date ? (isToday ? 'today' : 'upcoming') : 'anytime'
      })
    }
  }

  const updateTags = (nextTags: string[]) => {
    const normalizedTags = Array.from(new Set(nextTags.map(tag => tag.trim()).filter(Boolean)))
    setTags(normalizedTags)

    if (task) {
      onUpdate(task.id, { tags: normalizedTags })
    }
  }

  const handleAddTag = (event: React.FormEvent) => {
    event.preventDefault()
    if (!newTag.trim()) return

    updateTags([...tags, newTag.replace(/^#/, '').trim()])
    setNewTag('')
  }

  const handleRemoveTag = (tagToRemove: string) => {
    updateTags(tags.filter(tag => tag !== tagToRemove))
  }

  const updateChecklist = (items: ChecklistItem[]) => {
    setChecklistItems(items)
    if (task) {
      onUpdate(task.id, { checklist_items: items })
    }
  }

  const handleAddChecklistItem = (event: React.FormEvent) => {
    event.preventDefault()
    if (!newChecklistItem.trim()) return

    updateChecklist([
      ...checklistItems,
      {
        id: crypto.randomUUID(),
        title: newChecklistItem.trim(),
        completed: false
      }
    ])
    setNewChecklistItem('')
  }

  const handleToggleChecklistItem = (itemId: string) => {
    updateChecklist(
      checklistItems.map(item =>
        item.id === itemId ? { ...item, completed: !item.completed } : item
      )
    )
  }

  const handleChecklistTitleChange = (itemId: string, nextTitle: string) => {
    setChecklistItems(prev =>
      prev.map(item => item.id === itemId ? { ...item, title: nextTitle } : item)
    )
  }

  const handleChecklistTitleBlur = (itemId: string) => {
    const normalizedItems = checklistItems
      .map(item => item.id === itemId ? { ...item, title: item.title.trim() } : item)
      .filter(item => item.title.length > 0)

    updateChecklist(normalizedItems)
  }

  const handleRemoveChecklistItem = (itemId: string) => {
    updateChecklist(checklistItems.filter(item => item.id !== itemId))
  }

  const handleDelete = () => {
    if (task) {
      onDelete(task.id)
      onClose()
    }
  }

  if (!task) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/40 z-50"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />

          {/* Sheet content */}
          <motion.div
            className="things-sheet fixed inset-x-0 bottom-0 z-50 rounded-t-[28px] shadow-2xl max-h-[90vh] flex flex-col border-t border-white/70"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            <div className="w-10 h-1 rounded-full bg-gray-300/80 mx-auto mt-3" />
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Task Details</h2>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 active:scale-95 transition-all"
                aria-label="Close"
              >
                <X size={24} />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
              {/* Title */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title
                </label>
                <input
                  ref={titleInputRef}
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={handleTitleBlur}
                  className="w-full px-4 py-3 text-base border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                  placeholder="Task title..."
                />
              </motion.div>

              {/* Notes */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <AlignLeft size={16} />
                  Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  onBlur={handleNotesBlur}
                  className="w-full px-4 py-3 text-base border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-lg focus:border-blue-500 focus:outline-none transition-colors resize-none"
                  rows={4}
                  placeholder="Add notes..."
                />
              </motion.div>

              {/* Scheduled Date */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <Calendar size={16} />
                  When
                </label>
                <div className="flex gap-2 mb-3">
                  <button
                    onClick={() => onUpdate(task.id, { status: 'today', scheduled_date: getTodayLocalDate() })}
                    className={cn(
                      'flex-1 px-4 py-3 rounded-lg font-medium transition-all active:scale-98',
                      task.status === 'today'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    )}
                  >
                    Today
                  </button>
                  <button
                    onClick={() => onUpdate(task.id, { status: 'anytime', scheduled_date: null })}
                    className={cn(
                      'flex-1 px-4 py-3 rounded-lg font-medium transition-all active:scale-98',
                      task.status === 'anytime'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    )}
                  >
                    Anytime
                  </button>
                  <button
                    onClick={() => onUpdate(task.id, { status: 'upcoming', scheduled_date: task.scheduled_date || getTodayLocalDate() })}
                    className={cn(
                      'flex-1 px-4 py-3 rounded-lg font-medium transition-all active:scale-98',
                      task.status === 'upcoming'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    )}
                  >
                    Upcoming
                  </button>
                </div>

                {/* Date picker for specific scheduling */}
                <DatePicker
                  value={task.scheduled_date}
                  onChange={handleScheduledDateChange}
                />
              </motion.div>

              {/* Checklist items */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <ListChecks size={16} />
                  Checklist
                </label>

                <form onSubmit={handleAddChecklistItem} className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newChecklistItem}
                    onChange={(e) => setNewChecklistItem(e.target.value)}
                    placeholder="Add checklist item..."
                    className="flex-1 px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-700/50 dark:text-gray-100 rounded-lg focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={!newChecklistItem.trim()}
                    className="px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="Add checklist item"
                  >
                    <Plus size={16} />
                  </button>
                </form>

                <div className="space-y-2">
                  {checklistItems.length === 0 ? (
                    <div className="px-4 py-6 border border-dashed border-gray-200 dark:border-gray-700 rounded-lg text-center">
                      <p className="text-sm text-gray-500 dark:text-gray-400">No checklist items yet</p>
                    </div>
                  ) : (
                    checklistItems.map((item) => (
                      <div key={item.id} className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <button
                          type="button"
                          onClick={() => handleToggleChecklistItem(item.id)}
                          className={cn(
                            'flex-shrink-0 w-5 h-5 rounded-full border flex items-center justify-center transition-colors',
                            item.completed ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300 dark:border-gray-500 text-transparent'
                          )}
                          aria-label={item.completed ? 'Mark checklist item incomplete' : 'Mark checklist item complete'}
                        >
                          <Check size={12} />
                        </button>
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) => handleChecklistTitleChange(item.id, e.target.value)}
                          onBlur={() => handleChecklistTitleBlur(item.id)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.currentTarget.blur()
                            }
                          }}
                          className={cn(
                            'flex-1 bg-transparent text-sm focus:outline-none',
                            item.completed ? 'line-through text-gray-400 dark:text-gray-600' : 'text-gray-800 dark:text-gray-200'
                          )}
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveChecklistItem(item.id)}
                          className="text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                          aria-label="Delete checklist item"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>

              {/* Project assignment */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <label htmlFor="project-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <FolderKanban size={16} />
                  Project
                </label>
                <select
                  id="project-select"
                  value={task?.project_id || ''}
                  onChange={(e) => handleProjectAssign(e.target.value || null)}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                >
                  <option value="">No Project</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.title}
                    </option>
                  ))}
                </select>
              </motion.div>

              {/* Tags */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
              >
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <Tag size={16} />
                  Tags
                </label>

                <form onSubmit={handleAddTag} className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add a tag..."
                    className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={!newTag.trim()}
                    className="px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="Add tag"
                  >
                    <Plus size={16} />
                  </button>
                </form>

                <div className="flex flex-wrap gap-2">
                  {tags.length === 0 ? (
                    <span className="text-sm text-gray-500">No tags yet</span>
                  ) : (
                    tags.map((tag) => (
                      <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-300">
                        #{tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                          aria-label={`Remove tag ${tag}`}
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </motion.div>

              {/* Repeat/Recurrence */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <label htmlFor="recurrence-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <Repeat size={16} />
                  Repeat
                </label>
                <select
                  id="recurrence-select"
                  value={task?.recurrence_rule || ''}
                  onChange={(e) => handleRecurrenceChange(e.target.value || null)}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                >
                  <option value="">Never</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
                {task?.recurrence_rule && (
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    When completed, a new instance will be created for the next occurrence
                  </p>
                )}
              </motion.div>
            </div>

            {/* Footer actions */}
            <motion.div
              className="px-4 py-4 border-t border-gray-100"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45 }}
            >
              <button
                onClick={handleDelete}
                className="w-full px-4 py-3 rounded-lg font-medium text-red-600 bg-red-50 hover:bg-red-100 active:scale-98 transition-all flex items-center justify-center gap-2"
              >
                <Trash2 size={18} />
                Delete Task
              </button>
            </motion.div>

            {/* Safe area spacing */}
            <div className="h-6 safe-area-inset-bottom" />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
