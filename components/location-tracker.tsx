"use client"

import { useState, useEffect, useRef } from "react"
import dynamic from 'next/dynamic'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { getFirestore, collection, addDoc } from "firebase/firestore"
import { getAuth } from "firebase/auth"
import { app } from "@/lib/firebase"

const MapComponent = dynamic(() => import('./MapComponent'), { ssr: false })

interface Location {
  latitude: number
  longitude: number
  accuracy: number
  steps?: number
}

const db = getFirestore(app)

export function LocationTracker() {
  const [location, setLocation] = useState<Location | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [steps, setSteps] = useState(0)
  const watchIdRef = useRef<number | null>(null)
  const lastPositionRef = useRef<GeolocationPosition | null>(null)
  const auth = getAuth()

  // Calculate distance between two coordinates in meters
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3 // Earth radius in meters
    const φ1 = lat1 * Math.PI/180
    const φ2 = lat2 * Math.PI/180
    const Δφ = (lat2-lat1) * Math.PI/180
    const Δλ = (lon2-lon1) * Math.PI/180

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))

    return R * c
  }

  // Save step data to Firestore
  const saveStepData = async (userId: string, stepCount: number) => {
    try {
      await addDoc(collection(db, "userSteps"), {
        userId,
        stepCount,
        timestamp: new Date()
      })
    } catch (error) {
      console.error("Error saving step data:", error)
    }
  }

  useEffect(() => {
    setLoading(true)
    
    const successHandler = (position: GeolocationPosition) => {
      if (lastPositionRef.current) {
        const distance = calculateDistance(
          lastPositionRef.current.coords.latitude,
          lastPositionRef.current.coords.longitude,
          position.coords.latitude,
          position.coords.longitude
        )
        
        // Estimate steps based on distance (avg step length ~0.762m)
        if (distance > 0.5) { // Minimum movement threshold
          const newSteps = Math.round(distance / 0.762)
          setSteps(prev => {
            const updatedSteps = prev + newSteps
            const user = auth.currentUser
            if (user) {
              saveStepData(user.uid, updatedSteps)
            }
            return updatedSteps
          })
        }
      }

      setLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        steps
      })
      lastPositionRef.current = position
      setLoading(false)
    }

    const errorHandler = (err: GeolocationPositionError) => {
      setError(err.message)
      setLoading(false)
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      successHandler,
      errorHandler,
      { 
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 15000
      }
    )

    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current)
      }
    }
  }, [steps, auth])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Location Tracker</CardTitle>
        <CardDescription>Track your location and steps</CardDescription>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="rounded-md bg-destructive/15 p-4 text-sm text-destructive">{error}</div>
        ) : loading ? (
          <div className="flex justify-center p-4">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        ) : location ? (
          <div className="space-y-4">
            <div className="h-64 w-full relative rounded-md overflow-hidden">
              <MapComponent {...location} />
            </div>
            <div className="flex justify-between">
              <div className="bg-background/80 p-2 rounded-md text-xs">
                Accuracy: {Math.round(location.accuracy)}m
              </div>
              <div className="bg-background/80 p-2 rounded-md text-xs">
                Steps: {steps}
              </div>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}