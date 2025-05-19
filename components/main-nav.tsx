"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Brain } from "lucide-react"

export function MainNav({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  const pathname = usePathname()

  return (
    <nav className={cn("flex items-center space-x-4 lg:space-x-6", className)} {...props}>
      <Link href="/" className="flex items-center space-x-2">
        <Brain className="h-6 w-6 text-purple-500" />
        <span className="font-orbitron font-bold text-xl neon-text">ReMind</span>
      </Link>
      <Link
        href="/dashboard"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/dashboard" ? "text-foreground" : "text-muted-foreground",
        )}
      >
        Dashboard
      </Link>
      <Link
        href="/create-deck"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/create-deck" ? "text-foreground" : "text-muted-foreground",
        )}
      >
        Create Deck
      </Link>
      <Link
        href="/settings"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/settings" ? "text-foreground" : "text-muted-foreground",
        )}
      >
        Settings
      </Link>
      <Link
        href="/import"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/import" ? "text-foreground" : "text-muted-foreground",
        )}
      >
        Import
      </Link>
    </nav>
  )
}
