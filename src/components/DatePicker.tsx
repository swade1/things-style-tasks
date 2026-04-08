import { Calendar, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn, getTodayLocalDate } from '@/lib/utils'
import { useEffect, useRef, useState } from 'react'

interface DatePickerProps {
  value: string | null // YYYY-MM-DD format
  onChange: (date: string | null) => void
  className?: string
}

export function DatePicker({ value, onChange, className }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [draftValue, setDraftValue] = useState(value || '')
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setDraftValue(value || '')
  }, [value])

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    document.addEventListener('mousedown', handlePointerDown)

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.removeEventListener('mousedown', handlePointerDown)
    }
  }, [])

  const formatDisplayDate = (dateString: string | null): string => {
    if (!dateString) return 'Pick a date'
    
    const date = new Date(dateString + 'T00:00:00')
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow'
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'short',
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      })
    }
  }

  const getQuickDates = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    const thisWeekend = new Date(today)
    const daysUntilSaturday = (6 - today.getDay() + 7) % 7
    thisWeekend.setDate(today.getDate() + (daysUntilSaturday === 0 ? 7 : daysUntilSaturday))
    
    const nextWeek = new Date(today)
    const daysUntilMonday = (1 - today.getDay() + 7) % 7
    nextWeek.setDate(today.getDate() + (daysUntilMonday === 0 ? 7 : daysUntilMonday))
    
    const nextMonth = new Date(today)
    nextMonth.setMonth(nextMonth.getMonth() + 1)
    nextMonth.setDate(1)

    return {
      tomorrow: tomorrow.toISOString().split('T')[0],
      thisWeekend: thisWeekend.toISOString().split('T')[0],
      nextWeek: nextWeek.toISOString().split('T')[0],
      nextMonth: nextMonth.toISOString().split('T')[0]
    }
  }

  const quickDates = getQuickDates()

  const handleQuickDate = (date: string) => {
    onChange(date)
    setIsOpen(false)
  }

  const handleManualDateChange = (date: string) => {
    setDraftValue(date)

    // Only save when the browser has produced a complete valid date.
    // Partial typing can temporarily emit an empty string.
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      onChange(date)
    }
  }

  const handleClearDate = () => {
    onChange(null)
    setIsOpen(false)
  }

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {/* Date display button */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'flex-1 px-4 py-3 rounded-lg font-medium transition-all flex items-center justify-between',
            value
              ? 'bg-blue-50 text-blue-700 border-2 border-blue-200'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-transparent'
          )}
        >
          <span className="flex items-center gap-2">
            <Calendar size={18} />
            {formatDisplayDate(value)}
          </span>
        </button>

        {value && (
          <button
            type="button"
            onClick={handleClearDate}
            className="p-3 text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
            aria-label="Clear date"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Date picker popover */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="mt-2 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden max-h-[50vh] overflow-y-auto"
          >
            {/* Calendar input */}
            <div className="p-3 border-b border-gray-100">
              <input
                type="date"
                value={draftValue}
                onChange={(e) => handleManualDateChange(e.target.value)}
                min={getTodayLocalDate()}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Quick date options */}
            <div className="p-2 space-y-1">
              <button
                type="button"
                onClick={() => handleQuickDate(getTodayLocalDate())}
                className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 rounded transition-colors"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => handleQuickDate(quickDates.tomorrow)}
                className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 rounded transition-colors"
              >
                Tomorrow
              </button>
              <button
                type="button"
                onClick={() => handleQuickDate(quickDates.thisWeekend)}
                className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 rounded transition-colors"
              >
                This Weekend
              </button>
              <button
                type="button"
                onClick={() => handleQuickDate(quickDates.nextWeek)}
                className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 rounded transition-colors"
              >
                Next Week
              </button>
              <button
                type="button"
                onClick={() => handleQuickDate(quickDates.nextMonth)}
                className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 rounded transition-colors"
              >
                Next Month
              </button>
            </div>

            {/* Clear date */}
            {value && (
              <div className="p-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleClearDate}
                  className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
                >
                  Clear Date
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
