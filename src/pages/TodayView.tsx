import { useState, useEffect } from 'react'
import { NavigationBar, ReorderableTaskItem, QuickEntry, SearchBar } from '@/components'
import { TaskDetailSheet } from '@/components/TaskDetailSheet'
import { useProjects, useTasks } from '@/hooks'
import { getTodayLocalDate, matchesTaskSearch } from '@/lib/utils'
import { AnimatePresence, Reorder } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import type { Task } from '@/types'

interface TodayViewProps {
  onOpenSearch?: () => void
  focusTaskId?: string | null
  onFocusHandled?: () => void
}

export function TodayView({ onOpenSearch, focusTaskId, onFocusHandled }: TodayViewProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const { tasks, loading, error, createTask, toggleTask, updateTask, reorderTasks, deleteTask } = useTasks('today')
  const { projects } = useProjects('active')
  const projectTitleMap = new Map(projects.map(project => [project.id, project.title]))

  const filteredTasks = tasks.filter((task) =>
    matchesTaskSearch(task, searchQuery, task.project_id ? projectTitleMap.get(task.project_id) : undefined)
  )

  useEffect(() => {
    if (!focusTaskId) return

    const matchingTask = tasks.find(task => task.id === focusTaskId)
    if (matchingTask) {
      setSelectedTask(matchingTask)
      setIsDetailOpen(true)
      onFocusHandled?.()
    }
  }, [focusTaskId, tasks, onFocusHandled])

  // Update selected task when tasks change, or close sheet if task no longer in this view
  useEffect(() => {
    if (selectedTask && isDetailOpen) {
      const updatedTask = tasks.find(t => t.id === selectedTask.id)
      if (updatedTask) {
        setSelectedTask(updatedTask)
      } else {
        // Task no longer in this view (moved to another status), close the sheet
        setIsDetailOpen(false)
        setTimeout(() => setSelectedTask(null), 300)
      }
    }
  }, [tasks, selectedTask, isDetailOpen])

  const handleAddTask = async (title: string, status: 'today' | 'anytime' | 'upcoming', scheduledDate?: string | null) => {
    await createTask({
      title,
      status,
      scheduled_date: status === 'today' ? getTodayLocalDate() : status === 'upcoming' ? (scheduledDate || null) : null
    })
  }

  const handleTaskClick = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId)
    if (task) {
      setSelectedTask(task)
      setIsDetailOpen(true)
    }
  }

  const handleCloseDetail = () => {
    setIsDetailOpen(false)
    setTimeout(() => setSelectedTask(null), 300)
  }

  // Format today's date for display
  const today = new Date()
  const formattedDate = today.toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric',
    year: 'numeric'
  })

  return (
    <div className="things-screen flex flex-col h-screen">
      {/* Navigation */}
      <NavigationBar 
        title="Today" 
        subtitle={formattedDate}
        onSearch={onOpenSearch || (() => setIsSearchOpen(prev => !prev))}
      />

      <AnimatePresence>
        {isSearchOpen && (
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onClose={() => {
              setIsSearchOpen(false)
              setSearchQuery('')
            }}
            placeholder="Search today's tasks..."
          />
        )}
      </AnimatePresence>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-20">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-red-600 font-medium mb-2">Error loading tasks</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{error}</p>
            </div>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="flex items-center justify-center h-64 px-4">
            <div className="things-empty-card text-center px-8 py-8 rounded-[24px] max-w-sm w-full">
              <div className="text-6xl mb-4">☀️</div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {searchQuery ? 'No matching tasks' : 'No tasks today'}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-6">
                {searchQuery ? 'Try a different search term' : 'Tap the + button to add your first task'}
              </p>
            </div>
          </div>
        ) : (
          <div className="things-surface rounded-[24px] mx-4 mt-4 overflow-hidden">
            <Reorder.Group axis="y" values={filteredTasks} onReorder={reorderTasks} className="list-none">
              <AnimatePresence mode="popLayout">
                {filteredTasks.map((task) => (
                  <ReorderableTaskItem
                    key={task.id}
                    task={task}
                    onToggle={toggleTask}
                    onClick={handleTaskClick}
                    onDelete={deleteTask}
                  />
                ))}
              </AnimatePresence>
            </Reorder.Group>
          </div>
        )}
      </div>

      {/* Quick Entry */}
      <QuickEntry onAddTask={handleAddTask} defaultStatus="today" />

      {/* Task Detail Sheet */}
      <TaskDetailSheet
        task={selectedTask}
        isOpen={isDetailOpen}
        onClose={handleCloseDetail}
        onUpdate={updateTask}
        onDelete={deleteTask}
      />
    </div>
  )
}
