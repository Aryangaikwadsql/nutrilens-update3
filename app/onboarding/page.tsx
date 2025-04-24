"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { doc, setDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Utensils } from "lucide-react"

export default function OnboardingPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("personal")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Personal info
  const [name, setName] = useState("")
  const [age, setAge] = useState("")
  const [gender, setGender] = useState("male")

  // Body metrics
  const [height, setHeight] = useState("")
  const [weight, setWeight] = useState("")
  const [activityLevel, setActivityLevel] = useState("moderate")

  // Goals
  const [goal, setGoal] = useState("maintain")

  const calculateBMI = () => {
    const heightInM = Number.parseFloat(height) / 100
    const weightInKg = Number.parseFloat(weight)
    return (weightInKg / (heightInM * heightInM)).toFixed(1)
  }

  const handleNext = () => {
    if (activeTab === "personal") {
      if (!name || !age) {
        setError("Please fill in all fields")
        return
      }
      setActiveTab("metrics")
    } else if (activeTab === "metrics") {
      if (!height || !weight) {
        setError("Please fill in all fields")
        return
      }
      setActiveTab("goals")
    }
    setError(null)
  }

  const handleSubmit = async () => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      const bmi = calculateBMI()

      await setDoc(doc(db, "users", user.uid), {
        name,
        age: Number.parseInt(age),
        gender,
        height: Number.parseFloat(height),
        weight: Number.parseFloat(weight),
        bmi: Number.parseFloat(bmi),
        activityLevel,
        goal,
        createdAt: new Date(),
      })

      router.push("/dashboard")
    } catch (err) {
      setError("Failed to save your information")
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center gap-2">
            <Utensils className="h-6 w-6" />
            <span className="text-2xl font-bold">Nutrilens</span>
          </div>
          <CardTitle className="text-2xl text-center">Let's get to know you</CardTitle>
          <CardDescription className="text-center">
            We need some information to personalize your experience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="personal">Personal</TabsTrigger>
              <TabsTrigger value="metrics">Metrics</TabsTrigger>
              <TabsTrigger value="goals">Goals</TabsTrigger>
            </TabsList>
            <TabsContent value="personal" className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input id="age" type="number" value={age} onChange={(e) => setAge(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Gender</Label>
                <RadioGroup value={gender} onValueChange={setGender}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="male" id="male" />
                    <Label htmlFor="male">Male</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="female" id="female" />
                    <Label htmlFor="female">Female</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="other" id="other" />
                    <Label htmlFor="other">Other</Label>
                  </div>
                </RadioGroup>
              </div>
              <Button onClick={handleNext} className="w-full">
                Next
              </Button>
            </TabsContent>
            <TabsContent value="metrics" className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="height">Height (cm)</Label>
                <Input id="height" type="number" value={height} onChange={(e) => setHeight(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input id="weight" type="number" value={weight} onChange={(e) => setWeight(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Activity Level</Label>
                <RadioGroup value={activityLevel} onValueChange={setActivityLevel}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="sedentary" id="sedentary" />
                    <Label htmlFor="sedentary">Sedentary (little or no exercise)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="light" id="light" />
                    <Label htmlFor="light">Light (exercise 1-3 days/week)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="moderate" id="moderate" />
                    <Label htmlFor="moderate">Moderate (exercise 3-5 days/week)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="active" id="active" />
                    <Label htmlFor="active">Active (exercise 6-7 days/week)</Label>
                  </div>
                </RadioGroup>
              </div>
              <Button onClick={handleNext} className="w-full">
                Next
              </Button>
            </TabsContent>
            <TabsContent value="goals" className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Your Goal</Label>
                <RadioGroup value={goal} onValueChange={setGoal}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="lose" id="lose" />
                    <Label htmlFor="lose">Lose Weight</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="maintain" id="maintain" />
                    <Label htmlFor="maintain">Maintain Weight</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="gain" id="gain" />
                    <Label htmlFor="gain">Gain Weight</Label>
                  </div>
                </RadioGroup>
              </div>
              <Button onClick={handleSubmit} disabled={loading} className="w-full">
                {loading ? "Saving..." : "Complete Setup"}
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Your data is securely stored and used only to provide personalized recommendations
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}

