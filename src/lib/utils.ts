import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Task } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Get today's date in local timezone formatted as YYYY-MM-DD
 * This ensures the date matches the user's local timezone, not UTC
 */
export function getTodayLocalDate(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Parse a YYYY-MM-DD date string as a local date (not UTC)
 * This prevents timezone conversion issues when displaying dates
 */
export function parseLocalDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function buildTaskSearchText(task: Task, projectTitle?: string): string {
  return [
    task.title,
    task.notes || '',
    projectTitle || '',
    ...(task.tags || []),
    ...(task.checklist_items || []).map(item => item.title)
  ]
    .join(' ')
    .toLowerCase()
}

export function matchesTaskSearch(task: Task, query: string, projectTitle?: string): boolean {
  const normalizedQuery = query.trim().toLowerCase()
  if (!normalizedQuery) return true

  return buildTaskSearchText(task, projectTitle).includes(normalizedQuery)
}
