import { Inbox, Calendar, CalendarDays, FolderKanban } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ViewType } from '@/types'

interface TabItem {
  id: ViewType
  label: string
  icon: React.ReactNode
}

interface BottomTabNavigationProps {
  activeTab: ViewType
  onTabChange: (tab: ViewType) => void
  todayCount?: number
  anytimeCount?: number
  upcomingCount?: number
  projectsCount?: number
}

export function BottomTabNavigation({
  activeTab,
  onTabChange,
  todayCount = 0,
  anytimeCount = 0,
  upcomingCount = 0,
  projectsCount = 0
}: BottomTabNavigationProps) {
  const tabs: TabItem[] = [
    {
      id: 'today',
      label: 'Today',
      icon: <Calendar size={24} />
    },
    {
      id: 'anytime',
      label: 'Anytime',
      icon: <Inbox size={24} />
    },
    {
      id: 'upcoming',
      label: 'Upcoming',
      icon: <CalendarDays size={24} />
    },
    {
      id: 'projects',
      label: 'Projects',
      icon: <FolderKanban size={24} />
    }
  ]

  const counts: Record<string, number> = {
    today: todayCount,
    anytime: anytimeCount,
    upcoming: upcomingCount,
    projects: projectsCount
  }

  return (
    <nav className="fixed bottom-3 left-3 right-3 z-40 safe-area-inset-bottom md:left-1/2 md:right-auto md:w-[420px] md:-translate-x-1/2">
      <div className="things-surface rounded-[24px] px-1.5 py-1.5 border border-white/70 shadow-[0_16px_40px_rgba(15,23,42,0.10)]">
        <div className="grid grid-cols-4 h-16">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id
            const count = counts[tab.id] || 0

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 rounded-[18px] min-h-[48px] transition-all',
                  isActive ? 'bg-blue-50 text-blue-600 shadow-sm' : 'text-gray-500 active:bg-white/70'
                )}
                aria-label={tab.label}
                aria-current={isActive ? 'page' : undefined}
              >
                <div className="relative">
                  <div className={cn('transition-colors', isActive ? 'text-blue-600' : 'text-gray-500')}>
                    {tab.icon}
                  </div>
                  {count > 0 && (
                    <span className="absolute -top-1.5 -right-2 min-w-[18px] h-[18px] px-1 bg-gradient-to-br from-red-500 to-rose-500 text-white text-[10px] font-semibold rounded-full flex items-center justify-center shadow-sm">
                      {count > 99 ? '99+' : count}
                    </span>
                  )}
                </div>
                <span
                  className={cn(
                    'text-[11px] font-medium transition-colors',
                    isActive ? 'text-blue-600' : 'text-gray-500'
                  )}
                >
                  {tab.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
