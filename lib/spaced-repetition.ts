import type { Flashcard } from "@/types/flashcard"

// SuperMemo 2 (SM2) algorithm implementation
export function processAnswer(card: Flashcard, quality: number): Flashcard {
  // Quality should be between 0 and 5
  quality = Math.max(0, Math.min(5, quality))

  let nextInterval: number
  let nextEaseFactor: number = card.easeFactor
  let nextRepetitions: number = card.repetitions

  // Calculate new ease factor
  // The ease factor is a multiplier that affects the size of the interval
  nextEaseFactor = Math.max(
    1.3, // Minimum ease factor
    card.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)),
  )

  // If quality < 3, start repetitions from the beginning
  if (quality < 3) {
    nextRepetitions = 0
    nextInterval = 1 // 1 day
  } else {
    // Increment repetitions
    nextRepetitions = card.repetitions + 1

    // Calculate next interval
    if (nextRepetitions === 1) {
      nextInterval = 1 // 1 day
    } else if (nextRepetitions === 2) {
      nextInterval = 6 // 6 days
    } else {
      // For subsequent repetitions, multiply the previous interval by the ease factor
      nextInterval = Math.round(card.interval * nextEaseFactor)
    }
  }

  // Ensure interval is at least 1 day
  nextInterval = Math.max(1, nextInterval)

  // Calculate next review date
  const now = new Date()
  const nextReview = new Date(now.getTime() + nextInterval * 24 * 60 * 60 * 1000)

  return {
    ...card,
    interval: nextInterval,
    easeFactor: nextEaseFactor,
    repetitions: nextRepetitions,
    lastReview: now.toISOString(),
    nextReview: nextReview.toISOString(),
  }
}

// Calculate due cards
export function calculateDueCards(cards: Flashcard[]): Flashcard[] {
  const now = new Date()

  return cards.filter((card) => {
    // If the card has never been reviewed, it's due
    if (!card.nextReview) {
      return true
    }

    // If the next review date is in the past or today, it's due
    const nextReview = new Date(card.nextReview)
    return nextReview <= now
  })
}
