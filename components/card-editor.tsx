"use client"

import type React from "react"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import type { Flashcard } from "@/types/flashcard"
import { Markdown } from "@/components/markdown"

interface CardEditorProps {
  card: Flashcard
  onChange: (card: Flashcard) => void
  onSave?: () => void
}

export function CardEditor({ card, onChange, onSave }: CardEditorProps) {
  const [activeTab, setActiveTab] = useState<"front" | "back">("front")

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Save on Ctrl+Enter or Cmd+Enter
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter" && onSave) {
      onSave()
    }
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="front" className="w-full">
        <TabsList className="grid w-full grid-cols-2 cyberpunk-border">
          <TabsTrigger value="front" onClick={() => setActiveTab("front")}>
            Front
          </TabsTrigger>
          <TabsTrigger value="back" onClick={() => setActiveTab("back")}>
            Back
          </TabsTrigger>
        </TabsList>
        <TabsContent value="front" className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="front">Front (Markdown supported)</Label>
              <Textarea
                id="front"
                value={card.front}
                onChange={(e) => onChange({ ...card, front: e.target.value })}
                placeholder="Enter the front of the card"
                className="min-h-[200px] bg-background/50"
                onKeyDown={handleKeyDown}
              />
            </div>
            <div className="space-y-2">
              <Label>Preview</Label>
              <Card className="min-h-[200px] p-4 bg-background/50">
                <Markdown>{card.front}</Markdown>
              </Card>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="back" className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="back">Back (Markdown supported)</Label>
              <Textarea
                id="back"
                value={card.back}
                onChange={(e) => onChange({ ...card, back: e.target.value })}
                placeholder="Enter the back of the card"
                className="min-h-[200px] bg-background/50"
                onKeyDown={handleKeyDown}
              />
            </div>
            <div className="space-y-2">
              <Label>Preview</Label>
              <Card className="min-h-[200px] p-4 bg-background/50">
                <Markdown>{card.back}</Markdown>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
