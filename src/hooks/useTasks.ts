import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { getTodayLocalDate } from '@/lib/utils'
import type { Task, TaskInsert, TaskStatus } from '@/types'


// Event for cross-hook communication
const TASKS_CHANGED_EVENT = 'tasks-changed'
const emitTasksChanged = () => {
  window.dispatchEvent(new CustomEvent(TASKS_CHANGED_EVENT))
}

const normalizeTask = (task: Task): Task => ({
  ...task,
  tags: Array.isArray(task.tags) ? task.tags : [],
  checklist_items: Array.isArray(task.checklist_items) ? task.checklist_items : [],
  status: deriveTaskStatus(task)
})

const deriveTaskStatus = (task: Task): TaskStatus => {
  if (task.status === 'completed') {
    return 'completed'
  }

  if (task.scheduled_date) {
    const today = getTodayLocalDate()

    if (task.scheduled_date <= today) {
      return 'today'
    }

    return 'upcoming'
  }

  return task.status === 'someday' ? 'someday' : 'anytime'
}

const getCurrentUserId = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user?.id ?? null
}

export function useTasks(status?: TaskStatus) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch tasks
  const fetchTasks = async () => {
    try {
      setLoading(true)
      setError(null)

      const userId = await getCurrentUserId()

      if (!userId) {
        setTasks([])
        return
      }

      const query = supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .order('position', { ascending: true })
        .order('created_at', { ascending: false })

      const { data, error: fetchError } = await query

      if (fetchError) {
        console.error('Supabase fetch error:', fetchError)
        throw fetchError
      }

      const normalizedTasks = (data || []).map(task => normalizeTask(task as Task))

      const filteredTasks = status
        ? normalizedTasks.filter(task => task.status === status)
        : normalizedTasks

      setTasks(filteredTasks)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch tasks'
      setError(errorMessage)
      console.error('Error fetching tasks:', err)
      console.error('Full error details:', JSON.stringify(err, null, 2))
    } finally {
      setLoading(false)
    }
  }

  // Create task
  const createTask = async (taskData: Partial<TaskInsert>): Promise<Task | null> => {
    try {
      const userId = await getCurrentUserId()
      if (!userId) {
        throw new Error('You must be signed in to create tasks')
      }

      const newTask: TaskInsert = {
        user_id: userId,
        title: taskData.title || '',
        notes: taskData.notes || null,
        status: taskData.status || 'anytime',
        scheduled_date: taskData.scheduled_date || null,
        deadline_date: taskData.deadline_date || null,
        project_id: taskData.project_id || null,
        tags: taskData.tags || [],
        checklist_items: taskData.checklist_items || [],
        position: taskData.position || 0,
        recurrence_rule: taskData.recurrence_rule || null,
        recurrence_end_date: taskData.recurrence_end_date || null,
        recurrence_parent_id: taskData.recurrence_parent_id || null
      }

      const { data, error: createError } = await supabase
        .from('tasks')
        .insert(newTask)
        .select()
        .single()

      if (createError) {
        console.error('Supabase insert error:', createError)
        throw createError
      }

      const normalizedTask = normalizeTask(data as Task)

      // Add to local state
      setTasks(prev => [normalizedTask, ...prev])
      
      // Notify other hook instances
      emitTasksChanged()
      
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create task'
      setError(errorMessage)
      console.error('Error creating task:', err)
      console.error('Full error details:', JSON.stringify(err, null, 2))
      return null
    }
  }

  // Update task
  const updateTask = async (taskId: string, updates: Partial<Task>): Promise<boolean> => {
    try {
      const userId = await getCurrentUserId()
      if (!userId) {
        throw new Error('You must be signed in to update tasks')
      }

      const { error: updateError } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', taskId)
        .eq('user_id', userId)

      if (updateError) throw updateError

      // Update local state - remove task if it no longer matches the status filter
      setTasks(prev => {
        const updatedTasks = prev.map(task => {
          if (task.id !== taskId) return task

          const mergedTask = { ...task, ...updates } as Task
          return normalizeTask(mergedTask)
        })
        
        if (status) {
          return updatedTasks.filter(task => task.status === status)
        }
        
        return updatedTasks
      })

      // Notify other hook instances
      emitTasksChanged()

      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task')
      console.error('Error updating task:', err)
      return false
    }
  }

  // Toggle task completion
  const toggleTask = async (taskId: string): Promise<boolean> => {
    try {
      const task = tasks.find(t => t.id === taskId)
      if (!task) throw new Error('Task not found')

      const isCompleted = task.status === 'completed'
      
      // If completing a recurring task, create next instance
      if (!isCompleted && task.recurrence_rule) {
        await handleRecurringTaskCompletion(task)
      }
      
      const updates: Partial<Task> = {
        status: isCompleted
          ? (task.scheduled_date ? (task.scheduled_date <= getTodayLocalDate() ? 'today' : 'upcoming') : 'anytime')
          : 'completed',
        completed_at: isCompleted ? null : new Date().toISOString()
      }

      return await updateTask(taskId, updates)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle task')
      console.error('Error toggling task:', err)
      return false
    }
  }

  // Handle recurring task completion by creating next instance
  const handleRecurringTaskCompletion = async (task: Task) => {
    try {
      const nextDate = calculateNextOccurrence(task.scheduled_date, task.recurrence_rule!)
      
      // Create next instance
      const userId = await getCurrentUserId()
      if (!userId) {
        return
      }

      const nextTask: TaskInsert = {
        user_id: userId,
        title: task.title,
        notes: task.notes,
        status: task.status, // Keep same status (today/anytime/upcoming)
        scheduled_date: nextDate,
        deadline_date: task.deadline_date,
        project_id: task.project_id,
        tags: task.tags || [],
        checklist_items: task.checklist_items.map(item => ({ ...item, completed: false })), // Reset checklist
        position: task.position,
        recurrence_rule: task.recurrence_rule,
        recurrence_end_date: task.recurrence_end_date,
        recurrence_parent_id: task.recurrence_parent_id || task.id // Link to original or parent
      }

      const { data, error: createError } = await supabase
        .from('tasks')
        .insert(nextTask)
        .select()
        .single()

      if (createError) throw createError

      const normalizedTask = {
        ...data,
        status: deriveTaskStatus(data)
      }

      // Add to local state if it matches current filter
      if (!status || normalizedTask.status === status) {
        setTasks(prev => [normalizedTask, ...prev])
      }
    } catch (err) {
      console.error('Error creating recurring task instance:', err)
      // Don't fail the whole operation if next instance creation fails
    }
  }

  // Calculate next occurrence date based on recurrence rule
  const calculateNextOccurrence = (currentDate: string | null, rule: string): string => {
    const base = currentDate ? new Date(currentDate) : new Date()
    const next = new Date(base)

    switch (rule) {
      case 'daily':
        next.setDate(next.getDate() + 1)
        break
      case 'weekly':
        next.setDate(next.getDate() + 7)
        break
      case 'monthly':
        next.setMonth(next.getMonth() + 1)
        break
      default:
        // For custom RRULE, default to daily
        next.setDate(next.getDate() + 1)
    }

    return next.toISOString().split('T')[0] // Return YYYY-MM-DD
  }

  // Reorder tasks within the current view/group
  const reorderTasks = async (reorderedTasks: Task[]): Promise<boolean> => {
    try {
      const tasksWithPositions = reorderedTasks.map((task, index) => ({
        ...task,
        position: index
      }))

      const positionMap = new Map(tasksWithPositions.map(task => [task.id, task.position]))

      setTasks(prev =>
        prev
          .map(task =>
            positionMap.has(task.id)
              ? { ...task, position: positionMap.get(task.id)! }
              : task
          )
          .sort((a, b) => a.position - b.position)
      )

      const userId = await getCurrentUserId()
      if (!userId) {
        throw new Error('You must be signed in to reorder tasks')
      }

      const results = await Promise.all(
        tasksWithPositions.map(task =>
          supabase
            .from('tasks')
            .update({ position: task.position })
            .eq('id', task.id)
            .eq('user_id', userId)
        )
      )

      const failed = results.find(result => result.error)
      if (failed?.error) {
        throw failed.error
      }

      emitTasksChanged()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reorder tasks')
      console.error('Error reordering tasks:', err)
      return false
    }
  }

  // Delete task
  const deleteTask = async (taskId: string): Promise<boolean> => {
    try {
      const userId = await getCurrentUserId()
      if (!userId) {
        throw new Error('You must be signed in to delete tasks')
      }

      const { error: deleteError } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)
        .eq('user_id', userId)

      if (deleteError) throw deleteError

      // Remove from local state
      setTasks(prev => prev.filter(task => task.id !== taskId))

      // Notify other hook instances
      emitTasksChanged()

      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task')
      console.error('Error deleting task:', err)
      return false
    }
  }

  // Initial fetch
  useEffect(() => {
    fetchTasks()
  }, [status])

  // Listen for changes from other hook instances
  useEffect(() => {
    const handleTasksChanged = () => {
      fetchTasks()
    }
    
    window.addEventListener(TASKS_CHANGED_EVENT, handleTasksChanged)
    
    return () => {
      window.removeEventListener(TASKS_CHANGED_EVENT, handleTasksChanged)
    }
  }, [status])

  // Set up real-time subscription for the signed-in user's tasks
  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null

    const subscribe = async () => {
      const userId = await getCurrentUserId()
      if (!userId) {
        return
      }

      channel = supabase
        .channel(`tasks-changes-${status ?? 'all'}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'tasks',
            filter: `user_id=eq.${userId}`
          },
          () => {
            void fetchTasks()
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
    tasks,
    loading,
    error,
    createTask,
    updateTask,
    toggleTask,
    reorderTasks,
    deleteTask,
    refetch: fetchTasks
  }
}
