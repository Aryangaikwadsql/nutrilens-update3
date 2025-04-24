import { type NextRequest, NextResponse } from "next/server"
import { exec } from "child_process"
import { promisify } from "util"

const execPromise = promisify(exec)

export async function POST(request: NextRequest) {
  try {
    const { bmi, calories, calorieTarget, steps, stepTarget, weight, weightHistory, mood, mealTimes } =
      await request.json()

    // Validate input
    if (!bmi || !calories || !calorieTarget || !steps || !stepTarget) {
      return NextResponse.json({ error: "Missing required data" }, { status: 400 })
    }

    // Execute Python script
    const pythonScript = `
import sys
import json
from datetime import datetime

# Get input from command line arguments
input_data = json.loads(sys.argv[1])
bmi = input_data.get('bmi')
calories = input_data.get('calories')
calorie_target = input_data.get('calorieTarget')
steps = input_data.get('steps')
step_target = input_data.get('stepTarget')
weight = input_data.get('weight')
weight_history = input_data.get('weightHistory', [])
mood = input_data.get('mood')
meal_times = input_data.get('mealTimes', {})

recommendations = []

# Calorie vs Steps recommendation
calorie_ratio = calories / calorie_target if calorie_target > 0 else 1
step_ratio = steps / step_target if step_target > 0 else 0

if calorie_ratio > 0.9 and step_ratio < 0.5:
    recommendations.append({
        "type": "activity",
        "message": f"You've consumed {calories} kcal ({int(calorie_ratio * 100)}% of target) but only walked {steps} steps ({int(step_ratio * 100)}% of goal). Consider increasing to {int(step_target * 0.7)}+ steps to maintain caloric balance."
    })
elif calorie_ratio < 0.7 and step_ratio > 0.8:
    recommendations.append({
        "type": "nutrition",
        "message": f"You're {int((1-calorie_ratio) * 100)}% under your calorie target but have completed {int(step_ratio * 100)}% of your step goal. Consider a nutritious snack to fuel your activity."
    })

# BMI-based recommendations
if bmi > 30:
    recommendations.append({
        "type": "health",
        "message": "Focus on nutrient-dense, lower-calorie foods like vegetables, lean proteins, and whole grains to support weight management."
    })
elif bmi < 18.5:
    recommendations.append({
        "type": "health",
        "message": "Include more calorie-dense, nutritious foods like nuts, avocados, and whole grains to support healthy weight gain."
    })

# Weight trend analysis (if history provided)
if weight and weight_history and len(weight_history) >= 3:
    # Check if weight is increasing while in caloric deficit
    is_deficit = calories < calorie_target
    recent_weights = weight_history[-3:]
    weight_increasing = all(recent_weights[i] <= recent_weights[i+1] for i in range(len(recent_weights)-1))
    
    if is_deficit and weight_increasing:
        recommendations.append({
            "type": "metabolic",
            "message": "You appear to be gaining weight despite being in a caloric deficit. Consider checking your hydration levels or consulting with a healthcare provider about metabolic health."
        })

# Mood correlation (if provided)
if mood:
    if mood == "low" and "breakfast" not in meal_times:
        recommendations.append({
            "type": "mood",
            "message": "You reported feeling low today. Consider eating breakfast tomorrow, as skipping morning meals can affect energy levels and mood."
        })
    elif mood == "energetic" and "breakfast" in meal_times and meal_times["breakfast"] < "09:00":
        recommendations.append({
            "type": "mood",
            "message": "You reported feeling energetic today. Early breakfast before 9 AM seems to correlate with your higher energy levels."
        })

# Ensure we have at least one recommendation
if not recommendations:
    if step_ratio < 1.0:
        recommendations.append({
            "type": "general",
            "message": f"You're at {steps} steps. Just {step_target - steps} more to reach your daily goal!"
        })
    else:
        recommendations.append({
            "type": "general",
            "message": "Great job staying on track with your health goals today!"
        })

# Return results
result = {
    'recommendations': recommendations
}

print(json.dumps(result))
`

    const inputData = JSON.stringify({
      bmi,
      calories,
      calorieTarget,
      steps,
      stepTarget,
      weight,
      weightHistory,
      mood,
      mealTimes,
    })

    const { stdout } = await execPromise(`python -c "${pythonScript}" '${inputData}'`)

    const result = JSON.parse(stdout.trim())

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error generating recommendations:", error)
    return NextResponse.json({ error: "Failed to generate recommendations" }, { status: 500 })
  }
}

