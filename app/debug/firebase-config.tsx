"use client"

import { useEffect } from "react"
import { app } from "@/lib/firebase"
import { getAuth } from "firebase/auth"

export default function FirebaseConfigDebug() {
  useEffect(() => {
    console.log("Firebase Debug Information:")
    console.log("App:", app)
    console.log("Auth:", getAuth(app))
    console.log("Environment variables:", {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? "****" : "MISSING",
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? "****" : "MISSING",
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? "****" : "MISSING"
    })
  }, [])

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">Firebase Configuration Debug</h1>
      <p>Check browser console for debug information</p>
    </div>
  )
}
