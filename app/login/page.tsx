"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "context/auth-context"
import { Button } from "components/ui/button"
import { Input } from "components/ui/input"
import { Label } from "components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "components/ui/card"
import { Alert, AlertDescription } from "components/ui/alert"
import { Utensils } from "lucide-react"
import { doc, getDoc } from "firebase/firestore"
import { db } from "lib/firebase" // Import your Firebase configuration
import { toast } from "sonner"
import { Spinner } from "components/ui/Spinner"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { signIn, signInWithGoogle } = useAuth()
  const router = useRouter()

  // Fetch essential user data after login
  const loadEssentialUserData = async (userId: string) => {
    try {
      const userRef = doc(db, "users", userId)
      const userSnapshot = await getDoc(userRef)
      if (userSnapshot.exists()) {
        // Handle the user data here (e.g., set user context or state)
        // For example: setUserData(userSnapshot.data())
      }
    } catch (error) {
      console.error("Error fetching user data:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const user = await signIn(email, password)
      setLoading(false)
      toast.success("Signed in successfully!")
      router.replace("/dashboard") // Navigate to the dashboard
    } catch (err: any) {
      if (err.code === "auth/wrong-password") {
        setError("Incorrect password")
        toast.error("Incorrect password")
      } else {
        setError("Invalid email or password")
        toast.error("Invalid email or password")
      }
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setError(null)
    setLoading(true)

    try {
      const user = await signInWithGoogle()
      setLoading(false)
      toast.success("Signed in successfully!")
      router.replace("/dashboard") // Navigate to the dashboard
    } catch (err) {
      setError("Failed to sign in with Google")
      toast.error("Failed to sign in with Google")
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center gap-2">
            <Utensils className="h-6 w-6" />
            <span className="text-2xl font-bold">Nutrilens</span>
          </div>
          <CardTitle className="text-2xl text-center">Sign in to your account</CardTitle>
          <CardDescription className="text-center">Enter your email and password to sign in</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder={loading ? "Signing in..." : "name@example.com"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder={loading ? "Signing in..." : ""}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              Sign In
            </Button>
            {loading && (
              <p className="mt-2 text-center text-sm text-muted-foreground">
                Signing in, please wait...
              </p>
            )}
          </form>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>
          <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={loading}>
            Google
          </Button>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
