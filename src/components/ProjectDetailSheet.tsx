import { useState, useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X, AlignLeft, Trash2, Plus, Calendar } from 'lucide-react'
import { DatePicker, TaskRow } from '@/components'
import { TaskDetailSheet } from './TaskDetailSheet'
import { useTasks } from '@/hooks'
import { getTodayLocalDate } from '@/lib/utils'
import type { Project, Task } from '@/types'

interface ProjectDetailSheetProps {
  project: Project | null
  isOpen: boolean
  onClose: () => void
  onUpdate: (projectId: string, updates: Partial<Project>) => void
  onDelete: (projectId: string) => void
}

export function ProjectDetailSheet({ project, isOpen, onClose, onUpdate, onDelete }: ProjectDetailSheetProps) {
  const [title, setTitle] = useState('')
  const [notes, setNotes] = useState('')
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskDate, setNewTaskDate] = useState<string | null>(null)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false)
  const titleInputRef = useRef<HTMLInputElement>(null)
  
  // Fetch all tasks to filter by project
  const { tasks, createTask, toggleTask, updateTask, deleteTask } = useTasks()
  
  // Filter tasks for this project
  const projectTasks = project ? tasks.filter(t => t.project_id === project.id) : []
  const incompleteTasks = projectTasks.filter(t => t.status !== 'completed')
  const completedTasks = projectTasks.filter(t => t.status === 'completed')

  useEffect(() => {
    if (project) {
      setTitle(project.title)
      setNotes(project.notes || '')
    }
  }, [project])

  useEffect(() => {
    if (isOpen && titleInputRef.current) {
      titleInputRef.current.focus()
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return

    const previousOverflow = document.body.style.overflow
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isTaskDetailOpen) {
        onClose()
      }
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleEscape)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, isTaskDetailOpen, onClose])

  useEffect(() => {
    if (selectedTask && isTaskDetailOpen) {
      const updatedTask = tasks.find(t => t.id === selectedTask.id)
      if (updatedTask) {
        setSelectedTask(updatedTask)
      } else {
        setIsTaskDetailOpen(false)
        setTimeout(() => setSelectedTask(null), 200)
      }
    }
  }, [tasks, selectedTask, isTaskDetailOpen])

  const handleTitleBlur = () => {
    if (project && title.trim() !== project.title) {
      onUpdate(project.id, { title: title.trim() })
    }
  }

  const handleNotesBlur = () => {
    if (project && notes !== (project.notes || '')) {
      onUpdate(project.id, { notes })
    }
  }

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTaskTitle.trim() || !project) return

    const taskStatus = newTaskDate
      ? (newTaskDate <= getTodayLocalDate() ? 'today' : 'upcoming')
      : 'anytime'
    
    await createTask({
      title: newTaskTitle.trim(),
      project_id: project.id,
      status: taskStatus,
      scheduled_date: newTaskDate
    })
    
    setNewTaskTitle('')
    setNewTaskDate(null)
  }

  const handleDelete = () => {
    if (project) {
      onDelete(project.id)
      onClose()
    }
  }

  const handleTaskClick = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId)
    if (task) {
      setSelectedTask(task)
      setIsTaskDetailOpen(true)
    }
  }

  const handleCloseTaskDetail = () => {
    setIsTaskDetailOpen(false)
    setTimeout(() => setSelectedTask(null), 200)
  }

  if (!project) return null

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
            <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Project Details</h2>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 active:scale-95 transition-all"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Name
                </label>
                <input
                  ref={titleInputRef}
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={handleTitleBlur}
                  className="w-full px-4 py-3 text-base border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                  placeholder="Project name..."
                />
              </motion.div>

              {/* Notes */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <AlignLeft size={16} />
                  Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  onBlur={handleNotesBlur}
                  className="w-full px-4 py-3 text-base border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors resize-none"
                  rows={4}
                  placeholder="Add notes..."
                />
              </motion.div>

              {/* Tasks */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Tasks ({incompleteTasks.length})
                </label>

                {/* Quick add task */}
                <form onSubmit={handleAddTask} className="mb-3 space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      className="flex-1 px-4 py-2 text-sm border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                      placeholder="Add a task..."
                    />
                    <button
                      type="submit"
                      disabled={!newTaskTitle.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all flex items-center gap-2"
                    >
                      <Plus size={16} />
                      Add
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2 flex items-center gap-2">
                      <Calendar size={14} />
                      Schedule when creating (optional)
                    </label>
                    <DatePicker value={newTaskDate} onChange={setNewTaskDate} />
                  </div>
                </form>

                {/* Task list */}
                <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
                  {projectTasks.length === 0 ? (
                    <div className="px-4 py-8 text-center">
                      <p className="text-sm text-gray-500">
                        No tasks in this project yet
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Incomplete tasks */}
                      <AnimatePresence mode="popLayout">
                        {incompleteTasks.map((task) => (
                          <TaskRow
                            key={task.id}
                            task={task}
                            onToggle={toggleTask}
                            onClick={handleTaskClick}
                            onDelete={deleteTask}
                          />
                        ))}
                      </AnimatePresence>

                      {/* Completed tasks */}
                      {completedTasks.length > 0 && (
                        <>
                          <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                              Completed ({completedTasks.length})
                            </p>
                          </div>
                          <AnimatePresence mode="popLayout">
                            {completedTasks.map((task) => (
                              <TaskRow
                                key={task.id}
                                task={task}
                                onToggle={toggleTask}
                                onClick={handleTaskClick}
                                onDelete={deleteTask}
                              />
                            ))}
                          </AnimatePresence>
                        </>
                      )}
                    </>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Footer actions */}
            <motion.div
              className="px-4 py-4 border-t border-gray-100"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
            >
              <button
                onClick={handleDelete}
                className="w-full px-4 py-3 rounded-lg font-medium text-red-600 bg-red-50 hover:bg-red-100 active:scale-98 transition-all flex items-center justify-center gap-2"
              >
                <Trash2 size={18} />
                Delete Project
              </button>
            </motion.div>

            {/* Safe area spacing */}
            <div className="h-6 safe-area-inset-bottom" />
          </motion.div>

          <TaskDetailSheet
            task={selectedTask}
            isOpen={isTaskDetailOpen}
            onClose={handleCloseTaskDetail}
            onUpdate={updateTask}
            onDelete={deleteTask}
          />
        </>
      )}
    </AnimatePresence>
  )
}
