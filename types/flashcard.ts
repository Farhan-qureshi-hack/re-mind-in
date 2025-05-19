export interface Flashcard {
  id: string
  front: string
  back: string
  created: string
  lastReview: string | null
  nextReview: string | null
  interval: number
  easeFactor: number
  repetitions: number
}

export interface Deck {
  id: string
  title: string
  description: string
  created: string
  lastStudied: string | null
  cards: Flashcard[]
}
