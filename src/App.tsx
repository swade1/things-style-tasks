import { Suspense, lazy, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { BottomTabNavigation } from '@/components'
import { useAuth, useTasks, useProjects } from '@/hooks'
import { getSubscriptionStatus } from '@/lib/subscription'
import type { Task, ViewType } from '@/types'
import './App.css'

const AuthScreen = lazy(async () => {
  const module = await import('@/components/AuthScreen')
  return { default: module.AuthScreen }
})

const GlobalSearchSheet = lazy(async () => {
  const module = await import('@/components/GlobalSearchSheet')
  return { default: module.GlobalSearchSheet }
})

const TodayView = lazy(async () => {
  const module = await import('@/pages/TodayView')
  return { default: module.TodayView }
})

const AnytimeView = lazy(async () => {
  const module = await import('@/pages/AnytimeView')
  return { default: module.AnytimeView }
})

const UpcomingView = lazy(async () => {
  const module = await import('@/pages/UpcomingView')
  return { default: module.UpcomingView }
})

const ProjectsView = lazy( async () => {
  const module = await import('@/pages/ProjectsView')
  return { default: module.ProjectsView }
})

const OnboardingFlow = lazy(async () => {
  const module = await import('@/components/onboarding')
  return { default: module.OnboardingFlow }
})

const SubscriptionPaywall = lazy(async () => {
  const module = await import('@/components/SubscriptionPaywall')
  return { default: module.SubscriptionPaywall }
})

const viewLoadingFallback = (
  <div className="absolute inset-0 flex items-center justify-center bg-transparent">
    <Loader2 className="w-7 h-7 text-blue-600 animate-spin" />
  </div>
)

function MainApp({ userId: _userId }: { userId: string }) {
  const [activeView, setActiveView] = useState<ViewType>('today')
  const [direction, setDirection] = useState<'left' | 'right'>('right')
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false)
  const [focusedTask, setFocusedTask] = useState<{ taskId: string; view: Exclude<ViewType, 'projects'> } | null>(null)

  // Initialize theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [])

  // Fetch task counts for badges
  const { tasks: todayTasks, loading: loadingToday } = useTasks('today')
  const { tasks: anytimeTasks, loading: loadingAnytime } = useTasks('anytime')
  const { tasks: upcomingTasks, loading: loadingUpcoming } = useTasks('upcoming')
  const { projects, loading: loadingProjects } = useProjects('active')

  // Determine view order for slide direction
  const viewOrder: ViewType[] = ['today', 'anytime', 'upcoming', 'projects']

  const handleTabChange = (newView: ViewType) => {
    const currentIndex = viewOrder.indexOf(activeView)
    const newIndex = viewOrder.indexOf(newView)
    setDirection(newIndex > currentIndex ? 'left' : 'right')
    setActiveView(newView)
  }

  const openGlobalSearch = () => setIsGlobalSearchOpen(true)
  const closeGlobalSearch = () => setIsGlobalSearchOpen(false)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setIsGlobalSearchOpen(prev => !prev)
      }

      if (event.key === 'Escape') {
        setIsGlobalSearchOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleSearchTaskSelect = (task: Task) => {
    const targetView: Exclude<ViewType, 'projects'> =
      task.status === 'today'
        ? 'today'
        : task.status === 'upcoming'
          ? 'upcoming'
          : 'anytime'

    setFocusedTask({ taskId: task.id, view: targetView })
    closeGlobalSearch()

    if (activeView !== targetView) {
      handleTabChange(targetView)
    }
  }

  // Show loading state while initial data is fetching
  const isLoadingInitialData = loadingToday || loadingAnytime || loadingUpcoming || loadingProjects
  if (isLoadingInitialData) {
    return (
      <div className="h-screen flex items-center justify-center things-screen">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    )
  }

  // Slide variants for view transitions
  const slideVariants = {
    enter: (direction: 'left' | 'right') => ({
      x: direction === 'left' ? '100%' : '-100%',
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: 'left' | 'right') => ({
      x: direction === 'left' ? '-100%' : '100%',
      opacity: 0
    })
  }

  const renderView = () => {
    switch (activeView) {
      case 'today':
        return (
          <TodayView
            onOpenSearch={openGlobalSearch}
            focusTaskId={focusedTask?.view === 'today' ? focusedTask.taskId : null}
            onFocusHandled={() => setFocusedTask(null)}
          />
        )
      case 'anytime':
        return (
          <AnytimeView
            onOpenSearch={openGlobalSearch}
            focusTaskId={focusedTask?.view === 'anytime' ? focusedTask.taskId : null}
            onFocusHandled={() => setFocusedTask(null)}
          />
        )
      case 'upcoming':
        return (
          <UpcomingView
            onOpenSearch={openGlobalSearch}
            focusTaskId={focusedTask?.view === 'upcoming' ? focusedTask.taskId : null}
            onFocusHandled={() => setFocusedTask(null)}
          />
        )
      case 'projects':
        return <ProjectsView onOpenSearch={openGlobalSearch} />
      default:
        return <TodayView onOpenSearch={openGlobalSearch} />
    }
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Main content */}
      <div className="flex-1 overflow-hidden relative">
        <Suspense fallback={viewLoadingFallback}>
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={activeView}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: 'tween', ease: 'easeInOut', duration: 0.3 },
                opacity: { duration: 0.2 }
              }}
              className="absolute inset-0"
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </Suspense>
      </div>

      {isGlobalSearchOpen && (
        <Suspense fallback={null}>
          <GlobalSearchSheet
            isOpen={isGlobalSearchOpen}
            onClose={closeGlobalSearch}
            onSelectTask={handleSearchTaskSelect}
          />
        </Suspense>
      )}

      {/* Bottom navigation */}
      <BottomTabNavigation
        activeTab={activeView}
        onTabChange={handleTabChange}
        todayCount={todayTasks.filter(t => t.status !== 'completed').length}
        anytimeCount={anytimeTasks.filter(t => t.status !== 'completed').length}
        upcomingCount={upcomingTasks.filter(t => t.status !== 'completed').length}
        projectsCount={projects.length}
      />
    </div>
  )
}

function AuthenticatedApp({ userId, userEmail }: { userId: string; userEmail: string }) {
  const [showOnboarding, setShowOnboarding] = useState(() => {
    return !localStorage.getItem('onboarding_completed')
  })
  const [showPaywall, setShowPaywall] = useState(false)

  // Check trial status on mount and periodically
  useEffect(() => {
    const checkTrialStatus = async () => {
      const status = await getSubscriptionStatus(userId)
      if (status === 'expired') {
        setShowPaywall(true)
      }
    }

    checkTrialStatus()
    
    // Check every hour in case trial expires while app is open
    const interval = setInterval(() => void checkTrialStatus(), 60 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [userId])

  const handleSubscribe = () => {
    // After successful subscription, hide paywall and reload
    setShowPaywall(false)
    window.location.reload()
  }

  if (showOnboarding) {
    return (
      <Suspense fallback={viewLoadingFallback}>
        <OnboardingFlow
          userId={userId}
          userEmail={userEmail}
          onComplete={() => {
            setShowOnboarding(false)
          }}
        />
      </Suspense>
    )
  }

  return (
    <>
      <MainApp userId={userId} />
      
      {/* Show subscription paywall if trial expired */}
      {showPaywall && (
        <Suspense fallback={null}>
          <SubscriptionPaywall
            userId={userId}
            email={userEmail}
            isTrialExpired={true}
            onSubscribe={handleSubscribe}
          />
        </Suspense>
      )}
    </>
  )
}

function App() {
  const { user, loading, error, signIn, signUp } = useAuth()

  // Handle successful Stripe checkout redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('success') === 'true') {
      // Clear onboarding status - user has subscribed
      localStorage.setItem('onboarding_completed', 'true')
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [])

  if (loading && !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    )
  }

  if (!user) {
    return (
      <Suspense
        fallback={
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        }
      >
        <AuthScreen
          loading={loading}
          error={error}
          onSignIn={signIn}
          onSignUp={signUp}
        />
      </Suspense>
    )
  }

  return <AuthenticatedApp userId={user.id} userEmail={user.email || ''} />
}

export default App

