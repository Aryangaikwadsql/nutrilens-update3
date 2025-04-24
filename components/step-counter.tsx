"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "components/ui/card"

export function StepCounter() {
  const [steps, setSteps] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const lastPositionRef = useRef<GeolocationPosition | null>(null)

  // Calculate distance between two coordinates in meters
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3 // Earth radius in meters
    const φ1 = lat1 * Math.PI / 180
    const φ2 = lat2 * Math.PI / 180
    const Δφ = (lat2 - lat1) * Math.PI / 180
    const Δλ = (lon2 - lon1) * Math.PI / 180

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) *
      Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return R * c
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
        if (distance > 0.5) { // Minimum movement threshold
          setSteps(prev => prev + Math.round(distance / 0.762)) // avg step length ~0.762m
        }
      }
      lastPositionRef.current = position
      setLoading(false)
    }

    const errorHandler = (err: GeolocationPositionError) => {
      setError(err.message)
      setLoading(false)
    }

    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(successHandler, errorHandler, {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000,
      })

      return () => {
        navigator.geolocation.clearWatch(watchId)
      }
    } else {
      setError("Geolocation is not supported by this browser.")
      setLoading(false)
    }
  }, [])

  if (loading) {
    return <div>Loading step counter...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  return (
    <div>
      <h3 className="text-lg font-semibold">Steps Taken</h3>
      <p className="text-2xl font-bold">{steps}</p>
    </div>
  )
}