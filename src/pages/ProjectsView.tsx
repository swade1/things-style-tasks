import { NavigationBar, ProjectRow, QuickEntryProject, SettingsAboutSheet } from '@/components'
import { ProjectDetailSheet } from '@/components/ProjectDetailSheet'
import { useAuth, useProjects, useTasks } from '@/hooks'
import { AnimatePresence } from 'framer-motion'
import { ChevronRight, Loader2, Settings } from 'lucide-react'
import { useState } from 'react'
import type { Project } from '@/types'

interface ProjectsViewProps {
  onOpenSearch?: () => void
}

export function ProjectsView({ onOpenSearch }: ProjectsViewProps) {
  const { user, signOut } = useAuth()
  const { projects, loading, error, createProject, updateProject, toggleProject, deleteProject } = useProjects('active')
  const { tasks } = useTasks() // Get all tasks to count per project
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  // Count tasks per project
  const getTaskCount = (projectId: string) => {
    return tasks.filter(task => 
      task.project_id === projectId && task.status !== 'completed'
    ).length
  }

  const handleAddProject = async (title: string, notes?: string) => {
    await createProject({ title, notes })
  }

  const handleProjectClick = (projectId: string) => {
    const project = projects.find(p => p.id === projectId)
    if (project) {
      setSelectedProject(project)
      setIsDetailSheetOpen(true)
    }
  }

  const handleCloseDetailSheet = () => {
    setIsDetailSheetOpen(false)
    // Wait for animation to complete before clearing selected project
    setTimeout(() => setSelectedProject(null), 300)
  }

  return (
    <div className="things-screen flex flex-col h-screen">
      {/* Navigation */}
      <NavigationBar 
        title="Projects"
        onSearch={onOpenSearch}
        onRightAction={() => setIsSettingsOpen(true)}
        rightIcon={<Settings size={20} />}
        rightAriaLabel="Open settings and about"
      />

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-28">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-red-600 font-medium mb-2">Error loading projects</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{error}</p>
            </div>
          </div>
        ) : projects.length === 0 ? (
          <div className="flex items-center justify-center h-64 px-4">
            <div className="things-empty-card text-center px-8 py-8 rounded-[24px] max-w-sm w-full">
              <div className="text-6xl mb-4">📁</div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                No projects yet
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-6">
                Tap the + button to create your first project
              </p>
            </div>
          </div>
        ) : (
          <div className="things-surface rounded-[24px] mx-4 mt-4 overflow-hidden">
            <AnimatePresence mode="popLayout">
              {projects.map((project) => (
                <ProjectRow
                  key={project.id}
                  project={project}
                  taskCount={getTaskCount(project.id)}
                  onToggle={toggleProject}
                  onClick={handleProjectClick}
                  onDelete={deleteProject}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        <div className="mx-4 mt-4">
          <button
            type="button"
            onClick={() => setIsSettingsOpen(true)}
            className="things-surface w-full rounded-[24px] px-4 py-4 text-left hover:bg-white/90 transition-colors"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Settings & About</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Account, sync details, shortcuts, and project credits{user?.email ? ` • ${user.email}` : ''}
                </p>
              </div>
              <ChevronRight size={18} className="text-gray-400 flex-shrink-0" />
            </div>
          </button>
        </div>
      </div>

      {/* Quick Entry Project */}
      <QuickEntryProject onAddProject={handleAddProject} />

      {/* Project Detail Sheet */}
      <ProjectDetailSheet
        project={selectedProject}
        isOpen={isDetailSheetOpen}
        onClose={handleCloseDetailSheet}
        onUpdate={updateProject}
        onDelete={deleteProject}
      />

      <SettingsAboutSheet
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        email={user?.email}
        onSignOut={async () => {
          setIsSettingsOpen(false)
          await signOut()
        }}
      />
    </div>
  )
}
