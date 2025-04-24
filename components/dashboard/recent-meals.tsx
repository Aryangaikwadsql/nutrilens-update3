import { useEffect, useState } from "react"
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore"
import { useAuth } from "context/auth-context"
import { db } from "lib/firebase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "components/ui/card"
import { useRouter } from "next/navigation"

interface Meal {
  id: string
  name: string
  timestamp: any
  calories: number
  imageUrl?: string
}

export function RecentMeals() {
  const { user } = useAuth()
  const [meals, setMeals] = useState<Meal[]>([])
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      setMeals([])
      return
    }

    const mealsRef = collection(db, "users", user.uid, "meals")
    const q = query(mealsRef, orderBy("timestamp", "desc"), limit(5))

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedMeals: Meal[] = []
      querySnapshot.forEach((doc) => {
        fetchedMeals.push({
          id: doc.id,
          ...doc.data(),
        } as Meal)
      })
      setMeals(fetchedMeals)
    })

    return () => unsubscribe()
  }, [user])

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Recent Meals</CardTitle>
        <CardDescription>Your food intake for today</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {meals.length === 0 ? (
            <p className="text-muted-foreground">No recent meals found.</p>
          ) : (
            meals.map((meal) => (
              <div key={meal.id} className="flex items-center gap-4">
                <img
                  src={meal.imageUrl || "/placeholder.svg"}
                  alt={meal.name}
                  className="h-12 w-12 rounded-md object-cover"
                />
                <div className="flex-1">
                  <h4 className="text-sm font-semibold">{meal.name}</h4>
                  <p className="text-xs text-muted-foreground">
                    {meal.timestamp?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className="text-sm font-medium">{meal.calories} kcal</div>
              </div>
            ))
          )}
          <div className="pt-2">
            <button
              className="text-sm text-primary hover:underline"
              onClick={() => router.push("/dashboard/meals")}
            >
              View all meals
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
