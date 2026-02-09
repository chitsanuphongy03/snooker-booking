import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { User, Session } from '@supabase/supabase-js'

export type UserRole = 'admin' | 'user' | null

interface AuthState {
  user: User | null
  session: Session | null
  role: UserRole
  isLoading: boolean
  isAuthenticated: boolean
  isAdmin: boolean
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [role, setRole] = useState<UserRole>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setRole(getUserRole(session?.user))
      setIsLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setRole(getUserRole(session?.user))
    })

    return () => subscription.unsubscribe()
  }, [])

  return {
    user,
    session,
    role,
    isLoading,
    isAuthenticated: !!session,
    isAdmin: role === 'admin'
  }
}

// Extract role from user metadata
function getUserRole(user: User | null | undefined): UserRole {
  if (!user) return null
  
  // Check user_metadata first (set during signup)
  const metadataRole = user.user_metadata?.role
  if (metadataRole === 'admin') {
    return metadataRole
  }

  // Check app_metadata (set by admin/service role)
  const appMetadataRole = user.app_metadata?.role
  if (appMetadataRole === 'admin') {
    return appMetadataRole
  }

  // Default: authenticated users are regular users
  return 'user'
}
