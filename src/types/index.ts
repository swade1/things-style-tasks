export * from './database'
import type { Task, Project } from './database'

// UI-specific types
export type ViewType = 'today' | 'anytime' | 'upcoming' | 'projects'

export interface TaskWithProject extends Task {
  project?: Project
}

// Component prop types can be added here as needed
