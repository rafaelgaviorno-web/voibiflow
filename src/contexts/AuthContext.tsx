import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Session, User as SupabaseUser } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

export interface UserProfile {
  id: string
  email: string
  name: string
  avatar_url?: string
  created_at: string
}

interface AuthContextType {
  user: UserProfile | null
  session: Session | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signup: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const bootstrapAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setSession(session)

        if (session?.user) {
          await fetchProfile(session.user)
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error('Erro ao carregar sessão:', error)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    bootstrapAuth()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)

      if (session?.user) {
        setTimeout(() => {
          fetchProfile(session.user)
        }, 0)
      } else {
        setUser(null)
        setIsLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (authUser: SupabaseUser) => {
    try {
      setIsLoading(true)

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle()

      if (error) throw error

      if (data) {
        setUser(data as UserProfile)
        return
      }

      const fallbackProfile: UserProfile = {
        id: authUser.id,
        email: authUser.email || '',
        name:
          authUser.user_metadata?.name ||
          authUser.user_metadata?.full_name ||
          authUser.email?.split('@')[0] ||
          'Usuário',
        avatar_url: authUser.user_metadata?.avatar_url,
        created_at: authUser.created_at || new Date().toISOString(),
      }

      setUser(fallbackProfile)

      const { error: upsertError } = await supabase.from('profiles').upsert({
        id: fallbackProfile.id,
        email: fallbackProfile.email,
        name: fallbackProfile.name,
        avatar_url: fallbackProfile.avatar_url || null,
      })

      if (upsertError) {
        console.error('Erro ao criar perfil automaticamente:', upsertError)
      }
    } catch (error) {
      console.error('Erro ao buscar perfil:', error)

      const fallbackProfile: UserProfile = {
        id: authUser.id,
        email: authUser.email || '',
        name:
          authUser.user_metadata?.name ||
          authUser.user_metadata?.full_name ||
          authUser.email?.split('@')[0] ||
          'Usuário',
        avatar_url: authUser.user_metadata?.avatar_url,
        created_at: authUser.created_at || new Date().toISOString(),
      }

      setUser(fallbackProfile)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })

      if (error) {
        return { success: false, error: translateError(error.message) }
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: 'Erro ao fazer login' }
    }
  }

  const signup = async (name: string, email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
        },
      })

      if (error) {
        return { success: false, error: translateError(error.message) }
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: 'Erro ao criar conta' }
    }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
    setIsLoading(false)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAuthenticated: !!session?.user,
        isLoading,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}

function translateError(message: string): string {
  const errors: Record<string, string> = {
    'Invalid login credentials': 'Email ou senha incorretos',
    'Email not confirmed': 'Email não confirmado. Verifique sua caixa de entrada.',
    'User already registered': 'Este email já está cadastrado',
    'Password should be at least 6 characters': 'A senha deve ter pelo menos 6 caracteres',
    'Invalid email': 'Email inválido',
  }

  return errors[message] || message
}
