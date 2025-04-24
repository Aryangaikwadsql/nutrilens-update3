import { Camera, Activity, Brain, Scale, Smile, Smartphone } from "lucide-react"

export function FeatureSection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">Innovative Features</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Nutrilens combines cutting-edge AI with health tracking to provide a comprehensive solution
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
          <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
            <Camera className="h-12 w-12 text-primary" />
            <h3 className="text-xl font-bold">AI Meal Recognition</h3>
            <p className="text-center text-sm text-muted-foreground">
              Upload any food picture and our AI will recognize it, logging calories and macros automatically
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
            <Activity className="h-12 w-12 text-primary" />
            <h3 className="text-xl font-bold">Step Tracker Integration</h3>
            <p className="text-center text-sm text-muted-foreground">
              Sync with Google Fit or use our built-in pedometer to track your daily steps and activity
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
            <Brain className="h-12 w-12 text-primary" />
            <h3 className="text-xl font-bold">AI Recommendation Engine</h3>
            <p className="text-center text-sm text-muted-foreground">
              Get personalized notifications based on your calorie intake, steps, and BMI
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
            <Scale className="h-12 w-12 text-primary" />
            <h3 className="text-xl font-bold">Dynamic Diet Feedback</h3>
            <p className="text-center text-sm text-muted-foreground">
              Receive intelligent feedback on your diet based on weight changes and caloric intake
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
            <Smile className="h-12 w-12 text-primary" />
            <h3 className="text-xl font-bold">Mood + Nutrition Tracking</h3>
            <p className="text-center text-sm text-muted-foreground">
              Log your mood and discover correlations between your diet and emotional well-being
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
            <Smartphone className="h-12 w-12 text-primary" />
            <h3 className="text-xl font-bold">Progressive Web App</h3>
            <p className="text-center text-sm text-muted-foreground">
              Add to your home screen for a native app-like experience on any device
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

