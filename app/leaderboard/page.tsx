"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Medal } from "lucide-react"
import { cn } from "@/lib/utils"

const leaderboardData = [
  {
    rank: 1,
    name: "Sarah Johnson",
    points: 2500,
    completedChallenges: 15,
    streak: 30,
    avatar: "/placeholder.svg",
  },
  {
    rank: 2,
    name: "Michael Chen",
    points: 2350,
    completedChallenges: 12,
    streak: 25,
    avatar: "/placeholder.svg",
  },
  {
    rank: 3,
    name: "Emma Wilson",
    points: 2200,
    completedChallenges: 10,
    streak: 20,
    avatar: "/placeholder.svg",
  },
  // Add more users...
]

export default function LeaderboardPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [timeRange, setTimeRange] = useState("week")

  const filteredUsers = leaderboardData.filter((user) => user.name.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Leaderboard</h1>
        <p className="text-muted-foreground">See who's leading the fitness challenge</p>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <Input
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
            <SelectItem value="all">All Time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4">
        {filteredUsers.map((user, index) => (
          <Card key={user.rank}>
            <CardContent className="flex items-center p-6">
              <div className="flex items-center gap-4 flex-1">
                <div className="flex items-center justify-center w-8">
                  {index < 3 ? (
                    <Medal
                      className={cn(
                        "h-6 w-6",
                        index === 0 && "text-yellow-500",
                        index === 1 && "text-gray-400",
                        index === 2 && "text-amber-600",
                      )}
                    />
                  ) : (
                    <span className="text-lg font-semibold text-muted-foreground">{user.rank}</span>
                  )}
                </div>
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-muted-foreground">{user.points} points</p>
                </div>
              </div>
              <div className="hidden md:flex items-center gap-4 text-sm text-muted-foreground">
                <div>
                  <p className="font-medium">{user.completedChallenges}</p>
                  <p>Challenges</p>
                </div>
                <div>
                  <p className="font-medium">{user.streak} days</p>
                  <p>Streak</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

