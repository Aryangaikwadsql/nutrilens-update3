'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

interface Props {
  latitude: number
  longitude: number
  accuracy: number
}

export default function MapComponent({ latitude, longitude, accuracy }: Props) {
  const mapRef = useRef<L.Map | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current) return

    // Initialize map only once
    if (!mapRef.current) {
      mapRef.current = L.map(containerRef.current).setView([latitude, longitude], 15)
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapRef.current)

      const marker = L.marker([latitude, longitude], { icon: DefaultIcon }).addTo(mapRef.current)
      marker.bindPopup(`Accuracy: ${Math.round(accuracy)}m`).openPopup()
    } else {
      // Update existing map view and marker
      mapRef.current.setView([latitude, longitude], 15)
      mapRef.current.eachLayer(layer => {
        if (layer instanceof L.Marker) {
          layer.setLatLng([latitude, longitude])
          layer.getPopup()?.setContent(`Accuracy: ${Math.round(accuracy)}m`)
        }
      })
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [latitude, longitude, accuracy])

  return <div ref={containerRef} className="h-full w-full" />
}
//Key improvements:
