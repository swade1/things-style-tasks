import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Calendar, FolderKanban, Search, Tag, X } from 'lucide-react'
import { useProjects, useTasks } from '@/hooks'
import { cn, matchesTaskSearch, parseLocalDate } from '@/lib/utils'
import type { Task } from '@/types'

interface GlobalSearchSheetProps {
  isOpen: boolean
  onClose: () => void
  onSelectTask: (task: Task) => void
}

const statusMeta = {
  today: { label: 'Today', className: 'bg-blue-50 text-blue-700' },
  anytime: { label: 'Anytime', className: 'bg-gray-100 text-gray-700' },
  upcoming: { label: 'Upcoming', className: 'bg-amber-50 text-amber-700' },
  someday: { label: 'Someday', className: 'bg-purple-50 text-purple-700' },
  completed: { label: 'Completed', className: 'bg-green-50 text-green-700' }
} as const

function formatScheduledDate(dateString: string | null) {
  if (!dateString) return null

  const date = parseLocalDate(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  })
}

export function GlobalSearchSheet({ isOpen, onClose, onSelectTask }: GlobalSearchSheetProps) {
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const { tasks, loading } = useTasks()
  const { projects } = useProjects('active')

  const projectTitleMap = useMemo(
    () => new Map(projects.map(project => [project.id, project.title])),
    [projects]
  )

  useEffect(() => {
    if (!isOpen) {
      setQuery('')
      setActiveIndex(0)
      return
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [isOpen])

  const normalizedQuery = query.trim()
  const filteredTasks = useMemo(() => {
    const searchableTasks = tasks.filter(task => task.status !== 'completed')

    if (!normalizedQuery) {
      return searchableTasks.slice(0, 8)
    }

    return searchableTasks
      .filter(task =>
        matchesTaskSearch(
          task,
          normalizedQuery,
          task.project_id ? projectTitleMap.get(task.project_id) : undefined
        )
      )
      .slice(0, 30)
  }, [tasks, normalizedQuery, projectTitleMap])

  const groupedResults = useMemo(() => {
    return filteredTasks.reduce<Record<string, Task[]>>((groups, task) => {
      const key = task.status
      if (!groups[key]) {
        groups[key] = []
      }
      groups[key].push(task)
      return groups
    }, {})
  }, [filteredTasks])

  useEffect(() => {
    setActiveIndex(filteredTasks.length > 0 ? 0 : -1)
  }, [filteredTasks.length, normalizedQuery])

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      onClose()
      return
    }

    if (filteredTasks.length === 0) return

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((prev) => (prev + 1) % filteredTasks.length)
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((prev) => (prev <= 0 ? filteredTasks.length - 1 : prev - 1))
    }

    if (event.key === 'Enter' && activeIndex >= 0) {
      event.preventDefault()
      onSelectTask(filteredTasks[activeIndex])
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/40 z-[60]"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            className="things-sheet fixed inset-x-0 top-0 z-[70] rounded-b-[28px] shadow-2xl max-h-[85vh] flex flex-col border-b border-white/70"
            initial={{ y: '-100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '-100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 26, stiffness: 260 }}
          >
            <div className="px-4 pt-4 pb-3 border-b border-gray-100">
              <div className="w-10 h-1 rounded-full bg-gray-300/80 mx-auto mb-3" />
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50">
                <Search size={18} className="text-gray-400" />
                <input
                  autoFocus
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleInputKeyDown}
                  placeholder="Search tasks, notes, tags, or projects..."
                  className="flex-1 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
                />
                <span className="hidden sm:inline text-[11px] text-gray-400 border border-gray-200 rounded px-1.5 py-0.5">
                  ⌘K
                </span>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Close global search"
                >
                  <X size={18} />
                </button>
              </div>
              <p className="mt-2 text-[11px] text-gray-500 text-center">
                Search across titles, notes, checklists, tags, and projects • ↑↓ navigate • Enter opens
              </p>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4">
              {!normalizedQuery && (
                <div className="things-empty-card rounded-[20px] p-4 mb-4 text-center text-gray-500">
                  <div className="text-3xl mb-2">🔎</div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Global search</p>
                  <p className="text-sm">Start typing or jump back into one of your recent tasks below.</p>
                </div>
              )}

              {loading ? (
                <div className="text-center py-10 text-sm text-gray-500">Searching…</div>
              ) : filteredTasks.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                  <p className="text-sm font-medium text-gray-700 mb-1">No matches found</p>
                  <p className="text-sm">Try another title, tag, or project keyword.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {(['today', 'anytime', 'upcoming', 'someday'] as const).map((status) => {
                    const items = groupedResults[status] || []
                    if (items.length === 0) return null

                    return (
                      <section key={status} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                            {!normalizedQuery ? `Recent ${statusMeta[status].label}` : statusMeta[status].label}
                          </h3>
                          <span className="text-xs text-gray-400">{items.length}</span>
                        </div>

                        <div className="space-y-2">
                          {items.map((task) => {
                            const projectTitle = task.project_id ? projectTitleMap.get(task.project_id) : undefined
                            const scheduledLabel = formatScheduledDate(task.scheduled_date)
                            const resultIndex = filteredTasks.findIndex(item => item.id === task.id)

                            return (
                              <button
                                key={task.id}
                                type="button"
                                onClick={() => onSelectTask(task)}
                                className={cn(
                                  'w-full text-left p-3 rounded-xl border bg-white transition-colors',
                                  resultIndex === activeIndex
                                    ? 'border-blue-300 bg-blue-50/70 ring-2 ring-blue-100'
                                    : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/40'
                                )}
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                      <span className="font-medium text-gray-900 truncate">{task.title}</span>
                                      <span className={cn('px-2 py-0.5 rounded-full text-[11px] font-medium', statusMeta[status].className)}>
                                        {statusMeta[status].label}
                                      </span>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                                      {projectTitle && (
                                        <span className="inline-flex items-center gap-1">
                                          <FolderKanban size={12} />
                                          {projectTitle}
                                        </span>
                                      )}
                                      {scheduledLabel && (
                                        <span className="inline-flex items-center gap-1 text-blue-600">
                                          <Calendar size={12} />
                                          {scheduledLabel}
                                        </span>
                                      )}
                                      {task.tags.slice(0, 2).map((tag) => (
                                        <span key={tag} className="inline-flex items-center gap-1 text-gray-600">
                                          <Tag size={12} />
                                          #{tag}
                                        </span>
                                      ))}
                                    </div>
                                  </div>

                                  <ArrowRight size={16} className="text-gray-300 flex-shrink-0 mt-0.5" />
                                </div>
                              </button>
                            )
                          })}
                        </div>
                      </section>
                    )
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
