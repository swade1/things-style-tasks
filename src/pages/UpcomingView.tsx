import { useState, useEffect } from 'react'
import { NavigationBar, ReorderableTaskItem, QuickEntry, SearchBar } from '@/components'
import { TaskDetailSheet } from '@/components/TaskDetailSheet'
import { useTasks, useProjects } from '@/hooks'
import { getTodayLocalDate, matchesTaskSearch } from '@/lib/utils'
import { AnimatePresence, Reorder } from 'framer-motion'
import { ChevronDown, ChevronRight, FolderKanban, Loader2 } from 'lucide-react'
import type { Task } from '@/types'

interface UpcomingViewProps {
  onOpenSearch?: () => void
  focusTaskId?: string | null
  onFocusHandled?: () => void
}

export function UpcomingView({ onOpenSearch, focusTaskId, onFocusHandled }: UpcomingViewProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({})
  const [displayGroupTasks, setDisplayGroupTasks] = useState<Map<string, Task[]>>(new Map())
  const { tasks, loading, error, createTask, toggleTask, updateTask, reorderTasks, deleteTask } = useTasks('upcoming')
  const { projects } = useProjects('active')
  const projectTitleMap = new Map(projects.map(project => [project.id, project.title]))

  const filteredTasks = tasks.filter((task) =>
    matchesTaskSearch(task, searchQuery, task.project_id ? projectTitleMap.get(task.project_id) : undefined)
  )

  const groupedTasks = [
    {
      id: 'no-project',
      title: 'Non-Project Tasks',
      tasks: filteredTasks.filter(task => !task.project_id)
    },
    ...projects
      .map(project => ({
        id: project.id,
        title: project.title,
        tasks: filteredTasks.filter(task => task.project_id === project.id)
      }))
      .filter(group => group.tasks.length > 0)
  ].filter(group => group.tasks.length > 0)

  // Update display tasks when grouped tasks change
  useEffect(() => {
    const newMap = new Map<string, Task[]>()
    groupedTasks.forEach(group => {
      newMap.set(group.id, group.tasks)
    })
    setDisplayGroupTasks(newMap)
  }, [groupedTasks.map(g => g.tasks.map(t => t.id).join(',')).join('|')])

  const handleReorderGroup = (groupId: string, reorderedTasks: Task[]) => {
    setDisplayGroupTasks(prev => {
      const newMap = new Map(prev)
      newMap.set(groupId, reorderedTasks)
      return newMap
    })
  }

  const handleDragEnd = (groupId: string) => {
    const groupTasks = displayGroupTasks.get(groupId)
    if (groupTasks) {
      reorderTasks(groupTasks)
    }
  }

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

  const toggleGroup = (groupId: string) => {
    setCollapsedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }))
  }

  const handleCloseDetail = () => {
    setIsDetailOpen(false)
    setTimeout(() => setSelectedTask(null), 300)
  }

  return (
    <div className="things-screen flex flex-col h-screen">
      {/* Navigation */}
      <NavigationBar title="Upcoming" onSearch={onOpenSearch || (() => setIsSearchOpen(prev => !prev))} />

      <AnimatePresence>
        {isSearchOpen && (
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onClose={() => {
              setIsSearchOpen(false)
              setSearchQuery('')
            }}
            placeholder="Search upcoming tasks..."
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
              <div className="text-6xl mb-4">📅</div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {searchQuery ? 'No matching tasks' : 'No upcoming tasks'}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-6">
                {searchQuery ? 'Try a different search term' : 'Tasks scheduled for future dates will appear here'}
              </p>
            </div>
          </div>
        ) : (
          <div className="mx-4 mt-4 space-y-4">
            {groupedTasks.map((group) => {
              const isCollapsed = collapsedGroups[group.id] ?? false

              return (
                <div key={group.id} className="things-surface rounded-[22px] overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleGroup(group.id)}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-600 flex items-center justify-between text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      {isCollapsed ? (
                        <ChevronRight size={16} className="text-gray-500 dark:text-gray-400" />
                      ) : (
                        <ChevronDown size={16} className="text-gray-500 dark:text-gray-400" />
                      )}
                      <FolderKanban size={16} className="text-gray-500 dark:text-gray-400" />
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{group.title}</h3>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                      {group.tasks.length}
                    </span>
                  </button>

                  {!isCollapsed && (
                    <Reorder.Group 
                      axis="y" 
                      values={displayGroupTasks.get(group.id) || group.tasks} 
                      onReorder={(reordered) => handleReorderGroup(group.id, reordered)} 
                      className="list-none"
                    >
                      <AnimatePresence mode="popLayout">
                        {(displayGroupTasks.get(group.id) || group.tasks).map((task) => (
                          <ReorderableTaskItem
                            key={task.id}
                            task={task}
                            onToggle={toggleTask}
                            onClick={handleTaskClick}
                            onDelete={deleteTask}
                            onDragEnd={() => handleDragEnd(group.id)}
                          />
                        ))}
                      </AnimatePresence>
                    </Reorder.Group>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Quick Entry */}
      <QuickEntry onAddTask={handleAddTask} defaultStatus="upcoming" />
      {/* Task Detail Sheet */}
      <TaskDetailSheet
        task={selectedTask}
        isOpen={isDetailOpen}
        onClose={handleCloseDetail}
        onUpdate={updateTask}
        onDelete={deleteTask}
      />    </div>
  )
}
