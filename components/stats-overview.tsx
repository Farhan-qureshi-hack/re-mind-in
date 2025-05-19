"use client"

import { useEffect, useState } from "react"
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { initialStats } from "@/lib/initial-data"

export function StatsOverview() {
  const [mounted, setMounted] = useState(false)
  const [stats] = useLocalStorage("flashcard-stats", initialStats)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  // Generate sample data for the chart
  const data = [
    { day: "Mon", recall: 85, reviews: 12 },
    { day: "Tue", recall: 78, reviews: 8 },
    { day: "Wed", recall: 82, reviews: 15 },
    { day: "Thu", recall: 88, reviews: 10 },
    { day: "Fri", recall: 90, reviews: 18 },
    { day: "Sat", recall: 84, reviews: 6 },
    { day: "Sun", recall: 92, reviews: 14 },
  ]

  return (
    <ChartContainer
      config={{
        recall: {
          label: "Recall Rate (%)",
          color: "hsl(var(--chart-1))",
        },
        reviews: {
          label: "Reviews",
          color: "hsl(var(--chart-2))",
        },
      }}
      className="h-[300px]"
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 10,
            left: 10,
            bottom: 0,
          }}
        >
          <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}`}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Line
            type="monotone"
            dataKey="recall"
            strokeWidth={2}
            activeDot={{
              r: 6,
              style: { fill: "var(--color-recall)", opacity: 0.8 },
            }}
            style={{
              stroke: "var(--color-recall)",
            }}
          />
          <Line
            type="monotone"
            dataKey="reviews"
            strokeWidth={2}
            activeDot={{
              r: 6,
              style: { fill: "var(--color-reviews)", opacity: 0.8 },
            }}
            style={{
              stroke: "var(--color-reviews)",
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
