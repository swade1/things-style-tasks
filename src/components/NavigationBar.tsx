import type { ReactNode } from 'react'
import { ArrowLeft, Search } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavigationBarProps {
  title: string
  subtitle?: string
  onBack?: () => void
  onSearch?: () => void
  onRightAction?: () => void
  rightIcon?: ReactNode
  rightAriaLabel?: string
  className?: string
}

export function NavigationBar({
  title,
  subtitle,
  onBack,
  onSearch,
  onRightAction,
  rightIcon,
  rightAriaLabel,
  className
}: NavigationBarProps) {
  return (
    <nav
      className={cn(
        'things-surface flex items-center justify-between px-4 h-16 border-b border-white/60 supports-[backdrop-filter]:bg-white/75',
        className
      )}
    >
      {/* Left side - Back button or spacer */}
      <div className="flex items-center w-12">
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center justify-center w-10 h-10 -ml-2 text-blue-600 hover:text-blue-700 active:scale-95 transition-all"
            aria-label="Go back"
          >
            <ArrowLeft size={24} />
          </button>
        )}
      </div>

      {/* Center - Title */}
      <div className="flex-1 text-center mx-4">
        <h1 className="text-lg font-semibold text-gray-900 truncate">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs text-gray-500 truncate">
            {subtitle}
          </p>
        )}
      </div>

      {/* Right side actions */}
      <div className="flex items-center min-w-[48px] justify-end gap-1">
        {onSearch && (
          <button
            onClick={onSearch}
            className="flex items-center justify-center w-10 h-10 text-gray-600 hover:text-gray-900 active:scale-95 transition-all"
            aria-label="Search"
          >
            <Search size={22} />
          </button>
        )}

        {rightIcon && onRightAction && (
          <button
            onClick={onRightAction}
            className="flex items-center justify-center w-10 h-10 -mr-2 text-gray-600 hover:text-gray-900 active:scale-95 transition-all"
            aria-label={rightAriaLabel || 'Action'}
          >
            {rightIcon}
          </button>
        )}
      </div>
    </nav>
  )
}
