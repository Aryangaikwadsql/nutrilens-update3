import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "components/ui/card"
import { Brain } from "lucide-react"

interface UserProfile {
  bmi?: number
  goal?: string
}

interface Recommendation {
  id: number
  message: string
}

interface RecommendationsProps {
  profile: UserProfile | null
}

export function Recommendations({ profile }: RecommendationsProps) {
  const generateRecommendations = (): Recommendation[] => {
    if (!profile) {
      return [
        {
          id: 1,
          message: "Loading your personalized recommendations...",
        },
      ]
    }

    const recs: Recommendation[] = []

    if (profile.bmi) {
      if (profile.bmi < 18.5) {
        recs.push({
          id: 1,
          message: "Your BMI indicates you are underweight. Consider a calorie surplus with nutrient-dense foods.",
        })
      } else if (profile.bmi >= 18.5 && profile.bmi < 25) {
        recs.push({
          id: 2,
          message: "Your BMI is in the normal range. Maintain a balanced diet and regular exercise.",
        })
      } else {
        recs.push({
          id: 3,
          message: "Your BMI indicates overweight. Consider a calorie deficit and increased physical activity.",
        })
      }
    }

    if (profile.goal) {
      if (profile.goal.toLowerCase().includes("weight loss")) {
        recs.push({
          id: 4,
          message: "Focus on a calorie deficit and high protein intake to support weight loss.",
        })
      } else if (profile.goal.toLowerCase().includes("muscle gain")) {
        recs.push({
          id: 5,
          message: "Increase protein intake and strength training to support muscle gain.",
        })
      } else if (profile.goal.toLowerCase().includes("maintenance")) {
        recs.push({
          id: 6,
          message: "Maintain your current calorie intake and stay active to keep your weight stable.",
        })
      }
    }

    if (recs.length === 0) {
      recs.push({
        id: 7,
        message: "Keep tracking your meals and activity for personalized insights.",
      })
    }

    return recs
  }

  const recommendations = generateRecommendations()

  return (
    <Card className="col-span-2">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          <CardTitle>AI Recommendations</CardTitle>
        </div>
        <CardDescription>Personalized insights based on your data</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recommendations.map((rec) => (
            <div key={rec.id} className="rounded-lg border p-3">
              <p className="text-sm">{rec.message}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
