import { useState } from 'react'
import { Loader2, LockKeyhole, Mail } from 'lucide-react'
import { motion } from 'framer-motion'

interface AuthScreenProps {
  loading: boolean
  error: string | null
  onSignIn: (email: string, password: string) => Promise<boolean>
  onSignUp: (email: string, password: string) => Promise<boolean>
}

export function AuthScreen({ loading, error, onSignIn, onSignUp }: AuthScreenProps) {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setSuccessMessage(null)

    const ok = isSignUp
      ? await onSignUp(email.trim(), password)
      : await onSignIn(email.trim(), password)

    if (ok && isSignUp) {
      setSuccessMessage('Account created. If email confirmation is enabled, check your inbox.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
      >
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">✅</div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Things-Style Tasks</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {isSignUp ? 'Create your account to sync your tasks.' : 'Sign in to continue.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password</label>
            <div className="relative">
              <LockKeyhole size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="At least 6 characters"
                minLength={6}
                required
              />
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 text-red-700 text-sm px-3 py-2">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="rounded-lg bg-green-50 text-green-700 text-sm px-3 py-2">
              {successMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {isSignUp ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setIsSignUp((prev) => !prev)
            setSuccessMessage(null)
          }}
          className="w-full mt-4 text-sm text-blue-600 hover:text-blue-700"
        >
          {isSignUp ? 'Already have an account? Sign in' : 'Need an account? Create one'}
        </button>
      </motion.div>
    </div>
  )
}
