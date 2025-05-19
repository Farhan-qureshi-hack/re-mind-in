"use client"

import { useEffect, useState } from "react"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { initialStats } from "@/lib/initial-data"

export function CalendarHeatmap() {
  const [mounted, setMounted] = useState(false)
  const [stats] = useLocalStorage("flashcard-stats", initialStats)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  // Generate a 7x5 grid for the heatmap (last 5 weeks)
  const weeks = 5
  const days = 7

  // Generate sample data for the heatmap
  const heatmapData = Array.from({ length: weeks * days }).map((_, i) => {
    const intensity = Math.floor(Math.random() * 5) // 0-4 intensity
    return {
      date: new Date(Date.now() - (weeks * days - i) * 24 * 60 * 60 * 1000),
      count: intensity === 0 ? 0 : intensity * 5,
      intensity,
    }
  })

  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-muted-foreground mb-1">
        <div>Mon</div>
        <div>Wed</div>
        <div>Fri</div>
        <div>Sun</div>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {heatmapData.map((day, i) => (
          <div
            key={i}
            className={`h-4 rounded-sm ${
              day.intensity === 0
                ? "bg-muted/30"
                : day.intensity === 1
                  ? "bg-purple-900/30"
                  : day.intensity === 2
                    ? "bg-purple-800/40"
                    : day.intensity === 3
                      ? "bg-purple-700/60"
                      : "bg-purple-600/80"
            }`}
            title={`${day.date.toLocaleDateString()}: ${day.count} reviews`}
          />
        ))}
      </div>
    </div>
  )
}
