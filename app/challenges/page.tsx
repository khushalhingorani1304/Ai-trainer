"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Timer } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CreateChallengeDialog } from "@/components/challenges/create-challenge-dialog"

const challenges = [
  {
    id: 1,
    title: "30 Days of Squats",
    description: "Complete 100 squats daily for 30 days",
    participants: 128,
    progress: 65,
    daysLeft: 12,
    type: "active",
    image: "/placeholder.svg",
  },
  {
    id: 2,
    title: "Push-up Challenge",
    description: "50 push-ups daily for 2 weeks",
    participants: 89,
    progress: 0,
    daysLeft: 14,
    type: "upcoming",
    image: "/placeholder.svg",
  },
  // Add more challenges...
]

export default function ChallengePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  const filteredChallenges = challenges.filter((challenge) =>
    challenge.title.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Challenges</h1>
          <p className="text-muted-foreground">Join challenges and compete with others</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>Create Challenge</Button>
      </div>

      <div className="flex items-center space-x-4">
        <Input
          placeholder="Search challenges..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        <TabsContent value="active" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredChallenges
              .filter((challenge) => challenge.type === "active")
              .map((challenge) => (
                <Card key={challenge.id}>
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={challenge.image} alt={challenge.title} />
                        <AvatarFallback>CH</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle>{challenge.title}</CardTitle>
                        <CardDescription>{challenge.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{challenge.participants} participants</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{challenge.progress}%</span>
                        </div>
                        <Progress value={challenge.progress} />
                      </div>
                      <div className="flex items-center gap-4">
                        <Timer className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{challenge.daysLeft} days left</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full">View Details</Button>
                  </CardFooter>
                </Card>
              ))}
          </div>
        </TabsContent>
        <TabsContent value="upcoming">{/* Similar structure for upcoming challenges */}</TabsContent>
        <TabsContent value="completed">{/* Similar structure for completed challenges */}</TabsContent>
      </Tabs>

      <CreateChallengeDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} />
    </div>
  )
}

