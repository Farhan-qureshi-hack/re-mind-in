import { v4 as uuidv4 } from "./uuid"
import type { Flashcard } from "@/types/flashcard"

export async function parseImportFile(file: File): Promise<Flashcard[]> {
  const fileContent = await readFileAsText(file)
  const fileExtension = file.name.split(".").pop()?.toLowerCase()

  if (fileExtension === "csv") {
    return parseCSV(fileContent)
  } else if (fileExtension === "txt") {
    return parseText(fileContent)
  } else {
    throw new Error("Unsupported file format. Please upload a CSV or TXT file.")
  }
}

function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (event) => {
      if (event.target?.result) {
        resolve(event.target.result as string)
      } else {
        reject(new Error("Failed to read file"))
      }
    }
    reader.onerror = () => reject(new Error("Failed to read file"))
    reader.readAsText(file)
  })
}

function parseCSV(content: string): Flashcard[] {
  const lines = content.split("\n")
  const cards: Flashcard[] = []

  // Skip header row if it exists
  const startIndex = lines[0].toLowerCase().includes("front") && lines[0].toLowerCase().includes("back") ? 1 : 0

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue

    // Handle both quoted and unquoted CSV
    let [front, back] = ["", ""]

    if (line.includes('"')) {
      // Handle quoted values
      const matches = line.match(/"([^"]*)","([^"]*)"/i)
      if (matches && matches.length >= 3) {
        front = matches[1].trim()
        back = matches[2].trim()
      }
    } else {
      // Handle unquoted values
      const parts = line.split(",")
      if (parts.length >= 2) {
        front = parts[0].trim()
        back = parts.slice(1).join(",").trim()
      }
    }

    if (front && back) {
      cards.push(createFlashcard(front, back))
    }
  }

  return cards
}

function parseText(content: string): Flashcard[] {
  const cards: Flashcard[] = []

  // Split by double newlines to separate card blocks
  const blocks = content.split(/\n\s*\n/)

  for (const block of blocks) {
    if (!block.trim()) continue

    // Try Q/A format
    let match = block.match(/Q:\s*([\s\S]*?)(?:\n|$)A:\s*([\s\S]*?)(?:\n|$)/i)

    if (match && match.length >= 3) {
      const front = match[1].trim()
      const back = match[2].trim()

      if (front && back) {
        cards.push(createFlashcard(front, back))
      }
      continue
    }

    // Try front/back format
    match = block.match(/Front:\s*([\s\S]*?)(?:\n|$)Back:\s*([\s\S]*?)(?:\n|$)/i)

    if (match && match.length >= 3) {
      const front = match[1].trim()
      const back = match[2].trim()

      if (front && back) {
        cards.push(createFlashcard(front, back))
      }
      continue
    }

    // Try simple format with separator
    const lines = block.split("\n")
    if (lines.length >= 2) {
      const front = lines[0].trim()
      const back = lines.slice(1).join("\n").trim()

      if (front && back) {
        cards.push(createFlashcard(front, back))
      }
    }
  }

  return cards
}

function createFlashcard(front: string, back: string): Flashcard {
  return {
    id: uuidv4(),
    front,
    back,
    created: new Date().toISOString(),
    lastReview: null,
    nextReview: null,
    interval: 0,
    easeFactor: 2.5,
    repetitions: 0,
  }
}
