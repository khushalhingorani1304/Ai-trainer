"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"

const challenges = [
  {
    id: 1,
    name: "30 Days of Squats",
    progress: 65,
    participants: 128,
    daysLeft: 12,
    image: "/placeholder.svg",
  },
  {
    id: 2,
    name: "Push-up Challenge",
    progress: 32,
    participants: 89,
    daysLeft: 18,
    image: "/placeholder.svg",
  },
  {
    id: 3,
    name: "Core Strength",
    progress: 78,
    participants: 256,
    daysLeft: 5,
    image: "/placeholder.svg",
  },
]

export function ActiveChallenges() {
  return (
    <div className="space-y-8">
      {challenges.map((challenge) => (
        <div key={challenge.id} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarImage src={challenge.image} alt={challenge.name} />
            <AvatarFallback>CH</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1 flex-1">
            <p className="text-sm font-medium leading-none">{challenge.name}</p>
            <div className="flex items-center text-sm text-muted-foreground">
              <Progress value={challenge.progress} className="h-2 flex-1" />
              <span className="ml-2 text-xs">{challenge.progress}%</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {challenge.participants} participants • {challenge.daysLeft} days left
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

