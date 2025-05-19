"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Plus, Save, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { initialDecks } from "@/lib/initial-data"
import { v4 as uuidv4 } from "@/lib/uuid"
import { CardEditor } from "@/components/card-editor"
import type { Flashcard } from "@/types/flashcard"

export default function CreateDeckPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)
  const [decks, setDecks] = useLocalStorage("flashcard-decks", initialDecks)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [cards, setCards] = useState<Flashcard[]>([])
  const [currentCard, setCurrentCard] = useState<Flashcard>({
    id: uuidv4(),
    front: "",
    back: "",
    created: new Date().toISOString(),
    lastReview: null,
    nextReview: null,
    interval: 0,
    easeFactor: 2.5,
    repetitions: 0,
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const handleAddCard = () => {
    if (currentCard.front.trim() === "" || currentCard.back.trim() === "") {
      toast({
        title: "Empty card",
        description: "Please fill in both sides of the card.",
        variant: "destructive",
      })
      return
    }

    setCards([...cards, currentCard])
    setCurrentCard({
      id: uuidv4(),
      front: "",
      back: "",
      created: new Date().toISOString(),
      lastReview: null,
      nextReview: null,
      interval: 0,
      easeFactor: 2.5,
      repetitions: 0,
    })

    toast({
      title: "Card added",
      description: "Your flashcard has been added to the deck.",
    })
  }

  const handleSaveDeck = () => {
    if (title.trim() === "") {
      toast({
        title: "Missing title",
        description: "Please provide a title for your deck.",
        variant: "destructive",
      })
      return
    }

    if (cards.length === 0) {
      toast({
        title: "Empty deck",
        description: "Please add at least one card to your deck.",
        variant: "destructive",
      })
      return
    }

    const newDeck = {
      id: uuidv4(),
      title,
      description,
      created: new Date().toISOString(),
      lastStudied: null,
      cards,
    }

    setDecks([...decks, newDeck])

    toast({
      title: "Deck created",
      description: "Your new deck has been created successfully.",
    })

    router.push("/dashboard")
  }

  const handleGoBack = () => {
    router.push("/dashboard")
  }

  return (
    <div className="flex min-h-screen flex-col p-4 grid-pattern">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" onClick={handleGoBack} className="text-muted-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-xl font-medium ml-4">Create New Deck</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <Card className="glassmorphism cyberpunk-border">
            <CardHeader>
              <CardTitle>Deck Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter deck title"
                  className="bg-background/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter deck description"
                  className="bg-background/50 min-h-[100px]"
                />
              </div>

              <div className="pt-4">
                <h3 className="text-lg font-medium mb-2">Cards ({cards.length})</h3>
                {cards.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No cards added yet. Create your first card.</p>
                ) : (
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                    {cards.map((card, index) => (
                      <Card key={card.id} className="p-3 bg-background/50">
                        <div className="flex justify-between items-center">
                          <div className="font-medium">Card {index + 1}</div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-muted-foreground"
                            onClick={() => {
                              setCards(cards.filter((_, i) => i !== index))
                            }}
                          >
                            <span className="sr-only">Remove</span>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="mt-2 text-sm text-muted-foreground line-clamp-1">{card.front}</div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4">
                <Button
                  onClick={handleSaveDeck}
                  className="w-full cyberpunk-border"
                  disabled={title.trim() === "" || cards.length === 0}
                >
                  <Save className="mr-2 h-4 w-4" />
                  Save Deck
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="glassmorphism cyberpunk-border">
            <CardHeader>
              <CardTitle>Add New Card</CardTitle>
            </CardHeader>
            <CardContent>
              <CardEditor card={currentCard} onChange={setCurrentCard} onSave={handleAddCard} />

              <Button
                onClick={handleAddCard}
                className="w-full mt-4 cyberpunk-border"
                disabled={currentCard.front.trim() === "" || currentCard.back.trim() === ""}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Card
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
