// Database types matching Supabase schema

export type TaskStatus = 'today' | 'anytime' | 'upcoming' | 'someday' | 'completed'

export type RecurrenceRule = 'daily' | 'weekly' | 'monthly' | string // string for custom RRULE

export type ChecklistItem = {
  id: string
  title: string
  completed: boolean
}

export interface Task {
  id: string
  user_id: string
  title: string
  notes: string | null
  status: TaskStatus
  scheduled_date: string | null // ISO date string
  deadline_date: string | null // ISO date string
  project_id: string | null
  tags: string[]
  checklist_items: ChecklistItem[]
  position: number
  completed_at: string | null // ISO timestamp
  recurrence_rule: RecurrenceRule | null // Repeating pattern: 'daily', 'weekly', 'monthly', or RRULE
  recurrence_end_date: string | null // Optional end date for recurring series
  recurrence_parent_id: string | null // Links to parent recurring task (for instances)
  created_at: string // ISO timestamp
  updated_at: string // ISO timestamp
}

export type ProjectStatus = 'active' | 'completed'

export interface Project {
  id: string
  user_id: string
  title: string
  notes: string | null
  area_id: string | null
  status: ProjectStatus
  position: number
  created_at: string
  updated_at: string
}

export interface Area {
  id: string
  user_id: string
  title: string
  position: number
  created_at: string
  updated_at: string
}

export type Theme = 'light' | 'dark' | 'system'

export interface UserPreferences {
  user_id: string
  theme: Theme
  first_day_of_week: number // 0 = Sunday, 1 = Monday
  created_at: string
  updated_at: string
}

// Insert types (without id, timestamps, etc.)
export type TaskInsert = Omit<Task, 'id' | 'created_at' | 'updated_at' | 'completed_at'> & {
  id?: string
  completed_at?: string | null
}

export type ProjectInsert = Omit<Project, 'id' | 'created_at' | 'updated_at'> & {
  id?: string
}

export type AreaInsert = Omit<Area, 'id' | 'created_at' | 'updated_at'> & {
  id?: string
}

// Update types (all fields optional except id)
export type TaskUpdate = Partial<Omit<Task, 'id' | 'user_id' | 'created_at'>> & {
  id: string
}

export type ProjectUpdate = Partial<Omit<Project, 'id' | 'user_id' | 'created_at'>> & {
  id: string
}
