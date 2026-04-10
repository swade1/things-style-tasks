/**
 * Stripe integration via Supabase Edge Functions
 */

import { supabase } from './supabase'

export interface CheckoutOptions {
  userId: string
  email: string
  trialDays?: number
}

/**
 * Create a Stripe checkout session for subscription
 */
export async function createCheckoutSession(options: CheckoutOptions): Promise<string | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
    
    if (!session?.access_token) {
      console.error('No active session')
      return null
    }
    
    const response = await fetch(`${supabaseUrl}/functions/v1/create-checkout-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        userId: options.userId,
        email: options.email,
        trialDays: options.trialDays || 7,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Error creating checkout session:', error)
      return null
    }

    const data = await response.json()
    return data.url
  } catch (err) {
    console.error('Failed to create checkout session:', err)
    return null
  }
}

/**
 * Create a Stripe customer portal session for managing subscription
 */
export async function createPortalSession(userId: string): Promise<string | null> {
  try {
    // Get the current session to include auth headers
    const { data: { session } } = await supabase.auth.getSession()
    
    const { data, error } = await supabase.functions.invoke('create-portal-session', {
      body: { userId },
      headers: {
        Authorization: `Bearer ${session?.access_token}`,
      },
    })

    if (error) {
      console.error('Error creating portal session:', error)
      return null
    }

    return data.url
  } catch (err) {
    console.error('Failed to create portal session:', err)
    return null
  }
}

/**
 * Get user's subscription from database
 */
export async function getUserSubscription(userId: string) {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()

    if (error) {
      console.error('Error fetching subscription:', error)
      return null
    }

    return data
  } catch (err) {
    console.error('Failed to fetch subscription:', err)
    return null
  }
}

/**
 * Check if user has an active subscription
 */
export async function hasActiveSubscription(userId: string): Promise<boolean> {
  const subscription = await getUserSubscription(userId)
  
  if (!subscription) {
    return false
  }

  // Check if subscription is active or trialing
  const activeStatuses = ['active', 'trialing']
  return activeStatuses.includes(subscription.status)
}

/**
 * Check if user is currently in trial period
 */
export async function isInTrial(userId: string): Promise<boolean> {
  const subscription = await getUserSubscription(userId)
  
  if (!subscription) {
    return false
  }

  return subscription.status === 'trialing'
}

/**
 * Get days remaining in trial
 */
export async function getTrialDaysRemaining(userId: string): Promise<number> {
  const subscription = await getUserSubscription(userId)
  
  if (!subscription || !subscription.trial_end) {
    return 0
  }

  const trialEnd = new Date(subscription.trial_end)
  const now = new Date()
  const daysRemaining = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  
  return Math.max(0, daysRemaining)
}
