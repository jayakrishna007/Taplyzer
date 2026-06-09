"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export type UserRole = "USER" | "ADMIN" | "SUPER_ADMIN"

export interface User {
  _id?: string
  name: string
  email: string
  phone?: string
  role: UserRole
  verified: boolean
}

interface AuthContextType {
  user: User | null
  isLoggedIn: boolean
  isLoading: boolean
  isSuperAdmin: boolean
  isAdmin: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, name: string, password: string) => Promise<void>
  logOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me")
        if (res.ok) {
          const data = await res.json()
          setUser(data.user)
          setIsLoggedIn(true)
        }
      } catch (err) {
        console.error("Auth check failed:", err)
      } finally {
        setIsLoading(false)
      }
    }
    checkAuth()
  }, [])

  const signIn = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Login failed")
      }

      setUser(data.user)
      setIsLoggedIn(true)

      router.push("/profile")
    } catch (err: any) {
      setIsLoading(false)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const signUp = async (email: string, name: string, password: string) => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Signup failed")
      }

      setUser(data.user)
      setIsLoggedIn(true)

      router.push("/profile/setup")
    } catch (err: any) {
      setIsLoading(false)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const logOut = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
    } catch (err) {
      console.error("Logout error:", err)
    } finally {
      setUser(null)
      setIsLoggedIn(false)
      router.push("/")
    }
  }

  const isSuperAdmin = user?.role === "SUPER_ADMIN"
  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN"

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, isLoading, isSuperAdmin, isAdmin, signIn, signUp, logOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
