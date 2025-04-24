"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { addDoc, collection, serverTimestamp, getDoc } from "firebase/firestore"
import { db } from "lib/firebase"
import { useAuth } from "context/auth-context"
import { DashboardHeader } from "components/dashboard/dashboard-header"
import { DashboardShell } from "components/dashboard/dashboard-shell"
import { DashboardNav } from "components/dashboard/dashboard-nav"
import { Button } from "components/ui/button"
import { Card, CardContent } from "components/ui/card"
import { Input } from "components/ui/input"
import { Label } from "components/ui/label"
import { Camera, Upload } from "lucide-react"
import { analyzeFood } from "lib/openrouter"
import { toast } from "sonner"
import { Spinner } from "components/ui/Spinner"  // Importing spinner component with correct casing

export default function ScanFoodPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const [manualCalories, setManualCalories] = useState<string>("")
  const [manualProtein, setManualProtein] = useState<string>("")
  const [manualCarbs, setManualCarbs] = useState<string>("")
  const [manualFat, setManualFat] = useState<string>("")

  useEffect(() => {
    if (result) {
      setManualCalories(result.calories?.toString() || "")
      setManualProtein(result.protein?.toString() || "")
      setManualCarbs(result.carbs?.toString() || "")
      setManualFat(result.fat?.toString() || "")
    } else {
      setManualCalories("")
      setManualProtein("")
      setManualCarbs("")
      setManualFat("")
    }
  }, [result])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setImage(file)
      setPreview(URL.createObjectURL(file))
      setResult(null)
      toast.success("Image uploaded successfully")
    }
  }

  const handleCapture = async () => {
    alert("Camera capture would be implemented here")
  }

  // Cloudinary upload function
  const uploadToCloudinary = async (file: File): Promise<string | null> => {
    const url = "https://api.cloudinary.com/v1_1/dscaahxio/image/upload"
    const preset = "unsigned_preset" // Updated with the user-provided preset name

    const formData = new FormData()
    formData.append("file", file)
    formData.append("upload_preset", preset)

    try {
      const response = await fetch(url, {
        method: "POST",
        body: formData,
      })
      const data = await response.json()
      if (data.secure_url) {
        return data.secure_url
      } else {
        throw new Error("Cloudinary upload failed")
      }
    } catch (error) {
      console.error("Cloudinary upload error:", error)
      toast.error("Failed to upload image to Cloudinary")
      return null
    }
  }

  const handleAnalyze = async () => {
    if (!image || !user) {
      toast.error("Please upload an image and ensure you are logged in before analyzing.")
      return
    }

    setLoading(true)
    toast("Analyzing food, please wait...")

    try {
      const reader = new FileReader()
      reader.readAsDataURL(image)
      reader.onload = async () => {
        const base64Image = reader.result?.toString().split(",")[1]

        if (base64Image) {
          const analysis = await analyzeFood(base64Image)
          setResult(analysis)
          toast.success("Food analysis complete!")
        }
      }
    } catch (error) {
      console.error("Error analyzing food:", error)
      toast.error("Error analyzing food. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleClear = () => {
    setImage(null)
    setPreview(null)
    setResult(null)
    toast("Image cleared")
  }

  const handleSave = async () => {
    if (!result || !user) {
      toast.error("Please analyze your food first and ensure you're logged in")
      return
    }

    const caloriesNum = Number(manualCalories)
    const proteinNum = Number(manualProtein)
    const carbsNum = Number(manualCarbs)
    const fatNum = Number(manualFat)

    if (
      isNaN(caloriesNum) || caloriesNum < 0 ||
      isNaN(proteinNum) || proteinNum < 0 ||
      isNaN(carbsNum) || carbsNum < 0 ||
      isNaN(fatNum) || fatNum < 0
    ) {
      toast.error("Please enter valid non-negative numbers for proportions")
      return
    }

    try {
      toast("Saving meal, please wait...")
      if (!navigator.onLine) {
        throw new Error("offline")
      }

      let retries = 3
      let lastError = null

      while (retries > 0) {
        try {
          let imageUrl = preview
          if (image) {
            const uploadedUrl = await uploadToCloudinary(image)
            if (uploadedUrl) {
              imageUrl = uploadedUrl
            } else {
              throw new Error("Image upload failed")
            }
          }

          const docRef = await addDoc(collection(db, "users", user.uid, "meals"), {
            name: result.name,
            calories: caloriesNum,
            protein: proteinNum,
            carbs: carbsNum,
            fat: fatNum,
            imageUrl: imageUrl,
            timestamp: serverTimestamp(),
          })

          const docSnapshot = await getDoc(docRef)
          if (!docSnapshot.exists()) {
            throw new Error("Document not created")
          }

          toast.success(`Meal "${result.name}" logged successfully!`)
          // Redirect user to meals list immediately after clicking save
          router.push(`/dashboard/meals`)
          return
        } catch (error) {
          lastError = error
          retries--
          await new Promise(resolve => setTimeout(resolve, 2000))
        }
      }

      throw lastError || new Error("Failed after 3 attempts")
    } catch (error) {
      let errorMessage = "Failed to save meal. Please try again."

      if (error instanceof Error) {
        if (error.message.includes("offline")) {
          errorMessage = "You appear to be offline. Please check your internet connection and try again."
        }
      }

      toast.error(errorMessage)
    }
  }

  return (
    <DashboardShell>
      <DashboardNav />
      <div className="flex-1">
        <DashboardHeader heading="Scan Food" text="Take a photo of your meal to analyze its nutritional content" />
        <div className="p-4 md:p-8 space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="grid gap-6">
                <div className="flex flex-col items-center justify-center space-y-4">
                  {preview ? (
                    <div className="relative">
                      <img
                        src={preview || "/placeholder.svg"}
                        alt="Food preview"
                        className="max-h-[300px] rounded-lg object-contain"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={handleClear}
                      >
                        Clear
                      </Button>
                    </div>
                  ) : (
                    <div className="flex h-[300px] w-full items-center justify-center rounded-lg border border-dashed">
                      <div className="flex flex-col items-center space-y-2">
                        <Upload className="h-8 w-8 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Upload or take a photo of your meal</p>
                      </div>
                    </div>
                  )}
                  <div className="flex gap-4">
                    <div>
                      <Label htmlFor="image-upload" className="sr-only">Upload Image</Label>
                      <Input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      <Button variant="outline" onClick={() => document.getElementById("image-upload")?.click()}>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload
                      </Button>
                    </div>
                    <Button variant="outline" onClick={handleCapture}>
                      <Camera className="mr-2 h-4 w-4" />
                      Take Photo
                    </Button>
                  </div>
                </div>

                {image && !result && (
                  <Button onClick={handleAnalyze} disabled={loading} className="flex items-center justify-center">
                    {loading ? <Spinner /> : "Analyze Food"}
                  </Button>
                )}

                {result && (
                  <div>
                    <div className="text-lg font-medium">{result.name}</div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Calories</Label>
                        <Input
                          value={manualCalories}
                          onChange={(e) => setManualCalories(e.target.value)}
                          placeholder="Calories"
                        />
                      </div>
                      <div>
                        <Label>Protein</Label>
                        <Input
                          value={manualProtein}
                          onChange={(e) => setManualProtein(e.target.value)}
                          placeholder="Protein"
                        />
                      </div>
                      <div>
                        <Label>Carbs</Label>
                        <Input
                          value={manualCarbs}
                          onChange={(e) => setManualCarbs(e.target.value)}
                          placeholder="Carbs"
                        />
                      </div>
                      <div>
                        <Label>Fat</Label>
                        <Input
                          value={manualFat}
                          onChange={(e) => setManualFat(e.target.value)}
                          placeholder="Fat"
                        />
                      </div>
                    </div>

                    <Button onClick={handleSave} className="mt-4" disabled={loading}>
                      {loading ? <Spinner /> : "Save Meal"}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  )
}
