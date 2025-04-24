"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "context/auth-context"
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  Timestamp
} from "firebase/firestore"
import { db } from "lib/firebase"
import { DashboardHeader } from "components/dashboard/dashboard-header"
import { DashboardShell } from "components/dashboard/dashboard-shell"
import { DashboardNav } from "components/dashboard/dashboard-nav"
import { Overview } from "components/dashboard/overview"
import { RecentMeals } from "components/dashboard/recent-meals"
import { StepTracker } from "components/dashboard/step-tracker"
import { Recommendations } from "components/dashboard/recommendations"
import type { UserProfile } from "types/user"
import { Button } from "components/ui/button"
import { Camera, Utensils, Activity, User } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [todaySteps, setTodaySteps] = useState<number | null>(null)

  // Redirect unauthenticated users
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [loading, user, router])

  // Fetch profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return

      try {
        const docRef = doc(db, "users", user.uid)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
          setProfile(docSnap.data() as UserProfile)
        }
      } catch (error) {
        console.error("Error fetching profile:", error)
      } finally {
        setLoadingProfile(false)
      }
    }

    fetchProfile()
  }, [user])

  // Fetch today’s step count
  useEffect(() => {
    const fetchTodaySteps = async () => {
      if (!user) return

      try {
        const now = new Date()
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        const q = query(
          collection(db, "userSteps"),
          where("userId", "==", user.uid),
          where("timestamp", ">=", Timestamp.fromDate(startOfDay))
        )
        const querySnapshot = await getDocs(q)
        let totalSteps = 0
        querySnapshot.forEach((doc) => {
          const data = doc.data()
          if (data.stepCount) {
            totalSteps += data.stepCount
          }
        })
        setTodaySteps(totalSteps)
      } catch (error) {
        console.error("Error fetching today's steps:", error)
      }
    }

    fetchTodaySteps()
  }, [user])

  if (loading || loadingProfile) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  if (!user) return null

  return (
    <DashboardShell>
      <DashboardNav />
      <div className="flex-1">
        <DashboardHeader
          heading="Dashboard"
          text="Welcome back! Here's an overview of your health and nutrition."
        />

        {/* 🔘 Quick Actions - Horizontal layout optimized for all screens */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4 md:px-8">
          <Link href="/dashboard/scan" legacyBehavior>
            <a>
              <Button variant="outline" className="w-full h-20 flex flex-col gap-1 items-center justify-center">
                <Camera className="h-5 w-5" />
                <span>Scan Food</span>
              </Button>
            </a>
          </Link>
          <Link href="/dashboard/meals" legacyBehavior>
            <a>
              <Button variant="outline" className="w-full h-20 flex flex-col gap-1 items-center justify-center">
                <Utensils className="h-5 w-5" />
                <span>Meals</span>
              </Button>
            </a>
          </Link>
          <Link href="/dashboard/activity" legacyBehavior>
            <a>
              <Button variant="outline" className="w-full h-20 flex flex-col gap-1 items-center justify-center">
                <Activity className="h-5 w-5" />
                <span>Activity</span>
              </Button>
            </a>
          </Link>
          <Link href="/dashboard/profile" legacyBehavior>
            <a>
              <Button variant="outline" className="w-full h-20 flex flex-col gap-1 items-center justify-center">
                <User className="h-5 w-5" />
                <span>Profile</span>
              </Button>
            </a>
          </Link>
        </div>

        {/* 📊 Overview Section */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 p-4 md:px-8">
          <Overview profile={profile} weeklySteps={todaySteps ?? undefined} />
        </div>

        {/* 📈 Steps & Meals */}
        <div className="grid md:grid-cols-2 gap-4 p-4 md:px-8">
          <StepTracker />
          <RecentMeals />
        </div>

        {/* 🧠 Personalized Recommendations */}
        <div className="p-4 md:px-8">
          <Recommendations profile={profile} />
        </div>
      </div>
    </DashboardShell>
  )
}
