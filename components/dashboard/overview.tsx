import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { UserProfile } from "@/types/user"

interface OverviewProps {
  profile: UserProfile | null
  todaySteps?: number
  weeklySteps?: number
}

export function Overview({ profile, todaySteps, weeklySteps }: OverviewProps) {
  return (
    <div className="grid gap-4 md:col-span-2 lg:col-span-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current BMI</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profile?.bmi || "N/A"}</div>
            <p className="text-xs text-muted-foreground">{getBmiCategory(profile?.bmi)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Calories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,850</div>
            <p className="text-xs text-muted-foreground">of 2,100 target</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Steps Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todaySteps ?? "Loading..."}</div>
            <p className="text-xs text-muted-foreground">of 10,000 goal</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Water Intake</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1.2L</div>
            <p className="text-xs text-muted-foreground">of 2.5L goal</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function getBmiCategory(bmi: number | undefined): string {
  if (!bmi) return "Not calculated"

  if (bmi < 18.5) return "Underweight"
  if (bmi < 25) return "Normal weight"
  if (bmi < 30) return "Overweight"
  return "Obese"
}