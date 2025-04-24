"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithPopup,
  type User,
} from "firebase/auth"
import { doc, setDoc, getDoc } from "firebase/firestore"
import { useRouter } from "next/navigation"
import { app, db } from "../lib/firebase"
import { Auth } from "firebase/auth"

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  signInWithGoogle: async () => {},
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const auth = getAuth(app)
  const router = useRouter()

  // Prefetch routes in background
  useEffect(() => {

    // Prefetch routes in background
    const prefetchRoutes = async () => {
      await Promise.all([
        router.prefetch("/dashboard"),
        router.prefetch("/login"), 
        router.prefetch("/signup"),
        router.prefetch("/onboarding")
      ])
    }
    prefetchRoutes()
  }, [router])

  useEffect(() => {
    if (!auth) {
      console.error('Firebase auth not initialized')
      setLoading(false)
      return
    }

    console.log('Setting up auth state listener')
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Auth state changed:', user ? user.uid : 'null')
      setUser(user)

      if (user) {
        // Check if user has completed onboarding
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid))
          if (!userDoc.exists()) {
            // Pre-create user document for faster access later
            await setDoc(doc(db, "users", user.uid), {
              email: user.email,
              createdAt: new Date(),
            })
          }
        } catch (error) {
          console.error("Error checking user profile:", error)
        }
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [auth])

  const signIn = async (email: string, password: string) => {
    if (!auth) throw new Error("Auth not initialized")
    await signInWithEmailAndPassword(auth, email, password)
    router.push("/dashboard")
  }

  const signUp = async (email: string, password: string) => {
    if (!auth) throw new Error("Auth not initialized")
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    // Create user document immediately after signup
    await setDoc(doc(db, "users", userCredential.user.uid), {
      email,
      createdAt: new Date(),
    })
    router.push("/onboarding")
  }

  const signInWithGoogle = async () => {
    if (!auth) throw new Error("Auth not initialized")
    const provider = new GoogleAuthProvider()
    const userCredential = await signInWithPopup(auth, provider)

    // Check if user exists in Firestore
    const userDoc = await getDoc(doc(db, "users", userCredential.user.uid))

    if (!userDoc.exists()) {
      // New user - create document and redirect to onboarding
      await setDoc(doc(db, "users", userCredential.user.uid), {
        email: userCredential.user.email,
        createdAt: new Date(),
      })
      router.push("/onboarding")
    } else {
      // Existing user - redirect to dashboard
      router.push("/dashboard")
    }
  }

  const signOut = async () => {
    if (!auth) throw new Error("Auth not initialized")
    await firebaseSignOut(auth)
    router.push("/login")
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
