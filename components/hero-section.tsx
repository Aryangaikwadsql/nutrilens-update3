import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Camera, Activity, Utensils, Brain } from "lucide-react"

export function HeroSection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-background to-muted">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-2">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                AI-Powered Nutrition & Health Tracking
              </h1>
              <p className="max-w-[600px] text-muted-foreground md:text-xl">
                Snap a photo of your meal, track your steps, and get personalized health recommendations powered by AI.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Link href="/signup">
                <Button size="lg" className="gap-1">
                  Get Started
                </Button>
              </Link>
              <Link href="/features">
                <Button size="lg" variant="outline">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="grid grid-cols-2 gap-4 md:gap-8">
              <div className="flex flex-col items-center gap-2 rounded-lg bg-background p-4 shadow-sm">
                <Camera className="h-8 w-8 text-primary" />
                <h3 className="text-xl font-bold">AI Meal Recognition</h3>
                <p className="text-center text-sm text-muted-foreground">
                  Snap a photo of your meal and let AI identify it
                </p>
              </div>
              <div className="flex flex-col items-center gap-2 rounded-lg bg-background p-4 shadow-sm">
                <Activity className="h-8 w-8 text-primary" />
                <h3 className="text-xl font-bold">Step Tracking</h3>
                <p className="text-center text-sm text-muted-foreground">
                  Sync your daily steps and track your activity
                </p>
              </div>
              <div className="flex flex-col items-center gap-2 rounded-lg bg-background p-4 shadow-sm">
                <Utensils className="h-8 w-8 text-primary" />
                <h3 className="text-xl font-bold">Nutrition Insights</h3>
                <p className="text-center text-sm text-muted-foreground">
                  Track calories, macros, and nutritional balance
                </p>
              </div>
              <div className="flex flex-col items-center gap-2 rounded-lg bg-background p-4 shadow-sm">
                <Brain className="h-8 w-8 text-primary" />
                <h3 className="text-xl font-bold">Smart Recommendations</h3>
                <p className="text-center text-sm text-muted-foreground">
                  Get personalized health and diet suggestions
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

