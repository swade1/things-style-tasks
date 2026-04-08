import { Check, ChevronRight, Trash2 } from 'lucide-react'
import { motion, useMotionValue, useTransform, useAnimation } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { Project } from '@/types'
import { useEffect } from 'react'

interface ProjectRowProps {
  project: Project
  taskCount?: number
  onToggle: (projectId: string) => void
  onClick: (projectId: string) => void
  onDelete?: (projectId: string) => void
  className?: string
}

export function ProjectRow({ 
  project, 
  taskCount = 0,
  onToggle, 
  onClick, 
  onDelete, 
  className 
}: ProjectRowProps) {
  const isCompleted = project.status === 'completed'
  const checkboxControls = useAnimation()

  // Swipe gesture
  const x = useMotionValue(0)
  const backgroundColor = useTransform(
    x,
    [-100, 0, 100],
    ['rgb(239, 68, 68)', 'rgb(255, 255, 255)', 'rgb(34, 197, 94)']
  )
  const iconOpacity = useTransform(
    x, 
    [-80, -30, 0, 30, 80], 
    [1, 0.6, 0, 0.6, 1]
  )

  const handleDragEnd = (_event: any, info: any) => {
    const threshold = 80
    if (info.offset.x > threshold && !isCompleted) {
      // Swipe right - complete project
      onToggle(project.id)
    } else if (info.offset.x < -threshold && onDelete) {
      // Swipe left - delete project
      onDelete(project.id)
    }
    // Always return to center
    x.set(0)
  }

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    
    // Trigger bounce animation on every click
    checkboxControls.start({
      scale: [1, 1.15, 1],
      transition: { duration: 0.3, ease: 'easeOut' }
    })
    
    onToggle(project.id)
  }

  const handleRowClick = () => {
    // Only trigger if not dragging
    const currentX = x.get()
    if (Math.abs(currentX) < 5) {
      onClick(project.id)
    }
  }

  // Trigger bounce when project becomes completed
  useEffect(() => {
    if (isCompleted) {
      checkboxControls.start({
        scale: [1, 1.15, 1],
        transition: { duration: 0.3, ease: 'easeOut' }
      })
    }
  }, [isCompleted, checkboxControls])

  return (
    <div className="relative overflow-hidden">
      {/* Swipe action background */}
      <motion.div
        className="absolute inset-0 flex items-center justify-between px-6 pointer-events-none"
        style={{ backgroundColor }}
      >
        {/* Left side - Delete icon */}
        <motion.div style={{ opacity: iconOpacity }}>
          <Trash2 size={24} className="text-white" />
        </motion.div>
        
        {/* Right side - Complete icon */}
        <motion.div style={{ opacity: iconOpacity }}>
          <Check size={24} className="text-white" strokeWidth={3} />
        </motion.div>
      </motion.div>

      {/* Project row */}
      <motion.div
        className={cn(
          'flex items-center gap-3 px-4 py-3 min-h-[48px] bg-white/85 border-b border-slate-100',
          'cursor-pointer relative hover:bg-white transition-colors',
          isCompleted && 'opacity-60',
          className
        )}
        onClick={handleRowClick}
        style={{ x }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.3}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -40, transition: { duration: 0.3, ease: 'easeInOut' } }}
        layout
        transition={{
          layout: { duration: 0.2, ease: 'easeInOut' }
        }}
        whileTap={{ scale: 0.98 }}
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
          aria-label={isCompleted ? 'Mark as active' : 'Mark as complete'}
          whileTap={{ scale: 0.9 }}
          animate={checkboxControls}
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

        {/* Project Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {/* Title */}
            <span
              className={cn(
                'text-[15px] font-medium truncate',
                isCompleted ? 'line-through text-gray-500 dark:text-gray-600' : 'text-gray-900 dark:text-gray-100'
              )}
            >
              {project.title}
            </span>
          </div>

          {/* Task count */}
          {taskCount > 0 && (
            <div className="flex items-center gap-1 mt-1">
              <span className="text-xs text-gray-500">
                {taskCount} {taskCount === 1 ? 'task' : 'tasks'}
              </span>
            </div>
          )}
        </div>

        {/* Chevron */}
        <ChevronRight size={20} className="text-gray-400 flex-shrink-0" />
      </motion.div>
    </div>
  )
}
