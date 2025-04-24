import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { StepCounter } from "@/components/step-counter"

export function StepTracker() {
  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Step Tracker</CardTitle>
        <CardDescription>Your daily step count</CardDescription>
      </CardHeader>
      <CardContent>
        <StepCounter />
      </CardContent>
    </Card>
  )
}

