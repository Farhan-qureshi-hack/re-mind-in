"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, FileUp, Plus, Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { initialDecks } from "@/lib/initial-data"
import { parseImportFile } from "@/lib/file-parser"
import { v4 as uuidv4 } from "@/lib/uuid"
import type { Flashcard, Deck } from "@/types/flashcard"

export default function ImportPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)
  const [decks, setDecks] = useLocalStorage("flashcard-decks", initialDecks)
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [importedCards, setImportedCards] = useState<Flashcard[]>([])
  const [importOption, setImportOption] = useState<"existing" | "new">("existing")
  const [selectedDeckId, setSelectedDeckId] = useState<string>("")
  const [newDeckTitle, setNewDeckTitle] = useState("")
  const [newDeckDescription, setNewDeckDescription] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setMounted(true)

    // Set default selected deck if decks exist
    if (decks.length > 0) {
      setSelectedDeckId(decks[0].id)
    }
  }, [decks])

  if (!mounted) return null

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0]
      await handleFileSelected(droppedFile)
    }
  }

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0]
      await handleFileSelected(selectedFile)
    }
  }

  const handleFileSelected = async (selectedFile: File) => {
    const fileExtension = selectedFile.name.split(".").pop()?.toLowerCase()

    if (fileExtension !== "csv" && fileExtension !== "txt") {
      toast({
        title: "Invalid file format",
        description: "Please upload a CSV or TXT file.",
        variant: "destructive",
      })
      return
    }

    setFile(selectedFile)
    setIsProcessing(true)

    try {
      const cards = await parseImportFile(selectedFile)
      setImportedCards(cards)

      toast({
        title: "File processed",
        description: `Successfully parsed ${cards.length} flashcards.`,
      })
    } catch (error) {
      toast({
        title: "Error processing file",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      })
      setFile(null)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleImport = () => {
    if (importedCards.length === 0) {
      toast({
        title: "No cards to import",
        description: "Please upload a file with flashcards first.",
        variant: "destructive",
      })
      return
    }

    if (importOption === "existing") {
      if (!selectedDeckId) {
        toast({
          title: "No deck selected",
          description: "Please select a deck to import the cards into.",
          variant: "destructive",
        })
        return
      }

      // Add cards to existing deck
      const updatedDecks = decks.map((deck) => {
        if (deck.id === selectedDeckId) {
          return {
            ...deck,
            cards: [...deck.cards, ...importedCards],
          }
        }
        return deck
      })

      setDecks(updatedDecks)

      toast({
        title: "Import successful",
        description: `Added ${importedCards.length} cards to the selected deck.`,
      })
    } else {
      // Create new deck
      if (!newDeckTitle.trim()) {
        toast({
          title: "Missing title",
          description: "Please provide a title for the new deck.",
          variant: "destructive",
        })
        return
      }

      const newDeck: Deck = {
        id: uuidv4(),
        title: newDeckTitle,
        description: newDeckDescription,
        created: new Date().toISOString(),
        lastStudied: null,
        cards: importedCards,
      }

      setDecks([...decks, newDeck])

      toast({
        title: "Import successful",
        description: `Created new deck "${newDeckTitle}" with ${importedCards.length} cards.`,
      })
    }

    // Reset state
    setFile(null)
    setImportedCards([])
    setNewDeckTitle("")
    setNewDeckDescription("")

    // Redirect to dashboard
    router.push("/dashboard")
  }

  const handleGoBack = () => {
    router.push("/dashboard")
  }

  const handleRemoveCard = (index: number) => {
    setImportedCards(importedCards.filter((_, i) => i !== index))
  }

  return (
    <div className="flex min-h-screen flex-col p-4 grid-pattern">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" onClick={handleGoBack} className="text-muted-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-xl font-medium ml-4">Import Flashcards</h1>
      </div>

      <div className="max-w-4xl mx-auto w-full">
        <Card className="glassmorphism cyberpunk-border">
          <CardHeader>
            <CardTitle>Import from File</CardTitle>
            <CardDescription>
              Upload a CSV or text file to import flashcards.
              <br />
              CSV format: front,back
              <br />
              Text format: Q: [question] A: [answer] or Front: [front] Back: [back]
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!file && (
              <div
                className={`border-2 border-dashed rounded-lg p-12 text-center ${
                  isDragging ? "border-primary bg-primary/10" : "border-muted"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="rounded-full bg-primary/20 p-6">
                    <FileUp className="h-8 w-8 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-medium">Drag & Drop File</h3>
                    <p className="text-sm text-muted-foreground">Drop your CSV or TXT file here, or click to browse</p>
                  </div>
                  <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="cyberpunk-border">
                    <Upload className="mr-2 h-4 w-4" />
                    Browse Files
                  </Button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileInputChange}
                    accept=".csv,.txt"
                    className="hidden"
                  />
                </div>
              </div>
            )}

            {isProcessing && (
              <div className="text-center py-8">
                <div className="animate-pulse">
                  <p className="text-lg">Processing file...</p>
                </div>
              </div>
            )}

            {file && !isProcessing && (
              <>
                <div className="flex items-center justify-between bg-muted/30 p-3 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileUp className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{importedCards.length} cards imported</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setFile(null)
                      setImportedCards([])
                    }}
                    className="h-8 w-8 p-0"
                  >
                    <span className="sr-only">Remove file</span>
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Import Options</h3>

                  <RadioGroup
                    value={importOption}
                    onValueChange={(value) => setImportOption(value as "existing" | "new")}
                    className="space-y-3"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="existing" id="existing" />
                      <Label htmlFor="existing">Add to existing deck</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="new" id="new" />
                      <Label htmlFor="new">Create new deck</Label>
                    </div>
                  </RadioGroup>

                  {importOption === "existing" && (
                    <div className="space-y-2">
                      <Label htmlFor="deck">Select Deck</Label>
                      <Select value={selectedDeckId} onValueChange={setSelectedDeckId}>
                        <SelectTrigger id="deck" className="bg-background/50">
                          <SelectValue placeholder="Select a deck" />
                        </SelectTrigger>
                        <SelectContent>
                          {decks.map((deck) => (
                            <SelectItem key={deck.id} value={deck.id}>
                              {deck.title} ({deck.cards.length} cards)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {importOption === "new" && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Deck Title</Label>
                        <Input
                          id="title"
                          value={newDeckTitle}
                          onChange={(e) => setNewDeckTitle(e.target.value)}
                          placeholder="Enter deck title"
                          className="bg-background/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description">Description (optional)</Label>
                        <Input
                          id="description"
                          value={newDeckDescription}
                          onChange={(e) => setNewDeckDescription(e.target.value)}
                          placeholder="Enter deck description"
                          className="bg-background/50"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {importedCards.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Preview ({importedCards.length} cards)</h3>
                    <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2">
                      {importedCards.slice(0, 5).map((card, index) => (
                        <Card key={index} className="p-3 bg-background/50">
                          <div className="flex justify-between items-start">
                            <div className="space-y-2 flex-1 mr-4">
                              <div>
                                <span className="text-xs text-muted-foreground">Front:</span>
                                <p className="text-sm line-clamp-2">{card.front}</p>
                              </div>
                              <div>
                                <span className="text-xs text-muted-foreground">Back:</span>
                                <p className="text-sm line-clamp-2">{card.back}</p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-muted-foreground"
                              onClick={() => handleRemoveCard(index)}
                            >
                              <span className="sr-only">Remove</span>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </Card>
                      ))}
                      {importedCards.length > 5 && (
                        <p className="text-center text-sm text-muted-foreground">
                          +{importedCards.length - 5} more cards
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>

          {file && !isProcessing && (
            <CardFooter>
              <Button
                onClick={handleImport}
                className="w-full cyberpunk-border"
                disabled={
                  importedCards.length === 0 ||
                  (importOption === "existing" && !selectedDeckId) ||
                  (importOption === "new" && !newDeckTitle.trim())
                }
              >
                <Plus className="mr-2 h-4 w-4" />
                {importOption === "existing" ? "Add to Deck" : "Create New Deck"}
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  )
}
