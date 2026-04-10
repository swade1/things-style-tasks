/**
 * Trial and subscription management utilities
 * Handles trial period checking and subscription status
 * Now integrates with Stripe via Supabase
 */

import { hasActiveSubscription, isInTrial as checkIsInTrial, getTrialDaysRemaining as getStripTrialDays } from './stripe'

export type SubscriptionStatus = 'trial' | 'paid' | 'free' | 'expired'

export interface SubscriptionData {
  type: 'trial' | 'paid' | 'free'
  startDate?: string // ISO date when trial/subscription started
  expiryDate?: string // ISO date when trial expires
}

const TRIAL_DURATION_DAYS = 7

/**
 * Get the current subscription status
 * Checks Stripe subscription first, then falls back to localStorage
 */
export async function getSubscriptionStatus(userId?: string): Promise<SubscriptionStatus> {
  // If userId provided, check Stripe subscription in database
  if (userId) {
    try {
      const hasActive = await hasActiveSubscription(userId)
      if (hasActive) {
        const inTrial = await checkIsInTrial(userId)
        return inTrial ? 'trial' : 'paid'
      }
    } catch (err) {
      console.error('Error checking Stripe subscription:', err)
      // Fall through to localStorage check
    }
  }

  // Fallback to localStorage for legacy users
  const onboardingData = localStorage.getItem('onboarding_data')
  
  if (!onboardingData) {
    return 'free'
  }

  try {
    const data = JSON.parse(onboardingData)
    const subscriptionType = data.subscriptionType
    
    if (subscriptionType === 'paid') {
      return 'paid'
    }
    
    if (subscriptionType === 'trial') {
      const trialStartDate = data.trialStartDate || data.completedAt
      
      if (!trialStartDate) {
        return 'free'
      }

      const startDate = new Date(trialStartDate)
      const now = new Date()
      const daysSinceStart = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysSinceStart >= TRIAL_DURATION_DAYS) {
        return 'expired'
      }
      
      return 'trial'
    }
    
    return 'free'
  } catch (err) {
    console.error('Error parsing subscription data:', err)
    return 'free'
  }
}

/**
 * Get days remaining in trial (returns 0 if not on trial or expired)
 * Checks Stripe first, then falls back to localStorage
 */
export async function getTrialDaysRemaining(userId?: string): Promise<number> {
  // If userId provided, check Stripe subscription
  if (userId) {
    try {
      const days = await getStripTrialDays(userId)
      if (days > 0) {
        return days
      }
    } catch (err) {
      console.error('Error checking Stripe trial days:', err)
    }
  }

  // Fallback to localStorage
  const status = await getSubscriptionStatus(userId)
  
  if (status !== 'trial') {
    return 0
  }

  const onboardingData = localStorage.getItem('onboarding_data')
  if (!onboardingData) {
    return 0
  }

  try {
    const data = JSON.parse(onboardingData)
    const trialStartDate = data.trialStartDate || data.completedAt
    
    if (!trialStartDate) {
      return 0
    }

    const startDate = new Date(trialStartDate)
    const now = new Date()
    const daysSinceStart = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    const daysRemaining = TRIAL_DURATION_DAYS - daysSinceStart
    
    return Math.max(0, daysRemaining)
  } catch (err) {
    console.error('Error calculating trial days:', err)
    return 0
  }
}

/**
 * Check if user has premium access (paid subscription or active trial)
 */
export async function hasPremiumAccess(userId?: string): Promise<boolean> {
  const status = await getSubscriptionStatus(userId)
  return status === 'paid' || status === 'trial'
}

/**
 * Start a trial subscription (localStorage only - legacy)
 * New users should use Stripe checkout
 */
export function startTrial() {
  const onboardingData = localStorage.getItem('onboarding_data')
  
  if (onboardingData) {
    try {
      const data = JSON.parse(onboardingData)
      data.subscriptionType = 'trial'
      data.trialStartDate = new Date().toISOString()
      localStorage.setItem('onboarding_data', JSON.stringify(data))
    } catch (err) {
      console.error('Error starting trial:', err)
    }
  }
}

/**
 * Upgrade to paid subscription (localStorage only - legacy)
 * New users should use Stripe checkout
 */
export function upgradeToPaid() {
  const onboardingData = localStorage.getItem('onboarding_data')
  
  if (onboardingData) {
    try {
      const data = JSON.parse(onboardingData)
      data.subscriptionType = 'paid'
      data.paidAt = new Date().toISOString()
      localStorage.setItem('onboarding_data', JSON.stringify(data))
    } catch (err) {
      console.error('Error upgrading to paid:', err)
    }
  }
}

