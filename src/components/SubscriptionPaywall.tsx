import { motion } from 'framer-motion'
import { Check, X, Loader2 } from 'lucide-react'
import { createCheckoutSession, createPortalSession } from '@/lib/stripe'
import { useState } from 'react'

interface SubscriptionPaywallProps {
  userId: string
  email: string
  onSubscribe?: () => void
  onDismiss?: () => void
  isTrialExpired?: boolean
  hasExistingSubscription?: boolean
}

export function SubscriptionPaywall({ 
  userId,
  email,
  onSubscribe: _onSubscribe, 
  onDismiss,
  isTrialExpired = false,
  hasExistingSubscription = false
}: SubscriptionPaywallProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const premiumFeatures = [
    { icon: '✨', text: 'Unlimited projects' },
    { icon: '🏷️', text: 'Custom tags & filters' },
    { icon: '📊', text: 'Progress tracking' },
    { icon: '🌙', text: 'Premium themes' },
    { icon: '☁️', text: 'Priority sync' },
    { icon: '🎯', text: 'Advanced reminders' }
  ]

  const handleSubscribe = async () => {
    setLoading(true)
    setError(null)

    try {
      const checkoutUrl = await createCheckoutSession({
        userId,
        email,
        trialDays: isTrialExpired ? undefined : 7, // No trial if already expired
      })

      if (checkoutUrl) {
        // Redirect to Stripe checkout
        window.location.href = checkoutUrl
      } else {
        setError('Failed to create checkout session. Please try again.')
      }
    } catch (err) {
      console.error('Error starting subscription:', err)
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleManageSubscription = async () => {
    setLoading(true)
    setError(null)

    try {
      const portalUrl = await createPortalSession(userId)

      if (portalUrl) {
        // Redirect to Stripe customer portal
        window.location.href = portalUrl
      } else {
        setError('Failed to open subscription management. Please try again.')
      }
    } catch (err) {
      console.error('Error opening portal:', err)
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div
        className="things-screen relative w-full max-w-lg mx-4 bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Close button */}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        )}

        {/* App icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
            <Check className="w-8 h-8 text-white" strokeWidth={3} />
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-6">
          {isTrialExpired ? (
            <>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Trial Expired
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Subscribe to continue using premium features
              </p>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Unlock Premium Features
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Get the most out of your tasks
              </p>
            </>
          )}
        </div>

        {/* Premium features list */}
        <div className="space-y-3 mb-6">
          {premiumFeatures.map((feature, index) => (
            <motion.div
              key={index}
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-xl">
                {feature.icon}
              </div>
              <div className="text-gray-900 dark:text-gray-100 font-medium">
                {feature.text}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Pricing */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-500 rounded-2xl p-6 text-white mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold mb-2">$4.99/month</div>
            <div className="text-sm text-blue-100">Cancel anytime</div>
          </div>
        </div>

        {/* CTA button */}
        {hasExistingSubscription ? (
          <button
            onClick={handleManageSubscription}
            disabled={loading}
            className="w-full bg-gradient-to-br from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold py-4 px-8 rounded-2xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Loading...
              </>
            ) : (
              'Manage Subscription'
            )}
          </button>
        ) : (
          <button
            onClick={handleSubscribe}
            disabled={loading}
            className="w-full bg-gradient-to-br from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold py-4 px-8 rounded-2xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Loading...
              </>
            ) : (
              'Subscribe Now'
            )}
          </button>
        )}

        {/* Error message */}
        {error && (
          <p className="text-center text-sm text-red-600 dark:text-red-400 mt-2">
            {error}
          </p>
        )}

        {/* Footer */}
        <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-4">
          {hasExistingSubscription ? (
            <button onClick={handleManageSubscription} className="hover:underline">Manage subscription</button>
          ) : (
            <button onClick={handleManageSubscription} className="hover:underline">Restore purchases</button>
          )}
          {' · '}
          <button className="hover:underline">Terms</button>
          {' · '}
          <button className="hover:underline">Privacy</button>
        </p>

        {/* Powered by Stripe badge */}
        <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-2 flex items-center justify-center gap-1">
          <span>Secured by</span>
          <svg className="h-3" viewBox="0 0 60 25" fill="currentColor">
            <path d="M59.64 14.28h-8.06c.19 1.93 1.6 2.55 3.2 2.55 1.64 0 2.96-.37 4.05-.95v3.32a8.33 8.33 0 0 1-4.56 1.1c-4.01 0-6.83-2.5-6.83-7.48 0-4.19 2.39-7.52 6.3-7.52 3.92 0 5.96 3.28 5.96 7.5 0 .4-.04 1.03-.06 1.48zm-5.92-5.62c-1.03 0-2.17.73-2.17 2.58h4.25c0-1.85-1.07-2.58-2.08-2.58zM40.95 20.3c-1.44 0-2.32-.6-2.9-1.04l-.02 4.63-4.12.87V5.57h3.76l.08 1.02a4.7 4.7 0 0 1 3.23-1.29c2.9 0 5.62 2.6 5.62 7.4 0 5.23-2.7 7.6-5.65 7.6zM40 8.95c-.95 0-1.54.34-1.97.81l.02 6.12c.4.44.98.78 1.95.78 1.52 0 2.54-1.65 2.54-3.87 0-2.15-1.04-3.84-2.54-3.84zM28.24 5.57h4.13v14.44h-4.13V5.57zm0-4.7L32.37 0v3.36l-4.13.88V.88zm-4.32 9.35v9.79H19.8V5.57h3.7l.12 1.22c1-1.77 3.07-1.41 3.62-1.22v3.79c-.52-.17-2.29-.43-3.32.86zm-8.55 4.72c0 2.43 2.6 1.68 3.12 1.46v3.36c-.55.3-1.54.54-2.89.54a4.15 4.15 0 0 1-4.27-4.24l.01-13.17 4.02-.86v3.54h3.14V9.1h-3.13v5.85zm-4.91.7c0 2.97-2.31 4.66-5.73 4.66a11.2 11.2 0 0 1-4.46-.93v-3.93c1.38.75 3.1 1.31 4.46 1.31.92 0 1.53-.24 1.53-1C6.26 13.77 0 14.51 0 9.95 0 7.04 2.28 5.3 5.62 5.3c1.36 0 2.72.2 4.09.75v3.88a9.23 9.23 0 0 0-4.1-1.06c-.86 0-1.44.25-1.44.93 0 1.85 6.29.97 6.29 5.88z" />
          </svg>
        </p>
      </motion.div>
    </div>
  )
}
