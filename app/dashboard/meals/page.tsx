"use client"

import { useEffect, useState } from "react"
import { collection, query, orderBy, getDocs, where } from "firebase/firestore"
import { db } from "lib/firebase"
import { useAuth } from "context/auth-context"
import { DashboardHeader } from "components/dashboard/dashboard-header"
import { DashboardShell } from "components/dashboard/dashboard-shell"
import { DashboardNav } from "components/dashboard/dashboard-nav"
import { Button } from "components/ui/button"
import { Card, CardContent } from "components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "components/ui/tabs"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import Image from "next/image"

interface Meal {
  id: string
  name: string
  calories: number
  protein: number
  carbs: number
  fat: number
  imageUrl?: string
  timestamp: any
}

export default function MealsPage() {
  const { user } = useAuth()
  const [meals, setMeals] = useState<Meal[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("today")

  // Remove mealSaved query param toast logic as toast is now shown on Scan page

  useEffect(() => {
    const fetchMeals = async () => {
      if (!user) return

      setLoading(true)
      try {
        const mealsRef = collection(db, "users", user.uid, "meals")
        let q

        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const weekAgo = new Date()
        weekAgo.setDate(today.getDate() - 7)
        weekAgo.setHours(0, 0, 0, 0)

        if (activeTab === "today") {
          q = query(mealsRef, orderBy("timestamp", "desc"), where("timestamp", ">=", today))
        } else if (activeTab === "week") {
          q = query(mealsRef, orderBy("timestamp", "desc"), where("timestamp", ">=", weekAgo))
        } else {
          q = query(mealsRef, orderBy("timestamp", "desc"))
        }

        const querySnapshot = await getDocs(q)

        const fetchedMeals: Meal[] = []
        querySnapshot.forEach((doc) => {
          fetchedMeals.push({
            id: doc.id,
            ...doc.data(),
          } as Meal)
        })

        setMeals(fetchedMeals)
      } catch (error) {
        console.error("Error fetching meals:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchMeals()
  }, [user, activeTab])

  // Filter meals based on active tab
  const filteredMeals = meals.filter((meal) => {
    if (activeTab === "today") {
      // Show all meals in "Today" tab as requested
      return true
    } else if (activeTab === "week") {
      // Check if meal is from this week
      const mealDate = meal.timestamp?.toDate()
      if (!mealDate) return false

      const today = new Date()
      const weekAgo = new Date(today)
      weekAgo.setDate(today.getDate() - 7)

      return mealDate >= weekAgo
    } else {
      // All meals
      return true
    }
  })

  // Calculate totals
  const totalCalories = filteredMeals.reduce((sum, meal) => sum + meal.calories, 0)
  const totalProtein = filteredMeals.reduce((sum, meal) => sum + meal.protein, 0)
  const totalCarbs = filteredMeals.reduce((sum, meal) => sum + meal.carbs, 0)
  const totalFat = filteredMeals.reduce((sum, meal) => sum + meal.fat, 0)

  return (
    <DashboardShell>
      <DashboardNav />
      <div className="flex-1">
        <DashboardHeader heading="Meals" text="Track and manage your food intake">
          <Link href="/dashboard/scan">
            <Button>
              Add Meal
            </Button>
          </Link>
        </DashboardHeader>
        <div className="p-4 md:p-8 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="today">Today</TabsTrigger>
              <TabsTrigger value="week">This Week</TabsTrigger>
              <TabsTrigger value="all">All Time</TabsTrigger>
            </TabsList>
            <TabsContent value={activeTab} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="text-2xl font-bold">{totalCalories}</div>
                    <p className="text-xs text-muted-foreground">Total Calories</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="text-2xl font-bold">{totalProtein}g</div>
                    <p className="text-xs text-muted-foreground">Total Protein</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="text-2xl font-bold">{totalCarbs}g</div>
                    <p className="text-xs text-muted-foreground">Total Carbs</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="text-2xl font-bold">{totalFat}g</div>
                    <p className="text-xs text-muted-foreground">Total Fat</p>
                  </CardContent>
                </Card>
              </div>

              {loading ? (
                <div className="flex justify-center p-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                </div>
              ) : filteredMeals.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-muted-foreground">No meals recorded for this period</p>
                    <Link href="/dashboard/scan">
                      <Button className="mt-4">
                        Add Your First Meal
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {filteredMeals.map((meal) => (
                    <Card key={meal.id}>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                          {meal.imageUrl ? (
                            <Image
                              src={meal.imageUrl}
                              alt={meal.name}
                              width={64}
                              height={64}
                              className="rounded-md object-cover"
                            />
                          ) : (
                            <Image
                              src="/placeholder.svg"
                              alt="Placeholder"
                              width={64}
                              height={64}
                              className="rounded-md object-cover"
                            />
                          )}
                          <div className="flex-1">
                            <h3 className="font-semibold">{meal.name}</h3>
                            <p className="text-sm text-muted-foreground">{meal.timestamp?.toDate().toLocaleString()}</p>
                          </div>
                          <div className="grid grid-cols-4 gap-4 text-center">
                            <div>
                              <p className="text-sm font-medium">{meal.calories}</p>
                              <p className="text-xs text-muted-foreground">kcal</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium">{meal.protein}g</p>
                              <p className="text-xs text-muted-foreground">Protein</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium">{meal.carbs}g</p>
                              <p className="text-xs text-muted-foreground">Carbs</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium">{meal.fat}g</p>
                              <p className="text-xs text-muted-foreground">Fat</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardShell>
  )
}
