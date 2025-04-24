import { type NextRequest, NextResponse } from "next/server"
import { exec } from "child_process"
import { promisify } from "util"

const execPromise = promisify(exec)

export async function POST(request: NextRequest) {
  try {
    const { height, weight } = await request.json()

    // Validate input
    if (!height || !weight || isNaN(height) || isNaN(weight)) {
      return NextResponse.json({ error: "Invalid height or weight" }, { status: 400 })
    }

    // Execute Python script
    const pythonScript = `
import sys
import json

# Get input from command line arguments
input_data = json.loads(sys.argv[1])
height = input_data['height']  # height in cm
weight = input_data['weight']  # weight in kg

# Calculate BMI
height_in_meters = height / 100
bmi = weight / (height_in_meters ** 2)

# Determine BMI category
if bmi < 18.5:
    category = "Underweight"
elif bmi < 25:
    category = "Normal weight"
elif bmi < 30:
    category = "Overweight"
else:
    category = "Obese"

# Calculate recommended calorie intake based on BMI and weight
if bmi < 18.5:
    # For underweight, slightly higher calories for weight gain
    base_calories = weight * 35
elif bmi < 25:
    # For normal weight, maintenance calories
    base_calories = weight * 30
elif bmi < 30:
    # For overweight, slightly lower calories for weight loss
    base_calories = weight * 25
else:
    # For obese, lower calories for weight loss
    base_calories = weight * 22

# Round to nearest 50
recommended_calories = round(base_calories / 50) * 50

# Return results
result = {
    'bmi': round(bmi, 1),
    'category': category,
    'recommended_calories': recommended_calories
}

print(json.dumps(result))
`

    const inputData = JSON.stringify({ height, weight })
    const { stdout } = await execPromise(`python -c "${pythonScript}" '${inputData}'`)

    const result = JSON.parse(stdout.trim())

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error calculating BMI:", error)
    return NextResponse.json({ error: "Failed to calculate BMI" }, { status: 500 })
  }
}

