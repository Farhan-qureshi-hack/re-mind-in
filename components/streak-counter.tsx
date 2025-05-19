"use client"

import { Flame } from "lucide-react"

interface StreakCounterProps {
  currentStreak: number
  longestStreak: number
}

export function StreakCounter({ currentStreak, longestStreak }: StreakCounterProps) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <div className="absolute inset-0 rounded-full blur-xl bg-orange-500/30" />
        <div className="relative rounded-full bg-orange-500/20 p-6">
          <Flame className="h-12 w-12 text-orange-500" />
        </div>
      </div>
      <div className="mt-4 text-center">
        <div className="text-3xl font-bold">{currentStreak}</div>
        <div className="text-sm text-muted-foreground">day streak</div>
      </div>
    </div>
  )
}
