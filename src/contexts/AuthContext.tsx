import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Session } from '@supabase/supabase-js'
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
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setSession(session)

        if (session?.user) {
          await fetchProfile(session.user.id)
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

    initAuth()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)

      if (session?.user) {
        setIsLoading(true)
        setTimeout(() => {
          fetchProfile(session.user.id)
        }, 0)
      } else {
        setUser(null)
        setIsLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (error) throw error

      setUser(data as UserProfile | null)
    } catch (error) {
      console.error('Erro ao buscar perfil:', error)
      setUser(null)
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
        options: { data: { name } },
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
        isAuthenticated: !!user,
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
