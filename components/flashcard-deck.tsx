"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Flashcard } from "@/types/flashcard"
import { Markdown } from "@/components/markdown"

interface FlashcardDeckProps {
  cards: Flashcard[]
  onAnswer?: (card: Flashcard, quality: number) => void
}

export function FlashcardDeck({ cards, onAnswer }: FlashcardDeckProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)

  if (cards.length === 0) {
    return (
      <Card className="glassmorphism cyberpunk-border w-full h-[300px] flex items-center justify-center">
        <p className="text-muted-foreground">No cards available</p>
      </Card>
    )
  }

  const currentCard = cards[currentIndex]

  const handleFlip = () => {
    setFlipped(!flipped)
  }

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setFlipped(false)
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setFlipped(false)
    }
  }

  return (
    <div className="w-full">
      <div className="card-flip-container w-full mb-4" onClick={handleFlip}>
        <div className={cn("card-flip", flipped && "flipped")}>
          <div className="card-front absolute inset-0">
            <Card className="glassmorphism cyberpunk-border neon-glow w-full h-[300px] flex flex-col">
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
            <Card className="glassmorphism cyberpunk-border neon-glow w-full h-[300px] flex flex-col">
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="w-full">
                  <Markdown>{currentCard.back}</Markdown>
                </div>
              </div>
              <div className="p-4 text-center text-sm text-muted-foreground border-t border-white/10">
                Card {currentIndex + 1} of {cards.length}
              </div>
            </Card>
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className="cyberpunk-border"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleNext}
          disabled={currentIndex === cards.length - 1}
          className="cyberpunk-border"
        >
          Next
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
