"use client"

import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

const activities = [
  {
    id: 1,
    type: "Squats Challenge",
    reps: 100,
    date: "2024-02-14",
    duration: "15 mins",
  },
  {
    id: 2,
    type: "Push-ups",
    reps: 50,
    date: "2024-02-13",
    duration: "10 mins",
  },
  // Add more activities...
]

export function ActivityHistory() {
  return (
    <Card>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px] p-4">
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                <div>
                  <p className="font-medium">{activity.type}</p>
                  <p className="text-sm text-muted-foreground">
                    {activity.reps} reps • {activity.duration}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">{activity.date}</p>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

