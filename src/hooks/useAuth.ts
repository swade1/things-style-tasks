import { useEffect, useState } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

const DEV_PLACEHOLDER_USER_ID = '00000000-0000-0000-0000-000000000000'

async function adoptDevData(userId: string) {
  try {
    const [{ count: taskCount, error: taskCountError }, { count: projectCount, error: projectCountError }] = await Promise.all([
      supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('user_id', userId),
      supabase.from('projects').select('*', { count: 'exact', head: true }).eq('user_id', userId)
    ])

    if (taskCountError || projectCountError) {
      return
    }

    if ((taskCount ?? 0) > 0 || (projectCount ?? 0) > 0) {
      return
    }

    await Promise.all([
      supabase.from('tasks').update({ user_id: userId }).eq('user_id', DEV_PLACEHOLDER_USER_ID),
      supabase.from('projects').update({ user_id: userId }).eq('user_id', DEV_PLACEHOLDER_USER_ID),
      supabase.from('areas').update({ user_id: userId }).eq('user_id', DEV_PLACEHOLDER_USER_ID),
      supabase.from('user_preferences').update({ user_id: userId }).eq('user_id', DEV_PLACEHOLDER_USER_ID)
    ])
  } catch (error) {
    console.warn('Unable to adopt dev data for authenticated user:', error)
  }
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const initialize = async () => {
      const { data, error } = await supabase.auth.getSession()

      if (!isMounted) return

      if (error) {
        setError(error.message)
      }

      setSession(data.session)
      setUser(data.session?.user ?? null)

      if (data.session?.user) {
        await adoptDevData(data.session.user.id)
      }

      if (isMounted) {
        setLoading(false)
      }
    }

    void initialize()

    const { data: authListener } = supabase.auth.onAuthStateChange((_, nextSession) => {
      setSession(nextSession)
      setUser(nextSession?.user ?? null)
      setLoading(false)
      setError(null)

      if (nextSession?.user) {
        void adoptDevData(nextSession.user.id)
      }
    })

    return () => {
      isMounted = false
      authListener.subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return false
    }

    setLoading(false)
    return true
  }

  const signUp = async (email: string, password: string) => {
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signUp({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return false
    }

    setLoading(false)
    return true
  }

  const signOut = async () => {
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signOut()

    if (error) {
      setError(error.message)
      setLoading(false)
      return false
    }

    setLoading(false)
    return true
  }

  return {
    user,
    session,
    loading,
    error,
    signIn,
    signUp,
    signOut
  }
}
