"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const activities = [
  {
    id: 1,
    type: "Squats",
    count: 30,
    duration: "5 mins",
    time: "2 hours ago",
    image: "/placeholder.svg",
  },
  {
    id: 2,
    type: "Push-ups",
    count: 15,
    duration: "3 mins",
    time: "4 hours ago",
    image: "/placeholder.svg",
  },
  {
    id: 3,
    type: "Crunches",
    count: 50,
    duration: "8 mins",
    time: "6 hours ago",
    image: "/placeholder.svg",
  },
]

export function RecentActivities() {
  return (
    <div className="space-y-8">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarImage src={activity.image} alt={activity.type} />
            <AvatarFallback>EX</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{activity.type}</p>
            <p className="text-sm text-muted-foreground">
              {activity.count} reps • {activity.duration}
            </p>
            <p className="text-xs text-muted-foreground">{activity.time}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

