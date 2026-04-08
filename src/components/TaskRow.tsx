import { Check, Calendar, GripVertical, ListChecks, Trash2, Repeat } from 'lucide-react'
import { motion, useMotionValue, useTransform } from 'framer-motion'
import { cn, parseLocalDate } from '@/lib/utils'
import type { Task } from '@/types'

interface TaskRowProps {
  task: Task
  onToggle: (taskId: string) => void
  onClick: (taskId: string) => void
  onDelete?: (taskId: string) => void
  onReorderStart?: (event: React.PointerEvent<HTMLButtonElement>) => void
  className?: string
}

export function TaskRow({ task, onToggle, onClick, onDelete, onReorderStart, className }: TaskRowProps) {
  const isCompleted = task.status === 'completed'
  const hasChecklist = task.checklist_items.length > 0
  const completedItems = task.checklist_items.filter(item => item.completed).length
  const hasScheduledDate = !!task.scheduled_date
  const isRecurring = !!task.recurrence_rule
  const hasTags = (task.tags?.length || 0) > 0
  const isReorderable = !!onReorderStart

  // Swipe gesture
  const x = useMotionValue(0)
  const backgroundColor = useTransform(
    x,
    [-100, 0, 100],
    ['rgb(239, 68, 68)', 'rgb(255, 255, 255)', 'rgb(34, 197, 94)']
  )
  const opacity = useTransform(x, [-80, -30, 0, 30, 80], [1, 0.6, 0, 0.6, 1])

  const handleDragEnd = (_event: any, info: any) => {
    const threshold = 80
    if (info.offset.x > threshold && !isCompleted) {
      // Swipe right - complete task
      onToggle(task.id)
      x.set(0)
    } else if (info.offset.x < -threshold && onDelete) {
      // Swipe left - delete task
      onDelete(task.id)
    } else {
      // Return to center
      x.set(0)
    }
  }

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onToggle(task.id)
  }

  const formatDate = (dateString: string) => {
    // Parse as local date to avoid timezone conversion issues
    const date = parseLocalDate(dateString)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow'
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
  }

  return (
    <div className="relative overflow-hidden">
      {!isReorderable && (
        <motion.div
          className="absolute inset-0 flex items-center justify-between px-6"
          style={{ backgroundColor }}
        >
          {/* Left side - Delete icon */}
          <motion.div style={{ opacity }}>
            <Trash2 size={24} className="text-white" />
          </motion.div>
          
          {/* Right side - Complete icon */}
          <motion.div style={{ opacity }}>
            <Check size={24} className="text-white" strokeWidth={3} />
          </motion.div>
        </motion.div>
      )}

      {/* Task row */}
      <motion.div
        className={cn(
          'flex items-center gap-3 px-4 py-3 min-h-[48px] bg-white/85 dark:bg-gray-800/90 border-b border-slate-100 dark:border-gray-700',
          'hover:bg-white dark:hover:bg-gray-700 active:bg-slate-50/90 dark:active:bg-gray-700/70 transition-colors cursor-pointer relative',
          isCompleted && 'opacity-60',
          className
        )}
        onClick={() => onClick(task.id)}
        style={isReorderable ? undefined : { x }}
        drag={isReorderable ? false : 'x'}
        dragConstraints={isReorderable ? undefined : { left: 0, right: 0 }}
        dragElastic={isReorderable ? undefined : 0.2}
        onDragEnd={isReorderable ? undefined : handleDragEnd}
        initial={isReorderable ? false : { opacity: 0, x: -20 }}
        animate={isReorderable ? undefined : { opacity: 1, x: 0 }}
        exit={isReorderable ? undefined : { opacity: 0, x: -40, transition: { duration: 0.3, ease: 'easeInOut' } }}
        layout={!isReorderable}
        transition={isReorderable ? undefined : {
          layout: { duration: 0.2, ease: 'easeInOut' }
        }}
      >
      {/* Checkbox */}
      <motion.button
        onClick={handleCheckboxClick}
        className={cn(
          'flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center',
          'transition-colors',
          isCompleted
            ? 'bg-blue-600 border-blue-600'
            : 'border-gray-300 hover:border-blue-400'
        )}
        aria-label={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
        whileTap={{ scale: 0.9 }}
        animate={{
          scale: isCompleted ? [1, 1.15, 1] : 1
        }}
        transition={{
          duration: 0.2,
          ease: 'easeOut'
        }}
      >
        {isCompleted && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <Check size={16} className="text-white" strokeWidth={3} />
          </motion.div>
        )}
      </motion.button>

      {/* Task Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          {/* Title */}
          <span
            className={cn(
              'text-[15px] truncate text-gray-900 dark:text-gray-100',
              isCompleted && 'line-through'
            )}
          >
            {task.title}
          </span>
        </div>

        {/* Metadata row */}
        <div className="flex flex-wrap items-center gap-2 mt-1">
          {/* Scheduled date */}
          {hasScheduledDate && task.scheduled_date && (
            <span className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
              <Calendar size={12} />
              {formatDate(task.scheduled_date)}
            </span>
          )}

          {/* Checklist progress */}
          {hasChecklist && (
            <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <ListChecks size={12} />
              {completedItems}/{task.checklist_items.length}
            </span>
          )}

          {/* Notes indicator */}
          {task.notes && (
            <span className="text-xs text-gray-400 dark:text-gray-500">
              📝
            </span>
          )}

          {/* Recurring indicator */}
          {isRecurring && (
            <span className="flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400" title={`Repeats ${task.recurrence_rule}`}>
              <Repeat size={12} />
            </span>
          )}

          {/* Tags */}
          {hasTags && task.tags.slice(0, 2).map((tag) => (
            <span key={tag} className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-[11px] text-gray-600 dark:text-gray-300">
              #{tag}
            </span>
          ))}
          {hasTags && task.tags.length > 2 && (
            <span className="text-[11px] text-gray-500 dark:text-gray-400">+{task.tags.length - 2}</span>
          )}
        </div>
      </div>

      {onReorderStart && (
        <button
          type="button"
          onPointerDown={(event) => {
            event.stopPropagation()
            onReorderStart(event)
          }}
          onClick={(event) => event.stopPropagation()}
          className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
          aria-label="Reorder task"
        >
          <GripVertical size={16} />
        </button>
      )}
      </motion.div>
    </div>
  )
}
