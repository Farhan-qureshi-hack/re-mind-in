"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, Check, ChevronLeft, ChevronRight, Clock, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { initialDecks, initialStats } from "@/lib/initial-data"
import { calculateDueCards, processAnswer } from "@/lib/spaced-repetition"
import type { Flashcard } from "@/types/flashcard"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"
import { Markdown } from "@/components/markdown"

export default function StudyPage({ params }: { params: { deckId: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)
  const [decks, setDecks] = useLocalStorage("flashcard-decks", initialDecks)
  const [stats, setStats] = useLocalStorage("flashcard-stats", initialStats)
  const [flipped, setFlipped] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [dueCards, setDueCards] = useState<Flashcard[]>([])
  const [completed, setCompleted] = useState(false)
  const [answeredCards, setAnsweredCards] = useState<Flashcard[]>([])
  const [isAnswering, setIsAnswering] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const deck = decks.find((d) => d.id === params.deckId)

  const handleGoBack = () => {
    router.push("/dashboard")
  }

  useEffect(() => {
    setMounted(true)

    // Initialize audio elements
    audioRef.current = new Audio("/sounds/card-flip.mp3")
    audioRef.current.volume = 0.2

    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (mounted && deck) {
      const due = calculateDueCards(deck.cards)
      setDueCards(due)

      if (due.length === 0) {
        toast({
          title: "No cards due",
          description: "There are no cards due for review in this deck.",
          variant: "default",
        })
      }
    }
  }, [mounted, deck, toast])

  if (!mounted) return null
  if (!deck) {
    router.push("/dashboard")
    return null
  }

  // Check if there are due cards
  if (dueCards.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 grid-pattern">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full"
        >
          <Card className="glassmorphism cyberpunk-border p-6 text-center">
            <div className="mb-6 flex justify-center">
              <div className="rounded-full bg-green-500/20 p-6">
                <Check className="h-8 w-8 text-green-500" />
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-2">No Cards Due</h2>
            <p className="text-muted-foreground mb-6">
              There are no cards due for review in this deck. Come back later or add new cards.
            </p>
            <Button onClick={handleGoBack} className="w-full cyberpunk-border">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Card>
        </motion.div>
      </div>
    )
  }

  const currentCard = dueCards[currentIndex]
  if (!currentCard) {
    // Handle case where currentCard is undefined
    setCurrentIndex(0)
    return null
  }

  const progress = dueCards.length > 0 ? (currentIndex / dueCards.length) * 100 : 100

  const handleFlip = () => {
    setFlipped(!flipped)

    // Play flip sound
    if (audioRef.current) {
      audioRef.current.currentTime = 0
      audioRef.current.play().catch((err) => console.log("Audio play prevented:", err))
    }
  }

  const handleAnswer = (quality: number) => {
    if (isAnswering || !currentCard) return

    setIsAnswering(true)

    // Process the answer using SM2 algorithm
    const updatedCard = processAnswer(currentCard, quality)

    // Update the card in the deck
    const updatedDecks = decks.map((d) => {
      if (d.id === deck.id) {
        return {
          ...d,
          cards: d.cards.map((c) => (c.id === updatedCard.id ? updatedCard : c)),
        }
      }
      return d
    })

    // Update stats
    const updatedStats = {
      ...stats,
      totalReviews: stats.totalReviews + 1,
      reviewsToday: stats.reviewsToday + 1,
      totalXP: stats.totalXP + (quality >= 3 ? 10 : 5),
      lastReviewDate: new Date().toISOString(),
    }

    // Check if we need to update streak
    const lastReviewDate = stats.lastReviewDate ? new Date(stats.lastReviewDate) : null
    const today = new Date()
    if (
      !lastReviewDate ||
      lastReviewDate.getDate() !== today.getDate() ||
      lastReviewDate.getMonth() !== today.getMonth() ||
      lastReviewDate.getFullYear() !== today.getFullYear()
    ) {
      updatedStats.currentStreak = stats.currentStreak + 1
      updatedStats.longestStreak = Math.max(stats.longestStreak, updatedStats.currentStreak)
    }

    // Save the updated card to answered cards
    setAnsweredCards([...answeredCards, updatedCard])

    // Save updates
    setDecks(updatedDecks)
    setStats(updatedStats)

    // Move to next card or complete
    setTimeout(() => {
      setFlipped(false)
      setIsAnswering(false)

      if (currentIndex < dueCards.length - 1) {
        setCurrentIndex(currentIndex + 1)
      } else {
        setCompleted(true)

        toast({
          title: "Session completed!",
          description: `You've reviewed ${dueCards.length} cards. Great job!`,
          variant: "default",
        })
      }
    }, 500)
  }

  if (completed || dueCards.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 grid-pattern">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full"
        >
          <Card className="glassmorphism cyberpunk-border p-6 text-center">
            <div className="mb-6 flex justify-center">
              <div className="rounded-full bg-green-500/20 p-6">
                <Check className="h-8 w-8 text-green-500" />
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-2">Session Complete!</h2>
            <p className="text-muted-foreground mb-6">
              {dueCards.length > 0
                ? `You've reviewed ${dueCards.length} cards. Come back later for more.`
                : "There are no cards due for review in this deck."}
            </p>

            {answeredCards.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-3">Session Summary</h3>
                <div className="flex justify-between mb-2">
                  <span className="text-muted-foreground">Cards Reviewed:</span>
                  <span>{answeredCards.length}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-muted-foreground">XP Earned:</span>
                  <span>+{answeredCards.length * 10}</span>
                </div>
              </div>
            )}

            <Button onClick={handleGoBack} className="w-full cyberpunk-border">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col p-4 grid-pattern">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" onClick={handleGoBack} className="text-muted-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-xl font-medium ml-4">{deck.title}</h1>
        <div className="ml-auto flex items-center text-sm text-muted-foreground">
          <Clock className="mr-1 h-4 w-4" />
          <span>
            {currentIndex + 1} of {dueCards.length}
          </span>
        </div>
      </div>

      <div className="mb-4">
        <Progress value={progress} className="h-1" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="card-flip-container w-full max-w-2xl" onClick={handleFlip}>
          <motion.div
            className={cn("card-flip", flipped && "flipped")}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="card-front absolute inset-0">
              <Card className="glassmorphism cyberpunk-border neon-glow w-full h-[400px] flex flex-col">
                <div className="flex-1 flex items-center justify-center p-8">
                  <div className="w-full">
                    <Markdown>{currentCard.front}</Markdown>
                  </div>
                </div>
                <div className="p-4 text-center text-sm text-muted-foreground border-t border-white/10">
                  Click to reveal answer
                </div>
              </Card>
            </div>

            <div className="card-back absolute inset-0">
              <Card className="glassmorphism cyberpunk-border neon-glow w-full h-[400px] flex flex-col">
                <div className="flex-1 flex items-center justify-center p-8">
                  <div className="w-full">
                    <Markdown>{currentCard.back}</Markdown>
                  </div>
                </div>
                <div className="p-4 text-center text-sm text-muted-foreground border-t border-white/10">
                  Next review:{" "}
                  {currentCard.nextReview
                    ? formatDistanceToNow(new Date(currentCard.nextReview), { addSuffix: true })
                    : "Not reviewed yet"}
                </div>
              </Card>
            </div>
          </motion.div>
        </div>

        <div className="mt-8 w-full max-w-2xl">
          <AnimatePresence>
            {flipped && (
              <motion.div
                className="flex justify-between gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3 }}
              >
                <Button
                  variant="outline"
                  className="flex-1 border-red-500/50 text-red-500 hover:bg-red-950/20 hover:text-red-400 cyberpunk-border"
                  onClick={() => handleAnswer(1)}
                  disabled={isAnswering}
                >
                  <X className="mr-2 h-4 w-4" />
                  Didn't Know
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 border-yellow-500/50 text-yellow-500 hover:bg-yellow-950/20 hover:text-yellow-400 cyberpunk-border"
                  onClick={() => handleAnswer(3)}
                  disabled={isAnswering}
                >
                  <Clock className="mr-2 h-4 w-4" />
                  Hard
                </Button>
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white cyberpunk-border"
                  onClick={() => handleAnswer(5)}
                  disabled={isAnswering}
                >
                  <Check className="mr-2 h-4 w-4" />
                  Easy
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {!flipped && (
            <div className="flex justify-center">
              <Button variant="ghost" className="text-muted-foreground" onClick={handleFlip}>
                Tap to flip
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between mt-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            if (currentIndex > 0) {
              setCurrentIndex(currentIndex - 1)
              setFlipped(false)
            }
          }}
          disabled={currentIndex === 0}
          className="text-muted-foreground"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            if (currentIndex < dueCards.length - 1) {
              setCurrentIndex(currentIndex + 1)
              setFlipped(false)
            }
          }}
          disabled={currentIndex === dueCards.length - 1}
          className="text-muted-foreground"
        >
          Next
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
