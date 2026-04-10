import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Project, ProjectInsert, ProjectStatus } from '@/types'


// Event for cross-hook communication
const PROJECTS_CHANGED_EVENT = 'projects-changed'
const emitProjectsChanged = () => {
  window.dispatchEvent(new CustomEvent(PROJECTS_CHANGED_EVENT))
}

const getCurrentUserId = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user?.id ?? null
}

export function useProjects(status?: ProjectStatus) {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch projects
  const fetchProjects = async () => {
    try {
      setLoading(true)
      setError(null)

      const userId = await getCurrentUserId()

      if (!userId) {
        setProjects([])
        return
      }

      let query = supabase
        .from('projects')
        .select('*')
        .eq('user_id', userId)
        .order('position', { ascending: true })
        .order('created_at', { ascending: false })

      if (status) {
        query = query.eq('status', status)
      }

      const { data, error: fetchError } = await query

      if (fetchError) {
        console.error('Supabase fetch error:', fetchError)
        throw fetchError
      }

      setProjects(data || [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch projects'
      setError(errorMessage)
      console.error('Error fetching projects:', err)
    } finally {
      setLoading(false)
    }
  }

  // Create project
  const createProject = async (projectData: Partial<ProjectInsert>): Promise<Project | null> => {
    try {
      const userId = await getCurrentUserId()
      if (!userId) {
        throw new Error('You must be signed in to create projects')
      }

      const newProject: ProjectInsert = {
        user_id: userId,
        title: projectData.title || '',
        notes: projectData.notes || null,
        area_id: projectData.area_id || null,
        status: projectData.status || 'active',
        position: projectData.position || 0
      }

      const { data, error: createError } = await supabase
        .from('projects')
        .insert(newProject)
        .select()
        .single()

      if (createError) {
        console.error('Supabase insert error:', createError)
        throw createError
      }

      // Add to local state
      setProjects(prev => [data, ...prev])
      
      // Notify other hook instances
      emitProjectsChanged()
      
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create project'
      setError(errorMessage)
      console.error('Error creating project:', err)
      return null
    }
  }

  // Update project
  const updateProject = async (projectId: string, updates: Partial<Project>): Promise<boolean> => {
    try {
      const userId = await getCurrentUserId()
      if (!userId) {
        throw new Error('You must be signed in to update projects')
      }

      const { error: updateError } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', projectId)
        .eq('user_id', userId)

      if (updateError) {
        console.error('Supabase update error:', updateError)
        throw updateError
      }

      // Update local state - remove project if it no longer matches the status filter
      setProjects(prev => {
        const updatedProjects = prev.map(project =>
          project.id === projectId ? { ...project, ...updates } : project
        )
        
        // Filter out projects that don't match current status filter
        if (status) {
          return updatedProjects.filter(project => project.status === status)
        }
        
        return updatedProjects
      })

      // Notify other hook instances
      emitProjectsChanged()

      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update project'
      setError(errorMessage)
      console.error('Error updating project:', err)
      return false
    }
  }

  // Toggle project status (active/completed)
  const toggleProject = async (projectId: string): Promise<boolean> => {
    try {
      const project = projects.find(p => p.id === projectId)
      if (!project) throw new Error('Project not found')

      const newStatus: ProjectStatus = project.status === 'completed' ? 'active' : 'completed'

      return await updateProject(projectId, { status: newStatus })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to toggle project'
      setError(errorMessage)
      console.error('Error toggling project:', err)
      return false
    }
  }

  // Delete project
  const deleteProject = async (projectId: string): Promise<boolean> => {
    try {
      const userId = await getCurrentUserId()
      if (!userId) {
        throw new Error('You must be signed in to delete projects')
      }

      const { error: deleteError } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId)
        .eq('user_id', userId)

      if (deleteError) {
        console.error('Supabase delete error:', deleteError)
        throw deleteError
      }

      // Remove from local state
      setProjects(prev => prev.filter(project => project.id !== projectId))

      // Notify other hook instances
      emitProjectsChanged()

      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete project'
      setError(errorMessage)
      console.error('Error deleting project:', err)
      return false
    }
  }

  // Initial fetch
  useEffect(() => {
    fetchProjects()
  }, [status])

  // Listen for changes from other hook instances
  useEffect(() => {
    const handleProjectsChanged = () => {
      fetchProjects()
    }
    
    window.addEventListener(PROJECTS_CHANGED_EVENT, handleProjectsChanged)
    
    return () => {
      window.removeEventListener(PROJECTS_CHANGED_EVENT, handleProjectsChanged)
    }
  }, [status])

  // Realtime project sync for the signed-in user
  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null

    const subscribe = async () => {
      const userId = await getCurrentUserId()
      if (!userId) {
        return
      }

      // Use a unique channel name for each hook instance to avoid conflicts
      const channelName = `projects-changes-${status ?? 'all'}-${Math.random().toString(36).substring(7)}`

      channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'projects',
            filter: `user_id=eq.${userId}`
          },
          () => {
            void fetchProjects()
          }
        )
        .subscribe()
    }

    void subscribe()

    return () => {
      if (channel) {
        void supabase.removeChannel(channel)
      }
    }
  }, [status])

  return {
    projects,
    loading,
    error,
    createProject,
    updateProject,
    toggleProject,
    deleteProject,
    refetch: fetchProjects
  }
}
