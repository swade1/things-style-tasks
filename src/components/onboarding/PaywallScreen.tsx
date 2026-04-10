import { Check, Loader2 } from 'lucide-react'
import { useState } from 'react'

interface PaywallScreenProps {
  userId: string
  email: string
  progress: number
}

export function PaywallScreen({ userId, email, progress }: PaywallScreenProps) {
  const [loading, setLoading] = useState(false)

  const handleStartTrial = () => {
    setLoading(true)
    const paymentLink = 'https://buy.stripe.com/test_6oUdRbfEF3lbbYL7Dj4Ja00'
    const redirectUrl = `${paymentLink}?prefilled_email=${encodeURIComponent(email)}&client_reference_id=${userId}`
    window.location.href = redirectUrl
  }

  return (
    <div className="h-full overflow-y-auto flex flex-col px-6 py-12 bg-gray-50">
      {/* Progress bar */}
      <div className="w-full h-1 bg-gray-200 rounded-full mb-8 flex-shrink-0">
        <div 
          className="h-full bg-blue-600 rounded-full transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* App icon */}
      <div className="flex justify-center mb-6 flex-shrink-0">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
          <Check className="w-8 h-8 text-white" strokeWidth={3} />
        </div>
      </div>

      {/* Header */}
      <div className="text-center mb-8 flex-shrink-0">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Get the most out of your tasks
        </h1>
        <p className="text-gray-600">
          Upgrade to unlock premium features
        </p>
      </div>

      {/* Features */}
      <div className="space-y-3 mb-8 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-xl">✨</div>
          <div className="text-gray-900 font-medium">Unlimited projects</div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-xl">🏷️</div>
          <div className="text-gray-900 font-medium">Custom tags & filters</div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-xl">📊</div>
          <div className="text-gray-900 font-medium">Progress tracking</div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-xl">☁️</div>
          <div className="text-gray-900 font-medium">Priority sync</div>
        </div>
      </div>

      {/* Pricing */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-500 rounded-2xl p-6 text-white mb-6 text-center flex-shrink-0">
        <div className="text-2xl font-bold mb-2">$4.99/month</div>
        <div className="text-sm text-blue-100">Cancel anytime</div>
      </div>

      {/* Button */}
      <button
        onClick={handleStartTrial}
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-2xl shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 flex-shrink-0"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Starting trial...
          </>
        ) : (
          'Try Free for 7 Days'
        )}
      </button>

      {/* Footer */}
      <p className="text-center text-xs text-gray-500 mt-6 pb-6 flex-shrink-0">
        By continuing, you agree to our Terms and Privacy Policy
      </p>
    </div>
  )
}
