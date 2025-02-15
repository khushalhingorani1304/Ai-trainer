"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "./mode-toggle"

export function Header() {
  const pathname = usePathname()

  return (
    <header className="border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-2xl font-bold">LLM LEADS</span>
        </Link>
        <nav className="flex items-center space-x-6">
          <Link
            href="/dashboard"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              pathname === "/dashboard" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            Dashboard
          </Link>
          <Link
            href="/challenges"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              pathname === "/challenges" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            Challenges
          </Link>
          <Link
            href="/leaderboard"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              pathname === "/leaderboard" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            Leaderboard
          </Link>
          <Link
            href="/profile"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              pathname === "/profile" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            Profile
          </Link>
          <ModeToggle />
          <Button variant="default" size="sm">
            Sign In
          </Button>
        </nav>
      </div>
    </header>
  )
}

