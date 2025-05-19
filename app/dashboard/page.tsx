"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Activity, Clock, Edit3, Flame, Plus, Zap, FileUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { StatsOverview } from "@/components/stats-overview"
import { CalendarHeatmap } from "@/components/calendar-heatmap"
import { StreakCounter } from "@/components/streak-counter"
import { MainNav } from "@/components/main-nav"
import { UserNav } from "@/components/user-nav"
import { initialDecks, initialStats } from "@/lib/initial-data"
import { calculateDueCards } from "@/lib/spaced-repetition"

export default function DashboardPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)
  const [decks, setDecks] = useLocalStorage("flashcard-decks", initialDecks)
  const [stats, setStats] = useLocalStorage("flashcard-stats", initialStats)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const totalCards = decks.reduce((acc, deck) => acc + deck.cards.length, 0)
  const dueCards = decks.reduce((acc, deck) => acc + calculateDueCards(deck.cards).length, 0)
  const masteredCards = decks.reduce((acc, deck) => acc + deck.cards.filter((card) => card.interval > 30).length, 0)
  const masteryPercentage = totalCards > 0 ? Math.round((masteredCards / totalCards) * 100) : 0

  const handleCreateDeck = () => {
    router.push("/create-deck")
  }

  const handleStudyNow = () => {
    if (dueCards === 0) {
      toast({
        title: "No cards due",
        description: "There are no cards due for review. Create new cards or check back later.",
        variant: "default",
      })
      return
    }

    // Find the first deck with due cards
    const deckWithDueCards = decks.find((deck) => calculateDueCards(deck.cards).length > 0)
    if (deckWithDueCards) {
      router.push(`/study/${deckWithDueCards.id}`)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="border-b border-white/10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center px-4">
          <MainNav />
          <div className="ml-auto flex items-center space-x-4">
            <UserNav />
          </div>
        </div>
      </div>
      <div className="grid-pattern flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight neon-text">Dashboard</h2>
          <div className="flex items-center space-x-2">
            <Button onClick={() => router.push("/import")} variant="outline" className="cyberpunk-border">
              <FileUp className="mr-2 h-4 w-4" />
              Import
            </Button>
            <Button onClick={handleCreateDeck} className="cyberpunk-border">
              <Plus className="mr-2 h-4 w-4" />
              New Deck
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="cyberpunk-border">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="decks">Decks</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="glassmorphism cyberpunk-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Due Today</CardTitle>
                  <Clock className="h-4 w-4 text-blue-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dueCards}</div>
                  <p className="text-xs text-muted-foreground">
                    {dueCards > 0 ? "Cards waiting for review" : "All caught up!"}
                  </p>
                </CardContent>
              </Card>

              <Card className="glassmorphism cyberpunk-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
                  <Flame className="h-4 w-4 text-orange-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.currentStreak} days</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.currentStreak > 0 ? "Keep it going!" : "Start your streak today"}
                  </p>
                </CardContent>
              </Card>

              <Card className="glassmorphism cyberpunk-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Mastery Level</CardTitle>
                  <Zap className="h-4 w-4 text-yellow-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{masteryPercentage}%</div>
                  <Progress value={masteryPercentage} className="h-2" />
                </CardContent>
              </Card>

              <Card className="glassmorphism cyberpunk-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total XP</CardTitle>
                  <Activity className="h-4 w-4 text-green-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalXP}</div>
                  <p className="text-xs text-muted-foreground">Level {Math.floor(stats.totalXP / 100) + 1}</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="glassmorphism cyberpunk-border col-span-4">
                <CardHeader>
                  <CardTitle>Study Progress</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                  <StatsOverview />
                </CardContent>
              </Card>

              <Card className="glassmorphism cyberpunk-border col-span-3">
                <CardHeader>
                  <CardTitle>Activity</CardTitle>
                  <CardDescription>Your daily review activity</CardDescription>
                </CardHeader>
                <CardContent>
                  <CalendarHeatmap />
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card className="glassmorphism cyberpunk-border col-span-2">
                <CardHeader>
                  <CardTitle>Recent Decks</CardTitle>
                  <CardDescription>Your recently studied decks</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-8">
                    {decks.slice(0, 3).map((deck) => (
                      <div key={deck.id} className="flex items-center">
                        <div className="space-y-1">
                          <p className="text-sm font-medium leading-none">{deck.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {deck.cards.length} cards • {calculateDueCards(deck.cards).length} due
                          </p>
                        </div>
                        <div className="ml-auto font-medium">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/study/${deck.id}`)}
                            className="cyberpunk-border"
                          >
                            Study
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="glassmorphism cyberpunk-border">
                <CardHeader>
                  <CardTitle>Streak Stats</CardTitle>
                  <CardDescription>Your learning consistency</CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="flex items-center justify-center py-4">
                    <StreakCounter currentStreak={stats.currentStreak} longestStreak={stats.longestStreak} />
                  </div>
                  <Separator className="my-4 bg-white/10" />
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <div className="text-muted-foreground">Current Streak</div>
                      <div>{stats.currentStreak} days</div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <div className="text-muted-foreground">Longest Streak</div>
                      <div>{stats.longestStreak} days</div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <div className="text-muted-foreground">Total Reviews</div>
                      <div>{stats.totalReviews}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-center mt-8">
              <Button
                size="lg"
                onClick={handleStudyNow}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium px-8 py-6 rounded-xl cyberpunk-border neon-glow"
              >
                <Zap className="mr-2 h-5 w-5" />
                Study Now
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card className="glassmorphism cyberpunk-border col-span-2">
                <CardHeader>
                  <CardTitle>Recall Performance</CardTitle>
                  <CardDescription>Your memory retention over time</CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                  <StatsOverview />
                </CardContent>
              </Card>

              <Card className="glassmorphism cyberpunk-border">
                <CardHeader>
                  <CardTitle>Review Distribution</CardTitle>
                  <CardDescription>Cards by interval length</CardDescription>
                </CardHeader>
                <CardContent>
                  <CalendarHeatmap />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="decks" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {decks.map((deck) => (
                <Card key={deck.id} className="glassmorphism cyberpunk-border overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle>{deck.title}</CardTitle>
                    <CardDescription>{deck.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between text-sm mb-4">
                      <div className="text-muted-foreground">Total Cards</div>
                      <div>{deck.cards.length}</div>
                    </div>
                    <div className="flex justify-between text-sm mb-4">
                      <div className="text-muted-foreground">Due Cards</div>
                      <div>{calculateDueCards(deck.cards).length}</div>
                    </div>
                    <div className="flex justify-between text-sm mb-4">
                      <div className="text-muted-foreground">Mastered</div>
                      <div>
                        {deck.cards.length > 0
                          ? Math.round(
                              (deck.cards.filter((card) => card.interval > 30).length / deck.cards.length) * 100,
                            )
                          : 0}
                        %
                      </div>
                    </div>
                    <div className="flex space-x-2 mt-6">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 cyberpunk-border"
                        onClick={() => router.push(`/edit-deck/${deck.id}`)}
                      >
                        <Edit3 className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1 cyberpunk-border"
                        onClick={() => router.push(`/study/${deck.id}`)}
                      >
                        <Zap className="mr-2 h-4 w-4" />
                        Study
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Card
                className="glassmorphism cyberpunk-border flex flex-col items-center justify-center p-6 h-[250px] cursor-pointer hover:bg-white/5 transition-colors"
                onClick={handleCreateDeck}
              >
                <div className="rounded-full bg-primary/20 p-6 mb-4">
                  <Plus className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-medium mb-2">Create New Deck</h3>
                <p className="text-sm text-muted-foreground text-center">Add a new collection of flashcards</p>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
