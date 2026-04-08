import { AnimatePresence, motion } from 'framer-motion'
import { BookOpen, ExternalLink, Info, LogOut, Search, ShieldCheck, Smartphone, Sparkles, X } from 'lucide-react'
import { useEffect } from 'react'

interface SettingsAboutSheetProps {
  isOpen: boolean
  onClose: () => void
  email?: string | null
  onSignOut: () => void | Promise<void> | Promise<boolean>
}

export function SettingsAboutSheet({ isOpen, onClose, email, onSignOut }: SettingsAboutSheetProps) {
  useEffect(() => {
    if (!isOpen) return

    const previousOverflow = document.body.style.overflow
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleEscape)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/40 z-[70]"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />

          <motion.div
            className="things-sheet fixed inset-x-0 bottom-0 z-[80] rounded-t-[28px] shadow-2xl max-h-[90vh] flex flex-col border-t border-white/70"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            <div className="w-10 h-1 rounded-full bg-gray-300/80 mx-auto mt-3" />

            <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Settings & About</h2>
                <p className="text-xs text-gray-500 mt-0.5">Small details that make the app feel complete.</p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 active:scale-95 transition-all"
                aria-label="Close settings"
              >
                <X size={22} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              <section className="things-surface rounded-[20px] p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">Account & Sync</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Signed in as <span className="font-medium text-gray-800">{email || 'your account'}</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Realtime sync and offline-ready PWA support are enabled.</p>
                  </div>
                </div>
              </section>

              <section className="things-surface rounded-[20px] p-4 space-y-3">
                <h3 className="text-sm font-semibold text-gray-900">Helpful tips</h3>

                <div className="flex items-start gap-3">
                  <Search size={16} className="text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-800">Quick Find</p>
                    <p className="text-xs text-gray-500">Use <span className="font-medium">⌘K</span> to jump to tasks instantly.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Sparkles size={16} className="text-purple-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-800">Gestures</p>
                    <p className="text-xs text-gray-500">Swipe tasks to complete/delete and drag with the handle to reorder.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Smartphone size={16} className="text-emerald-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-800">Installable app</p>
                    <p className="text-xs text-gray-500">Add it to your home screen for the most native-feeling experience.</p>
                  </div>
                </div>
              </section>

              <section className="things-surface rounded-[20px] p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Info size={16} className="text-gray-500" />
                  <h3 className="text-sm font-semibold text-gray-900">About this build</h3>
                </div>

                <p className="text-sm text-gray-600 leading-6">
                  This is an educational Things-style task app built with React, TypeScript, Vite, Framer Motion, and Supabase.
                </p>

                <div className="flex flex-wrap gap-2">
                  {['React', 'TypeScript', 'Vite', 'Supabase', 'PWA'].map((item) => (
                    <span key={item} className="px-2.5 py-1 rounded-full bg-gray-100 text-xs text-gray-700">
                      {item}
                    </span>
                  ))}
                </div>

                <div className="space-y-2 pt-1">
                  <a
                    href="https://culturedcode.com/things/"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between px-3 py-2 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <span className="inline-flex items-center gap-2 text-sm text-gray-800">
                      <BookOpen size={15} />
                      Things 3 inspiration
                    </span>
                    <ExternalLink size={14} className="text-gray-400" />
                  </a>

                  <a
                    href="https://supabase.com/"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between px-3 py-2 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <span className="inline-flex items-center gap-2 text-sm text-gray-800">
                      <BookOpen size={15} />
                      Supabase backend
                    </span>
                    <ExternalLink size={14} className="text-gray-400" />
                  </a>
                </div>
              </section>
            </div>

            <div className="px-4 py-4 border-t border-gray-100 space-y-2">
              <button
                onClick={() => {
                  void onSignOut()
                }}
                className="w-full px-4 py-3 rounded-lg font-medium text-red-600 bg-red-50 hover:bg-red-100 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
              >
                <LogOut size={18} />
                Sign Out
              </button>
              <button
                onClick={onClose}
                className="w-full px-4 py-3 rounded-lg font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 active:scale-[0.99] transition-all"
              >
                Done
              </button>
            </div>

            <div className="h-6 safe-area-inset-bottom" />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
