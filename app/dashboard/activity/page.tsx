"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/context/auth-context"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Activity, Footprints } from "lucide-react"
import { LocationTracker } from "@/components/location-tracker"

export default function ActivityPage() {
  const { user } = useAuth()
  const [steps, setSteps] = useState(0)
  const [stepGoal, setStepGoal] = useState(10000)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("steps")

  // Mock step history data
  const stepHistory = [
    { date: "Monday", steps: 8234 },
    { date: "Tuesday", steps: 6543 },
    { date: "Wednesday", steps: 9876 },
    { date: "Thursday", steps: 7654 },
    { date: "Friday", steps: 12345 },
    { date: "Saturday", steps: 5432 },
    { date: "Sunday", steps: 8765 },
  ]

  useEffect(() => {
    const fetchStepData = async () => {
      if (!user) return

      try {
        const docRef = doc(db, "users", user.uid, "activity", "steps")
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
          const data = docSnap.data()
          setSteps(data.steps || 0)
          setStepGoal(data.goal || 10000)
        }
      } catch (error) {
        console.error("Error fetching step data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStepData()
  }, [user])

  const handleUpdateSteps = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setSaving(true)
    try {
      const docRef = doc(db, "users", user.uid, "activity", "steps")
      await updateDoc(docRef, {
        steps,
        goal: stepGoal,
        updatedAt: new Date(),
      })
    } catch (error) {
      console.error("Error updating steps:", error)
    } finally {
      setSaving(false)
    }
  }

  const handleConnectGoogleFit = () => {
    // This would be implemented with Google Fit API in a real app
    alert("Google Fit integration would be implemented here")
  }

  return (
    <DashboardShell>
      <DashboardNav />
      <div className="flex-1">
        <DashboardHeader heading="Activity Tracking" text="Monitor your daily movement and exercise" />
        <div className="p-4 md:p-8 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="steps">Steps</TabsTrigger>
              <TabsTrigger value="location">Location</TabsTrigger>
              <TabsTrigger value="connect">Connect Devices</TabsTrigger>
            </TabsList>
            <TabsContent value="steps" className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Today's Steps</CardTitle>
                    <CardDescription>Track your daily movement</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <div className="relative h-40 w-40 rounded-full border-8 border-muted flex items-center justify-center">
                        <div
                          className="absolute inset-0 rounded-full border-8 border-primary border-r-transparent border-b-transparent"
                          style={{ transform: `rotate(${Math.min(steps / stepGoal, 1) * 360}deg)` }}
                        ></div>
                        <div className="text-center">
                          <div className="text-3xl font-bold">{steps.toLocaleString()}</div>
                          <div className="text-xs text-muted-foreground">of {stepGoal.toLocaleString()} goal</div>
                        </div>
                      </div>
                      <form onSubmit={handleUpdateSteps} className="w-full space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="steps">Update Steps</Label>
                          <div className="flex space-x-2">
                            <Input
                              id="steps"
                              type="number"
                              value={steps}
                              onChange={(e) => setSteps(Number.parseInt(e.target.value) || 0)}
                            />
                            <Button type="submit" disabled={saving}>
                              {saving ? "Saving..." : "Update"}
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="goal">Daily Step Goal</Label>
                          <Input
                            id="goal"
                            type="number"
                            value={stepGoal}
                            onChange={(e) => setStepGoal(Number.parseInt(e.target.value) || 0)}
                          />
                        </div>
                      </form>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Weekly Overview</CardTitle>
                    <CardDescription>Your step count for the past week</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px] flex items-end justify-between gap-2">
                      {stepHistory.map((day) => (
                        <div key={day.date} className="flex flex-col items-center">
                          <div
                            className="w-10 bg-primary rounded-t-sm"
                            style={{ height: `${(day.steps / stepGoal) * 200}px` }}
                          ></div>
                          <div className="mt-2 text-xs font-medium">{day.date.substring(0, 3)}</div>
                          <div className="text-xs text-muted-foreground">{day.steps.toLocaleString()}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
              <Card>
                <CardHeader>
                  <CardTitle>Activity Insights</CardTitle>
                  <CardDescription>Understanding your movement patterns</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="rounded-lg border p-4">
                      <div className="flex items-center gap-2">
                        <Footprints className="h-5 w-5 text-primary" />
                        <h3 className="font-semibold">Step Count Analysis</h3>
                      </div>
                      <p className="mt-2 text-sm">
                        You're averaging 8,407 steps per day this week, which is 84% of your daily goal. Your most
                        active day is Friday, and your least active is Saturday.
                      </p>
                    </div>
                    <div className="rounded-lg border p-4">
                      <div className="flex items-center gap-2">
                        <Activity className="h-5 w-5 text-primary" />
                        <h3 className="font-semibold">Activity Recommendation</h3>
                      </div>
                      <p className="mt-2 text-sm">
                        Based on your current activity level, try to increase your daily steps by 500 each week until
                        you consistently reach your goal of 10,000 steps.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="location">
              <LocationTracker />
            </TabsContent>
            <TabsContent value="connect">
              <Card>
                <CardHeader>
                  <CardTitle>Connect Activity Trackers</CardTitle>
                  <CardDescription>Sync your fitness devices and apps</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img
                          src="/placeholder.svg?height=40&width=40"
                          alt="Google Fit"
                          className="h-10 w-10 rounded-full"
                        />
                        <div>
                          <h3 className="font-semibold">Google Fit</h3>
                          <p className="text-sm text-muted-foreground">Connect to sync steps and activities</p>
                        </div>
                      </div>
                      <Button onClick={handleConnectGoogleFit}>Connect</Button>
                    </div>
                  </div>
                  <div className="rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img
                          src="/placeholder.svg?height=40&width=40"
                          alt="Apple Health"
                          className="h-10 w-10 rounded-full"
                        />
                        <div>
                          <h3 className="font-semibold">Apple Health</h3>
                          <p className="text-sm text-muted-foreground">Connect to sync steps and activities</p>
                        </div>
                      </div>
                      <Button variant="outline">Connect</Button>
                    </div>
                  </div>
                  <div className="rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img
                          src="/placeholder.svg?height=40&width=40"
                          alt="Fitbit"
                          className="h-10 w-10 rounded-full"
                        />
                        <div>
                          <h3 className="font-semibold">Fitbit</h3>
                          <p className="text-sm text-muted-foreground">Connect to sync steps and activities</p>
                        </div>
                      </div>
                      <Button variant="outline">Connect</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardShell>
  )
}

